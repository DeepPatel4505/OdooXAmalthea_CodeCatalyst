import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { Stepper } from "@/components/ui/stepper";
import { Plus, Trash2, Edit, Save, X } from "lucide-react";

const APPROVAL_TYPES = [
  { value: "sequential", label: "Sequential Approval" },
  { value: "percentage", label: "Percentage-based" },
  { value: "specific_approver", label: "Specific Approver" },
  { value: "hybrid", label: "Hybrid (Combination)" },
];

const APPROVER_ROLES = [
  { value: "manager", label: "Manager" },
  { value: "finance", label: "Finance" },
  { value: "director", label: "Director" },
  { value: "cfo", label: "CFO" },
  { value: "ceo", label: "CEO" },
];

// Mock data
const mockApprovalRules = [
  {
    id: "1",
    name: "Standard Approval Flow",
    isManagerApprover: true,
    approvalType: "sequential",
    percentageThreshold: null,
    specificApproverId: null,
    steps: [
      {
        id: "1",
        stepNumber: 1,
        approverRole: "manager",
        approverName: "Direct Manager",
      },
      {
        id: "2",
        stepNumber: 2,
        approverRole: "finance",
        approverName: "Finance Team",
      },
    ],
    isActive: true,
  },
  {
    id: "2",
    name: "High Value Approval",
    isManagerApprover: true,
    approvalType: "hybrid",
    percentageThreshold: 60,
    specificApproverId: "cfo",
    steps: [
      {
        id: "3",
        stepNumber: 1,
        approverRole: "manager",
        approverName: "Direct Manager",
      },
      {
        id: "4",
        stepNumber: 2,
        approverRole: "finance",
        approverName: "Finance Team",
      },
      {
        id: "5",
        stepNumber: 3,
        approverRole: "director",
        approverName: "Director",
      },
    ],
    isActive: true,
  },
];

const mockUsers = [
  { id: "1", name: "John Doe", role: "manager", email: "john@company.com" },
  { id: "2", name: "Jane Smith", role: "finance", email: "jane@company.com" },
  {
    id: "3",
    name: "Mike Johnson",
    role: "director",
    email: "mike@company.com",
  },
  { id: "4", name: "Sarah Wilson", role: "cfo", email: "sarah@company.com" },
];

