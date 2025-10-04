import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatedButton } from "@/components/ui/animations";
import { toast } from "sonner";
import { FormCard, FormField, FormSubmitButton } from "@/components/ui/form-components";
import { Check, AlertCircle, Upload } from "lucide-react";

export default function ExpenseForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    category: "travel",
    description: "",
    receipt: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "receipt" && files.length > 0) {
      setFormData({ ...formData, receipt: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Success state
      setSuccess(true);
      toast.success("Expense submitted successfully!");
      setTimeout(() => {
        navigate("/expenses");
      }, 1500);
    } catch (err) {
      setError("Failed to submit expense. Please try again.");
      toast.error("Failed to submit expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Submit Expense">
      <div className="max-w-3xl mx-auto">
        <FormCard>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Submit New Expense</h2>
            <p className="text-gray-500">
              Fill out the form below to submit a new expense for approval.
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-success-50 border border-success-200 text-success-700 px-4 py-3 rounded-lg flex items-center mb-6"
            >
              <Check className="h-5 w-5 mr-2 text-success" />
              <span>Expense submitted successfully!</span>
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-lg flex items-center mb-6"
            >
              <AlertCircle className="h-5 w-5 mr-2 text-error" />
              <span>{error}</span>
            </motion.div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Expense Title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter expense title"
                required
              />
              
              <FormField
                label="Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                required
                prefix="$"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
              
              <FormField
                label="Category"
                name="category"
                type="select"
                value={formData.category}
                onChange={handleChange}
                required
                options={[
                  { value: "travel", label: "Travel" },
                  { value: "meals", label: "Meals & Entertainment" },
                  { value: "supplies", label: "Office Supplies" },
                  { value: "software", label: "Software & Subscriptions" },
                  { value: "other", label: "Other" },
                ]}
              />
            </div>

            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide details about this expense"
              required
              rows={4}
            />

            <div className="border border-dashed border-border rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipt Upload
              </label>
              <div className="flex items-center justify-center">
                <label
                  htmlFor="receipt-upload"
                  className="w-full cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="flex flex-col items-center justify-center py-6 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      {formData.receipt
                        ? `Selected: ${formData.receipt.name}`
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG or PDF up to 5MB
                    </p>
                  </motion.div>
                  <input
                    id="receipt-upload"
                    name="receipt"
                    type="file"
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={handleChange}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <AnimatedButton
                type="button"
                onClick={() => navigate("/expenses")}
                variant="outline"
              >
                Cancel
              </AnimatedButton>
              <FormSubmitButton
                loading={loading}
                success={success}
                type="submit"
              >
                Submit Expense
              </FormSubmitButton>
            </div>
          </form>
        </FormCard>
      </div>
    </DashboardLayout>
  );
}