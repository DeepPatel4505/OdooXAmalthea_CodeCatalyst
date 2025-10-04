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
import { CheckCircle, Clock, Users, DollarSign, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { approvalAPI, expenseAPI, userAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

export function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pendingApprovals: 0,
    teamMembers: 0,
    totalApproved: 0,
    monthlyBudget: 50000,
    usedBudget: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch pending approvals, team stats, and expense stats in parallel
        const [approvalsResponse, teamStatsResponse, expenseStatsResponse] =
          await Promise.all([
            approvalAPI.getPendingApprovals(),
            userAPI.getUserStats(),
            expenseAPI.getStatistics("30"),
          ]);

        if (approvalsResponse.success) {
          setPendingApprovals(approvalsResponse.data.approvals || []);
          setStats((prev) => ({
            ...prev,
            pendingApprovals: approvalsResponse.data.approvals?.length || 0,
          }));
        }

        if (teamStatsResponse.success) {
          setStats((prev) => ({
            ...prev,
            teamMembers: teamStatsResponse.data.statistics?.teamMembers || 0,
          }));
        }

        if (expenseStatsResponse.success) {
          const expenseStats = expenseStatsResponse.data.statistics;
          setStats((prev) => ({
            ...prev,
            totalApproved: expenseStats?.approvedExpenses || 0,
            usedBudget: expenseStats?.totalAmountApproved || 0,
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "MANAGER") {
      fetchDashboardData();
    }
  }, [user]);

  const budgetPercentage = (stats.usedBudget / stats.monthlyBudget) * 100;

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
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Manage team expenses and approvals
          </p>
        </div>
        <Link to="/manager/approvals">
          <Button className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Review Approvals
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Approvals
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Under your management
            </p>
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
              {stats.totalApproved}
            </div>
            <p className="text-xs text-muted-foreground">Expenses approved</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.usedBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              of ${stats.monthlyBudget.toLocaleString()} used
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full"
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>Expenses waiting for your approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingApprovals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending approvals</p>
                <p className="text-sm">All caught up!</p>
              </div>
            ) : (
              pendingApprovals.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.employee?.firstName}{" "}
                        {expense.employee?.lastName} • {expense.category} •{" "}
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
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive">
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <Link to="/manager/approvals">
              <Button variant="outline" className="w-full">
                View All Pending Approvals
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
