import jwt from "jsonwebtoken";
import { config } from "../config/environment.js";
import prisma from "../config/database.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: true,
        message: "Access token required",
        code: "MISSING_TOKEN",
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Get user from database to ensure they still exist and are active
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.userId,
        isActive: true,
      },
      include: {
        company: {
          select: {
            name: true,
            defaultCurrency: true,
            country: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({
        error: true,
        message: "User not found or inactive",
        code: "USER_NOT_FOUND",
      });
    }

    // Flatten the user object for easier access
    req.user = {
      ...user,
      company_name: user.company.name,
      default_currency: user.company.defaultCurrency,
      country: user.company.country,
      company_id: user.companyId,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: true,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: true,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    console.error("Auth middleware error:", error);
    return res.status(500).json({
      error: true,
      message: "Authentication error",
      code: "AUTH_ERROR",
    });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: true,
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      });
    }

    // Convert user role to lowercase for comparison
    const userRole = req.user.role.toLowerCase();

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: true,
        message: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    }

    next();
  };
};

export const requireAdmin = requireRole(["admin"]);
export const requireManagerOrAdmin = requireRole(["manager", "admin"]);
export const requireEmployeeOrAbove = requireRole([
  "employee",
  "manager",
  "admin",
]);
