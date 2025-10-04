import { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { Layout } from "@/components/layout/Layout";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LandingPage } from "@/pages/LandingPage";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { AnimatedButton } from "@/components/ui/animations";
import { ToastProvider } from "@/components/ui/feedback";
import { Receipt } from "lucide-react";
import ExpenseForm from "@/pages/ExpenseForm";
import ExpenseApprovals from "@/pages/ExpenseApprovals";
// import { AuthPage } from "@/pages/AuthPage";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

// Employee Pages
import { EmployeeDashboard } from "@/pages/employee/EmployeeDashboard";
import { ExpenseSubmission } from "@/pages/employee/ExpenseSubmission";
import { ExpenseHistory } from "@/pages/employee/ExpenseHistory";

// Manager Pages
import { ManagerDashboard } from "@/pages/manager/ManagerDashboard";
import { ApprovalWorkflow } from "@/pages/manager/ApprovalWorkflow";

// Admin Pages
import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { UserManagement } from "@/pages/admin/UserManagement";
import { ApprovalRules } from "@/pages/admin/ApprovalRules";
import { CompanySettings } from "@/pages/admin/CompanySettings";

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Layout>{children}</Layout>;
}

// Login Page Component (Sign In Only)
function LoginPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleAuthSuccess = () => {
    // The AuthContext will automatically update the authentication state
    // React Router will handle the navigation based on the user's role
    // No need to reload the page - just navigate to the default route
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ExpenseFlow
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => navigate("/landing")}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 flex-1">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back! Please sign in to your account
            </p>
          </div>

          <LoginForm onSuccess={handleAuthSuccess} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?
              <button
                onClick={() => navigate("/signup")}
                className="ml-1 text-primary hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Signup Page Component
function SignupPage() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleAuthSuccess = () => {
    // The AuthContext will automatically update the authentication state
    // React Router will handle the navigation based on the user's role
    // No need to reload the page - just navigate to the default route
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Receipt className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ExpenseFlow
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              onClick={() => navigate("/landing")}
              className="text-muted-foreground hover:text-foreground"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center p-4 flex-1">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-muted-foreground mt-2">
              Create your account to get started
            </p>
          </div>

          <SignupForm onSuccess={handleAuthSuccess} />

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?
              <button
                onClick={() => navigate("/login")}
                className="ml-1 text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Unauthorized Page
function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-muted-foreground mt-2">
          You don't have permission to access this page.
        </p>
      </div>
    </div>
  );
}

// Main App Component
function AppContent() {
  const { user, isLoading } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return "/landing";
    switch (user.role?.toLowerCase()) {
      case "admin":
        return "/admin";
      case "manager":
        return "/manager";
      case "employee":
        return "/employee";
      default:
        return "/landing";
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Landing Page */}
        <Route path="/landing" element={<LandingPage />} />

        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* New UI Routes */}
        <Route path="/expenses" element={<ExpenseForm />} />
        <Route path="/approvals" element={<ExpenseApprovals />} />

        {/* Employee Routes */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "manager"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/submit"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "manager"]}>
              <ExpenseSubmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/expenses"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "manager"]}>
              <ExpenseHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/employee/submit/:id"
          element={
            <ProtectedRoute allowedRoles={["employee", "admin", "manager"]}>
              <ExpenseSubmission />
            </ProtectedRoute>
          }
        />

        {/* Manager Routes */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/approvals"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ApprovalWorkflow />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/expenses"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <ExpenseHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manager/reports"
          element={
            <ProtectedRoute allowedRoles={["manager", "admin"]}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Reports</h1>
                <p className="text-muted-foreground">
                  Manager reports coming soon...
                </p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/expenses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ExpenseHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rules"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <ApprovalRules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <CompanySettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <div className="p-6">
                <h1 className="text-2xl font-bold">Reports</h1>
                <p className="text-muted-foreground">
                  Admin reports coming soon...
                </p>
              </div>
            </ProtectedRoute>
          }
        />

        {/* Default Route - only redirect if not on a valid route */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* 404 Route - only for truly invalid routes */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <div className="text-center">
                <h1 className="text-2xl font-bold">404 - Page Not Found</h1>
                <p className="text-muted-foreground mt-2">
                  The page you're looking for doesn't exist.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Go Back
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <ToastProvider>
          <AppContent />
          <Toaster position="bottom-right" richColors />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
