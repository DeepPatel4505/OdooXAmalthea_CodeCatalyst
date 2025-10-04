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
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

        console.log("📊 API Responses:", {
          approvals: approvalsResponse,
          teamStats: teamStatsResponse,
          expenseStats: expenseStatsResponse,
        });

        if (approvalsResponse.success) {
          console.log("✅ Approvals loaded:", approvalsResponse.data.approvals);
          setPendingApprovals(approvalsResponse.data.approvals || []);
          setStats((prev) => ({
            ...prev,
            pendingApprovals: approvalsResponse.data.approvals?.length || 0,
          }));
        } else {
          console.error("❌ Approvals API failed:", approvalsResponse);
        }

        if (teamStatsResponse.success) {
          console.log(
            "✅ Team stats loaded:",
            teamStatsResponse.data.statistics
          );
          setStats((prev) => ({
            ...prev,
            teamMembers: teamStatsResponse.data.statistics?.teamMembers || 0,
          }));
        } else {
          console.error("❌ Team stats API failed:", teamStatsResponse);
        }

        if (expenseStatsResponse.success) {
          console.log(
            "✅ Expense stats loaded:",
            expenseStatsResponse.data.statistics
          );
          const expenseStats = expenseStatsResponse.data.statistics;
          setStats((prev) => ({
            ...prev,
            totalApproved: expenseStats?.approvedExpenses || 0,
            usedBudget: expenseStats?.totalAmountApproved || 0,
          }));
        } else {
          console.error("❌ Expense stats API failed:", expenseStatsResponse);
        }
      } catch (error) {
        console.error("❌ Failed to fetch dashboard data:", error);
      } finally {
        console.log("🏁 Dashboard data fetch completed");
        setIsLoading(false);
      }
    };

    console.log("🔍 Checking user role:", user?.role, "User object:", user);

    if (user?.role === "MANAGER") {
      console.log("👤 User is manager, fetching dashboard data for:", user);
      fetchDashboardData();
    } else {
      console.log("❌ User is not a manager. Role:", user?.role, "User:", user);
    }
  }, [user]);

  const budgetPercentage = (stats.usedBudget / stats.monthlyBudget) * 100;

  // Handle approve/reject actions
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

  const handleApprove = async () => {
    if (!selectedExpense) return;

    setIsProcessing(true);
    try {
      const response = await approvalAPI.makeDecision(selectedExpense.id, {
        status: "approved",
        comments: approvalComment,
      });

      if (response.success) {
        // Refresh the dashboard data
        const [approvalsResponse] = await Promise.all([
          approvalAPI.getPendingApprovals(),
        ]);

        if (approvalsResponse.success) {
          setPendingApprovals(approvalsResponse.data.approvals || []);
          setStats((prev) => ({
            ...prev,
            pendingApprovals: approvalsResponse.data.approvals?.length || 0,
          }));
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

  const handleReject = async () => {
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
        // Refresh the dashboard data
        const [approvalsResponse] = await Promise.all([
          approvalAPI.getPendingApprovals(),
        ]);

        if (approvalsResponse.success) {
          setPendingApprovals(approvalsResponse.data.approvals || []);
          setStats((prev) => ({
            ...prev,
            pendingApprovals: approvalsResponse.data.approvals?.length || 0,
          }));
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

      {/* Pending Approvals - Matching Mockup Table Format */}
      <Card>
        <CardHeader>
          <CardTitle>Approvals to review</CardTitle>
          <CardDescription>Expenses waiting for your approval</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending approvals</p>
              <p className="text-sm">All caught up!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">
                      Approval Subject
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Request Owner
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Request Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Total amount (in company's currency)
                    </th>
                    <th className="text-center py-3 px-4 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((expense) => (
                    <tr key={expense.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{expense.description}</div>
                      </td>
                      <td className="py-3 px-4">
                        {expense.employee?.firstName}{" "}
                        {expense.employee?.lastName}
                      </td>
                      <td className="py-3 px-4">{expense.category}</td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">Pending</Badge>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {parseFloat(expense.amount).toLocaleString(undefined, {
                          style: "currency",
                          currency: expense.currency || "USD",
                        })}
                        {expense.amountInCompanyCurrency &&
                          expense.currency !== "USD" && (
                            <span className="text-sm text-muted-foreground ml-2">
                              +{" "}
                              {parseFloat(
                                expense.amountInCompanyCurrency
                              ).toFixed(0)}{" "}
                              USD
                            </span>
                          )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleApproveClick(expense)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRejectClick(expense)}
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4">
            <Link to="/manager/approvals">
              <Button variant="outline" className="w-full">
                View All Pending Approvals
              </Button>
            </Link>
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
              onClick={handleApprove}
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
              onClick={handleReject}
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
