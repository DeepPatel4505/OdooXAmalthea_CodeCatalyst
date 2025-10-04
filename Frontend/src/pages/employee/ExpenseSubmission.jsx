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
import { Upload, FileText, CheckCircle, Save } from "lucide-react";
import { expenseAPI } from "@/services/api";

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
        reset({
          amount: parseFloat(expense.amount),
          category: expense.category,
          description: expense.description,
          date: new Date(expense.expenseDate).toISOString().split("T")[0],
          currency: expense.currency,
        });
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

  // 🟢 Step 2: Handle currency conversion (same as before)
  useEffect(() => {
    const convertCurrency = async () => {
      if (!amount || !selectedCurrency || selectedCurrency === COMPANY_CURRENCY) {
        setConvertedAmount(null);
        setExchangeRate(null);
        return;
      }

      setIsConverting(true);
      try {
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
      } catch (err) {
        console.error("Conversion failed", err);
      } finally {
        setIsConverting(false);
      }
    };

    convertCurrency();
  }, [amount, selectedCurrency]);

  // 🟢 Step 3: Handle OCR upload (same)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessingOcr(true);

    setTimeout(() => {
      const mockOcrData = {
        amount: "125.50",
        date: "2024-01-15",
        merchant: "Restaurant ABC",
        category: "Meals & Entertainment",
      };
      setOcrData(mockOcrData);
      setIsProcessingOcr(false);

      setValue("amount", mockOcrData.amount);
      setValue("date", mockOcrData.date);
      setValue("description", mockOcrData.merchant);
      setValue("category", mockOcrData.category);
    }, 2000);
  };

  // 🟢 Step 4: Submit (create or update)
  const onSubmit = async (data, status = "PENDING") => {
    setIsSubmitting(true);
    try {
      // Create a clean, serializable object
      const expenseData = {
        amount: parseFloat(data.amount),
        currency: data.currency,
        category: data.category,
        description: data.description,
        expenseDate: new Date(data.date).toISOString(), // Convert to ISO8601 format
        receiptUrl: uploadedFile ? uploadedFile.name : null,
        ocrData: ocrData ? {
          amount: ocrData.amount,
          date: ocrData.date,
          merchant: ocrData.merchant,
          category: ocrData.category
        } : null,
        status: status,
      };

      // Validate required fields
      if (!expenseData.amount || !expenseData.currency || !expenseData.category || !expenseData.description || !expenseData.expenseDate) {
        throw new Error("Please fill in all required fields");
      }

      console.log("Submitting expense data:", expenseData);

      if (isEditMode) {
        // Update existing expense
        await expenseAPI.updateExpense(id, expenseData);
        } else {
          // Create new expense
          await expenseAPI.createExpense(expenseData);
        }

      navigate("/employee/expenses");
    } catch (error) {
      console.error("Error saving expense:", error);
      // Show user-friendly error message
      alert(`Failed to save expense: ${error.message || 'Unknown error occurred'}`);
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
                {...register("description", { required: "Description is required" })}
              />
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register("date", { required: "Date is required" })}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Submitting..."
                    : isEditMode
                    ? "Update & Submit"
                    : "Submit Expense"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSubmit(handleSaveAsDraft)}
                  disabled={isSubmitting}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isEditMode ? "Update as Draft" : "Save as Draft"}
                </Button>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/employee/expenses")}
                className="sm:ml-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
