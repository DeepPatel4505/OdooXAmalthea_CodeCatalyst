import React from "react";
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet, Users, PieChart as PieIcon } from "lucide-react";

// Dummy static data
const monthlyExpenses = [
    { month: "Jan", amount: 4000 },
    { month: "Feb", amount: 3000 },
    { month: "Mar", amount: 5000 },
    { month: "Apr", amount: 4800 },
    { month: "May", amount: 5300 },
    { month: "Jun", amount: 6200 },
    { month: "Jul", amount: 7100 },
    { month: "Aug", amount: 6900 },
    { month: "Sep", amount: 7500 },
    { month: "Oct", amount: 8000 },
    { month: "Nov", amount: 7800 },
    { month: "Dec", amount: 8500 },
];

const categoryBreakdown = [
    { name: "Travel", value: 3200 },
    { name: "Meals", value: 2500 },
    { name: "Supplies", value: 1800 },
    { name: "Software", value: 1500 },
    { name: "Misc", value: 900 },
];

const departmentStats = [
    { name: "Engineering", total: 8500 },
    { name: "Marketing", total: 7200 },
    { name: "Sales", total: 6400 },
    { name: "HR", total: 3100 },
    { name: "Finance", total: 5200 },
];

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const Reports = () => {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Expense Reports
                </h1>
                <p className="text-gray-500">
                    Visual overview of expense trends and insights
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Total Expenses</CardTitle>
                        <Wallet className="text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-gray-800">
                            ₹76,300
                        </p>
                        <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp size={16} /> +8% from last month
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Active Departments</CardTitle>
                        <Users className="text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-gray-800">
                            5
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Departments tracking expenses
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Top Category</CardTitle>
                        <PieIcon className="text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-gray-800">
                            Travel
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            ₹3,200 spent
                        </p>
                    </CardContent>
                </Card>

                <Card className="shadow-md">
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Avg. Monthly Spend</CardTitle>
                        <TrendingUp className="text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-semibold text-gray-800">
                            ₹6,350
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Based on past 12 months
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Line Chart - Monthly Expense Trends */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Monthly Expense Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyExpenses}>
                                <defs>
                                    <linearGradient
                                        id="colorExpense"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#2563eb"
                                            stopOpacity={0.8}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#2563eb"
                                            stopOpacity={0.1}
                                        />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#2563eb"
                                    strokeWidth={3}
                                    fill="url(#colorExpense)"
                                    dot={{ r: 5 }}
                                    activeDot={{ r: 8 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart - Category Breakdown */}
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Expense by Category</CardTitle>
                    </CardHeader>
                    <CardContent className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={110}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) =>
                                        `${name} ${(percent * 100).toFixed(0)}%`
                                    }
                                >
                                    {categoryBreakdown.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bar Chart - Department-wise Spending */}
            <Card className="shadow-md">
                <CardHeader>
                    <CardTitle>Department-wise Spending</CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={departmentStats}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="total"
                                fill="#10b981"
                                radius={[10, 10, 0, 0]}
                                barSize={45}
                            >
                                {departmentStats.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export { Reports} ;
