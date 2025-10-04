import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Users, DollarSign } from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock data
const mockStats = {
  pendingApprovals: 8,
  teamMembers: 12,
  totalApproved: 45,
  monthlyBudget: 50000,
  usedBudget: 32000
}

const mockPendingApprovals = [
  {
    id: '1',
    employee: 'John Doe',
    amount: 125.50,
    category: 'Meals',
    description: 'Client dinner',
    date: '2024-01-15',
    currency: 'USD'
  },
  {
    id: '2',
    employee: 'Jane Smith',
    amount: 89.99,
    category: 'Transportation',
    description: 'Taxi to airport',
    date: '2024-01-14',
    currency: 'USD'
  },
  {
    id: '3',
    employee: 'Mike Johnson',
    amount: 245.00,
    category: 'Travel',
    description: 'Hotel accommodation',
    date: '2024-01-13',
    currency: 'USD'
  }
]

export function ManagerDashboard() {
  const budgetPercentage = (mockStats.usedBudget / mockStats.monthlyBudget) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Manage team expenses and approvals
          </p>
        </div>
        <Link to="/manager/approvals">
          <Button className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Review Approvals
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{mockStats.pendingApprovals}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Under your management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.totalApproved}</div>
            <p className="text-xs text-muted-foreground">
              Expenses approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockStats.usedBudget.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              of ${mockStats.monthlyBudget.toLocaleString()} used
            </p>
            <div className="mt-2 w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals</CardTitle>
          <CardDescription>
            Expenses waiting for your approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPendingApprovals.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {expense.employee} • {expense.category} • {expense.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">${expense.amount.toFixed(2)}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive">
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link to="/manager/approvals">
              <Button variant="outline" className="w-full">
                View All Pending Approvals
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
