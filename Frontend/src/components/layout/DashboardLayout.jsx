import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageWrapper } from "@/components/ui/animations";
import {
  Menu,
  X,
  Home,
  FileText,
  CheckSquare,
  Settings,
  LogOut,
  User,
  BarChart2,
  Users,
  ChevronDown,
  Bell,
} from "lucide-react";

export function DashboardLayout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager" || isAdmin;

  const menuItems = [
    { icon: <Home size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <FileText size={20} />, label: "My Expenses", path: "/expenses" },
    ...(isManager
      ? [
          {
            icon: <CheckSquare size={20} />,
            label: "Approvals",
            path: "/approvals",
          },
        ]
      : []),
    ...(isAdmin
      ? [
          { icon: <Users size={20} />, label: "Users", path: "/users" },
          {
            icon: <BarChart2 size={20} />,
            label: "Reports",
            path: "/reports",
          },
          {
            icon: <Settings size={20} />,
            label: "Settings",
            path: "/settings",
          },
        ]
      : []),
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-border sticky top-0 z-40 flex items-center justify-between p-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">{title}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
            {user?.name?.charAt(0) || "U"}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={toggleSidebar}
          ></motion.div>
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-border transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ExpenseFlow
            </span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-medium">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1) || "Role"}
              </p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className="flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-primary-50 hover:text-primary transition-colors"
              >
                <span className="text-gray-500">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors mt-4"
            >
              <LogOut size={20} className="text-gray-500" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`lg:ml-64 transition-all duration-300`}>
        {/* Desktop Header */}
        <header className="hidden lg:flex items-center justify-between bg-white border-b border-border p-4 sticky top-0 z-30">
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                {user?.name?.charAt(0) || "U"}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || "User"}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <PageWrapper>
          <main className="p-4 md:p-6">
            {children}
          </main>
        </PageWrapper>
      </div>
    </div>
  );
}