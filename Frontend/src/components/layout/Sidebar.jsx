import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home,
  Receipt,
  Users,
  Settings,
  FileText,
  CheckCircle,
  BarChart3,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navigation = {
  admin: [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "All Expenses", href: "/admin/expenses", icon: Receipt },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Approval Rules", href: "/admin/rules", icon: Settings },
    { name: "Company Settings", href: "/admin/settings", icon: Settings },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
  manager: [
    { name: "Dashboard", href: "/manager", icon: Home },
    { name: "Team Expenses", href: "/manager/expenses", icon: Receipt },
    { name: "Reports", href: "/manager/reports", icon: BarChart3 },
  ],
  employee: [
    { name: "Dashboard", href: "/employee", icon: Home },
    { name: "My Expenses", href: "/employee/expenses", icon: Receipt },
    { name: "Submit Expense", href: "/employee/submit", icon: FileText },
  ],
};

export function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const userNavigation = navigation[user.role.toLowerCase()] || [];

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-lg font-semibold text-sidebar-foreground">
          Expense Manager
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {userNavigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
