import express from "express";
import multer from "multer";
import {
  authenticateToken,
  requireEmployeeOrAbove,
} from "../middleware/auth.js";
import ocrService from "../services/ocrService.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept image files only
    const allowedTypes = [
      "image/jpeg",
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Invalid file type. Only images and PDFs are allowed."),
        false
      );
    }
  },
});

// Upload receipt and process with OCR
router.post(
  "/process-receipt",
  requireEmployeeOrAbove,
  upload.single("receipt"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: true,
          message: "No file uploaded",
          code: "NO_FILE_UPLOADED",
        });
      }

      const filePath = req.file.path;
      const mimeType = req.file.mimetype;

      // Process with OCR
      const result = await ocrService.processReceipt(filePath);

      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupError) {
        console.warn("Failed to clean up uploaded file:", cleanupError);
      }

      if (!result.success) {
        return res.status(400).json({
          error: true,
          message: "OCR processing failed",
          code: "OCR_PROCESSING_FAILED",
          details: result.error,
        });
      }

      res.json({
        success: true,
        message: "Receipt processed successfully",
        data: {
          ocrData: result.data,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType,
        },
      });
    } catch (error) {
      console.error("OCR processing error:", error);

      // Clean up uploaded file on error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn("Failed to clean up uploaded file:", cleanupError);
        }
      }

      res.status(500).json({
        error: true,
        message: "Failed to process receipt",
        code: "OCR_PROCESSING_ERROR",
      });
    }
  }
);

// Get OCR processing status (for future use with async processing)
router.get("/status/:jobId", requireEmployeeOrAbove, async (req, res) => {
  try {
    const { jobId } = req.params;

    // This would be implemented for asynchronous OCR processing
    // For now, return a placeholder response
    res.json({
      success: true,
      data: {
        jobId,
        status: "completed",
        message: "Synchronous processing completed",
        result: null,
      },
    });
  } catch (error) {
    console.error("Get OCR status error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to get OCR processing status",
      code: "OCR_STATUS_ERROR",
    });
  }
});

// Get supported file types
router.get("/supported-types", (req, res) => {
  try {
    const supportedTypes = [
      {
        type: "image/jpeg",
        extension: "jpg",
        description: "JPEG Images",
      },
      {
        type: "image/jpeg",
        extension: "jpeg",
        description: "JPEG Images",
      },
      {
        type: "image/png",
        extension: "png",
        description: "PNG Images",
      },
      {
        type: "image/gif",
        extension: "gif",
        description: "GIF Images",
      },
      {
        type: "application/pdf",
        extension: "pdf",
        description: "PDF Documents",
      },
    ];

    res.json({
      success: true,
      data: {
        supportedTypes,
        maxFileSize: "5MB",
        recommendations: [
          "Use high-resolution images for better accuracy",
          "Ensure good lighting and contrast",
          "Position text horizontally for best results",
          "Avoid blurry or skewed images",
        ],
      },
    });
  } catch (error) {
    console.error("Get supported types error:", error);
    res.status(500).json({
      error: true,
      message: "Failed to retrieve supported file types",
      code: "GET_SUPPORTED_TYPES_ERROR",
    });
  }
});

export default router;
