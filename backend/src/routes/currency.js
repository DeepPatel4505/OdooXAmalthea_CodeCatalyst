import express from "express";
import { query, body, validationResult } from "express-validator";
import { authenticateToken } from "../middleware/auth.js";
import currencyService from "../services/currencyService.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get supported currencies
router.get("/supported", (req, res) => {
  try {
    const currencies = currencyService.getSupportedCurrencies();

    res.json({
      success: true,
      data: { currencies },
    });
  } catch (error) {
    console.error("Get supported currencies error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve supported currencies",
      code: "GET_CURRENCIES_ERROR",
    });
  }
});

// Get countries
router.get("/countries", async (req, res) => {
  try {
    const countries = await currencyService.getCountries();

    res.json({
      success: true,
      data: { countries },
    });
  } catch (error) {
    console.error("Get countries error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve countries",
      code: "GET_COUNTRIES_ERROR",
    });
  }
});

// Get exchange rates
router.get(
  "/rates",
  [
    query("base").optional().isLength({ min: 3, max: 6 }),
    query("symbols").optional().trim(),
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

      const base = req.query.base || "USD";
      const rates = await currencyService.getExchangeRates(base);

      res.json({
        success: true,
        data: { rates },
      });
    } catch (error) {
      console.error("Get exchange rates error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to retrieve exchange rates",
        code: "GET_EXCHANGE_RATES_ERROR",
      });
    }
  }
);

// Convert currency
router.post(
  "/convert",
  [
    body("amount").isFloat({ min: 0.01 }),
    body("from").isLength({ min: 3, max: 6 }),
    body("to").isLength({ min: 3, max: 6 }),
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

      const { amount, from, to } = req.body;
      const conversion = await currencyService.convertCurrency(
        amount,
        from,
        to
      );

      res.json({
        success: true,
        data: { conversion },
      });
    } catch (error) {
      console.error("Currency conversion error:", error);
      res.status(500).json({
        error: true,
        message: "Failed to convert currency",
        code: "CURRENCY_CONVERSION_ERROR",
      });
    }
  }
);

export default router;
