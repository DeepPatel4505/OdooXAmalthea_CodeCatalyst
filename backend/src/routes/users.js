import express from "express";
import { body, validationResult, query } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import prisma from "../config/database.js";
import bcrypt from "bcryptjs";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateCreateUser = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("firstName").trim().isLength({ min: 1 }),
  body("lastName").trim().isLength({ min: 1 }),
  body("role").isIn(["admin", "manager", "employee"]),
  body("managerId").optional().isUUID(),
];

const validateUpdateUser = [
  body("firstName").optional().trim().isLength({ min: 1 }),
  body("lastName").optional().trim().isLength({ min: 1 }),
  body("role").optional().isIn(["admin", "manager", "employee"]),
  body("managerId").optional().isUUID(),
  body("isActive").optional().isBoolean(),
];

// Get all users (Admin only)
router.get(
  "/",
  requireAdmin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("search").optional().trim(),
    query("role").optional().isIn(["admin", "manager", "employee"]),
    query("status").optional().isIn(["active", "inactive"]),
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
      const role = req.query.role;
      const status = req.query.status;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = {
        companyId: req.user.company_id,
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }),
        ...(role && { role: role.toUpperCase() }),
        ...(status === "active" && { isActive: true }),
        ...(status === "inactive" && { isActive: false }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
            managerId: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to retrieve users",
        code: "GET_USERS_ERROR",
      });
    }
  }
);

// Get single user
router.get("/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: req.user.company_id,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        subordinates: {
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

    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve user",
      code: "GET_USER_ERROR",
    });
  }
});

// Create new user (Admin only)
router.post("/", requireAdmin, validateCreateUser, async (req, res) => {
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

    const { email, password, firstName, lastName, role, managerId } = req.body;

    // console.log("Creating user with data:", {
    //   email,
    //   firstName,
    //   lastName,
    //   role,
    //   managerId,
    //   companyId: req.user.company_id,
    // });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "User already exists",
        code: "USER_EXISTS",
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await prisma.user.findFirst({
        where: {
          id: managerId,
          companyId: req.user.company_id,
          role: { in: ["ADMIN", "MANAGER"] },
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

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // console.log("About to create user in database...");

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role.toUpperCase(),
        companyId: req.user.company_id,
        managerId: managerId || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        managerId: true,
        createdAt: true,
      },
    });

    // console.log("User created successfully:", user);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Create user error:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({
      error: true,
      message: "Failed to create user",
      code: "CREATE_USER_ERROR",
    });
  }
});

// Update user (Admin only)
router.put("/:userId", requireAdmin, validateUpdateUser, async (req, res) => {
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

    const { userId } = req.params;
    const { firstName, lastName, role, managerId, isActive } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: req.user.company_id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: true,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Validate manager if provided
    if (managerId) {
      const manager = await prisma.user.findFirst({
        where: {
          id: managerId,
          companyId: req.user.company_id,
          role: { in: ["ADMIN", "MANAGER"] },
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

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(role && { role: role.toUpperCase() }),
        ...(managerId && { managerId }),
        ...(typeof isActive === "boolean" && { isActive }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        managerId: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      message: "User updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to update user",
      code: "UPDATE_USER_ERROR",
    });
  }
});

// Delete user (Admin only)
router.delete("/:userId", requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        companyId: req.user.company_id,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        error: true,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({
        error: true,
        message: "Cannot delete your own account",
        code: "SELF_DELETE_NOT_ALLOWED",
      });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to delete user",
      code: "DELETE_USER_ERROR",
    });
  }
});

// Get managers for dropdown
router.get("/managers/list", requireAdmin, async (req, res) => {
  try {
    const managers = await prisma.user.findMany({
      where: {
        companyId: req.user.company_id,
        role: { in: ["ADMIN", "MANAGER"] },
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
    });

    res.json({
      success: true,
      data: { managers },
    });
  } catch (error) {
    console.error("Get managers error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve managers",
      code: "GET_MANAGERS_ERROR",
    });
  }
});

// Get user statistics (Admin only)
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const where = {
      companyId: req.user.company_id,
    };

    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      managerUsers,
      employeeUsers,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, isActive: true } }),
      prisma.user.count({ where: { ...where, isActive: false } }),
      prisma.user.count({ where: { ...where, role: "ADMIN" } }),
      prisma.user.count({ where: { ...where, role: "MANAGER" } }),
      prisma.user.count({ where: { ...where, role: "EMPLOYEE" } }),
    ]);

    const statistics = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      adminUsers,
      managerUsers,
      employeeUsers,
    };

    res.json({
      success: true,
      data: { statistics },
    });
  } catch (error) {
    console.error("Get user statistics error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve user statistics",
      code: "GET_USER_STATISTICS_ERROR",
    });
  }
});

export default router;
