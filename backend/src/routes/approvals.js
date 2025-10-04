import express from "express";
import { body, validationResult } from "express-validator";
import {
  authenticateToken,
  requireManagerOrAdmin,
} from "../middleware/auth.js";
import { checkApprovalAccess } from "../middleware/roleCheck.js";
import prisma from "../config/database.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateApprovalDecision = [
  body("status").isIn(["approved", "rejected"]),
  body("comments").optional().trim(),
];

// Get pending approvals
router.get("/pending", requireManagerOrAdmin, async (req, res) => {
  try {
    let where = {
      companyId: req.user.company_id,
      status: "PENDING",
    };

    // Role-based filtering
    if (req.user.role === "MANAGER") {
      where.currentApproverId = req.user.id;
    }
    // Admin can see all pending approvals

    const pendingApprovals = await prisma.expense.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        currentApprover: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        approvals: {
          include: {
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { stepNumber: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    res.json({
      success: true,
      data: { approvals: pendingApprovals },
    });
  } catch (error) {
    console.error("Get pending approvals error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve pending approvals",
      code: "GET_PENDING_APPROVALS_ERROR",
    });
  }
});

// Approve or reject expense
router.post(
  "/:expenseId/decision",
  requireManagerOrAdmin,
  checkApprovalAccess,
  validateApprovalDecision,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: true,
          message: "Validation failed",
          code: "VALIDATION_ERROR",
          details: errors.array(),
        });
      }

      const { expenseId } = req.params;
      const { status, comments } = req.body;
      const expense = req.expense;

      // Create approval record
      const approval = await prisma.approval.create({
        data: {
          expenseId: expense.id,
          approverId: req.user.id,
          stepNumber: expense.currentApprovalStep,
          status: status.toUpperCase(),
          comments,
        },
      });

      if (status === "rejected") {
        // If rejected, update expense status
        await prisma.expense.update({
          where: { id: expense.id },
          data: {
            status: "REJECTED",
            currentApproverId: null,
          },
        });

        res.json({
          success: true,
          message: "Expense rejected successfully",
          data: { approval },
        });
      } else {
        // If approved, continue with approval workflow
        await continueApprovalWorkflow(expense, approval, res);
      }
    } catch (error) {
      console.error("Approval decision error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to process approval decision",
        code: "APPROVAL_DECISION_ERROR",
      });
    }
  }
);

// Handle user-specific approval workflow
async function handleUserApprovalWorkflow(expense, approval, userRule, res) {
  try {
    if (userRule.approvalType === "SEQUENTIAL") {
      // Get current step and find next approver
      const currentStep = expense.currentApprovalStep;
      const nextApprover = userRule.approvers.find(
        (approver) => approver.sequenceOrder === currentStep + 1
      );

      if (!nextApprover) {
        // No more steps, expense is approved
        await prisma.expense.update({
          where: { id: expense.id },
          data: {
            status: "APPROVED",
            currentApproverId: null,
            currentApprovalStep: 0,
          },
        });

        return res.json({
          success: true,
          message: "Expense approved successfully",
          data: { approval },
        });
      }

      // Move to next approver
      await prisma.expense.update({
        where: { id: expense.id },
        data: {
          currentApproverId: nextApprover.approverId,
          currentApprovalStep: currentStep + 1,
        },
      });

      return res.json({
        success: true,
        message: `Approval recorded. Forwarded to ${nextApprover.approver.firstName} ${nextApprover.approver.lastName}.`,
        data: { approval },
      });
    } else if (userRule.approvalType === "PERCENTAGE") {
      // Count current approvals and check threshold
      const totalApprovals = await prisma.approval.count({
        where: {
          expenseId: expense.id,
          status: "APPROVED",
        },
      });

      const requiredApprovals = Math.ceil(
        (userRule.percentageThreshold * userRule.approvers.length) / 100
      );

      if (totalApprovals >= requiredApprovals) {
        await prisma.expense.update({
          where: { id: expense.id },
          data: {
            status: "APPROVED",
            currentApproverId: null,
            currentApprovalStep: 0,
          },
        });

        return res.json({
          success: true,
          message: "Expense approved successfully",
          data: { approval },
        });
      }

      // Still need more approvals
      return res.json({
        success: true,
        message: `Approval recorded. ${totalApprovals}/${requiredApprovals} approvals received.`,
        data: { approval },
      });
    }

    // Default: mark as approved
    await prisma.expense.update({
      where: { id: expense.id },
      data: {
        status: "APPROVED",
        currentApproverId: null,
        currentApprovalStep: 0,
      },
    });

    return res.json({
      success: true,
      message: "Expense approved successfully",
      data: { approval },
    });
  } catch (error) {
    console.error("User approval workflow error:", error);
    throw error;
  }
}

