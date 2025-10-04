import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Receipt, Settings, BarChart3, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

// Mock data
const mockStats = {
  totalUsers: 45,
  activeUsers: 42,
  pendingExpenses: 23,
  approvedThisMonth: 156,
  totalAmount: 125000,
  averageProcessingTime: 2.5
}

const mockRecentActivity = [
  {
    id: '1',
    type: 'expense_approved',
    user: 'John Doe',
    amount: 125.50,
    timestamp: '2024-01-16T10:30:00Z',
    status: 'approved'
  },
  {
    id: '2',
    type: 'user_created',
    user: 'Jane Smith',
    timestamp: '2024-01-16T09:15:00Z',
    status: 'created'
  },
  {
    id: '3',
    type: 'expense_rejected',
    user: 'Mike Johnson',
    amount: 89.99,
    timestamp: '2024-01-16T08:45:00Z',
    status: 'rejected'
  }
]

const getActivityIcon = (type) => {
  switch (type) {
    case 'expense_approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />
    case 'expense_rejected':
      return <Clock className="h-4 w-4 text-red-500" />
    case 'user_created':
      return <Users className="h-4 w-4 text-blue-500" />
    default:
      return <Receipt className="h-4 w-4 text-gray-500" />
  }
}

const getActivityBadge = (status) => {
  switch (status) {
    case 'approved':
      return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    case 'created':
      return <Badge variant="secondary">Created</Badge>
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/settings">
            <Button className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {mockStats.activeUsers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
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
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Expenses approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Processed this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Average Processing Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{mockStats.averageProcessingTime} days</div>
            <p className="text-xs text-muted-foreground">
              From submission to approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">All Systems Operational</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Last updated 2 minutes ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Users currently online
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest system events and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockRecentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="font-medium">
                      {activity.type === 'user_created' 
                        ? `${activity.user} joined the system`
                        : activity.type === 'expense_approved'
                        ? `${activity.user} had an expense approved`
                        : `${activity.user} had an expense rejected`
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {activity.amount && (
                    <span className="font-semibold">${activity.amount}</span>
                  )}
                  {getActivityBadge(activity.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
