import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignupForm } from "@/components/auth/SignupForm";

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Redirect after login
    useEffect(() => {
        if (isAuthenticated) {
            switch (user?.role) {
                case "admin":
                    navigate("/admin", { replace: true });
                    break;
                case "manager":
                    navigate("/manager", { replace: true });
                    break;
                case "employee":
                    navigate("/employee", { replace: true });
                    break;
                default:
                    navigate("/login", { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Expense Manager</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your expense reimbursements efficiently
                    </p>
                </div>

                {isLogin ? <LoginForm /> : <SignupForm />}

                <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                        {isLogin
                            ? "Don't have an account?"
                            : "Already have an account?"}
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