// Continue approval workflow logic
async function continueApprovalWorkflow(expense, approval, res) {
  try {
    // First, try to get user-specific approval rule
    const userApprovalRule = await prisma.userApprovalRule.findFirst({
      where: {
        userId: expense.employeeId,
        isActive: true,
      },
      include: {
        approvers: {
          include: {
            approver: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { sequenceOrder: "asc" },
        },
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (userApprovalRule) {
      // Use user-specific approval rule
      return await handleUserApprovalWorkflow(
        expense,
        approval,
        userApprovalRule,
        res
      );
    }

    // Fallback to company-wide approval rule
    const approvalRule = await prisma.approvalRule.findFirst({
      where: {
        companyId: expense.companyId,
        isActive: true,
      },
      include: {
        approvalSteps: { orderBy: { stepNumber: "asc" } },
        specificApprover: true,
      },
    });

    if (!approvalRule) {
      // No approval rule, mark as approved
      await prisma.expense.update({
        where: { id: expense.id },
        data: {
          status: "APPROVED",
          currentApproverId: null,
        },
      });

      return res.json({
        success: true,
        message: "Expense approved successfully",
        data: { approval },
      });
    }

    // Handle different approval types
    if (approvalRule.approvalType === "SPECIFIC_APPROVER") {
      // If specific approver approved, expense is fully approved
      await prisma.expense.update({
        where: { id: expense.id },
        data: {
          status: "APPROVED",
          currentApproverId: null,
        },
      });

      return res.json({
        success: true,
        message: "Expense approved successfully",
        data: { approval },
      });
    } else if (approvalRule.approvalType === "PERCENTAGE") {
      // Count current approvals and check threshold
      const totalApprovals = await prisma.approval.count({
        where: {
          expenseId: expense.id,
          status: "APPROVED",
        },
      });

      const totalSteps = approvalRule.approvalSteps.length;
      const requiredApprovals = Math.ceil(
        (approvalRule.percentageThreshold * totalSteps) / 100
      );

      if (totalApprovals >= requiredApprovals) {
        await prisma.expense.update({
          where: { id: expense.id },
          data: {
            status: "APPROVED",
            currentApproverId: null,
          },
        });

        return res.json({
          success: true,
          message: "Expense approved successfully",
          data: { approval },
        });
      }

      // Still need more approvals
      return res.json({
        success: true,
        message: `Approval recorded. ${totalApprovals}/${requiredApprovals} approvals received.`,
        data: { approval },
      });
    } else if (approvalRule.approvalType === "SEQUENTIAL") {
      // Move to next step
      const currentStep = expense.currentApprovalStep;
      const nextStep = approvalRule.approvalSteps.find(
        (step) => step.stepNumber === currentStep + 1
      );

      if (!nextStep) {
        // No more steps, expense is approved
        await prisma.expense.update({
          where: { id: expense.id },
          data: {
            status: "APPROVED",
            currentApproverId: null,
          },
        });

        return res.json({
          success: true,
          message: "Expense approved successfully",
          data: { approval },
        });
      }

      // Move to next approver
      await prisma.expense.update({
        where: { id: expense.id },
        data: {
          currentApproverId: nextStep.approverId,
          currentApprovalStep: currentStep + 1,
        },
      });

      return res.json({
        success: true,
        message: `Approval recorded. Forwarded to step ${currentStep + 1}.`,
        data: { approval },
      });
    } else if (approvalRule.approvalType === "HYBRID") {
      // Handle hybrid logic (percentage OR specific approver)
      const totalApprovals = await prisma.approval.count({
        where: {
          expenseId: expense.id,
          status: "APPROVED",
        },
      });

      const hasSpecificApproverApproval = await prisma.approval.findFirst({
        where: {
          expenseId: expense.id,
          approverId: approvalRule.specificApproverId,
          status: "APPROVED",
        },
      });

      const totalSteps = approvalRule.approvalSteps.length;
      const requiredApprovals = Math.ceil(
        (approvalRule.percentageThreshold * totalSteps) / 100
      );

      if (hasSpecificApproverApproval || totalApprovals >= requiredApprovals) {
        await prisma.expense.update({
          where: { id: expense.id },
          data: {
            status: "APPROVED",
            currentApproverId: null,
          },
        });

        return res.json({
          success: true,
          message: "Expense approved successfully",
          data: { approval },
        });
      }

      // Still need more approvals
      return res.json({
        success: true,
        message: `Approval recorded. Progress: ${totalApprovals}/${requiredApprovals} approvals.`,
        data: { approval },
      });
    }

    // Default fallback - mark as approved
    await prisma.expense.update({
      where: { id: expense.id },
      data: {
        status: "APPROVED",
        currentApproverId: null,
      },
    });

    return res.json({
      success: true,
      message: "Expense approved successfully",
      data: { approval },
    });
  } catch (error) {
    console.error("Continue approval workflow error:", error);
    return res.status(500).json({
      error: true,
      message: "Failed to continue approval workflow",
      code: "WORKFLOW_ERROR",
    });
  }
}

// Get approval history
router.get("/:expenseId/history", requireManagerOrAdmin, async (req, res) => {
  try {
    const { expenseId } = req.params;

    // Check if user can access this expense
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId },
    });

    if (!expense) {
      return res.status(404).json({
        error: true,
        message: "Expense not found",
        code: "EXPENSE_NOT_FOUND",
      });
    }

    const approvals = await prisma.approval.findMany({
      where: { expenseId },
      include: {
        approver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { stepNumber: "asc" },
    });

    res.json({
      success: true,
      data: { approvals },
    });
  } catch (error) {
    console.error("Get approval history error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve approval history",
      code: "GET_APPROVAL_HISTORY_ERROR",
    });
  }
});

export default router;