export function ApprovalRules() {
  const [rules, setRules] = useState(mockApprovalRules);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: "",
    isManagerApprover: false,
    approvalType: "sequential",
    percentageThreshold: null,
    specificApproverId: null,
    steps: [],
  });

  const handleCreateRule = () => {
    const rule = {
      id: Date.now().toString(),
      ...newRule,
      isActive: true,
    };
    setRules([...rules, rule]);
    setNewRule({
      name: "",
      isManagerApprover: false,
      approvalType: "sequential",
      percentageThreshold: null,
      specificApproverId: null,
      steps: [],
    });
    setShowCreateModal(false);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setShowEditModal(true);
  };

  const handleDeleteRule = (ruleId) => {
    setRules(rules.filter((rule) => rule.id !== ruleId));
  };

  const toggleRuleStatus = (ruleId) => {
    setRules(
      rules.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  const getApprovalTypeBadge = (type) => {
    const typeConfig = APPROVAL_TYPES.find((t) => t.value === type);
    return <Badge variant="outline">{typeConfig?.label || type}</Badge>;
  };

  const getStatusBadge = (isActive) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Active
      </Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Approval Rules</h1>
          <p className="text-muted-foreground">
            Configure expense approval workflows and rules
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => (
          <Card key={rule.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {rule.name}
                    {getStatusBadge(rule.isActive)}
                  </CardTitle>
                  <CardDescription>
                    {rule.isManagerApprover &&
                      "Manager approval required first • "}
                    {getApprovalTypeBadge(rule.approvalType)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={rule.isActive}
                    onCheckedChange={() => toggleRuleStatus(rule.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditRule(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Rule Configuration */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-sm font-medium">
                      Manager Approver
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {rule.isManagerApprover
                        ? "Yes - Manager must approve first"
                        : "No - Skip manager approval"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Approval Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {
                        APPROVAL_TYPES.find(
                          (t) => t.value === rule.approvalType
                        )?.label
                      }
                    </p>
                  </div>
                </div>

                {/* Conditional Rules */}
                {rule.approvalType === "percentage" &&
                  rule.percentageThreshold && (
                    <div>
                      <Label className="text-sm font-medium">
                        Percentage Threshold
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {rule.percentageThreshold}% of approvers must approve
                      </p>
                    </div>
                  )}

                {rule.approvalType === "specific_approver" &&
                  rule.specificApproverId && (
                    <div>
                      <Label className="text-sm font-medium">
                        Specific Approver
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {
                          APPROVER_ROLES.find(
                            (r) => r.value === rule.specificApproverId
                          )?.label
                        }{" "}
                        approval auto-approves
                      </p>
                    </div>
                  )}

                {rule.approvalType === "hybrid" && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hybrid Rules</Label>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {rule.percentageThreshold && (
                        <p>
                          • {rule.percentageThreshold}% of approvers must
                          approve
                        </p>
                      )}
                      {rule.specificApproverId && (
                        <p>
                          •{" "}
                          {
                            APPROVER_ROLES.find(
                              (r) => r.value === rule.specificApproverId
                            )?.label
                          }{" "}
                          approval auto-approves
                        </p>
                      )}
                      <p>• Expense approved if EITHER condition is met</p>
                    </div>
                  </div>
                )}

                {/* Approval Steps */}
                {rule.steps.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">
                      Approval Steps
                    </Label>
                    <div className="mt-2">
                      <Stepper
                        steps={rule.steps.map((step) => ({
                          id: step.id,
                          title: step.approverName,
                          description: `Step ${step.stepNumber}`,
                          status: "completed",
                        }))}
                        currentStep={rule.steps.length - 1}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Approval Rule"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              placeholder="e.g., Standard Approval Flow"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="manager-approver"
              checked={newRule.isManagerApprover}
              onCheckedChange={(checked) =>
                setNewRule({ ...newRule, isManagerApprover: checked })
              }
            />
            <Label htmlFor="manager-approver">Manager Approver Required</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="approval-type">Approval Type</Label>
            <Select
              value={newRule.approvalType}
              onValueChange={(value) =>
                setNewRule({ ...newRule, approvalType: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select approval type" />
              </SelectTrigger>
              <SelectContent>
                {APPROVAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {newRule.approvalType === "percentage" && (
            <div className="space-y-2">
              <Label htmlFor="percentage">Percentage Threshold</Label>
              <Input
                id="percentage"
                type="number"
                min="1"
                max="100"
                placeholder="60"
                value={newRule.percentageThreshold || ""}
                onChange={(e) =>
                  setNewRule({
                    ...newRule,
                    percentageThreshold: parseInt(e.target.value),
                  })
                }
              />
            </div>
          )}

          {newRule.approvalType === "specific_approver" && (
            <div className="space-y-2">
              <Label htmlFor="specific-approver">Specific Approver</Label>
              <Select
                value={newRule.specificApproverId || ""}
                onValueChange={(value) =>
                  setNewRule({ ...newRule, specificApproverId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select approver" />
                </SelectTrigger>
                <SelectContent>
                  {APPROVER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {newRule.approvalType === "hybrid" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hybrid-percentage">
                  Percentage Threshold (Optional)
                </Label>
                <Input
                  id="hybrid-percentage"
                  type="number"
                  min="1"
                  max="100"
                  placeholder="60"
                  value={newRule.percentageThreshold || ""}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      percentageThreshold: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hybrid-approver">
                  Specific Approver (Optional)
                </Label>
                <Select
                  value={newRule.specificApproverId || ""}
                  onValueChange={(value) =>
                    setNewRule({ ...newRule, specificApproverId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select approver" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPROVER_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleCreateRule} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
