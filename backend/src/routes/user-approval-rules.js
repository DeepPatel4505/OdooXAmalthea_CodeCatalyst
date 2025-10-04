import express from "express";
import { body, validationResult } from "express-validator";
import prisma from "../config/database.js";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// Get all users with their approval rules
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        companyId: req.user.company_id,
        isActive: true,
      },
      include: {
        userApprovalRules: {
          where: { isActive: true },
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
      orderBy: { firstName: "asc" },
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    console.error("Get users with approval rules error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to fetch users with approval rules",
      code: "GET_USERS_ERROR",
    });
  }
});

// Get preset approval rules
router.get("/presets", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const presets = await prisma.presetApprovalRule.findMany({
      where: { isActive: true },
      include: {
        approvers: {
          orderBy: { sequenceOrder: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: { presets },
    });
  } catch (error) {
    console.error("Get preset rules error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to fetch preset approval rules",
      code: "GET_PRESETS_ERROR",
    });
  }
});

// Create user-specific approval rule
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("ruleName").notEmpty().withMessage("Rule name is required"),
    body("approvers").isArray().withMessage("Approvers must be an array"),
    body("approvers.*.approverId")
      .notEmpty()
      .withMessage("Approver ID is required"),
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

      const {
        userId,
        ruleName,
        description,
        isManagerApprover,
        managerId,
        approvalType = "SEQUENTIAL",
        useSequence = true,
        percentageThreshold,
        approvers,
      } = req.body;

      // Verify user exists and belongs to company
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
          companyId: req.user.company_id,
          isActive: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          error: true,
          message: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Verify manager if provided
      if (managerId) {
        const manager = await prisma.user.findFirst({
          where: {
            id: managerId,
            companyId: req.user.company_id,
            isActive: true,
          },
        });

        if (!manager) {
          return res.status(400).json({
            error: true,
            message: "Invalid manager selected",
            code: "INVALID_MANAGER",
          });
        }
      }

      // Verify approvers
      const approverIds = approvers.map((a) => a.approverId);
      const validApprovers = await prisma.user.findMany({
        where: {
          id: { in: approverIds },
          companyId: req.user.company_id,
          isActive: true,
        },
      });

      if (validApprovers.length !== approverIds.length) {
        return res.status(400).json({
          error: true,
          message: "One or more approvers are invalid",
          code: "INVALID_APPROVERS",
        });
      }

      // Create user approval rule with approvers
      const userRule = await prisma.userApprovalRule.create({
        data: {
          userId,
          ruleName,
          description,
          isManagerApprover,
          managerId,
          approvalType,
          useSequence,
          percentageThreshold,
          approvers: {
            create: approvers.map((approver, index) => ({
              approverId: approver.approverId,
              isRequired: approver.isRequired || false,
              sequenceOrder: approver.sequenceOrder || index + 1,
            })),
          },
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

      res.status(201).json({
        success: true,
        message: "User approval rule created successfully",
        data: { userRule },
      });
    } catch (error) {
      console.error("Create user approval rule error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to create user approval rule",
        code: "CREATE_USER_RULE_ERROR",
      });
    }
  }
);

