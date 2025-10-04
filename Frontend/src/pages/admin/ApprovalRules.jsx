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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Loader2,
  Users,
  Settings,
} from "lucide-react";
import { userApprovalRulesAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function ApprovalRules() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [presets, setPresets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [newRule, setNewRule] = useState({
    userId: "",
    ruleName: "",
    description: "",
    isManagerApprover: false,
    managerId: "",
    approvalType: "SEQUENTIAL",
    useSequence: true,
    percentageThreshold: null,
    approvers: [],
  });

  // Fetch users and preset rules
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [usersResponse, presetsResponse] = await Promise.all([
          userApprovalRulesAPI.getUsersWithApprovalRules(),
          userApprovalRulesAPI.getPresetRules(),
        ]);

        if (usersResponse.success) {
          setUsers(usersResponse.data.users || []);
        }

        if (presetsResponse.success) {
          setPresets(presetsResponse.data.presets || []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
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
      if (
        !selectedUser ||
        !newRule.ruleName ||
        newRule.approvers.length === 0
      ) {
        toast.error("Please fill in all required fields and select at least one approver.");
        return;
      }

      const response = await userApprovalRulesAPI.createUserApprovalRule({
        ...newRule,
        userId: selectedUser.id,
      });
      if (response.success) {
        // Refresh users list
        const usersResponse =
          await userApprovalRulesAPI.getUsersWithApprovalRules();
        if (usersResponse.success) {
          const updatedUsers = usersResponse.data.users || [];
          setUsers(updatedUsers);
          
          // Update selectedUser if it's still in the updated list
          if (selectedUser) {
            const updatedSelectedUser = updatedUsers.find(user => user.id === selectedUser.id);
            if (updatedSelectedUser) {
              setSelectedUser(updatedSelectedUser);
            }
          }
        }
        setNewRule({
          userId: "",
          ruleName: "",
          description: "",
          isManagerApprover: false,
          managerId: "",
          approvalType: "SEQUENTIAL",
          useSequence: true,
          percentageThreshold: null,
          approvers: [],
        });
        setShowCreateModal(false);
        toast.success("Approval rule created successfully!");
      }
    } catch (error) {
      console.error("Failed to create rule:", error);
      toast.error(`Failed to create approval rule: ${error.message}`);
    }
  };

  const handleUpdateRule = async () => {
    try {
      if (!editingRule) return;

      const response = await userApprovalRulesAPI.updateUserApprovalRule(
        editingRule.id,
        newRule
      );
      if (response.success) {
        // Refresh users list
        const usersResponse =
          await userApprovalRulesAPI.getUsersWithApprovalRules();
        if (usersResponse.success) {
          const updatedUsers = usersResponse.data.users || [];
          setUsers(updatedUsers);
          
          // Update selectedUser if it's still in the updated list
          if (selectedUser) {
            const updatedSelectedUser = updatedUsers.find(user => user.id === selectedUser.id);
            if (updatedSelectedUser) {
              setSelectedUser(updatedSelectedUser);
            }
          }
        }
        setEditingRule(null);
        setShowCreateModal(false);
        toast.success("Approval rule updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update rule:", error);
      toast.error(`Failed to update approval rule: ${error.message}`);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (!confirm("Are you sure you want to delete this approval rule?")) return;

    try {
      console.log("🗑️ Deleting rule:", ruleId);
      const response = await userApprovalRulesAPI.deleteUserApprovalRule(
        ruleId
      );
      
      console.log("🗑️ Delete response:", response);
      
      if (response.success) {
        // Refresh both users and presets
        const [usersResponse, presetsResponse] = await Promise.all([
          userApprovalRulesAPI.getUsersWithApprovalRules(),
          userApprovalRulesAPI.getPresetRules()
        ]);
        
        console.log("🔄 Refresh responses:", { usersResponse, presetsResponse });
        
        if (usersResponse.success) {
          const updatedUsers = usersResponse.data.users || [];
          setUsers(updatedUsers);
          
          // Update selectedUser if it's still in the updated list
          if (selectedUser) {
            const updatedSelectedUser = updatedUsers.find(user => user.id === selectedUser.id);
            if (updatedSelectedUser) {
              setSelectedUser(updatedSelectedUser);
              console.log("✅ Selected user updated with new rules");
            }
          }
          
          console.log("✅ Users list updated");
        }
        
        if (presetsResponse.success) {
          setPresets(presetsResponse.data.presets || []);
          console.log("✅ Presets list updated");
        }
        
        toast.success("Approval rule deleted successfully!");
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error) {
      console.error("❌ Failed to delete rule:", error);
      toast.error(`Failed to delete approval rule: ${error.message}`);
    }
  };

  const handleApplyPreset = async (presetId) => {
    try {
      if (!selectedUser) {
        toast.error("Please select a user first.");
        return;
      }

      const response = await userApprovalRulesAPI.applyPresetRule(
        selectedUser.id,
        presetId
      );
      if (response.success) {
        // Refresh users list
        const usersResponse =
          await userApprovalRulesAPI.getUsersWithApprovalRules();
        if (usersResponse.success) {
          const updatedUsers = usersResponse.data.users || [];
          setUsers(updatedUsers);
          
          // Update selectedUser if it's still in the updated list
          if (selectedUser) {
            const updatedSelectedUser = updatedUsers.find(user => user.id === selectedUser.id);
            if (updatedSelectedUser) {
              setSelectedUser(updatedSelectedUser);
            }
          }
        }
        setShowPresetModal(false);
        toast.success("Preset rule applied successfully!");
      }
    } catch (error) {
      console.error("Failed to apply preset:", error);
      toast.error(`Failed to apply preset rule: ${error.message}`);
    }
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
          <h1 className="text-3xl font-bold">Admin view (Approval rules)</h1>
          <p className="text-muted-foreground">
            Configure user-specific approval workflows and rules
          </p>
        </div>
      </div>

      {/* Tab-based Interface - Matching Mockup */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Rules
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Preset Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select User</CardTitle>
              <CardDescription>
                Choose a user to configure their approval rules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="user-select">User</Label>
                  <Select
                    value={selectedUser?.id || ""}
                    onValueChange={(userId) => {
                      const user = users.find((u) => u.id === userId);
                      setSelectedUser(user);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a user to configure rules" />
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

                {selectedUser && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setNewRule({
                          ...newRule,
                          userId: selectedUser.id,
                          managerId: selectedUser.managerId || "",
                        });
                        setShowCreateModal(true);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Create Custom Rule
                    </Button>
                    <Button
                      onClick={() => setShowPresetModal(true)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Apply Preset
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* User's Current Rules */}
          {selectedUser && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Approval Rules for {selectedUser.firstName}{" "}
                  {selectedUser.lastName}
                </CardTitle>
                <CardDescription>
                  Current approval workflow configuration
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedUser.userApprovalRules &&
                selectedUser.userApprovalRules.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.userApprovalRules.map((rule) => (
                      <div key={rule.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold">{rule.ruleName}</h3>
                            {rule.description && (
                              <p className="text-sm text-muted-foreground">
                                {rule.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingRule(rule);
                                setNewRule({
                                  ...rule,
                                  approvers: rule.approvers || [],
                                });
                                setShowCreateModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Rule Configuration Display */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label className="text-sm font-medium">
                              Manager
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {rule.manager
                                ? `${rule.manager.firstName} ${rule.manager.lastName}`
                                : "No manager assigned"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">
                              Approval Type
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              {rule.approvalType}{" "}
                              {rule.useSequence ? "(Sequential)" : "(Parallel)"}
                            </p>
                          </div>
                          {rule.percentageThreshold && (
                            <div>
                              <Label className="text-sm font-medium">
                                Percentage Threshold
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                {rule.percentageThreshold}%
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Approvers List */}
                        {rule.approvers && rule.approvers.length > 0 && (
                          <div className="mt-4">
                            <Label className="text-sm font-medium">
                              Approvers
                            </Label>
                            <div className="mt-2 space-y-2">
                              {rule.approvers.map((approver, index) => (
                                <div
                                  key={approver.id}
                                  className="flex items-center gap-2 p-2 bg-muted rounded"
                                >
                                  <span className="text-sm font-medium">
                                    {index + 1}. {approver.approver.firstName}{" "}
                                    {approver.approver.lastName}
                                  </span>
                                  {approver.isRequired && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      Required
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No approval rules configured for this user</p>
                    <p className="text-sm">
                      Create a custom rule or apply a preset
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="presets" className="space-y-6">
          {/* Preset Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Preset Approval Rules</CardTitle>
              <CardDescription>
                Pre-configured approval rule templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {presets.map((preset) => (
                  <div key={preset.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{preset.name}</h3>
                      <Badge variant="outline">Preset</Badge>
                    </div>
                    {preset.description && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {preset.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {preset.approvalType}
                      </div>
                      <div>
                        <span className="font-medium">Sequence:</span>{" "}
                        {preset.useSequence ? "Sequential" : "Parallel"}
                      </div>
                      {preset.percentageThreshold && (
                        <div>
                          <span className="font-medium">Threshold:</span>{" "}
                          {preset.percentageThreshold}%
                        </div>
                      )}
                    </div>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApplyPreset(preset.id)}
                        className="w-full"
                      >
                        Apply to User
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Rule Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={editingRule ? "Edit Approval Rule" : "Create Approval Rule"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editingRule) {
              handleUpdateRule();
            } else {
              handleCreateRule();
            }
          }}
          className="space-y-4"
        >
          {/* User Field - Matching Mockup */}
          <div className="space-y-2">
            <Label htmlFor="user-field">User</Label>
            <Input
              id="user-field"
              value={
                selectedUser
                  ? `${selectedUser.firstName} ${selectedUser.lastName}`
                  : ""
              }
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Dynamic dropdown. Initially the manager set on user record should
              be set, admin can change manager for approval if required.
            </p>
          </div>

          {/* Rule Name Field - Required */}
          <div className="space-y-2">
            <Label htmlFor="rule-name">Rule Name *</Label>
            <Input
              id="rule-name"
              placeholder="Enter rule name"
              value={newRule.ruleName}
              onChange={(e) =>
                setNewRule({ ...newRule, ruleName: e.target.value })
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              A descriptive name for this approval rule
            </p>
          </div>

          {/* Description Field - Matching Mockup */}
          <div className="space-y-2">
            <Label htmlFor="description">Description about rules</Label>
            <Textarea
              id="description"
              placeholder="Approval rule for miscellaneous expenses"
              value={newRule.description}
              onChange={(e) =>
                setNewRule({ ...newRule, description: e.target.value })
              }
            />
          </div>

          {/* Manager Field - Matching Mockup */}
          <div className="space-y-2">
            <Label htmlFor="manager">Manager</Label>
            <Select
              value={newRule.managerId}
              onValueChange={(value) =>
                setNewRule({ ...newRule, managerId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => u.role === "MANAGER" || u.role === "ADMIN")
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.firstName} {user.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approvers Section - Matching Mockup */}
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-3">Approvers</h3>

              {/* Is Manager Approver Checkbox */}
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="is-manager-approver"
                  checked={newRule.isManagerApprover}
                  onCheckedChange={(checked) =>
                    setNewRule({ ...newRule, isManagerApprover: checked })
                  }
                />
                <Label htmlFor="is-manager-approver">
                  Is manager an approver?
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                If this field is checked then by default the approve request
                would go to his/her manager first, before going to other
                approvers.
              </p>

              {/* Approvers List */}
              <div className="space-y-2">
                <Label>Select Approvers</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {users
                    .filter((u) => u.role === "MANAGER" || u.role === "ADMIN")
                    .map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          id={`approver-${user.id}`}
                          checked={newRule.approvers.some(
                            (a) => a.approverId === user.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewRule({
                                ...newRule,
                                approvers: [
                                  ...newRule.approvers,
                                  {
                                    approverId: user.id,
                                    isRequired: false,
                                    sequenceOrder: newRule.approvers.length + 1,
                                  },
                                ],
                              });
                            } else {
                              setNewRule({
                                ...newRule,
                                approvers: newRule.approvers.filter(
                                  (a) => a.approverId !== user.id
                                ),
                              });
                            }
                          }}
                        />
                        <label
                          htmlFor={`approver-${user.id}`}
                          className="text-sm"
                        >
                          {index + 1} {user.firstName} {user.lastName}
                        </label>
                      </div>
                    ))}
                </div>
              </div>

              {/* Required Checkboxes */}
              {newRule.approvers.length > 0 && (
                <div className="space-y-2">
                  <Label>Required</Label>
                  <div className="space-y-2">
                    {newRule.approvers.map((approver, index) => {
                      const user = users.find(
                        (u) => u.id === approver.approverId
                      );
                      return (
                        <div
                          key={approver.approverId}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            id={`required-${approver.approverId}`}
                            checked={approver.isRequired}
                            onChange={(e) => {
                              const updatedApprovers = [...newRule.approvers];
                              updatedApprovers[index].isRequired =
                                e.target.checked;
                              setNewRule({
                                ...newRule,
                                approvers: updatedApprovers,
                              });
                            }}
                          />
                          <label
                            htmlFor={`required-${approver.approverId}`}
                            className="text-sm"
                          >
                            {user?.firstName} {user?.lastName}
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    If this field is ticked, then anyhow approval of this
                    approver is required in any approval combination scenarios.
                  </p>
                </div>
              )}
            </div>

            {/* Approvers Sequence - Matching Mockup */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="approvers-sequence"
                  checked={newRule.useSequence}
                  onCheckedChange={(checked) =>
                    setNewRule({ ...newRule, useSequence: checked })
                  }
                />
                <Label htmlFor="approvers-sequence">Approvers Sequence</Label>
              </div>
              <p className="text-xs text-muted-foreground">
                If this field is ticked true then the above mentioned sequence
                of approvers matters, that is first the request goes to John, if
                he approves/rejects then only request goes to mitchell and so
                on. If the required approver rejects the request, then expense
                request is auto-rejected. If not ticked then send approver
                request to all approvers at the same time.
              </p>
            </div>

            {/* Minimum Approval Percentage - Matching Mockup */}
            {!newRule.useSequence && (
              <div className="space-y-2">
                <Label htmlFor="percentage">Minimum Approval percentage</Label>
                <div className="flex items-center space-x-2">
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
                        percentageThreshold: parseInt(e.target.value) || null,
                      })
                    }
                    className="w-20"
                  />
                  <span>%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Specify the number of percentage approvers required in order
                  to get the request approved.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {editingRule ? "Update Rule" : "Create Rule"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreateModal(false);
                setEditingRule(null);
                setNewRule({
                  userId: "",
                  ruleName: "",
                  description: "",
                  isManagerApprover: false,
                  managerId: "",
                  approvalType: "SEQUENTIAL",
                  useSequence: true,
                  percentageThreshold: null,
                  approvers: [],
                });
              }}
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
