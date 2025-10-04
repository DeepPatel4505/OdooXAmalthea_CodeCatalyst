import express from "express";
import { body, validationResult, query } from "express-validator";
import {
  authenticateToken,
  requireEmployeeOrAbove,
} from "../middleware/auth.js";
import { checkExpenseAccess } from "../middleware/roleCheck.js";
import prisma from "../config/database.js";
import currencyService from "../services/currencyService.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateCreateExpense = [
  body("amount").isFloat({ min: 0.01 }),
  body("currency").isLength({ min: 3, max: 7 }),
  body("category").trim().isLength({ min: 1 }),
  body("description").trim().isLength({ min: 1 }),
  body("expenseDate").isISO8601().toDate(),
];

const validateUpdateExpense = [
  body("amount").optional().isFloat({ min: 0.01 }),
  body("currency").optional().isLength({ min: 3, max: 7 }),
  body("category").optional().trim().isLength({ min: 1 }),
  body("description").optional().trim().isLength({ min: 1 }),
  body("expenseDate").optional().isISO8601().toDate(),
];

// Get all expenses
router.get(
  "/",
  requireEmployeeOrAbove,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim(),
    query("status").optional().isIn(["draft", "pending", "approved", "rejected"]),
    query("category").optional().trim(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
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

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const search = req.query.search;
      const status = req.query.status;
      const category = req.query.category;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const skip = (page - 1) * limit;

      // Build where clause based on user role
      let where = {
        companyId: req.user.company_id,
      };

      // Role-based filtering
      if (req.user.role === "EMPLOYEE") {
        where.employeeId = req.user.id;
      } else if (req.user.role === "MANAGER") {
        // Manager can see their team's expenses
        const teamMembers = await prisma.user.findMany({
          where: { managerId: req.user.id },
          select: { id: true },
        });
        where.employeeId = {
          in: [req.user.id, ...teamMembers.map((m) => m.id)],
        };
      }
      // Admin can see all expenses (no additional filter)

      // Add other filters
      if (search) {
        where.description = { contains: search, mode: "insensitive" };
      }

      if (status) {
        where.status = status.toUpperCase();
      }

      if (category) {
        where.category = category;
      }

      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) where.expenseDate.gte = new Date(startDate);
        if (endDate) where.expenseDate.lte = new Date(endDate);
      }

      const [expenses, total] = await Promise.all([
        prisma.expense.findMany({
          where,
          skip,
          take: limit,
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
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.expense.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          expenses,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get expenses error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to retrieve expenses",
        code: "GET_EXENSES_ERROR",
      });
    }
  }
);

// Get single expense
router.get(
  "/:expenseId",
  requireEmployeeOrAbove,
  checkExpenseAccess,
  async (req, res) => {
    try {
      const { expenseId } = req.params;

      const expense = await prisma.expense.findUnique({
        where: { id: expenseId },
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
      });

      if (!expense) {
        return res.status(404).json({
          error: true,
          message: "Expense not found",
          code: "EXPENSE_NOT_FOUND",
        });
      }

      res.json({
        success: true,
        data: { expense },
      });
    } catch (error) {
      console.error("Get expense error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to retrieve expense",
        code: "GET_EXPENSE_ERROR",
      });
    }
  }
);

// Create new expense
router.post(
  "/",
  requireEmployeeOrAbove,
  validateCreateExpense,
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

      const {
        amount,
        currency,
        category,
        description,
        expenseDate,
        receiptUrl,
        ocrData,
        status = "PENDING", // Default to PENDING, can be DRAFT
      } = req.body;

      // Get company currency
      const company = await prisma.company.findUnique({
        where: { id: req.user.company_id },
        select: { defaultCurrency: true },
      });

      const companyCurrency = company.defaultCurrency;

      // Convert currency if different from company currency
      let amountInCompanyCurrency = amount;
      let exchangeRate = null;

      if (currency !== companyCurrency) {
        try {
          const conversion = await currencyService.convertCurrency(
            amount,
            currency,
            companyCurrency
          );
          amountInCompanyCurrency = conversion.amount;
          exchangeRate = conversion.rate;
        } catch (error) {
          console.error("Currency conversion failed:", error);
          // Continue with original amount if conversion fails
        }
      }

      let currentApproverId = null;

      // Only set up approval workflow if not a draft
      if (status !== "DRAFT") {
        // Get approval workflow
        const approvalRule = await prisma.approvalRule.findFirst({
          where: {
            companyId: req.user.company_id,
            isActive: true,
          },
          include: {
            approvalSteps: true,
            specificApprover: true,
          },
        });

        if (approvalRule) {
          // Determine current approver based on rule type
          if (approvalRule.isManagerApprover) {
            // Find employee's manager
            const employee = await prisma.user.findUnique({
              where: { id: req.user.id },
              include: { manager: true },
            });

            if (employee.manager) {
              currentApproverId = employee.manager.id;
            }
          } else if (
            approvalRule.approvalType === "SEQUENTIAL" &&
            approvalRule.approvalSteps.length > 0
          ) {
            // Set current approver to first step approver
            currentApproverId = approvalRule.approvalSteps[0].approverId;
          } else if (
            approvalRule.approvalType === "SPECIFIC_APPROVER" &&
            approvalRule.specificApprover
          ) {
            // Set current approver to specific approver
            currentApproverId = approvalRule.specificApprover.id;
          }
        }
      }

      // Create expense
      const expense = await prisma.expense.create({
        data: {
          amount,
          currency,
          amountInCompanyCurrency,
          exchangeRate,
          category,
          description,
          expenseDate: new Date(expenseDate),
          receiptUrl,
          ocrData,
          employeeId: req.user.id,
          companyId: req.user.company_id,
          currentApproverId,
          status: status.toUpperCase(),
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
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
        },
      });

      res.status(201).json({
        success: true,
        message: status === "DRAFT" ? "Expense saved as draft" : "Expense submitted successfully",
        data: { expense },
      });
    } catch (error) {
      console.error("Create expense error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to create expense",
        code: "CREATE_EXPENSE_ERROR",
      });
    }
  }
);

