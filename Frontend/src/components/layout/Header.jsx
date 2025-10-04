import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Bell } from 'lucide-react'

export function Header() {
  const { user, logout } = useAuth()

  if (!user) return null

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold capitalize">
          {user.role} Dashboard
        </h2>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={logout} className="h-9 w-9">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
