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
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { expenseAPI } from "@/services/api";

// Status mapping from backend to frontend
const mapExpenseStatus = (status) => {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "PENDING":
      return "submitted";
    case "REJECTED":
      return "rejected";
    case "DRAFT":
      return "draft";
    default:
      return status.toLowerCase();
  }
};

const getStatusIcon = (status) => {
  const mappedStatus = mapExpenseStatus(status);
  switch (mappedStatus) {
    case "approved":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "submitted":
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "draft":
      return <Clock className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status) => {
  const mappedStatus = mapExpenseStatus(status);
  switch (mappedStatus) {
    case "approved":
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Approved
        </Badge>
      );
    case "rejected":
      return <Badge variant="destructive">Rejected</Badge>;
    case "submitted":
    case "pending":
      return <Badge variant="secondary">Submitted</Badge>;
    case "draft":
      return <Badge variant="outline">Draft</Badge>;
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

export function EmployeeDashboard() {
  const [stats, setStats] = useState({
    totalExpenses: 0,
    pendingExpenses: 0,
    approvedExpenses: 0,
    rejectedExpenses: 0,
    totalAmount: 0,
    toSubmitAmount: 0,
    waitingApprovalAmount: 0,
    approvedAmount: 0,
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch expenses and statistics
        const [expensesResponse, statsResponse] = await Promise.all([
          expenseAPI.getExpenses({
            limit: 5,
            sort: "createdAt",
            order: "desc",
          }),
          expenseAPI.getStatistics("30"),
        ]);

        const expenses = expensesResponse.data.expenses || [];
        const statsData = statsResponse.data || {};

        // Calculate stats from expenses
        const totalExpenses = expenses.length;
        const pendingExpenses = expenses.filter(
          (e) => mapExpenseStatus(e.status) === "submitted"
        ).length;
        const approvedExpenses = expenses.filter(
          (e) => mapExpenseStatus(e.status) === "approved"
        ).length;
        const rejectedExpenses = expenses.filter(
          (e) => mapExpenseStatus(e.status) === "rejected"
        ).length;
        const draftExpenses = expenses.filter(
          (e) => mapExpenseStatus(e.status) === "draft"
        );

        const totalAmount = expenses.reduce(
          (sum, expense) => sum + parseFloat(expense.amount || 0),
          0
        );

        // Calculate amounts by status for the summary bar
        const toSubmitAmount = draftExpenses.reduce(
          (sum, expense) => sum + parseFloat(expense.amount || 0),
          0
        );
        const waitingApprovalAmount = expenses
          .filter((e) => mapExpenseStatus(e.status) === "submitted")
          .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
        const approvedAmount = expenses
          .filter((e) => mapExpenseStatus(e.status) === "approved")
          .reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);

        setStats({
          totalExpenses,
          pendingExpenses,
          approvedExpenses,
          rejectedExpenses,
          totalAmount,
          toSubmitAmount,
          waitingApprovalAmount,
          approvedAmount,
        });

        setRecentExpenses(expenses);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set default values on error
        setStats({
          totalExpenses: 0,
          pendingExpenses: 0,
          approvedExpenses: 0,
          rejectedExpenses: 0,
          totalAmount: 0,
          toSubmitAmount: 0,
          waitingApprovalAmount: 0,
          approvedAmount: 0,
        });
        setRecentExpenses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Manage your expense reports and track their status
          </p>
        </div>
        <Link to="/employee/submit">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Expense
          </Button>
        </Link>
      </div>

      {/* Status Summary Bar - Matching Mockup */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-lg font-semibold text-orange-700">
                {stats.toSubmitAmount.toFixed(0)} Rs To Submit
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-lg font-semibold text-yellow-700">
                {stats.waitingApprovalAmount.toFixed(0)} Rs Waiting approval
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-lg font-semibold text-green-700">
                {stats.approvedAmount.toFixed(0)} Rs Approved
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
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
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedExpenses}
            </div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Total submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>Your latest expense submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentExpenses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No expenses submitted yet</p>
                <p className="text-sm">
                  Start by submitting your first expense
                </p>
              </div>
            ) : (
              recentExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(expense.status)}
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.category} •{" "}
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">
                      {parseFloat(expense.amount).toLocaleString(undefined, {
                        style: "currency",
                        currency: expense.currency || "USD",
                      })}
                    </span>
                    {getStatusBadge(expense.status)}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link to="/employee/expenses">
              <Button variant="outline" className="w-full">
                View All Expenses
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
