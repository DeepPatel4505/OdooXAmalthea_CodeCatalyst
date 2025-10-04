import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Save, Loader2 } from "lucide-react";
import { expenseAPI } from "@/services/api";
import { toast } from "sonner";

const EXPENSE_CATEGORIES = [
  "Meals & Entertainment",
  "Transportation",
  "Office Supplies",
  "Travel",
  "Training",
  "Software",
  "Hardware",
  "Other",
];

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
];

const COMPANY_CURRENCY = "USD";

// Status mapping from backend to frontend
const mapExpenseStatus = (status) => {
  switch (status) {
    case "DRAFT":
      return "draft";
    case "PENDING":
      return "submitted";
    case "APPROVED":
      return "approved";
    case "REJECTED":
      return "rejected";
    default:
      return status.toLowerCase();
  }
};

export function ExpenseSubmission() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode); // show loading spinner for edit
  const [uploadedFile, setUploadedFile] = useState(null);
  const [ocrData, setOcrData] = useState(null);
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [exchangeRate, setExchangeRate] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [expenseData, setExpenseData] = useState(null);
  const [isReadonly, setIsReadonly] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      currency: "USD",
    },
  });

  const selectedCurrency = watch("currency");
  const amount = watch("amount");
  const currency = CURRENCIES.find((c) => c.code === selectedCurrency);

  // 🟢 Step 1: Load existing expense if in edit mode
  useEffect(() => {
    if (!isEditMode) return;

    const fetchExpense = async () => {
      setIsLoading(true);
      try {
        const response = await expenseAPI.getExpense(id);
        const expense = response.data.expense;

        // Populate form with expense data
        setExpenseData(expense);
        reset({
          amount: parseFloat(expense.amount),
          category: expense.category,
          description: expense.description,
          date: new Date(expense.expenseDate).toISOString().split("T")[0],
          currency: expense.currency,
        });

        // Set readonly mode for submitted/approved/rejected expenses
        const mappedStatus = mapExpenseStatus(expense.status);
        if (
          mappedStatus === "submitted" ||
          mappedStatus === "approved" ||
          mappedStatus === "rejected"
        ) {
          setIsReadonly(true);
        }
      } catch (error) {
        console.error("Failed to load expense:", error);
        // Navigate back to history if expense not found
        navigate("/employee/expenses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpense();
  }, [id, isEditMode, reset, navigate]);

  // 🟢 Step 2: Handle currency conversion with real API
  useEffect(() => {
    const convertCurrency = async () => {
      if (
        !amount ||
        !selectedCurrency ||
        selectedCurrency === COMPANY_CURRENCY
      ) {
        setConvertedAmount(null);
        setExchangeRate(null);
        return;
      }

      setIsConverting(true);
      try {
        // Try real currency API first
        const { currencyAPI } = await import("@/services/api");
        const response = await currencyAPI.convertCurrency(
          parseFloat(amount),
          selectedCurrency,
          COMPANY_CURRENCY
        );

        if (response.success && response.data) {
          setExchangeRate(response.data.rate);
          setConvertedAmount(response.data.convertedAmount);
        } else {
          throw new Error("Currency conversion failed");
        }
      } catch (error) {
        console.error("Currency conversion failed, using mock rates:", error);
        // Fallback to mock rates for development
        const mockRates = {
          EUR: 0.85,
          GBP: 0.73,
          JPY: 110.0,
          CAD: 1.25,
          AUD: 1.35,
          INR: 75.0,
          BRL: 5.2,
          CNY: 6.45,
          CHF: 0.92,
        };
        const rate = mockRates[selectedCurrency] || 1;
        setExchangeRate(rate);
        setConvertedAmount(parseFloat(amount) * rate);
      } finally {
        setIsConverting(false);
      }
    };

    convertCurrency();
  }, [amount, selectedCurrency]);

  // 🟢 Step 3: Handle OCR upload with real API integration
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG) or PDF file");
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);
    setIsProcessingOcr(true);

    try {
      // Use real OCR API
      const { ocrAPI } = await import("@/services/api");
      const response = await ocrAPI.processReceipt(file);

      if (response.success && response.data) {
        const ocrData = response.data;
        setOcrData(ocrData);

        // Auto-populate form with OCR data
        if (ocrData.amount) setValue("amount", parseFloat(ocrData.amount));
        if (ocrData.date) setValue("date", ocrData.date);
        if (ocrData.merchant) setValue("description", ocrData.merchant);
        if (ocrData.category) setValue("category", ocrData.category);
      } else {
        throw new Error(response.message || "OCR processing failed");
      }
    } catch (error) {
      console.error("OCR processing failed:", error);
      // Fallback to mock data for development
      const mockOcrData = {
        amount: "125.50",
        date: new Date().toISOString().split("T")[0],
        merchant: "Receipt OCR",
        category: "Meals & Entertainment",
      };
      setOcrData(mockOcrData);
      setValue("amount", mockOcrData.amount);
      setValue("date", mockOcrData.date);
      setValue("description", mockOcrData.merchant);
      setValue("category", mockOcrData.category);

      // Show user-friendly message
      toast.error("OCR processing failed. Using mock data for demonstration.");
    } finally {
      setIsProcessingOcr(false);
    }
  };

  // 🟢 Step 4: Submit (create or update) with enhanced validation
  const onSubmit = async (data, status = "PENDING") => {
    setIsSubmitting(true);
    try {
      // Enhanced validation
      if (!data.amount || data.amount <= 0) {
        throw new Error("Please enter a valid amount greater than 0");
      }
      if (!data.currency) {
        throw new Error("Please select a currency");
      }
      if (!data.category) {
        throw new Error("Please select a category");
      }
      if (!data.description || data.description.trim().length < 3) {
        throw new Error("Please enter a description (at least 3 characters)");
      }
      if (!data.date) {
        throw new Error("Please select a date");
      }

      // Validate date is not in the future
      const expenseDate = new Date(data.date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (expenseDate > today) {
        throw new Error("Expense date cannot be in the future");
      }

      // Create a clean, serializable object
      const expenseData = {
        amount: parseFloat(data.amount),
        currency: data.currency,
        category: data.category,
        description: data.description.trim(),
        expenseDate: expenseDate.toISOString(),
        receiptUrl: uploadedFile ? uploadedFile.name : null,
        ocrData: ocrData
          ? {
              amount: ocrData.amount,
              date: ocrData.date,
              merchant: ocrData.merchant,
              category: ocrData.category,
            }
          : null,
        status: status,
      };

      console.log("Submitting expense data:", expenseData);

      if (isEditMode) {
        // Update existing expense
        await expenseAPI.updateExpense(id, expenseData);
      } else {
        // Create new expense
        await expenseAPI.createExpense(expenseData);
      }

      // Show success message
      const action = isEditMode ? "updated" : "submitted";
      const statusText =
        status === "DRAFT" ? "saved as draft" : "submitted for approval";
      toast.success(
        `Expense ${action} successfully! ${
          status === "PENDING"
            ? "It has been submitted for approval."
            : "It has been saved as draft."
        }`
      );

      navigate("/employee/expenses");
    } catch (error) {
      console.error("Error saving expense:", error);
      // Show user-friendly error message
      toast.error(
        `Failed to save expense: ${error.message || "Unknown error occurred"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle save as draft
  const handleSaveAsDraft = async (data) => {
    // Determine the appropriate status based on current expense status
    let targetStatus = "DRAFT";

    if (isEditMode) {
      // If editing an existing expense, keep it as draft if it was draft,
      // otherwise set to pending (submitted) for approval
      targetStatus = "DRAFT";
    }

    await onSubmit(data, targetStatus);
  };

  // Handle form submission with proper data extraction
  const handleFormSubmit = async (data) => {
    await onSubmit(data, "PENDING");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading expense...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isEditMode ? "Edit Expense" : "Submit Expense"}
        </h1>
        <p className="text-muted-foreground">
          {isEditMode
            ? "Update your expense details. You can save as draft or submit for approval."
            : "Submit a new expense for reimbursement"}
        </p>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>Receipt Upload</CardTitle>
          <CardDescription>
            Upload a receipt to automatically fill expense details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              id="receipt-upload"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload receipt</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or PDF up to 10MB
              </p>
            </label>
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{uploadedFile.name}</span>
              {isProcessingOcr && (
                <Badge variant="secondary">Processing...</Badge>
              )}
              {ocrData && (
                <Badge
                  variant="default"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  OCR Complete
                </Badge>
              )}
            </div>
          )}

          {ocrData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">
                Auto-filled from receipt:
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Amount: {ocrData.amount}</div>
                <div>Date: {ocrData.date}</div>
                <div>Merchant: {ocrData.merchant}</div>
                <div>Category: {ocrData.category}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Details Form */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Modify your expense information. Use 'Update as Draft' to save changes without submitting, or 'Update & Submit' to submit for approval."
              : "Fill in the expense information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Amount & Currency */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm">
                    {currency?.symbol}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount", {
                      required: "Amount is required",
                      min: { value: 0.01, message: "Amount must be > 0" },
                    })}
                    className="rounded-l-none"
                    disabled={isReadonly}
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-destructive">
                    {errors.amount.message}
                  </p>
                )}
                {convertedAmount && selectedCurrency !== COMPANY_CURRENCY && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      Converted to {COMPANY_CURRENCY}: $
                      {convertedAmount.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-600">
                      Rate: 1 {selectedCurrency} = {exchangeRate}{" "}
                      {COMPANY_CURRENCY}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={selectedCurrency}
                  onValueChange={(value) => setValue("currency", value)}
                  disabled={isReadonly}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) => setValue("category", value)}
                value={watch("category")}
                disabled={isReadonly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the expense..."
                {...register("description", {
                  required: "Description is required",
                })}
                disabled={isReadonly}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: "Date is required" })}
                disabled={isReadonly}
              />
            </div>

            {/* Approver Field - Matching Mockup */}
            <div className="space-y-2">
              <Label htmlFor="approver">Approver</Label>
              <div className="p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Sarah (Manager)
                </span>
                <p className="text-xs text-muted-foreground mt-1">
                  This expense will be sent to your manager for approval
                </p>
              </div>
            </div>

            {/* Status Field - Matching Mockup */}
            {isEditMode && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Approved
                    </span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Time: 12:44 04, Oct, 2025
                  </p>
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            {!isReadonly && (
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting || isConverting}>
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {isEditMode ? "Updating..." : "Submitting..."}
                      </div>
                    ) : isEditMode ? (
                      "Update & Submit"
                    ) : (
                      "Submit Expense"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSubmit(handleSaveAsDraft)}
                    disabled={isSubmitting || isConverting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isEditMode ? "Update as Draft" : "Save as Draft"}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/employee/expenses")}
                  disabled={isSubmitting}
                  className="sm:ml-auto"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Readonly Mode Message */}
            {isReadonly && (
              <div className="pt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    This expense has been submitted and cannot be edited.
                    {expenseData && (
                      <span className="ml-1 font-medium">
                        Status:{" "}
                        {mapExpenseStatus(expenseData.status)
                          .charAt(0)
                          .toUpperCase() +
                          mapExpenseStatus(expenseData.status).slice(1)}
                      </span>
                    )}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/employee/expenses")}
                  className="mt-4"
                >
                  Back to Expenses
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
