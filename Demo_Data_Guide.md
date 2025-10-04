# Demo Data Guide

## Overview

The database has been seeded with comprehensive demo data for testing the Expense Management System. This includes multiple companies, users with different roles, approval rules, and sample expenses.

## 🏢 Companies Created

### 1. TechCorp Solutions

- **Default Currency:** USD
- **Country:** US
- **Users:** 6 (1 Admin, 2 Managers, 3 Employees)

### 2. Global Industries Inc

- **Default Currency:** EUR
- **Country:** DE
- **Users:** 3 (1 Admin, 1 Manager, 1 Employee)

### 3. StartupCo

- **Default Currency:** USD
- **Country:** CA
- **Users:** 2 (1 Admin, 1 Employee)

## 👥 User Credentials

### TechCorp Solutions

| Role     | Email                  | Password    | Manager               |
| -------- | ---------------------- | ----------- | --------------------- |
| Admin    | admin@techcorp.com     | password123 | -                     |
| Manager  | manager1@techcorp.com  | password123 | -                     |
| Manager  | manager2@techcorp.com  | password123 | -                     |
| Employee | employee1@techcorp.com | password123 | manager1@techcorp.com |
| Employee | employee2@techcorp.com | password123 | manager1@techcorp.com |
| Employee | employee3@techcorp.com | password123 | manager2@techcorp.com |

### Global Industries Inc

| Role     | Email                  | Password    | Manager               |
| -------- | ---------------------- | ----------- | --------------------- |
| Admin    | admin@globalinc.com    | password123 | -                     |
| Manager  | manager@globalinc.com  | password123 | -                     |
| Employee | employee@globalinc.com | password123 | manager@globalinc.com |

### StartupCo

| Role     | Email                  | Password    | Manager |
| -------- | ---------------------- | ----------- | ------- |
| Admin    | admin@startupco.com    | password123 | -       |
| Employee | employee@startupco.com | password123 | -       |

## 📋 Approval Rules (TechCorp Only)

### 1. Standard Sequential Approval

- **Type:** SEQUENTIAL
- **Steps:** 2
  - Step 1: Manager (manager1@techcorp.com)
  - Step 2: Finance (admin@techcorp.com)

### 2. Percentage-Based Approval

- **Type:** PERCENTAGE
- **Threshold:** 60%
- **Steps:** 3
  - Step 1: Manager (manager1@techcorp.com)
  - Step 2: Manager (manager2@techcorp.com)
  - Step 3: Finance (admin@techcorp.com)

### 3. Finance Team Approval

- **Type:** SPECIFIC_APPROVER
- **Specific Approver:** admin@techcorp.com

### 4. Hybrid Approval Process

- **Type:** HYBRID
- **Percentage Threshold:** 50%
- **Specific Approver:** manager1@techcorp.com
- **Steps:** 2
  - Step 1: Manager (manager1@techcorp.com)
  - Step 2: Manager (manager2@techcorp.com)

## 💰 Sample Expenses

### TechCorp Solutions

#### Approved Expenses

1. **Client Dinner** - $125.50

   - Employee: employee1@techcorp.com
   - Category: Meals & Entertainment
   - Status: APPROVED
   - Approvals: Manager1 → Admin

2. **Office Supplies** - $89.99
   - Employee: employee2@techcorp.com
   - Category: Office Supplies
   - Status: APPROVED
   - Approvals: Manager1

#### Pending Expenses

3. **Business Trip** - $250.00

   - Employee: employee1@techcorp.com
   - Category: Travel
   - Status: PENDING
   - Current Approver: manager1@techcorp.com

4. **Uber Rides** - $75.00

   - Employee: employee3@techcorp.com
   - Category: Transportation
   - Status: PENDING
   - Current Approver: manager2@techcorp.com

5. **Hotel Berlin** - €150.00 ($165.00)
   - Employee: employee1@techcorp.com
   - Category: Travel
   - Status: PENDING
   - Current Approver: manager1@techcorp.com
   - Multi-currency: EUR → USD

#### Rejected Expenses

6. **Expensive Team Dinner** - $500.00
   - Employee: employee2@techcorp.com
   - Category: Meals & Entertainment
   - Status: REJECTED
   - Reason: "Expense too high for team dinner"

### Global Industries Inc

7. **Software Licenses** - €200.00
   - Employee: employee@globalinc.com
   - Category: Office Supplies
   - Status: APPROVED
   - Approvals: Manager

### StartupCo

8. **Team Lunch** - $45.00
   - Employee: employee@startupco.com
   - Category: Meals & Entertainment
   - Status: PENDING
   - Current Approver: admin@startupco.com

## 🧪 Testing Scenarios

### Scenario 1: Manager Approval Flow

1. Login as `manager1@techcorp.com`
2. Check pending approvals: `/api/approvals/pending`
3. Approve expense: `/api/approvals/{expense_id}/decision`

### Scenario 2: Multi-Currency Testing

1. Login as `employee1@techcorp.com`
2. Create expense in EUR: `/api/expenses`
3. Verify automatic conversion to USD

### Scenario 3: Different Approval Rules

1. Login as `admin@techcorp.com`
2. Test different approval rule types:
   - Sequential: Requires step-by-step approval
   - Percentage: Requires 60% of approvers
   - Specific: Only admin can approve
   - Hybrid: Either percentage OR specific approver

### Scenario 4: Cross-Company Testing

1. Login as `admin@techcorp.com`
2. Try to access GlobalInc data (should fail)
3. Login as `admin@globalinc.com`
4. Verify company isolation

## 🔄 Reset Demo Data

To reset the database with fresh demo data:

```bash
npm run db:reset
```

This will:

1. Reset the database (drop all data)
2. Run migrations
3. Seed with fresh demo data

## 📊 Database Statistics

- **Companies:** 3
- **Users:** 11
- **Approval Rules:** 4
- **Approval Steps:** 7
- **Expenses:** 8
- **Approvals:** 5

## 🎯 Quick Start Testing

1. **Start Backend:** `npm run dev`
2. **Login as Admin:** `admin@techcorp.com / password123`
3. **Test User Management:** Create new users
4. **Test Approval Rules:** Modify approval workflows
5. **Login as Employee:** `employee1@techcorp.com / password123`
6. **Test Expense Submission:** Create new expenses
7. **Login as Manager:** `manager1@techcorp.com / password123`
8. **Test Approvals:** Approve/reject pending expenses

## 🔍 API Endpoints to Test

- **Authentication:** `/api/auth/login`, `/api/auth/profile`
- **User Management:** `/api/users` (Admin only)
- **Expense Management:** `/api/expenses`
- **Approval Workflow:** `/api/approvals/pending`, `/api/approvals/{id}/decision`
- **Approval Rules:** `/api/approval-rules` (Admin only)
- **Currency Conversion:** `/api/currency/convert`
- **OCR Processing:** `/api/ocr/process-receipt`

This demo data provides a comprehensive testing environment for all system features!
