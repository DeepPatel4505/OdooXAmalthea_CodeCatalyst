import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import prisma from "../config/database.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateCreateRule = [
  body("name").trim().isLength({ min: 1 }),
  body("isManagerApprover").optional().toBoolean().isBoolean(),
  body("approvalType").isIn([
    "SEQUENTIAL",
    "PERCENTAGE",
    "SPECIFIC_APPROVER",
    "HYBRID",
  ]),
  body("percentageThreshold")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 }),
  body("specificApproverId").optional({ nullable: true }).isUUID(),
];

const validateUpdateRule = [
  body("name").optional().trim().isLength({ min: 1 }),
  body("isManagerApprover").optional().toBoolean().isBoolean(),
  body("approvalType")
    .optional()
    .isIn(["SEQUENTIAL", "PERCENTAGE", "SPECIFIC_APPROVER", "HYBRID"]),
  body("percentageThreshold")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 }),
  body("specificApproverId").optional({ nullable: true }).isUUID(),
  body("isActive").optional().toBoolean().isBoolean(),
];

const validateCreateStep = [
  body("stepNumber").isInt({ min: 1 }),
  body("approverRole").trim().isLength({ min: 1 }),
  body("approverId").isUUID(),
];

// Get all approval rules for company
router.get("/", requireAdmin, async (req, res) => {
  try {
    const rules = await prisma.approvalRule.findMany({
      where: {
        companyId: req.user.company_id,
      },
      include: {
        approvalSteps: {
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
        },
        specificApprover: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { rules },
    });
  } catch (error) {
    console.error("Get approval rules error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve approval rules",
      code: "GET_APPROVAL_RULES_ERROR",
    });
  }
});

// Get single approval rule
router.get("/:ruleId", requireAdmin, async (req, res) => {
  try {
    const { ruleId } = req.params;

    const rule = await prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: req.user.company_id,
      },
      include: {
        approvalSteps: {
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
        },
        specificApprover: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!rule) {
      return res.status(404).json({
        error: true,
        message: "Approval rule not found",
        code: "APPROVAL_RULE_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: { rule },
    });
  } catch (error) {
    console.error("Get approval rule error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve approval rule",
      code: "GET_APPROVAL_RULE_ERROR",
    });
  }
});

// Create approval rule
router.post("/", requireAdmin, validateCreateRule, async (req, res) => {
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

    const {
      name,
      isManagerApprover = false,
      approvalType,
      percentageThreshold,
      specificApproverId,
    } = req.body;

    // Validate specific approver if provided
    if (specificApproverId && approvalType === "SPECIFIC_APPROVER") {
      const approver = await prisma.user.findFirst({
        where: {
          id: specificApproverId,
          companyId: req.user.company_id,
          role: { in: ["ADMIN", "MANAGER"] },
          isActive: true,
        },
      });

      if (!approver) {
        return res.status(400).json({
          error: true,
          message: "Invalid specific approver selected",
          code: "INVALID_SPECIFIC_APPROVER",
        });
      }
    }

    // Create rule
    const rule = await prisma.approvalRule.create({
      data: {
        name,
        isManagerApprover,
        approvalType,
        percentageThreshold,
        companyId: req.user.company_id,
        specificApproverId,
      },
      include: {
        specificApprover: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Approval rule created successfully",
      data: { rule },
    });
  } catch (error) {
    console.error("Create approval rule error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to create approval rule",
      code: "CREATE_APPROVAL_RULE_ERROR",
    });
  }
});

// Update approval rule
router.put("/:ruleId", requireAdmin, validateUpdateRule, async (req, res) => {
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

    const { ruleId } = req.params;
    const {
      name,
      isManagerApprover,
      approvalType,
      percentageThreshold,
      specificApproverId,
      isActive,
    } = req.body;

    // Check if rule exists
    const existingRule = await prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: req.user.company_id,
      },
    });

    if (!existingRule) {
      return res.status(404).json({
        error: true,
        message: "Approval rule not found",
        code: "APPROVAL_RULE_NOT_FOUND",
      });
    }

    // Validate specific approver if provided
    if (specificApproverId && approvalType === "SPECIFIC_APPROVER") {
      const approver = await prisma.user.findFirst({
        where: {
          id: specificApproverId,
          companyId: req.user.company_id,
          role: { in: ["ADMIN", "MANAGER"] },
          isActive: true,
        },
      });

      if (!approver) {
        return res.status(400).json({
          error: true,
          message: "Invalid specific approver selected",
          code: "INVALID_SPECIFIC_APPROVER",
        });
      }
    }

    // Update rule
    const rule = await prisma.approvalRule.update({
      where: { id: ruleId },
      data: {
        ...(name && { name }),
        ...(typeof isManagerApprover === "boolean" && { isManagerApprover }),
        ...(approvalType && { approvalType }),
        ...(percentageThreshold && { percentageThreshold }),
        ...(specificApproverId && { specificApproverId }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
      include: {
        approvalSteps: {
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
        },
        specificApprover: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: "Approval rule updated successfully",
      data: { rule },
    });
  } catch (error) {
    console.error("Update approval rule error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to update approval rule",
      code: "UPDATE_APPROVAL_RULE_ERROR",
    });
  }
});

