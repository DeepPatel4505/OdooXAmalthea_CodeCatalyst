import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Settings, Globe, DollarSign, Calendar, Save, RefreshCw } from 'lucide-react'

// Mock countries with currencies - matches mockup requirements  
const COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'DE', name: 'Germany', currency: 'EUR' },
  { code: 'FR', name: 'France', currency: 'EUR' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'IN', name: 'India', currency: 'INR' },
  { code: 'BR', name: 'Brazil', currency: 'BRL' },
  { code: 'CN', name: 'China', currency: 'CNY' },
  { code: 'CH', name: 'Switzerland', currency: 'CHF' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'NL', name: 'Netherlands', currency: 'EUR' },
  { code: 'IT', name: 'Italy', currency: 'EUR' },
  { code: 'ES', name: 'Spain', currency: 'EUR' },
]

const CURRENCY_FORMATS = {
  USD: { symbol: '$', position: 'before', decimals: 2 },
  EUR: { symbol: '€', position: 'after', decimals: 2 },
  GBP: { symbol: '£', position: 'before', decimals: 2 },
  JPY: { symbol: '¥', position: 'before', decimals: 0 },
  INR: { symbol: '₹', position: 'before', decimals: 2 },
  CAD: { symbol: 'C$', position: 'before', decimals: 2 },
  AUD: { symbol: 'A$', position: 'before', decimals: 2 },
  BRL: { symbol: 'R$', position: 'before', decimals: 2 },
  CNY: { symbol: '¥', position: 'before', decimals: 2 },
  CHF: { symbol: 'CHF', position: 'after', decimals: 2 },
  SGD: { symbol: 'S$', position: 'before', decimals: 2 },
}

// Mock company data
const mockCompany = {
  id: '1',
  name: 'Amalthea Technologies',
  country: 'US',
  defaultCurrency: 'USD',
  address: '123 Business Street, Tech City, TC 12345',
  contactEmail: 'admin@amaltheatech.com',
  fiscalYearStart: '1', // January
  expenseLimitPolicy: {
    dailyMealLimit: 75,
    hotelRateLimit: 200,
    transportationLimit: 100
  },
  approvalPolicy: {
    managerApprovalRequired: true,
    approvalMethod: 'sequential',
    autoApprovalLimit: 50
  }
}

export function CompanySettings() {
  const [company, setCompany] = useState(mockCompany)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const handleSaveChanges = async () => {
    setIsLoading(true)
    try {
      // TODO: Connect to API
      console.log('Saving company settings:', company)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCountryChange = (countryCode) => {
    const selectedCountry = COUNTRIES.find(c => c.code === countryCode)
    if (selectedCountry) {
      setCompany({
        ...company,
        country: countryCode,
        defaultCurrency: selectedCountry.currency
      })
      setHasChanges(true)
    }
  }

  const selectedCountry = COUNTRIES.find(c => c.code === company.country)
  const currencyFormat = CURRENCY_FORMATS[company.defaultCurrency]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Settings</h1>
          <p className="text-muted-foreground">
            Manage company information and configuration
          </p>
        </div>
        <Button 
          onClick={handleSaveChanges}
          disabled={!hasChanges || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

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
                value={company.name}
                onChange={(e) => {
                  setCompany({ ...company, name: e.target.value })
                  setHasChanges(true)
                }}
                placeholder="Enter company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-email">Contact Email</Label>
              <Input
                id="contact-email"
                type="email"
                value={company.contactEmail}
                onChange={(e) => {
                  setCompany({ ...company, contactEmail: e.target.value })
                  setHasChanges(true)
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
                setCompany({ ...company, address: e.target.value })
                setHasChanges(true)
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
                  {COUNTRIES.map((country) => (
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
            <h4 className="font-medium text-blue-900 mb-2">Currency Configuration</h4>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div>
                <span className="font-medium">Symbol:</span> {currencyFormat.symbol}
              </div>
              <div>
                <span className="font-medium">Position:</span> {currencyFormat.position === 'before' ? 'Before amount' : 'After amount'}
              </div>
              <div>
                <span className="font-medium">Decimals:</span> {currencyFormat.decimals}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Expense Policies
          </CardTitle>
          <CardDescription>
            Set spending limits and approval policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="meal-limit">Daily Meal Limit ({company.defaultCurrency})</Label>
              <Input
                id="meal-limit"
                type="number"
                value={company.expenseLimitPolicy.dailyMealLimit}
                onChange={(e) => {
                  setCompany({
                    ...company,
                    expenseLimitPolicy: {
                      ...company.expenseLimitPolicy,
                      dailyMealLimit: parseFloat(e.target.value)
                    }
                  })
                  setHasChanges(true)
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="hotel-limit">Hotel Rate Limit ({company.defaultCurrency})</Label>
              <Input
                id="hotel-limit"
                type="number"
                value={company.expenseLimitPolicy.hotelRateLimit}
                onChange={(e) => {
                  setCompany({
                    ...company,
                    expenseLimitPolicy: {
                      ...company.expenseLimitPolicy,
                      hotelRateLimit: parseFloat(e.target.value)
                    }
                  })
                  setHasChanges(true)
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transport-limit">Transportation Limit ({company.defaultCurrency})</Label>
              <Input
                id="transport-limit"
                type="number"
                value={company.expenseLimitPolicy.transportationLimit}
                onChange={(e) => {
                  setCompany({
                    ...company,
                    expenseLimitPolicy: {
                      ...company.expenseLimitPolicy,
                      transportationLimit: parseFloat(e.target.value)
                    }
                  })
                  setHasChanges(true)
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Summary</CardTitle>
          <CardDescription>
            Overview of current company configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company</Label>
              <p className="text-sm">{company.name}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Country</Label>
              <p className="text-sm">{selectedCountry?.name}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Currency</Label>
              <p className="text-sm">{company.defaultCurrency} ({currencyFormat.symbol})</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Daily Meal Limit</Label>
              <p className="text-sm">{currencyFormat.symbol}{company.expenseLimitPolicy.dailyMealLimit}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Hotel Rate Limit</Label>
              <p className="text-sm">{currencyFormat.symbol}{company.expenseLimitPolicy.hotelRateLimit}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Transportation Limit</Label>
              <p className="text-sm">{currencyFormat.symbol}{company.expenseLimitPolicy.transportationLimit}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}