// Update expense (only pending expenses)
router.put(
  "/:expenseId",
  requireEmployeeOrAbove,
  validateUpdateExpense,
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
      const updateData = req.body;

      // Check if expense exists and can be updated
      const existingExpense = await prisma.expense.findFirst({
        where: {
          id: expenseId,
          employeeId: req.user.id,
          status: { in: ["DRAFT", "PENDING"] },
        },
      });

      if (!existingExpense) {
        return res.status(404).json({
          error: true,
          message: "Expense not found or cannot be updated",
          code: "EXPENSE_NOT_UPDATABLE",
        });
      }

      // Handle currency conversion if changing currency
      if (updateData.currency || updateData.amount) {
        const company = await prisma.company.findUnique({
          where: { id: req.user.company_id },
          select: { defaultCurrency: true },
        });

        const finalAmount = updateData.amount || existingExpense.amount;
        const finalCurrency = updateData.currency || existingExpense.currency;

        if (finalCurrency !== company.defaultCurrency) {
          try {
            const conversion = await currencyService.convertCurrency(
              finalAmount,
              finalCurrency,
              company.defaultCurrency
            );
            updateData.amountInCompanyCurrency = conversion.amount;
            updateData.exchangeRate = conversion.rate;
          } catch (error) {
            console.error("Currency conversion failed:", error);
          }
        }
      }

      // Update expense
      const expense = await prisma.expense.update({
        where: { id: expenseId },
        data: {
          ...updateData,
          ...(updateData.expenseDate && {
            expenseDate: new Date(updateData.expenseDate),
          }),
        },
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Expense updated successfully",
        data: { expense },
      });
    } catch (error) {
      console.error("Update expense error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to update expense",
        code: "UPDATE_EXPENSE_ERROR",
      });
    }
  }
);

// Delete expense (only pending expenses)
router.delete("/:expenseId", requireEmployeeOrAbove, async (req, res) => {
  try {
    const { expenseId } = req.params;

    // Check if expense exists and can be deleted
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id: expenseId,
        employeeId: req.user.id,
        status: { in: ["DRAFT", "PENDING"] },
      },
    });

    if (!existingExpense) {
      return res.status(404).json({
        error: true,
        message: "Expense not found or cannot be deleted",
        code: "EXPENSE_NOT_DELETABLE",
      });
    }

    // Delete expense
    await prisma.expense.delete({
      where: { id: expenseId },
    });

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to delete expense",
      code: "DELETE_EXPENSE_ERROR",
    });
  }
});

// Get expense statistics
router.get("/stats/summary", requireEmployeeOrAbove, async (req, res) => {
  try {
    const { period = "30" } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build where clause based on user role
    let where = {
      companyId: req.user.company_id,
      createdAt: { gte: startDate },
    };

    if (req.user.role === "EMPLOYEE") {
      where.employeeId = req.user.id;
    } else if (req.user.role === "MANAGER") {
      const teamMembers = await prisma.user.findMany({
        where: { managerId: req.user.id },
        select: { id: true },
      });
      where.employeeId = { in: [req.user.id, ...teamMembers.map((m) => m.id)] };
    }

    const [
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses,
      totalAmount,
    ] = await Promise.all([
      prisma.expense.count({ where }),
      prisma.expense.count({ where: { ...where, status: "PENDING" } }),
      prisma.expense.count({ where: { ...where, status: "APPROVED" } }),
      prisma.expense.count({ where: { ...where, status: "REJECTED" } }),
      prisma.expense.aggregate({
        where: { ...where, status: "APPROVED" },
        _sum: { amountInCompanyCurrency: true },
      }),
    ]);

    const statistics = {
      totalExpenses,
      pendingExpenses,
      approvedExpenses,
      rejectedExpenses,
      totalAmountApproved: totalAmount._sum.amountInCompanyCurrency || 0,
      approvalRate:
        totalExpenses > 0 ? (approvedExpenses / totalExpenses) * 100 : 0,
    };

    res.json({
      success: true,
      data: { statistics, period: `${days} days` },
    });
  } catch (error) {
    console.error("Get expense statistics error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve expense statistics",
      code: "GET_STATISTICS_ERROR",
    });
  }
});

export default router;