// Delete approval rule
router.delete("/:ruleId", requireAdmin, async (req, res) => {
  try {
    const { ruleId } = req.params;

    // Check if rule exists
    const existingRule = await prisma.approvalRule.findFirst({
      where: {
        id: ruleId,
        companyId: req.user.company_id,
      },
    });

    if (!existingRule) {
      return res.status(404).json({
        error: true,
        message: "Approval rule not found",
        code: "APPROVAL_RULE_NOT_FOUND",
      });
    }

    // Check if rule is being used by any expenses
    const expensesUsingRule = await prisma.expense.count({
      where: {
        companyId: req.user.company_id,
        status: "PENDING",
      },
    });

    if (expensesUsingRule > 0) {
      return res.status(400).json({
        error: true,
        message: "Cannot delete rule that is being used by pending expenses",
        code: "RULE_IN_USE",
      });
    }

    // Delete rule (steps will be cascade deleted)
    await prisma.approvalRule.delete({
      where: { id: ruleId },
    });

    res.json({
      success: true,
      message: "Approval rule deleted successfully",
    });
  } catch (error) {
    console.error("Delete approval rule error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to delete approval rule",
      code: "DELETE_APPROVAL_RULE_ERROR",
    });
  }
});

// Add approval step
router.post(
  "/:ruleId/steps",
  requireAdmin,
  validateCreateStep,
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

      const { ruleId } = req.params;
      const { stepNumber, approverRole, approverId } = req.body;

      // Check if rule exists
      const existingRule = await prisma.approvalRule.findFirst({
        where: {
          id: ruleId,
          companyId: req.user.company_id,
        },
      });

      if (!existingRule) {
        return res.status(404).json({
          error: true,
          message: "Approval rule not found",
          code: "APPROVAL_RULE_NOT_FOUND",
        });
      }

      // Validate approver
      const approver = await prisma.user.findFirst({
        where: {
          id: approverId,
          companyId: req.user.company_id,
          isActive: true,
        },
      });

      if (!approver) {
        return res.status(400).json({
          error: true,
          message: "Invalid approver selected",
          code: "INVALID_APPROVER",
        });
      }

      // Check if step number already exists
      const existingStep = await prisma.approvalStep.findFirst({
        where: {
          approvalRuleId: ruleId,
          stepNumber,
        },
      });

      if (existingStep) {
        return res.status(409).json({
          error: true,
          message: `Step ${stepNumber} already exists for this rule`,
          code: "STEP_ALREADY_EXISTS",
        });
      }

      // Create step
      const step = await prisma.approvalStep.create({
        data: {
          stepNumber,
          approverRole,
          approverId,
          approvalRuleId: ruleId,
        },
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
      });

      res.status(201).json({
        success: true,
        message: "Approval step created successfully",
        data: { step },
      });
    } catch (error) {
      console.error("Create approval step error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to create approval step",
        code: "CREATE_APPROVAL_STEP_ERROR",
      });
    }
  }
);

// Update approval step
router.put(
  "/:ruleId/steps/:stepId",
  requireAdmin,
  [
    body("stepNumber").optional().isInt({ min: 1 }),
    body("approverRole").optional().trim().isLength({ min: 1 }),
    body("approverId").optional().isUUID(),
  ],
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

      const { ruleId, stepId } = req.params;
      const { stepNumber, approverRole, approverId } = req.body;

      // Check if step exists
      const existingStep = await prisma.approvalStep.findFirst({
        where: {
          id: stepId,
          approvalRuleId: ruleId,
        },
        include: {
          approvalRule: {
            where: { companyId: req.user.company_id },
          },
        },
      });

      if (!existingStep) {
        return res.status(404).json({
          error: true,
          message: "Approval step not found",
          code: "APPROVAL_STEP_NOT_FOUND",
        });
      }

      // Validate approver if provided
      if (approverId) {
        const approver = await prisma.user.findFirst({
          where: {
            id: approverId,
            companyId: req.user.company_id,
            isActive: true,
          },
        });

        if (!approver) {
          return res.status(400).json({
            error: true,
            message: "Invalid approver selected",
            code: "INVALID_APPROVER",
          });
        }
      }

      // Update step
      const step = await prisma.approvalStep.update({
        where: { id: stepId },
        data: {
          ...(stepNumber && { stepNumber }),
          ...(approverRole && { approverRole }),
          ...(approverId && { approverId }),
        },
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
      });

      res.json({
        success: true,
        message: "Approval step updated successfully",
        data: { step },
      });
    } catch (error) {
      console.error("Update approval step error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to update approval step",
        code: "UPDATE_APPROVAL_STEP_ERROR",
      });
    }
  }
);

// Delete approval step
router.delete("/:ruleId/steps/:stepId", requireAdmin, async (req, res) => {
  try {
    const { ruleId, stepId } = req.params;

    // Check if step exists
    const existingStep = await prisma.approvalStep.findFirst({
      where: {
        id: stepId,
        approvalRuleId: ruleId,
      },
      include: {
        approvalRule: {
          where: { companyId: req.user.company_id },
        },
      },
    });

    if (!existingStep) {
      return res.status(404).json({
        error: true,
        message: "Approval step not found",
        code: "APPROVAL_STEP_NOT_FOUND",
      });
    }

    // Delete step
    await prisma.approvalStep.delete({
      where: { id: stepId },
    });

    res.json({
      success: true,
      message: "Approval step deleted successfully",
    });
  } catch (error) {
    console.error("Delete approval step error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to delete approval step",
      code: "DELETE_APPROVAL_STEP_ERROR",
    });
  }
});

export default router;
