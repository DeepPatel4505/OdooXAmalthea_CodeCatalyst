// API service layer for connecting frontend to backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem("authToken");
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    localStorage.setItem("authToken", token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    localStorage.removeItem("authToken");
  }

  // Get headers for requests
  getHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: this.getHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }

  // Upload file request
  async upload(endpoint, formData) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {};

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error(`File upload failed for ${endpoint}:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

// Auth API methods
export const authAPI = {
  // Signup user and create company
  signup: async (userData) => {
    return apiService.post("/auth/signup", userData);
  },

  // Login user
  login: async (credentials) => {
    return apiService.post("/auth/login", credentials);
  },

  // Logout user
  logout: async () => {
    return apiService.post("/auth/logout");
  },

  // Get current user profile
  getProfile: async () => {
    return apiService.get("/auth/profile");
  },

  // Forgot password
  forgotPassword: async (email) => {
    return apiService.post("/auth/forgot-password", { email });
  },
};

// User management API methods
export const userAPI = {
  // Get all users (Admin)
  getUsers: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiService.get(`/users?${queryParams}`);
  },

  // Get single user
  getUser: async (userId) => {
    return apiService.get(`/users/${userId}`);
  },

  // Create new user (Admin)
  createUser: async (userData) => {
    return apiService.post("/users", userData);
  },

  // Update user (Admin)
  updateUser: async (userId, userData) => {
    return apiService.put(`/users/${userId}`, userData);
  },

  // Delete user (Admin)
  deleteUser: async (userId) => {
    return apiService.delete(`/users/${userId}`);
  },

  // Get managers list for dropdown
  getManagers: async () => {
    return apiService.get("/users/managers/list");
  },

  // Get user statistics (Admin)
  getUserStats: async () => {
    return apiService.get("/users/stats");
  },
};

// Expense API methods
export const expenseAPI = {
  // Get expenses
  getExpenses: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    return apiService.get(`/expenses?${queryParams}`);
  },

  // Get single expense
  getExpense: async (expenseId) => {
    return apiService.get(`/expenses/${expenseId}`);
  },

  // Create expense
  createExpense: async (expenseData) => {
    return apiService.post("/expenses", expenseData);
  },

  // Update expense
  updateExpense: async (expenseId, expenseData) => {
    return apiService.put(`/expenses/${expenseId}`, expenseData);
  },

  // Delete expense
  deleteExpense: async (expenseId) => {
    return apiService.delete(`/expenses/${expenseId}`);
  },

  // Get expense statistics
  getStatistics: async (period = "30") => {
    return apiService.get(`/expenses/stats/summary?period=${period}`);
  },
};

// Approval API methods
export const approvalAPI = {
  // Get pending approvals
  getPendingApprovals: async () => {
    return apiService.get("/approvals/pending");
  },

  // Approve or reject expense
  makeDecision: async (expenseId, decision) => {
    return apiService.post(`/approvals/${expenseId}/decision`, decision);
  },

  // Get approval history
  getApprovalHistory: async (expenseId) => {
    return apiService.get(`/approvals/${expenseId}/history`);
  },
};

// Approval Rules API methods
export const approvalRulesAPI = {
  // Get approval rules
  getRules: async () => {
    return apiService.get("/approval-rules");
  },

  // Get single rule
  getRule: async (ruleId) => {
    return apiService.get(`/approval-rules/${ruleId}`);
  },

  // Create rule
  createRule: async (ruleData) => {
    return apiService.post("/approval-rules", ruleData);
  },

  // Update rule
  updateRule: async (ruleId, ruleData) => {
    return apiService.put(`/approval-rules/${ruleId}`, ruleData);
  },

  // Delete rule
  deleteRule: async (ruleId) => {
    return apiService.delete(`/approval-rules/${ruleId}`);
  },

  // Add approval step
  addStep: async (ruleId, stepData) => {
    return apiService.post(`/approval-rules/${ruleId}/steps`, stepData);
  },

  // Update approval step
  updateStep: async (ruleId, stepId, stepData) => {
    return apiService.put(
      `/approval-rules/${ruleId}/steps/${stepId}`,
      stepData
    );
  },

  // Delete approval step
  deleteStep: async (ruleId, stepId) => {
    return apiService.delete(`/approval-rules/${ruleId}/steps/${stepId}`);
  },
};

// Currency API methods
export const currencyAPI = {
  // Get supported currencies
  getSupportedCurrencies: async () => {
    return apiService.get("/currency/supported");
  },

  // Get countries
  getCountries: async () => {
    return apiService.get("/currency/countries");
  },

  // Get exchange rates
  getExchangeRates: async (base = "USD", symbols = "") => {
    return apiService.get(`/currency/rates?base=${base}&symbols=${symbols}`);
  },

  // Convert currency
  convertCurrency: async (amount, from, to) => {
    return apiService.post("/currency/convert", { amount, from, to });
  },
};

// OCR API methods
export const ocrAPI = {
  // Process receipt
  processReceipt: async (file) => {
    const formData = new FormData();
    formData.append("receipt", file);
    return apiService.upload("/ocr/process-receipt", formData);
  },

  // Get OCR status (for async processing)
  getOCRStatus: async (jobId) => {
    return apiService.get(`/ocr/status/${jobId}`);
  },

  // Get supported file types
  getSupportedTypes: async () => {
    return apiService.get("/ocr/supported-types");
  },
};

// Company settings API methods
export const companyAPI = {
  // Get company settings
  getSettings: async () => {
    return apiService.get("/company/settings");
  },

  // Update company settings
  updateSettings: async (settings) => {
    return apiService.put("/company/settings", settings);
  },
};

export default apiService;
export { apiService };
