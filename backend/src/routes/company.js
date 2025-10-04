import express from "express";
import { body, validationResult } from "express-validator";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import prisma from "../config/database.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Validation middleware
const validateUpdateSettings = [
  body("name").optional().trim().isLength({ min: 1 }),
  body("country").optional().trim().isLength({ min: 2, max: 3 }),
  body("defaultCurrency").optional().trim().isLength({ min: 3, max: 3 }),
];

// Get company settings (Admin only)
router.get("/settings", requireAdmin, async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.company_id },
      select: {
        id: true,
        name: true,
        country: true,
        defaultCurrency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      return res.status(404).json({
        error: true,
        message: "Company not found",
        code: "COMPANY_NOT_FOUND",
      });
    }

    res.json({
      success: true,
      data: { company },
    });
  } catch (error) {
    console.error("Get company settings error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve company settings",
      code: "GET_COMPANY_SETTINGS_ERROR",
    });
  }
});

// Update company settings (Admin only)
router.put(
  "/settings",
  requireAdmin,
  validateUpdateSettings,
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

      const { name, country, defaultCurrency } = req.body;

      // Check if company exists
      const existingCompany = await prisma.company.findUnique({
        where: { id: req.user.company_id },
      });

      if (!existingCompany) {
        return res.status(404).json({
          error: true,
          message: "Company not found",
          code: "COMPANY_NOT_FOUND",
        });
      }

      // Update company
      const updatedCompany = await prisma.company.update({
        where: { id: req.user.company_id },
        data: {
          ...(name && { name }),
          ...(country && { country }),
          ...(defaultCurrency && { defaultCurrency }),
        },
        select: {
          id: true,
          name: true,
          country: true,
          defaultCurrency: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: "Company settings updated successfully",
        data: { company: updatedCompany },
      });
    } catch (error) {
      console.error("Update company settings error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to update company settings",
        code: "UPDATE_COMPANY_SETTINGS_ERROR",
      });
    }
  }
);

export default router;
