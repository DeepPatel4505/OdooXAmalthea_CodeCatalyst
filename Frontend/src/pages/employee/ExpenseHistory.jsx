import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Modal } from "@/components/ui/modal";
import {
  Search,
  Filter,
  Download,
  Eye,
  Plus,
  Calendar,
  User,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Upload,
  Receipt,
} from "lucide-react";
import { expenseAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Expense categories
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

// Reverse mapping from frontend to backend
const mapStatusToBackend = (status) => {
  switch (status) {
    case "draft":
      return "draft";
    case "submitted":
      return "pending";
    case "approved":
      return "approved";
    case "rejected":
      return "rejected";
    default:
      return status;
  }
};

const STATUS_FILTERS = [
  { value: "all", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const CATEGORY_FILTERS = [
  { value: "all", label: "All Categories" },
  { value: "Meals & Entertainment", label: "Meals & Entertainment" },
  { value: "Transportation", label: "Transportation" },
  { value: "Office Supplies", label: "Office Supplies" },
  { value: "Travel", label: "Travel" },
  { value: "Software", label: "Software" },
];

export function ExpenseHistory() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch expenses from API
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters object, only including defined values
        const queryParams = {};
        if (searchTerm && searchTerm.trim()) {
          queryParams.search = searchTerm.trim();
        }
        if (statusFilter && statusFilter !== "all") {
          queryParams.status = mapStatusToBackend(statusFilter);
        }
        if (categoryFilter && categoryFilter !== "all") {
          queryParams.category = categoryFilter;
        }

        const response = await expenseAPI.getExpenses(queryParams);
        setExpenses(response.data.expenses || []);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        setError("Failed to load expenses. Please try again.");
        setExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [searchTerm, statusFilter, categoryFilter]);

  const handleViewExpense = (expense) => {
    const mappedStatus = mapExpenseStatus(expense.status);

    // If draft or submitted → edit page, else open view modal
    if (mappedStatus === "draft" || mappedStatus === "submitted") {
      navigate(`/employee/submit/${expense.id}`);
    } else {
      setSelectedExpense(expense);
      setIsModalOpen(true);
    }
  };

  // Export expenses to CSV
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      // Create CSV content
      const headers = [
        "Date",
        "Description",
        "Category",
        "Amount",
        "Currency",
        "Status",
      ];
      const csvContent = [
        headers.join(","),
        ...filteredExpenses.map((expense) =>
          [
            new Date(expense.expenseDate).toLocaleDateString(),
            `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
            `"${expense.category}"`,
            expense.amount,
            expense.currency,
            mapExpenseStatus(expense.status),
          ].join(",")
        ),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `expenses_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Expenses exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export expenses. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredExpenses = expenses;

  const getStatusBadge = (status) => {
    const mappedStatus = mapExpenseStatus(status);
    switch (mappedStatus) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "submitted":
        return <Badge variant="secondary">Submitted</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "draft":
        return "text-gray-600";
      case "approved":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      case "submitted":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  const totalAmount = filteredExpenses.reduce(
    (sum, expense) => sum + parseFloat(expense.amount),
    0
  );
  const approvedAmount = filteredExpenses
    .filter((expense) => mapExpenseStatus(expense.status) === "approved")
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const pendingAmount = filteredExpenses
    .filter((expense) => mapExpenseStatus(expense.status) === "submitted")
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  
  const totalExpenses = filteredExpenses.length;
  const approvedExpenses = filteredExpenses.filter((expense) => mapExpenseStatus(expense.status) === "approved").length;
  const pendingExpenses = filteredExpenses.filter((expense) => mapExpenseStatus(expense.status) === "submitted").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-muted-foreground">
            Submit and manage your expense reports
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting || filteredExpenses.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submitted</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${approvedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {approvedExpenses} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingExpenses} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Filter expenses by status and category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab-based Interface - Matching Mockup - Only for Employees */}
      {user?.role !== "ADMIN" && (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New
            </TabsTrigger>
          </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Upload</CardTitle>
              <CardDescription>
                Upload a receipt to automatically create an expense
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">Upload Receipt</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop your receipt here, or click to browse
                </p>
                <Button onClick={() => navigate("/employee/submit")}>
                  Choose File
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${totalAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {filteredExpenses.length} expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${approvedAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {
                    filteredExpenses.filter((e) => e.status === "approved")
                      .length
                  }{" "}
                  expenses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  $
                  {filteredExpenses
                    .filter((e) => mapExpenseStatus(e.status) === "submitted")
                    .reduce((sum, e) => sum + parseFloat(e.amount), 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {
                    filteredExpenses.filter(
                      (e) => mapExpenseStatus(e.status) === "submitted"
                    ).length
                  }{" "}
                  expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <XCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses ({filteredExpenses.length})</CardTitle>
              <CardDescription>Your expense submission history</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Paid By</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading expenses...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredExpenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground opacity-50" />
                          <p className="text-muted-foreground">
                            No expenses found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {searchTerm ||
                            statusFilter !== "all" ||
                            categoryFilter !== "all"
                              ? "Try adjusting your filters"
                              : "Start by submitting your first expense"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredExpenses.map((expense) => (
                      <TableRow
                        key={expense.id}
                        onClick={() => handleViewExpense(expense)}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        {/* Employee */}
                        <TableCell className="font-medium text-sm">
                          {expense.employee
                            ? `${expense.employee.firstName} ${expense.employee.lastName}`
                            : "Unknown"}
                        </TableCell>

                        {/* Description */}
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.description}</p>
                          </div>
                        </TableCell>

                        {/* Date */}
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(expense.expenseDate).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TableCell>

                        {/* Category */}
                        <TableCell className="text-sm">
                          {expense.category}
                        </TableCell>

                        {/* Paid By */}
                        <TableCell className="text-sm">Self</TableCell>

                        {/* Remarks */}
                        <TableCell className="text-sm text-muted-foreground">
                          —
                        </TableCell>

                        {/* Amount */}
                        <TableCell className="font-semibold">
                          {parseFloat(expense.amount).toLocaleString(
                            undefined,
                            {
                              style: "currency",
                              currency: expense.currency || "USD",
                            }
                          )}
                        </TableCell>

                        {/* Status */}
                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      )}

      {/* Admin View - Show All Expenses */}
      {user?.role === "ADMIN" && (
        <Card>
          <CardHeader>
            <CardTitle>All Expenses</CardTitle>
            <CardDescription>
              View and manage all expense submissions across the organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading expenses...</span>
              </div>
            ) : filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Approver</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">
                          {expense.employee?.firstName} {expense.employee?.lastName}
                        </TableCell>
                        <TableCell>{expense.description}</TableCell>
                        <TableCell>
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="font-mono">
                          {parseFloat(expense.amount).toLocaleString(undefined, {
                            style: "currency",
                            currency: expense.currency || "USD",
                          })}
                          {expense.amountInCompanyCurrency &&
                            expense.currency !== "USD" && (
                              <div className="text-xs text-muted-foreground">
                                ({parseFloat(expense.amountInCompanyCurrency).toFixed(0)} USD)
                              </div>
                            )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              expense.status === "APPROVED"
                                ? "default"
                                : expense.status === "REJECTED"
                                ? "destructive"
                                : expense.status === "PENDING"
                                ? "secondary"
                                : "outline"
                            }
                            className={
                              expense.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : expense.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                          >
                            {expense.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {expense.currentApprover
                            ? `${expense.currentApprover?.firstName} ${expense.currentApprover?.lastName}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedExpense(expense);
                              setIsModalOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No expenses found</p>
                <p className="text-sm">No expenses match your current filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expense Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Expense Details"
        className="max-w-2xl"
      >
        {selectedExpense && (
          <div className="space-y-6">
            {/* Header with amount and status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-2xl font-bold">
                    {parseFloat(selectedExpense.amount).toLocaleString(
                      undefined,
                      {
                        style: "currency",
                        currency: selectedExpense.currency || "USD",
                      }
                    )}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedExpense.currency}
                  </p>
                </div>
              </div>
              {getStatusBadge(selectedExpense.status)}
            </div>

            {/* Expense details grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Description</span>
                </div>
                <p className="font-medium">{selectedExpense.description}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Category</span>
                </div>
                <p className="font-medium">{selectedExpense.category}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Expense Date</span>
                </div>
                <p className="font-medium">
                  {new Date(selectedExpense.expenseDate).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Submitted</span>
                </div>
                <p className="font-medium">
                  {new Date(selectedExpense.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Employee details */}
            {selectedExpense.employee && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Employee</span>
                  </div>
                  <p className="font-medium">
                    {selectedExpense.employee.firstName}{" "}
                    {selectedExpense.employee.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedExpense.employee.email}
                  </p>
                </div>
              </div>
            )}

            {/* Approval details */}
            {selectedExpense.currentApprover && (
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>Current Approver</span>
                  </div>
                  <p className="font-medium">
                    {selectedExpense.currentApprover.firstName}{" "}
                    {selectedExpense.currentApprover.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedExpense.currentApprover.email}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Receipt
              </Button>
              <Button variant="outline" className="flex-1">
                <FileText className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
