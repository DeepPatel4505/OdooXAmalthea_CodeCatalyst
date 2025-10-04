import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
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
import {
  Settings,
  Globe,
  DollarSign,
  Calendar,
  Save,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { companyAPI, currencyAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

// Default countries list - will be populated from API
const DEFAULT_COUNTRIES = [
  { code: "US", name: "United States", currency: "USD" },
  { code: "GB", name: "United Kingdom", currency: "GBP" },
  { code: "DE", name: "Germany", currency: "EUR" },
  { code: "FR", name: "France", currency: "EUR" },
  { code: "JP", name: "Japan", currency: "JPY" },
  { code: "CA", name: "Canada", currency: "CAD" },
  { code: "AU", name: "Australia", currency: "AUD" },
  { code: "IN", name: "India", currency: "INR" },
  { code: "BR", name: "Brazil", currency: "BRL" },
  { code: "CN", name: "China", currency: "CNY" },
  { code: "CH", name: "Switzerland", currency: "CHF" },
  { code: "SG", name: "Singapore", currency: "SGD" },
  { code: "NL", name: "Netherlands", currency: "EUR" },
  { code: "IT", name: "Italy", currency: "EUR" },
  { code: "ES", name: "Spain", currency: "EUR" },
];

const CURRENCY_FORMATS = {
  USD: { symbol: "$", position: "before", decimals: 2 },
  EUR: { symbol: "€", position: "after", decimals: 2 },
  GBP: { symbol: "£", position: "before", decimals: 2 },
  JPY: { symbol: "¥", position: "before", decimals: 0 },
  INR: { symbol: "₹", position: "before", decimals: 2 },
  CAD: { symbol: "C$", position: "before", decimals: 2 },
  AUD: { symbol: "A$", position: "before", decimals: 2 },
  BRL: { symbol: "R$", position: "before", decimals: 2 },
  CNY: { symbol: "¥", position: "before", decimals: 2 },
  CHF: { symbol: "CHF", position: "after", decimals: 2 },
  SGD: { symbol: "S$", position: "before", decimals: 2 },
};

// Remove mock data - will be replaced with real API data

export function CompanySettings() {
  const { user } = useAuth();
  const [company, setCompany] = useState({
    id: "",
    name: "",
    country: "US",
    defaultCurrency: "USD",
  });
  const [countries, setCountries] = useState(DEFAULT_COUNTRIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm();

  // Load company settings and countries on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [companyResponse, countriesResponse] = await Promise.all([
          companyAPI.getSettings(),
          currencyAPI.getCountries(),
        ]);

        if (companyResponse.success) {
          setCompany(companyResponse.data.company);
          // Set form values
          setValue("name", companyResponse.data.company.name);
          setValue("country", companyResponse.data.company.country);
          setValue(
            "defaultCurrency",
            companyResponse.data.company.defaultCurrency
          );
        }

        if (countriesResponse.success) {
          setCountries(countriesResponse.data);
        }
      } catch (error) {
        console.error("Failed to fetch company settings:", error);
        setError("Failed to load company settings");
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchData();
    }
  }, [user, setValue]);

  const handleSaveChanges = async (data) => {
    setIsSaving(true);
    setError(null);

    try {
      const response = await companyAPI.updateSettings(data);
      if (response.success) {
        setCompany(response.data.company);
        setHasChanges(false);
        // Show success message (you could add a toast here)
        console.log("Company settings updated successfully");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setError(error.message || "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCountryChange = (countryCode) => {
    const selectedCountry = countries.find((c) => c.code === countryCode);
    if (selectedCountry) {
      setCompany({
        ...company,
        country: countryCode,
        defaultCurrency: selectedCountry.currency,
      });
      setValue("country", countryCode);
      setValue("defaultCurrency", selectedCountry.currency);
      setHasChanges(true);
    }
  };

  const selectedCountry = countries.find((c) => c.code === company.country);
  const currencyFormat = CURRENCY_FORMATS[company.defaultCurrency];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading company settings...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleSaveChanges)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage company information and configuration
          </p>
        </div>
        <Button
          type="submit"
          disabled={!hasChanges || isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Basic Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Company name, contact details, and basic settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                {...register("name", { required: "Company name is required" })}
                onChange={(e) => {
                  setValue("name", e.target.value);
                  setHasChanges(true);
                }}
                placeholder="Enter company name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={company.contactEmail}
                onChange={(e) => {
                  setCompany({ ...company, contactEmail: e.target.value });
                  setHasChanges(true);
                }}
                placeholder="admin@company.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={company.address}
              onChange={(e) => {
                setCompany({ ...company, address: e.target.value });
                setHasChanges(true);
              }}
              placeholder="Enter company address"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Geographic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Settings
          </CardTitle>
          <CardDescription>
            Country selection and currency configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select
                value={company.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium">{company.defaultCurrency}</span>
                <Badge variant="outline">{selectedCountry?.currency}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically set based on country selection
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Currency Configuration
            </h4>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <span className="font-medium">Symbol:</span>{" "}
                {currencyFormat.symbol}
              </div>
              <div>
                <span className="font-medium">Position:</span>{" "}
                {currencyFormat.position === "before"
                  ? "Before amount"
                  : "After amount"}
              </div>
              <div>
                <span className="font-medium">Decimals:</span>{" "}
                {currencyFormat.decimals}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
