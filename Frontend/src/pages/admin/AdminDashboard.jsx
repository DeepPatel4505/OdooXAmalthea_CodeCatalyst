import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import {
  Users,
  Receipt,
  Settings,
  BarChart3,
  DollarSign,
  Clock,
  CheckCircle,
  Search,
  Filter,
  Download,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseAPI, userAPI, approvalAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Remove mock data - will be replaced with real API data
const mockRecentActivity = [
  {
    id: "1",
    type: "expense_approved",
    user: "John Doe",
    amount: 125.5,
    timestamp: "2024-01-16T10:30:00Z",
    status: "approved",
  },
  {
    id: "2",
    type: "user_created",
    user: "Jane Smith",
    timestamp: "2024-01-16T09:15:00Z",
    status: "created",
  },
  {
    id: "3",
    type: "expense_rejected",
    user: "Mike Johnson",
    amount: 89.99,
    timestamp: "2024-01-16T08:45:00Z",
    status: "rejected",
  },
];

const getActivityIcon = (type) => {
  switch (type) {
    case "expense_approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "expense_rejected":
      return <Clock className="h-4 w-4 text-red-500" />;
    case "user_created":
      return <Users className="h-4 w-4 text-blue-500" />;
    default:
      return <Receipt className="h-4 w-4 text-gray-500" />;
  }
};

const getActivityBadge = (status) => {
  switch (status) {
    case "approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Approved
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "created":
      return <Badge variant="secondary">Created</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [expenseFilter, setExpenseFilter] = useState("all");
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("all");
  const [expenses, setExpenses] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingExpenses: 0,
    approvedThisMonth: 0,
    totalAmount: 0,
    averageProcessingTime: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch expenses, statistics, and user stats in parallel
        const [expensesResponse, statsResponse, userStatsResponse] =
          await Promise.all([
            expenseAPI.getExpenses({ page: 1, limit: 50 }),
            expenseAPI.getStatistics(),
            userAPI.getUserStats(),
          ]);

        if (expensesResponse.success) {
          setExpenses(expensesResponse.data.expenses);

          // Extract unique categories
          const categories = [
            ...new Set(
              expensesResponse.data.expenses.map((expense) => expense.category)
            ),
          ];
          setAvailableCategories(categories);
        }

        if (statsResponse.success && userStatsResponse.success) {
          const expenseStats = statsResponse.data.statistics;
          const userStats = userStatsResponse.data.statistics;

          setStats({
            totalUsers: userStats.totalUsers,
            activeUsers: userStats.activeUsers,
            pendingExpenses: expenseStats.pendingExpenses,
            approvedThisMonth: expenseStats.approvedExpenses,
            totalAmount: expenseStats.totalAmountApproved,
            averageProcessingTime: 2.5, // This would need to be calculated from approval times
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Pending Approval
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        );
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    const employeeName = `${expense.employee?.firstName || ""} ${
      expense.employee?.lastName || ""
    }`.trim();
    const matchesSearch =
      employeeName.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      expense.description.toLowerCase().includes(expenseSearch.toLowerCase()) ||
      expense.category.toLowerCase().includes(expenseSearch.toLowerCase());

    const normalizedStatus = expense.status?.toLowerCase();
    const matchesStatusFilter =
      expenseFilter === "all" ||
      normalizedStatus.includes(expenseFilter.toLowerCase());

    const matchesCategoryFilter =
      expenseCategory === "all" ||
      expense.category.toLowerCase() === expenseCategory.toLowerCase();

    return matchesSearch && matchesStatusFilter && matchesCategoryFilter;
  });

  const handleApproveClick = (expense) => {
    setSelectedExpense(expense);
    setApprovalComment("");
    setShowApprovalModal(true);
  };

  const handleRejectClick = (expense) => {
    setSelectedExpense(expense);
    setRejectionComment("");
    setShowRejectionModal(true);
  };

  const handleApproveExpense = async () => {
    if (!selectedExpense) return;

    setIsProcessing(true);
    try {
      const response = await approvalAPI.makeDecision(selectedExpense.id, {
        status: "approved",
        comments: approvalComment,
      });

      if (response.success) {
        // Refresh the expenses data
        const expensesResponse = await expenseAPI.getExpenses({
          page: 1,
          limit: 50,
        });
        if (expensesResponse.success) {
          setExpenses(expensesResponse.data.expenses || []);
        }

        setShowApprovalModal(false);
        setApprovalComment("");
        setSelectedExpense(null);
        alert("Expense approved successfully!");
      } else {
        throw new Error(response.message || "Approval failed");
      }
    } catch (error) {
      console.error("Approval failed:", error);
      alert("Failed to approve expense. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectExpense = async () => {
    if (!selectedExpense) return;

    if (!rejectionComment.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await approvalAPI.makeDecision(selectedExpense.id, {
        status: "rejected",
        comments: rejectionComment,
      });

      if (response.success) {
        // Refresh the expenses data
        const expensesResponse = await expenseAPI.getExpenses({
          page: 1,
          limit: 50,
        });
        if (expensesResponse.success) {
          setExpenses(expensesResponse.data.expenses || []);
        }

        setShowRejectionModal(false);
        setRejectionComment("");
        setSelectedExpense(null);
        alert("Expense rejected successfully!");
      } else {
        throw new Error(response.message || "Rejection failed");
      }
    } catch (error) {
      console.error("Rejection failed:", error);
      alert("Failed to reject expense. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportExpenses = async () => {
    try {
      // Create CSV content
      const headers = [
        "Employee",
        "Description",
        "Date",
        "Category",
        "Amount",
        "Currency",
        "Status",
        "Current Approver",
        "Submitted Date",
      ];

      const csvContent = [
        headers.join(","),
        ...filteredExpenses.map((expense) =>
          [
            `"${`${expense.employee?.firstName || ""} ${
              expense.employee?.lastName || ""
            }`.trim()}"`,
            `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
            `"${new Date(expense.expenseDate).toLocaleDateString()}"`,
            `"${expense.category}"`,
            expense.amount,
            expense.currency,
            expense.status,
            `"${
              expense.currentApprover
                ? `${expense.currentApprover?.firstName || ""} ${
                    expense.currentApprover?.lastName || ""
                  }`.trim()
                : "N/A"
            }"`,
            `"${new Date(expense.createdAt).toLocaleDateString()}"`,
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
        `expenses_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert("Expenses exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export expenses. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Expenses
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingExpenses}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved This Month
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedThisMonth}
            </div>
            <p className="text-xs text-muted-foreground">Expenses approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Processed this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.averageProcessingTime} days
            </div>
            <p className="text-xs text-muted-foreground">
              From submission to approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">
                All Systems Operational
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated 2 minutes ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Users currently online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Management</CardTitle>
              <CardDescription>
                View and manage all expense submissions
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={handleExportExpenses}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={expenseSearch}
                onChange={(e) => setExpenseSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={expenseFilter} onValueChange={setExpenseFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={expenseCategory} onValueChange={setExpenseCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expense Table */}
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
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">
                      {`${expense.employee?.firstName || ""} ${
                        expense.employee?.lastName || ""
                      }`.trim()}
                    </TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{expense.category}</TableCell>
                    <TableCell className="font-mono">
                      {expense.amount} {expense.currency}
                      {expense.amountInCompanyCurrency &&
                        expense.currency !== user?.company?.defaultCurrency && (
                          <div className="text-xs text-muted-foreground">
                            ({expense.amountInCompanyCurrency}{" "}
                            {user?.company?.defaultCurrency})
                          </div>
                        )}
                    </TableCell>
                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                    <TableCell>
                      {expense.currentApprover
                        ? `${expense.currentApprover?.firstName || ""} ${
                            expense.currentApprover?.lastName || ""
                          }`.trim()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        {expense.status === "PENDING" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveClick(expense)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRejectClick(expense)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {isLoading ? "Loading expenses..." : "No expenses found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium">
                      {activity.type === "user_created"
                        ? `${activity.user} joined the system`
                        : activity.type === "expense_approved"
                        ? `${activity.user} had an expense approved`
                        : `${activity.user} had an expense rejected`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {activity.amount && (
                    <span className="font-semibold">${activity.amount}</span>
                  )}
                  {getActivityBadge(activity.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Approve Expense"
      >
        <div className="space-y-4">
          <p>Are you sure you want to approve this expense?</p>
          {selectedExpense && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{selectedExpense.description}</p>
              <p className="text-sm text-muted-foreground">
                {parseFloat(selectedExpense.amount).toLocaleString(undefined, {
                  style: "currency",
                  currency: selectedExpense.currency || "USD",
                })}{" "}
                • {selectedExpense.employee?.firstName}{" "}
                {selectedExpense.employee?.lastName}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="approval-comment">Comments (Optional)</Label>
            <Textarea
              id="approval-comment"
              placeholder="Add any comments about this approval..."
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleApproveExpense}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Approving..." : "Yes, Approve"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowApprovalModal(false)}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title="Reject Expense"
      >
        <div className="space-y-4">
          <p>Are you sure you want to reject this expense?</p>
          {selectedExpense && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="font-medium">{selectedExpense.description}</p>
              <p className="text-sm text-muted-foreground">
                {parseFloat(selectedExpense.amount).toLocaleString(undefined, {
                  style: "currency",
                  currency: selectedExpense.currency || "USD",
                })}{" "}
                • {selectedExpense.employee?.firstName}{" "}
                {selectedExpense.employee?.lastName}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">
              Reason for rejection (Required)
            </Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a reason for rejection..."
              value={rejectionComment}
              onChange={(e) => setRejectionComment(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRejectExpense}
              disabled={isProcessing || !rejectionComment.trim()}
              variant="destructive"
              className="flex-1"
            >
              {isProcessing ? "Rejecting..." : "Yes, Reject"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowRejectionModal(false)}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
