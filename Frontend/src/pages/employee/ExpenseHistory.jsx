import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Filter, Download, Eye } from 'lucide-react'

// Mock data
const mockExpenses = [
  {
    id: '1',
    amount: 125.50,
    category: 'Meals & Entertainment',
    description: 'Client dinner at Restaurant ABC',
    date: '2024-01-15',
    status: 'approved',
    currency: 'USD',
    submittedAt: '2024-01-16T09:30:00Z',
    approvedAt: '2024-01-16T14:20:00Z',
    approver: 'Jane Smith'
  },
  {
    id: '2',
    amount: 89.99,
    category: 'Transportation',
    description: 'Taxi to airport',
    date: '2024-01-14',
    status: 'pending',
    currency: 'USD',
    submittedAt: '2024-01-15T08:15:00Z'
  },
  {
    id: '3',
    amount: 45.00,
    category: 'Office Supplies',
    description: 'Stationery and notebooks',
    date: '2024-01-13',
    status: 'rejected',
    currency: 'USD',
    submittedAt: '2024-01-14T10:45:00Z',
    rejectedAt: '2024-01-14T16:30:00Z',
    approver: 'Jane Smith',
    rejectionReason: 'Insufficient documentation'
  },
  {
    id: '4',
    amount: 245.00,
    category: 'Travel',
    description: 'Hotel accommodation for conference',
    date: '2024-01-12',
    status: 'approved',
    currency: 'USD',
    submittedAt: '2024-01-13T11:20:00Z',
    approvedAt: '2024-01-13T15:45:00Z',
    approver: 'Mike Johnson'
  },
  {
    id: '5',
    amount: 67.50,
    category: 'Software',
    description: 'Monthly subscription for design tool',
    date: '2024-01-10',
    status: 'approved',
    currency: 'USD',
    submittedAt: '2024-01-11T09:00:00Z',
    approvedAt: '2024-01-11T12:15:00Z',
    approver: 'Jane Smith'
  }
]

const STATUS_FILTERS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Meals & Entertainment', label: 'Meals & Entertainment' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Office Supplies', label: 'Office Supplies' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Software', label: 'Software' }
]

export function ExpenseHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const filteredExpenses = mockExpenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const approvedAmount = filteredExpenses
    .filter(expense => expense.status === 'approved')
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Expense History</h1>
          <p className="text-muted-foreground">
            View and manage your expense submissions
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.length} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${approvedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.filter(e => e.status === 'approved').length} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${filteredExpenses
                .filter(e => e.status === 'pending')
                .reduce((sum, e) => sum + e.amount, 0)
                .toFixed(2)
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.filter(e => e.status === 'pending').length} expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_FILTERS.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses ({filteredExpenses.length})</CardTitle>
          <CardDescription>
            Your expense submission history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted {new Date(expense.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell>
                    <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                  </TableCell>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {getStatusBadge(expense.status)}
                      {expense.approver && (
                        <p className="text-xs text-muted-foreground">
                          by {expense.approver}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {expense.status === 'rejected' && expense.rejectionReason && (
                        <div className="text-xs text-red-600 max-w-32 truncate" title={expense.rejectionReason}>
                          {expense.rejectionReason}
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
