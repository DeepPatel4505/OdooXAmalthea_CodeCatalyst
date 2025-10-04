import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AnimatedCard } from "@/components/ui/animations";
import { Check, X, Eye, Clock, Filter, Search } from "lucide-react";

// Sample data - would normally come from API
const SAMPLE_EXPENSES = [
  {
    id: "exp-001",
    title: "Client Meeting Lunch",
    amount: 78.50,
    date: "2023-06-15",
    category: "meals",
    status: "pending",
    submittedBy: {
      id: "user-1",
      name: "Alex Johnson",
      department: "Sales",
    },
  },
  {
    id: "exp-002",
    title: "Office Supplies",
    amount: 125.30,
    date: "2023-06-14",
    category: "supplies",
    status: "pending",
    submittedBy: {
      id: "user-2",
      name: "Sarah Williams",
      department: "Marketing",
    },
  },
  {
    id: "exp-003",
    title: "Software Subscription",
    amount: 49.99,
    date: "2023-06-12",
    category: "software",
    status: "pending",
    submittedBy: {
      id: "user-3",
      name: "Michael Chen",
      department: "Engineering",
    },
  },
];

export default function ExpenseApprovals() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedExpense, setSelectedExpense] = useState(null);

  useEffect(() => {
    // Simulate API fetch
    const fetchExpenses = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setExpenses(SAMPLE_EXPENSES);
      setLoading(false);
    };

    fetchExpenses();
  }, []);

  const handleApprove = async (id) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id ? { ...exp, status: "approved" } : exp
      )
    );
    if (selectedExpense?.id === id) {
      setSelectedExpense({ ...selectedExpense, status: "approved" });
    }
  };

  const handleReject = async (id) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id ? { ...exp, status: "rejected" } : exp
      )
    );
    if (selectedExpense?.id === id) {
      setSelectedExpense({ ...selectedExpense, status: "rejected" });
    }
  };

  const filteredExpenses = expenses.filter(
    (expense) =>
      (filterStatus === "all" || expense.status === filterStatus) &&
      (expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.submittedBy.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout title="Expense Approvals">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AnimatedCard className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Pending Approvals
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search expenses..."
                      className="pl-9 pr-4 py-2 w-full sm:w-64 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Filter className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <select
                      className="pl-9 pr-4 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none bg-white"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="all">All Statuses</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
                />
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No expenses found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expense
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <AnimatePresence>
                      {filteredExpenses.map((expense) => (
                        <motion.tr
                          key={expense.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedExpense(expense)}
                        >
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                                {expense.submittedBy.name.charAt(0)}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {expense.submittedBy.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {expense.submittedBy.department}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{expense.title}</div>
                            <div className="text-xs text-gray-500">{expense.category}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${expense.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                expense.status === "approved"
                                  ? "bg-success-100 text-success-800"
                                  : expense.status === "rejected"
                                  ? "bg-error-100 text-error-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {expense.status === "approved" ? (
                                <Check className="h-3 w-3 mr-1" />
                              ) : expense.status === "rejected" ? (
                                <X className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedExpense(expense);
                                }}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <Eye size={18} />
                              </button>
                              {expense.status === "pending" && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApprove(expense.id);
                                    }}
                                    className="text-success hover:text-success-600"
                                  >
                                    <Check size={18} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleReject(expense.id);
                                    }}
                                    className="text-error hover:text-error-600"
                                  >
                                    <X size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            )}
          </AnimatedCard>
        </div>

        <div className="lg:col-span-1">
          <AnimatePresence>
            {selectedExpense ? (
              <AnimatedCard className="bg-white rounded-xl shadow-sm h-full">
                <div className="p-4 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Expense Details</h3>
                  <button
                    onClick={() => setSelectedExpense(null)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Title</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedExpense.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Submitted By</h4>
                    <div className="mt-1 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                        {selectedExpense.submittedBy.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {selectedExpense.submittedBy.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedExpense.submittedBy.department}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Amount</h4>
                      <p className="mt-1 text-sm font-medium text-gray-900">
                        ${selectedExpense.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Date</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedExpense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Category</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedExpense.category.charAt(0).toUpperCase() +
                        selectedExpense.category.slice(1)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <span
                      className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedExpense.status === "approved"
                          ? "bg-success-100 text-success-800"
                          : selectedExpense.status === "rejected"
                          ? "bg-error-100 text-error-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedExpense.status === "approved" ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : selectedExpense.status === "rejected" ? (
                        <X className="h-3 w-3 mr-1" />
                      ) : (
                        <Clock className="h-3 w-3 mr-1" />
                      )}
                      {selectedExpense.status.charAt(0).toUpperCase() +
                        selectedExpense.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Receipt</h4>
                    <div className="mt-1 border border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
                      <p className="text-sm text-gray-500">Receipt image preview</p>
                    </div>
                  </div>

                  {selectedExpense.status === "pending" && (
                    <div className="pt-4 flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleApprove(selectedExpense.id)}
                        className="flex-1 bg-success text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleReject(selectedExpense.id)}
                        className="flex-1 bg-error text-white py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </motion.button>
                    </div>
                  )}
                </div>
              </AnimatedCard>
            ) : (
              <AnimatedCard className="bg-white rounded-xl shadow-sm h-full flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No expense selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Select an expense from the list to view details
                  </p>
                </div>
              </AnimatedCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </DashboardLayout>
  );
}