import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Receipt, Plus, Clock, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock data
const mockStats = {
  totalExpenses: 12,
  pendingExpenses: 3,
  approvedExpenses: 8,
  rejectedExpenses: 1,
  totalAmount: 2450.75
}

const mockRecentExpenses = [
  {
    id: '1',
    amount: 125.50,
    category: 'Meals',
    description: 'Client dinner',
    date: '2024-01-15',
    status: 'approved',
    currency: 'USD'
  },
  {
    id: '2',
    amount: 89.99,
    category: 'Transportation',
    description: 'Taxi to airport',
    date: '2024-01-14',
    status: 'pending',
    currency: 'USD'
  },
  {
    id: '3',
    amount: 45.00,
    category: 'Office Supplies',
    description: 'Stationery',
    date: '2024-01-13',
    status: 'rejected',
    currency: 'USD'
  }
]

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />
    default:
      return <Clock className="h-4 w-4 text-gray-500" />
  }
}

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

export function EmployeeDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back!</h1>
          <p className="text-muted-foreground">
            Manage your expense reports and track their status
          </p>
        </div>
        <Link to="/employee/submit">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Submit Expense
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalExpenses}</div>
            <p className="text-xs text-muted-foreground">
              All time submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockStats.pendingExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.approvedExpenses}</div>
            <p className="text-xs text-muted-foreground">
              Successfully approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Total submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>
            Your latest expense submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(expense.status)}
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                  {getStatusBadge(expense.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/employee/expenses">
              <Button variant="outline" className="w-full">
                View All Expenses
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
