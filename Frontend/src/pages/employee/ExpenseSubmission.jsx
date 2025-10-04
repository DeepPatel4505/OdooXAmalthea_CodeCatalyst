import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, CheckCircle } from 'lucide-react'

const EXPENSE_CATEGORIES = [
  'Meals & Entertainment',
  'Transportation',
  'Office Supplies',
  'Travel',
  'Training',
  'Software',
  'Hardware',
  'Other'
]

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
]

export function ExpenseSubmission() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [ocrData, setOcrData] = useState(null)
  const [isProcessingOcr, setIsProcessingOcr] = useState(false)
  
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      currency: 'USD'
    }
  })

  const selectedCurrency = watch('currency')
  const currency = CURRENCIES.find(c => c.code === selectedCurrency)

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadedFile(file)
    setIsProcessingOcr(true)

    // TODO: Connect to OCR API
    // Simulate OCR processing
    setTimeout(() => {
      const mockOcrData = {
        amount: '125.50',
        date: '2024-01-15',
        merchant: 'Restaurant ABC',
        category: 'Meals & Entertainment'
      }
      setOcrData(mockOcrData)
      setIsProcessingOcr(false)

      // Auto-fill form with OCR data
      setValue('amount', mockOcrData.amount)
      setValue('date', mockOcrData.date)
      setValue('description', mockOcrData.merchant)
      setValue('category', mockOcrData.category)
    }, 2000)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      // TODO: Connect to API
      console.log('Submitting expense:', data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      navigate('/employee')
    } catch (error) {
      console.error('Submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Submit Expense</h1>
        <p className="text-muted-foreground">
          Submit a new expense for reimbursement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Receipt Upload</CardTitle>
          <CardDescription>
            Upload a receipt to automatically fill expense details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <input
              type="file"
              id="receipt-upload"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="receipt-upload" className="cursor-pointer">
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Click to upload receipt</p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, or PDF up to 10MB
              </p>
            </label>
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{uploadedFile.name}</span>
              {isProcessingOcr && (
                <Badge variant="secondary">Processing...</Badge>
              )}
              {ocrData && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  OCR Complete
                </Badge>
              )}
            </div>
          )}

          {ocrData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Auto-filled from receipt:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Amount: {ocrData.amount}</div>
                <div>Date: {ocrData.date}</div>
                <div>Merchant: {ocrData.merchant}</div>
                <div>Category: {ocrData.category}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>
            Fill in the expense information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-input bg-muted text-sm">
                    {currency?.symbol}
                  </span>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register('amount', { 
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' }
                    })}
                    className="rounded-l-none"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select onValueChange={(value) => setValue('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((curr) => (
                      <SelectItem key={curr.code} value={curr.code}>
                        {curr.symbol} {curr.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">Category is required</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the expense..."
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...register('date', { required: 'Date is required' })}
              />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Expense'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/employee')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
