import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Stepper } from "@/components/ui/stepper";
import { Modal } from "@/components/ui/modal";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Loader2,
} from "lucide-react";
import { expenseAPI, approvalAPI } from "@/services/api";
import { toast } from "sonner";

export function ApprovalWorkflow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [approvalComment, setApprovalComment] = useState("");
  const [rejectionComment, setRejectionComment] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch expense details or pending approvals list
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (id) {
          // Fetch specific expense
          const response = await expenseAPI.getExpense(id);
          if (response.success) {
            setExpense(response.data.expense);
          } else {
            navigate("/manager/approvals");
          }
        } else {
          // No specific expense ID, redirect to main dashboard
          navigate("/manager");
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        navigate("/manager");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleApprove = async () => {
    if (!expense) return;

    setIsProcessing(true);
    try {
      const response = await approvalAPI.makeDecision(expense.id, {
        decision: "approve",
        comment: approvalComment,
      });

      if (response.success) {
        setShowApprovalModal(false);
        setApprovalComment("");
        // Navigate back to manager dashboard
        navigate("/manager");
      } else {
        throw new Error(response.message || "Approval failed");
      }
    } catch (error) {
      console.error("Approval failed:", error);
      toast.error("Failed to approve expense. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!expense) return;

    setIsProcessing(true);
    try {
      const response = await approvalAPI.makeDecision(expense.id, {
        decision: "reject",
        comment: rejectionComment,
      });

      if (response.success) {
        setShowRejectionModal(false);
        setRejectionComment("");
        // Navigate back to manager dashboard
        navigate("/manager");
      } else {
        throw new Error(response.message || "Rejection failed");
      }
    } catch (error) {
      console.error("Rejection failed:", error);
      toast.error("Failed to reject expense. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading expense details...</p>
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Expense not found</p>
        <Button onClick={() => navigate("/manager")} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Generate approval steps based on expense data
  const approvalSteps = [
    {
      id: "manager",
      title: "Manager Review",
      description: "Direct manager approval",
      status: "current",
    },
  ];

  // Add additional steps based on amount or other criteria
  if (parseFloat(expense.amount) > 100) {
    approvalSteps.push({
      id: "finance",
      title: "Finance Review",
      description: "Finance team verification",
      status: "upcoming",
    });
  }

  if (parseFloat(expense.amount) > 500) {
    approvalSteps.push({
      id: "director",
      title: "Director Approval",
      description: "Final approval for high amounts",
      status: "upcoming",
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Expense Approval</h1>
        <p className="text-muted-foreground">
          Review and approve expense submissions
        </p>
      </div>

      {/* Approval Stepper */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflow</CardTitle>
          <CardDescription>
            Current status of the expense approval process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Stepper steps={approvalSteps} currentStep={0} className="mb-6" />
        </CardContent>
      </Card>

      {/* Expense Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
            <CardDescription>
              Information submitted by the employee
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {expense.employee?.firstName} {expense.employee?.lastName}
              </span>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Amount</Label>
              <p className="text-2xl font-bold">
                {parseFloat(expense.amount).toLocaleString(undefined, {
                  style: "currency",
                  currency: expense.currency || "USD",
                })}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Category</Label>
              <Badge variant="outline">{expense.category}</Badge>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm">{expense.description}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Date</Label>
              <p className="text-sm">
                {new Date(expense.expenseDate).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Receipt</Label>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <Button variant="link" className="p-0 h-auto">
                  {expense.receiptUrl || "No receipt uploaded"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Approval Actions</CardTitle>
            <CardDescription>
              Review and make a decision on this expense
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="approval-comment">Comments (Optional)</Label>
              <Textarea
                id="approval-comment"
                placeholder="Add any comments about this expense..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowApprovalModal(true)}
                className="flex-1"
                disabled={isProcessing}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                variant="destructive"
                onClick={() => setShowRejectionModal(true)}
                className="flex-1"
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Approval Rules</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Amounts under $50: Manager approval only</li>
                <li>• Amounts $50-$100: Manager + Finance approval</li>
                <li>
                  • Amounts over $100: Manager + Finance + Director approval
                </li>
                <li>• Travel expenses require additional documentation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Confirmation Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Confirm Approval"
      >
        <div className="space-y-4">
          <p>Are you sure you want to approve this expense?</p>
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {parseFloat(expense.amount).toLocaleString(undefined, {
                style: "currency",
                currency: expense.currency || "USD",
              })}{" "}
              • {expense.employee?.firstName} {expense.employee?.lastName}
            </p>
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

      {/* Rejection Confirmation Modal */}
      <Modal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title="Confirm Rejection"
      >
        <div className="space-y-4">
          <p>Are you sure you want to reject this expense?</p>
          <div className="bg-muted p-3 rounded-lg">
            <p className="font-medium">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {parseFloat(expense.amount).toLocaleString(undefined, {
                style: "currency",
                currency: expense.currency || "USD",
              })}{" "}
              • {expense.employee?.firstName} {expense.employee?.lastName}
            </p>
          </div>
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
