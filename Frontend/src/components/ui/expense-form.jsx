import { useState } from "react";
import { motion } from "framer-motion";
import { FormWrapper, FormSection, FormField, FormSubmitButton, FormFeedback } from "./form-components";
import { AnimatedCard } from "./animations";
import { Upload, Receipt, Calendar, DollarSign, Globe, FileText } from "lucide-react";

export const ExpenseForm = ({ 
  onSubmit, 
  isLoading = false, 
  initialValues = {}, 
  feedback = null 
}) => {
  const [formData, setFormData] = useState({
    title: initialValues.title || "",
    amount: initialValues.amount || "",
    date: initialValues.date || "",
    currency: initialValues.currency || "USD",
    category: initialValues.category || "",
    description: initialValues.description || "",
    receipt: null,
    ...initialValues
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "receipt" && files) {
      setFormData(prev => ({ ...prev, receipt: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!formData.title) newErrors.title = "Title is required";
    if (!formData.amount) newErrors.amount = "Amount is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.category) newErrors.category = "Category is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  return (
    <AnimatedCard className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground">Submit Expense</h2>
        <p className="text-muted-foreground mt-1">
          Fill in the details below to submit a new expense for approval
        </p>
      </div>

      {feedback && (
        <FormFeedback
          type={feedback.type}
          message={feedback.message}
          visible={true}
          className="mb-6"
        />
      )}

      <FormWrapper onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSection className="md:col-span-2">
            <div className="bg-muted/50 rounded-lg p-4 border border-dashed border-border flex flex-col items-center justify-center">
              <div className="mb-3 p-3 rounded-full bg-primary-100 text-primary">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-medium mb-1">Upload Receipt</p>
              <p className="text-xs text-muted-foreground mb-3">
                Supported formats: JPG, PNG, PDF (max 5MB)
              </p>
              <input
                type="file"
                id="receipt"
                name="receipt"
                accept="image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={handleChange}
              />
              <label
                htmlFor="receipt"
                className="cursor-pointer px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Select File
              </label>
              {formData.receipt && (
                <p className="text-xs mt-2 text-muted-foreground">
                  Selected: {formData.receipt.name}
                </p>
              )}
            </div>
          </FormSection>

          <FormField
            label="Expense Title"
            name="title"
            placeholder="e.g., Business Lunch"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            required
          />

          <FormField
            label="Amount"
            name="amount"
            type="number"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            required
          />

          <FormField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.date}
            required
          />

          <FormField
            label="Currency"
            name="currency"
            type="select"
            value={formData.currency}
            onChange={handleChange}
            error={errors.currency}
            required
          />

          <FormField
            label="Category"
            name="category"
            type="select"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            required
            className="md:col-span-2"
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            placeholder="Add details about this expense..."
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            className="md:col-span-2"
          />
        </div>

        <FormSubmitButton isLoading={isLoading} className="mt-8">
          Submit Expense
        </FormSubmitButton>
      </FormWrapper>
    </AnimatedCard>
  );
};

export const ExpenseApprovalCard = ({ 
  expense, 
  onApprove, 
  onReject, 
  isLoading = false 
}) => {
  return (
    <AnimatedCard className="border border-border p-6 rounded-xl mb-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{expense.title}</h3>
          <p className="text-muted-foreground text-sm">
            Submitted by {expense.submittedBy} • {expense.date}
          </p>
        </div>
        <div className="mt-2 md:mt-0">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            expense.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            expense.status === 'approved' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="flex items-center">
          <DollarSign className="h-5 w-5 text-muted-foreground mr-2" />
          <div>
            <p className="text-sm font-medium">{expense.amount}</p>
            <p className="text-xs text-muted-foreground">Amount</p>
          </div>
        </div>
        <div className="flex items-center">
          <Globe className="h-5 w-5 text-muted-foreground mr-2" />
          <div>
            <p className="text-sm font-medium">{expense.currency}</p>
            <p className="text-xs text-muted-foreground">Currency</p>
          </div>
        </div>
        <div className="flex items-center">
          <FileText className="h-5 w-5 text-muted-foreground mr-2" />
          <div>
            <p className="text-sm font-medium">{expense.category}</p>
            <p className="text-xs text-muted-foreground">Category</p>
          </div>
        </div>
      </div>

      {expense.description && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
          <p className="text-sm">{expense.description}</p>
        </div>
      )}

      {expense.status === 'pending' && (
        <div className="flex space-x-3 mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-success text-white rounded-md text-sm font-medium flex-1"
            onClick={() => onApprove(expense.id)}
            disabled={isLoading}
          >
            Approve
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-white border border-error text-error rounded-md text-sm font-medium flex-1"
            onClick={() => onReject(expense.id)}
            disabled={isLoading}
          >
            Reject
          </motion.button>
        </div>
      )}
    </AnimatedCard>
  );
};