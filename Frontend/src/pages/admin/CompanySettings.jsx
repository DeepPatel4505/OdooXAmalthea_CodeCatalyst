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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, Globe, Users, Save } from "lucide-react";

// Mock data
const mockCompany = {
  id: "1",
  name: "Acme Corporation",
  country: "US",
  currency: "USD",
  currencySymbol: "$",
  timezone: "America/New_York",
  createdAt: "2024-01-01T00:00:00Z",
  totalUsers: 45,
  totalExpenses: 1234,
};

const COUNTRIES = [
  { code: "US", name: "United States", currency: "USD", symbol: "$" },
  { code: "GB", name: "United Kingdom", currency: "GBP", symbol: "£" },
  { code: "DE", name: "Germany", currency: "EUR", symbol: "€" },
  { code: "FR", name: "France", currency: "EUR", symbol: "€" },
  { code: "JP", name: "Japan", currency: "JPY", symbol: "¥" },
  { code: "CA", name: "Canada", currency: "CAD", symbol: "C$" },
  { code: "AU", name: "Australia", currency: "AUD", symbol: "A$" },
  { code: "IN", name: "India", currency: "INR", symbol: "₹" },
  { code: "BR", name: "Brazil", currency: "BRL", symbol: "R$" },
  { code: "CN", name: "China", currency: "CNY", symbol: "¥" },
];

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "Greenwich Mean Time (GMT)" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Asia/Shanghai", label: "China Standard Time (CST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
];

export function CompanySettings() {
  const [company, setCompany] = useState(mockCompany);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: company.name,
    country: company.country,
    timezone: company.timezone,
  });

  const selectedCountry = COUNTRIES.find((c) => c.code === formData.country);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Connect to API
      console.log("Saving company settings:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setCompany({
        ...company,
        ...formData,
        currency: selectedCountry?.currency || company.currency,
        currencySymbol: selectedCountry?.symbol || company.currencySymbol,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save company settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: company.name,
      country: company.country,
      timezone: company.timezone,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage your company information and preferences
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>Edit Settings</Button>
          )}
        </div>
      </div>

      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Company Overview
          </CardTitle>
          <CardDescription>
            Basic information about your company
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company Name</Label>
              {isEditing ? (
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter company name"
                />
              ) : (
                <p className="text-sm">{company.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Country</Label>
              {isEditing ? (
                <Select
                  value={formData.country}
                  onValueChange={(value) =>
                    setFormData({ ...formData, country: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {selectedCountry?.name || company.country}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Default Currency</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {company.currency} ({company.currencySymbol})
                </span>
                {isEditing && selectedCountry && (
                  <Badge variant="outline" className="text-xs">
                    Will change to {selectedCountry.currency}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Timezone</Label>
              {isEditing ? (
                <Select
                  value={formData.timezone}
                  onValueChange={(value) =>
                    setFormData({ ...formData, timezone: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">
                  {TIMEZONES.find((tz) => tz.value === company.timezone)
                    ?.label || company.timezone}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active users in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{company.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">Expenses processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Company Created
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(company.createdAt).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">System setup date</p>
          </CardContent>
        </Card>
      </div>

      {/* Currency Information */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Information</CardTitle>
          <CardDescription>
            Information about your company's default currency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Current Currency</p>
                <p className="text-sm text-muted-foreground">
                  {company.currency} -{" "}
                  {selectedCountry?.name || "Unknown Country"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{company.currencySymbol}</p>
                <p className="text-sm text-muted-foreground">Symbol</p>
              </div>
            </div>

            {isEditing &&
              selectedCountry &&
              selectedCountry.currency !== company.currency && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">
                    Currency Change Warning
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Changing the company currency will affect how amounts are
                    displayed and may require currency conversion for existing
                    expenses.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>
            Technical details about your expense management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company ID</Label>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {company.id}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Created At</Label>
              <p className="text-sm">
                {new Date(company.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
