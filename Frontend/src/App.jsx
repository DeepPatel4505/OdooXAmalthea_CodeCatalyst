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
import { Layout } from "@/components/layout/Layout";
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

// Auth Page Component
function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Expense Manager</h1>
          <p className="text-muted-foreground mt-2">
            Manage your expense reimbursements efficiently
          </p>
        </div>

        {isLogin ? (
          <LoginForm onSuccess={handleAuthSuccess} />
        ) : (
          <SignupForm onSuccess={handleAuthSuccess} />
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-1 text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
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
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return "/login";
    switch (user.role?.toLowerCase()) {
      case "admin":
        return "/admin";
      case "manager":
        return "/manager";
      case "employee":
        return "/employee";
      default:
        return "/login";
    }
  };

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

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

        {/* Default Route */}
        <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
