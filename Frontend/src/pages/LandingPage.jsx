import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Receipt,
  Users,
  Shield,
  BarChart3,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Globe,
  Lock,
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Receipt className="h-6 w-6" />,
      title: "Smart Receipt Processing",
      description:
        "AI-powered OCR technology automatically extracts data from receipts and invoices",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Multi-Role Management",
      description:
        "Seamless workflow for employees, managers, and administrators",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Compliant",
      description:
        "Enterprise-grade security with audit trails and compliance reporting",
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description:
        "Comprehensive reporting and insights for better financial management",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Real-time Processing",
      description: "Instant expense submission and approval workflows",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Automated Approvals",
      description:
        "Smart approval rules reduce manual work and speed up reimbursements",
    },
  ];

  const stats = [
    { label: "Companies Trust Us", value: "500+" },
    { label: "Expenses Processed", value: "1M+" },
    { label: "Time Saved", value: "85%" },
    { label: "User Satisfaction", value: "98%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 transition-all duration-500">
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
              onClick={() => navigate("/login")}
              className="text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Button>
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 transition-all duration-500">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-6 bg-blue-100 text-blue-800 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            New: AI-Powered Receipt Processing
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-900 to-indigo-900 bg-clip-text text-transparent">
            Streamline Your
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Expense Management
            </span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Transform your expense workflow with intelligent automation,
            real-time approvals, and comprehensive analytics. Built for modern
            businesses that value efficiency and transparency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-3"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 border-2"
            >
              Watch Demo
            </Button> */}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/20 transition-all duration-500">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ExpenseFlow?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to simplify expense management and
              accelerate your business growth.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-card/50 backdrop-blur-sm hover:bg-card/80"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mr-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-muted/30 via-muted/20 to-muted/40 transition-all duration-500">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                Built for Modern Teams
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                ExpenseFlow integrates seamlessly with your existing workflow,
                providing a unified platform for all expense-related activities.
              </p>

              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-foreground">
                    Reduce processing time by 85%
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-foreground">
                    Eliminate manual data entry
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-foreground">
                    Real-time approval workflows
                  </span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                  <span className="text-foreground">
                    Comprehensive audit trails
                  </span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-border/50">
                <div className="flex items-center mb-6">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
                  <div className="text-sm text-muted-foreground">
                    ExpenseFlow Dashboard
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-blue-200 rounded w-1/2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                  <div className="h-4 bg-green-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 transition-all duration-500">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Expense Management?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using ExpenseFlow to streamline
            their expense processes and save valuable time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/login")}
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
            >
              Contact Sales
            </Button> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-muted/50 to-muted py-12 px-4 transition-all duration-500">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ExpenseFlow</span>
              </div>
              <p className="text-muted-foreground">
                The modern expense management platform for growing businesses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Integrations</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>API</li>
                <li>Status</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ExpenseFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
