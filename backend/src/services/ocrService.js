import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

class OCRService {
  constructor() {
    this.worker = null;
  }

  // Initialize Tesseract worker
  async initializeWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker("eng");
      await this.worker.load();
      await this.worker.loadLanguage("eng");
      await this.worker.initialize("eng");
    }
    return this.worker;
  }

  // Extract text from image
  async extractText(imagePath) {
    try {
      const worker = await this.initializeWorker();
      const {
        data: { text },
      } = await worker.recognize(imagePath);
      return text;
    } catch (error) {
      console.error("OCR extraction error:", error);
      throw new Error("Failed to extract text from image");
    }
  }

  // Parse receipt data from extracted text
  parseReceiptData(text) {
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);

    // Extract amount (look for currency patterns)
    const amountPattern =
      /(\$|€|£|¥|₹|R\$|C\$|A\$|S\$)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/;
    const amountMatch = text.match(amountPattern);
    const amount = amountMatch ? amountMatch[2].replace(/,/g, "") : null;

    // Extract date (look for date patterns)
    const datePattern =
      /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})|(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})/;
    const dateMatch = text.match(datePattern);
    const date = dateMatch ? this.parseDate(dateMatch[0]) : null;

    // Extract merchant name (usually the first non-empty line or line with business indicators)
    const merchantPattern =
      /(restaurant|cafe|store|shop|market|hotel|gas|fuel|taxi|uber|lyft)/i;
    const merchantLine = lines.find(
      (line) =>
        merchantPattern.test(line) ||
        (line.length > 3 && line.length < 50 && !amountPattern.test(line))
    );
    const merchant = merchantLine || lines[0] || "Unknown Merchant";

    // Determine category based on keywords
    const category = this.determineCategory(text);

    return {
      amount: amount ? parseFloat(amount) : null,
      date: date,
      merchant: merchant,
      category: category,
      rawText: text,
      confidence: 0.8, // Mock confidence score
    };
  }

  // Parse date string to ISO format
  parseDate(dateString) {
    try {
      // Handle different date formats
      const formats = [
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/, // MM/DD/YYYY or DD/MM/YYYY
        /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/, // YYYY/MM/DD
        /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2})/, // MM/DD/YY or DD/MM/YY
      ];

      for (const format of formats) {
        const match = dateString.match(format);
        if (match) {
          let year, month, day;

          if (format === formats[0]) {
            // MM/DD/YYYY or DD/MM/YYYY
            month = parseInt(match[1]);
            day = parseInt(match[2]);
            year = parseInt(match[3]);

            // Assume MM/DD/YYYY if month > 12, otherwise DD/MM/YYYY
            if (month > 12) {
              [month, day] = [day, month];
            }
          } else if (format === formats[1]) {
            // YYYY/MM/DD
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
          } else {
            // MM/DD/YY or DD/MM/YY
            month = parseInt(match[1]);
            day = parseInt(match[2]);
            year = parseInt(match[3]) + 2000;

            if (month > 12) {
              [month, day] = [day, month];
            }
          }

          return new Date(year, month - 1, day).toISOString().split("T")[0];
        }
      }

      return null;
    } catch (error) {
      console.error("Date parsing error:", error);
      return null;
    }
  }

  // Determine expense category based on text content
  determineCategory(text) {
    const categories = {
      "Meals & Entertainment": [
        "restaurant",
        "cafe",
        "food",
        "dining",
        "bar",
        "coffee",
        "lunch",
        "dinner",
        "breakfast",
      ],
      Transportation: [
        "taxi",
        "uber",
        "lyft",
        "gas",
        "fuel",
        "parking",
        "toll",
        "metro",
        "bus",
        "train",
      ],
      "Office Supplies": [
        "office",
        "supplies",
        "stationery",
        "paper",
        "pen",
        "pencil",
        "notebook",
      ],
      Travel: [
        "hotel",
        "flight",
        "airline",
        "travel",
        "accommodation",
        "lodging",
      ],
      Training: [
        "training",
        "course",
        "education",
        "seminar",
        "workshop",
        "conference",
      ],
      Software: ["software", "app", "license", "subscription", "saas", "cloud"],
      Hardware: [
        "computer",
        "laptop",
        "monitor",
        "keyboard",
        "mouse",
        "hardware",
        "equipment",
      ],
    };

    const lowerText = text.toLowerCase();

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        return category;
      }
    }

    return "Other";
  }

  // Process receipt image and return structured data
  async processReceipt(imagePath) {
    try {
      const text = await this.extractText(imagePath);
      const parsedData = this.parseReceiptData(text);

      return {
        success: true,
        data: parsedData,
      };
    } catch (error) {
      console.error("Receipt processing error:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Cleanup worker
  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export default new OCRService();