// Apply preset rule to user
router.post(
  "/apply-preset",
  authenticateToken,
  requireAdmin,
  [
    body("userId").notEmpty().withMessage("User ID is required"),
    body("presetId").notEmpty().withMessage("Preset ID is required"),
    body("managerId").optional(),
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

      const { userId, presetId, managerId } = req.body;

      // Get preset rule
      const preset = await prisma.presetApprovalRule.findFirst({
        where: { id: presetId, isActive: true },
        include: {
          approvers: {
            orderBy: { sequenceOrder: "asc" },
          },
        },
      });

      if (!preset) {
        return res.status(404).json({
          error: true,
          message: "Preset rule not found",
          code: "PRESET_NOT_FOUND",
        });
      }

      // Get all managers for the company to map roles to actual users
      const managers = await prisma.user.findMany({
        where: {
          companyId: req.user.company_id,
          role: { in: ["MANAGER", "ADMIN"] },
          isActive: true,
        },
      });

      // Create approvers array by mapping roles to actual users
      const approvers = [];
      for (const presetApprover of preset.approvers) {
        // Find a user with the matching role
        const approverUser = managers.find(
          (m) => m.role === presetApprover.approverRole
        );
        if (approverUser) {
          approvers.push({
            approverId: approverUser.id,
            isRequired: presetApprover.isRequired,
            sequenceOrder: presetApprover.sequenceOrder,
          });
        }
      }

      // Create user approval rule
      const userRule = await prisma.userApprovalRule.create({
        data: {
          userId,
          ruleName: `${preset.name} (Applied)`,
          description: preset.description,
          isManagerApprover: preset.isManagerApprover,
          managerId: managerId || null,
          approvalType: preset.approvalType,
          useSequence: preset.useSequence,
          percentageThreshold: preset.percentageThreshold,
          isPreset: true,
          approvers: {
            create: approvers,
          },
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

      res.status(201).json({
        success: true,
        message: "Preset rule applied successfully",
        data: { userRule },
      });
    } catch (error) {
      console.error("Apply preset rule error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to apply preset rule",
        code: "APPLY_PRESET_ERROR",
      });
    }
  }
);

// Update user approval rule
router.put(
  "/:ruleId",
  authenticateToken,
  requireAdmin,
  [
    body("ruleName")
      .optional()
      .notEmpty()
      .withMessage("Rule name cannot be empty"),
    body("approvers")
      .optional()
      .isArray()
      .withMessage("Approvers must be an array"),
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

      const { ruleId } = req.params;
      const {
        ruleName,
        description,
        isManagerApprover,
        managerId,
        approvalType,
        useSequence,
        percentageThreshold,
        approvers,
      } = req.body;

      // Verify rule exists and belongs to company
      const existingRule = await prisma.userApprovalRule.findFirst({
        where: {
          id: ruleId,
          user: { companyId: req.user.company_id },
        },
      });

      if (!existingRule) {
        return res.status(404).json({
          error: true,
          message: "User approval rule not found",
          code: "RULE_NOT_FOUND",
        });
      }

      // Update rule
      const updateData = {
        ...(ruleName && { ruleName }),
        ...(description !== undefined && { description }),
        ...(isManagerApprover !== undefined && { isManagerApprover }),
        ...(managerId !== undefined && { managerId }),
        ...(approvalType && { approvalType }),
        ...(useSequence !== undefined && { useSequence }),
        ...(percentageThreshold !== undefined && { percentageThreshold }),
      };

      // If approvers are provided, update them
      if (approvers) {
        // Delete existing approvers
        await prisma.userRuleApprover.deleteMany({
          where: { userRuleId: ruleId },
        });

        // Create new approvers
        await prisma.userRuleApprover.createMany({
          data: approvers.map((approver, index) => ({
            userRuleId: ruleId,
            approverId: approver.approverId,
            isRequired: approver.isRequired || false,
            sequenceOrder: approver.sequenceOrder || index + 1,
          })),
        });
      }

      const updatedRule = await prisma.userApprovalRule.update({
        where: { id: ruleId },
        data: updateData,
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

      res.json({
        success: true,
        message: "User approval rule updated successfully",
        data: { userRule: updatedRule },
      });
    } catch (error) {
      console.error("Update user approval rule error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to update user approval rule",
        code: "UPDATE_USER_RULE_ERROR",
      });
    }
  }
);

// Delete user approval rule
router.delete("/:ruleId", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { ruleId } = req.params;

    // Verify rule exists and belongs to company
    const existingRule = await prisma.userApprovalRule.findFirst({
      where: {
        id: ruleId,
        user: { companyId: req.user.company_id },
      },
    });

    if (!existingRule) {
      return res.status(404).json({
        error: true,
        message: "User approval rule not found",
        code: "RULE_NOT_FOUND",
      });
    }

    // Soft delete by setting isActive to false
    await prisma.userApprovalRule.update({
      where: { id: ruleId },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "User approval rule deleted successfully",
    });
  } catch (error) {
    console.error("Delete user approval rule error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to delete user approval rule",
      code: "DELETE_USER_RULE_ERROR",
    });
  }
});

export default router;
