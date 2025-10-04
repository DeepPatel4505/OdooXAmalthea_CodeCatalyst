import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import { config } from "../config/environment.js";
import prisma from "../config/database.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Validation middleware
const validateSignup = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("firstName").trim().isLength({ min: 1 }),
  body("lastName").trim().isLength({ min: 1 }),
  body("company").trim().isLength({ min: 1 }),
  body("country").trim().isLength({ min: 2, max: 3 }),
  body("role").isIn(["admin", "manager", "employee"]),
];

const validateLogin = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

// Signup endpoint
router.post("/signup", validateSignup, async (req, res) => {
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

    const { email, password, firstName, lastName, company, country, role } =
      req.body;

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

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create company if it doesn't exist (for first admin signup)
    let companyRecord = await prisma.company.findFirst({
      where: { name: company },
    });

    if (!companyRecord) {
      // Get currency for country (mock implementation)
      const countryCurrencies = {
        US: "USD",
        GB: "GBP",
        DE: "EUR",
        FR: "EUR",
        JP: "JPY",
        CA: "CAD",
        AU: "AUD",
        IN: "INR",
        BR: "BRL",
        CN: "CNY",
      };

      companyRecord = await prisma.company.create({
        data: {
          name: company,
          country: country,
          defaultCurrency: countryCurrencies[country] || "USD",
        },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: role.toUpperCase(),
        companyId: companyRecord.id,
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

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          company: user.company,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to create user",
      code: "SIGNUP_ERROR",
    });
  }
});

// Login endpoint
router.post("/login", validateLogin, async (req, res) => {
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

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          company: user.company,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: true,
      message: "Login failed",
      code: "LOGIN_ERROR",
    });
  }
});

// Get current user profile
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          role: req.user.role,
          company: {
            name: req.user.company_name,
            defaultCurrency: req.user.default_currency,
            country: req.user.country,
          },
        },
      },
    });
  } catch (error) {
    console.error("Profile error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to get profile",
      code: "PROFILE_ERROR",
    });
  }
});

// Logout endpoint (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Logout successful",
  });
});

export default router;
