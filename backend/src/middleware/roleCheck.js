import prisma from "../config/database.js";

// Check if user can access company resources
export const checkCompanyAccess = async (req, res, next) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({
        error: true,
        message: "Company ID required",
        code: "MISSING_COMPANY_ID",
      });
    }

    // Admin can access any company, others can only access their own
    if (req.user.role === "admin" || req.user.company_id === companyId) {
      return next();
    }

    return res.status(403).json({
      error: true,
      message: "Access denied to this company",
      code: "COMPANY_ACCESS_DENIED",
    });
  } catch (error) {
    console.error("Company access check error:", error);
    return res.status(500).json({
      error: true,
      message: "Error checking company access",
      code: "COMPANY_ACCESS_ERROR",
    });
  }
};

// Check if user can access expense (employee can only see their own, manager can see team's, admin can see all)
export const checkExpenseAccess = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        error: true,
        message: "Expense ID required",
        code: "MISSING_EXPENSE_ID",
      });
    }

    // Admin can access any expense
    if (req.user.role === "admin") {
      return next();
    }

    // Get expense details
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId },
      include: {
        employee: {
          select: {
            managerId: true,
          },
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

    // Employee can only access their own expenses
    if (req.user.role === "EMPLOYEE" && expense.employeeId !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: "Access denied to this expense",
        code: "EXPENSE_ACCESS_DENIED",
      });
    }

    // Manager can access their team's expenses
    if (req.user.role === "MANAGER") {
      // Check if the expense belongs to their direct report
      const teamMember = await prisma.user.findFirst({
        where: {
          managerId: req.user.id,
          id: expense.employeeId,
        },
      });

      if (!teamMember) {
        return res.status(403).json({
          error: true,
          message: "Access denied to this expense",
          code: "EXPENSE_ACCESS_DENIED",
        });
      }
    }

    req.expense = expense;
    next();
  } catch (error) {
    console.error("Expense access check error:", error);
    return res.status(500).json({
      error: true,
      message: "Error checking expense access",
      code: "EXPENSE_ACCESS_ERROR",
    });
  }
};

// Check if user can approve expense
export const checkApprovalAccess = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        error: true,
        message: "Expense ID required",
        code: "MISSING_EXPENSE_ID",
      });
    }

    // Get expense and check if user is the current approver
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

    // Admin can approve any expense
    if (req.user.role === "ADMIN") {
      req.expense = expense;
      return next();
    }

    // Check if user is the current approver
    if (expense.currentApproverId !== req.user.id) {
      return res.status(403).json({
        error: true,
        message: "You are not authorized to approve this expense",
        code: "APPROVAL_ACCESS_DENIED",
      });
    }

    req.expense = expense;
    next();
  } catch (error) {
    console.error("Approval access check error:", error);
    return res.status(500).json({
      error: true,
      message: "Error checking approval access",
      code: "APPROVAL_ACCESS_ERROR",
    });
  }
};
