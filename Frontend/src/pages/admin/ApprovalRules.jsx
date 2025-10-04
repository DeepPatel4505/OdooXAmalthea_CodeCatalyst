import { useState, useEffect } from "react";
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
import { Plus, Trash2, Edit, Save, X, Loader2 } from "lucide-react";
import { approvalRulesAPI, userAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const APPROVAL_TYPES = [
  { value: "SEQUENTIAL", label: "Sequential Approval" },
  { value: "PERCENTAGE", label: "Percentage-based" },
  { value: "SPECIFIC_APPROVER", label: "Specific Approver" },
  { value: "HYBRID", label: "Hybrid (Combination)" },
];

const APPROVER_ROLES = [
  { value: "manager", label: "Manager" },
  { value: "finance", label: "Finance" },
  { value: "director", label: "Director" },
  { value: "cfo", label: "CFO" },
  { value: "ceo", label: "CEO" },
];

// Remove mock data - will be replaced with real API data

export function ApprovalRules() {
  const { user } = useAuth();
  const [rules, setRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    name: "",
    isManagerApprover: false,
    approvalType: "SEQUENTIAL",
    percentageThreshold: null,
    specificApproverId: null,
    approvers: [], // Array of approver IDs for multiple approvers
  });

  // Fetch approval rules and users
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [rulesResponse, usersResponse] = await Promise.all([
          approvalRulesAPI.getRules(),
          userAPI.getUsers({ role: "manager" }),
        ]);

        if (rulesResponse.success) {
          setRules(rulesResponse.data.rules || []);
        }

        if (usersResponse.success) {
          setUsers(usersResponse.data.users || []);
        }
      } catch (error) {
        console.error("Failed to fetch approval rules:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user]);

  const handleCreateRule = async () => {
    try {
      // Validate required fields
      if (!newRule.name || newRule.name.trim() === "") {
        alert("Please enter a rule name.");
        return;
      }

      // Validate that approvers are selected for applicable rule types
      if (
        (newRule.approvalType === "SEQUENTIAL" ||
          newRule.approvalType === "PERCENTAGE" ||
          newRule.approvalType === "HYBRID") &&
        newRule.approvers.length === 0
      ) {
        alert("Please select at least one approver for this rule type.");
        return;
      }

      // Validate percentage threshold for percentage and hybrid types
      if (
        (newRule.approvalType === "PERCENTAGE" ||
          newRule.approvalType === "HYBRID") &&
        (!newRule.percentageThreshold ||
          newRule.percentageThreshold < 1 ||
          newRule.percentageThreshold > 100)
      ) {
        alert(
          "Please enter a valid percentage threshold (1-100) for this rule type."
        );
        return;
      }

      // Validate specific approver for specific_approver type
      if (
        newRule.approvalType === "SPECIFIC_APPROVER" &&
        !newRule.specificApproverId
      ) {
        alert("Please select a specific approver for this rule type.");
        return;
      }

      // Prepare rule data for backend (exclude approvers array)
      const ruleData = {
        name: newRule.name.trim(),
        isManagerApprover: newRule.isManagerApprover,
        approvalType: newRule.approvalType,
        percentageThreshold: newRule.percentageThreshold || null,
        specificApproverId: newRule.specificApproverId || null,
      };

      const response = await approvalRulesAPI.createRule(ruleData);
      if (response.success) {
        // If we have approvers, create approval steps
        if (newRule.approvers.length > 0) {
          const ruleId = response.data.rule.id;
          for (let i = 0; i < newRule.approvers.length; i++) {
            await approvalRulesAPI.addStep(ruleId, {
              stepNumber: i + 1,
              approverRole: "MANAGER",
              approverId: newRule.approvers[i],
            });
          }
        }

        // Refresh rules list
        const rulesResponse = await approvalRulesAPI.getRules();
        if (rulesResponse.success) {
          setRules(rulesResponse.data.rules || []);
        }
        setNewRule({
          name: "",
          isManagerApprover: false,
          approvalType: "SEQUENTIAL",
          percentageThreshold: null,
          specificApproverId: null,
          approvers: [],
        });
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create rule:", error);
      alert(
        `Failed to create approval rule: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setShowEditModal(true);
  };

  const handleUpdateRule = async () => {
    try {
      if (!editingRule) return;

      // Validate required fields
      if (!editingRule.name || editingRule.name.trim() === "") {
        alert("Please enter a rule name.");
        return;
      }

      // Prepare rule data for backend
      const ruleData = {
        name: editingRule.name.trim(),
        isManagerApprover: editingRule.isManagerApprover,
        approvalType: editingRule.approvalType,
        percentageThreshold: editingRule.percentageThreshold || null,
        specificApproverId: editingRule.specificApproverId || null,
      };

      const response = await approvalRulesAPI.updateRule(
        editingRule.id,
        ruleData
      );
      if (response.success) {
        // Refresh rules list
        const rulesResponse = await approvalRulesAPI.getRules();
        if (rulesResponse.success) {
          setRules(rulesResponse.data.rules || []);
        }
        setEditingRule(null);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Failed to update rule:", error);
      alert(
        `Failed to update approval rule: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm("Are you sure you want to delete this approval rule?")) return;

    try {
      const response = await approvalRulesAPI.deleteRule(ruleId);
      if (response.success) {
        // Refresh rules list
        const rulesResponse = await approvalRulesAPI.getRules();
        if (rulesResponse.success) {
          setRules(rulesResponse.data.rules || []);
        }
      }
    } catch (error) {
      console.error("Failed to delete rule:", error);
      alert(
        `Failed to delete approval rule: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  const toggleRuleStatus = async (ruleId) => {
    try {
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) return;

      const response = await approvalRulesAPI.updateRule(ruleId, {
        ...rule,
        isActive: !rule.isActive,
      });

      if (response.success) {
        // Refresh rules list
        const rulesResponse = await approvalRulesAPI.getRules();
        if (rulesResponse.success) {
          setRules(rulesResponse.data.rules || []);
        }
      }
    } catch (error) {
      console.error("Failed to update rule status:", error);
      alert("Failed to update rule status. Please try again.");
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading approval rules...</p>
        </div>
      </div>
    );
  }

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
        {rules && rules.length > 0 ? (
          rules.map((rule) => (
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
                      {getApprovalTypeBadge(rule.approvalType || "sequential")}
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
                      <Label className="text-sm font-medium">
                        Approval Type
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {APPROVAL_TYPES.find(
                          (t) => t.value === (rule.approvalType || "SEQUENTIAL")
                        )?.label || "Sequential Approval"}
                      </p>
                    </div>
                  </div>

                  {/* Conditional Rules */}
                  {(rule.approvalType === "PERCENTAGE" ||
                    rule.approvalType === "HYBRID") &&
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

                  {(rule.approvalType === "SPECIFIC_APPROVER" ||
                    rule.approvalType === "HYBRID") &&
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

                  {rule.approvalType === "HYBRID" && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Hybrid Rules
                      </Label>
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
                  {rule.steps && rule.steps.length > 0 && (
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
          ))
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <p>No approval rules found</p>
                <p className="text-sm">
                  Create your first approval rule to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Approval Rule"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateRule();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name</Label>
            <Input
              id="rule-name"
              placeholder="e.g., Standard Approval Flow"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              required
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

          {newRule.approvalType === "PERCENTAGE" && (
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

          {/* Multiple Approvers Selection */}
          {(newRule.approvalType === "SEQUENTIAL" ||
            newRule.approvalType === "PERCENTAGE" ||
            newRule.approvalType === "HYBRID") && (
            <div className="space-y-2">
              <Label htmlFor="approvers">Select Approvers</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`approver-${user.id}`}
                      checked={newRule.approvers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewRule({
                            ...newRule,
                            approvers: [...newRule.approvers, user.id],
                          });
                        } else {
                          setNewRule({
                            ...newRule,
                            approvers: newRule.approvers.filter(
                              (id) => id !== user.id
                            ),
                          });
                        }
                      }}
                    />
                    <label htmlFor={`approver-${user.id}`} className="text-sm">
                      {user.firstName} {user.lastName} ({user.role})
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select the managers who will be part of the approval process
              </p>
            </div>
          )}

          {newRule.approvalType === "SPECIFIC_APPROVER" && (
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

          {newRule.approvalType === "HYBRID" && (
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
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Rule Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Approval Rule"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateRule();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="edit-rule-name">Rule Name</Label>
            <Input
              id="edit-rule-name"
              placeholder="e.g., Standard Approval Flow"
              value={editingRule?.name || ""}
              onChange={(e) =>
                setEditingRule({ ...editingRule, name: e.target.value })
              }
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="edit-manager-approver"
              checked={editingRule?.isManagerApprover || false}
              onCheckedChange={(checked) =>
                setEditingRule({ ...editingRule, isManagerApprover: checked })
              }
            />
            <Label htmlFor="edit-manager-approver">
              Manager approval required first
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-approval-type">Approval Type</Label>
            <Select
              value={editingRule?.approvalType || "SEQUENTIAL"}
              onValueChange={(value) =>
                setEditingRule({ ...editingRule, approvalType: value })
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

          {editingRule?.approvalType === "PERCENTAGE" && (
            <div className="space-y-2">
              <Label htmlFor="edit-percentage">Percentage Threshold</Label>
              <Input
                id="edit-percentage"
                type="number"
                min="1"
                max="100"
                placeholder="60"
                value={editingRule?.percentageThreshold || ""}
                onChange={(e) =>
                  setEditingRule({
                    ...editingRule,
                    percentageThreshold: parseInt(e.target.value),
                  })
                }
              />
            </div>
          )}

          {editingRule?.approvalType === "SPECIFIC_APPROVER" && (
            <div className="space-y-2">
              <Label htmlFor="edit-specific-approver">Specific Approver</Label>
              <Select
                value={editingRule?.specificApproverId || ""}
                onValueChange={(value) =>
                  setEditingRule({ ...editingRule, specificApproverId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specific approver" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Update Rule
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
