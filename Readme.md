# 🚀 Team CodeCatalyst

**Team Lead:** Krishnapal Singh Jadeja  
**Team Members:**  
- Vasu Kamani  
- Deep Patel  
- Pradeep Chandravadiya  

---

## 📄 Problem Statement
**Problem Statement 1**

---

## 🎥 Demo Video
[Watch the Demo](https://drive.google.com/file/d/1r8mDhExjNOv8J3WJLxscwu-W-t9XXrur/view?usp=sharing)




# Expense Management System

A comprehensive expense reimbursement platform that streamlines approval workflows, supports multi-level approvals, and provides flexible approval rules for organizations.

## Problem Statement

Companies often struggle with manual expense reimbursement processes that are time-consuming, error-prone, and lack transparency. This system addresses these challenges by providing:

- Threshold-based approval flows
- Multi-level approval management
- Flexible and conditional approval rules
- Automated expense tracking and transparency

## Core Features

### 1. Authentication & User Management

- **Auto-Setup**: On first login/signup, a new Company and Admin User are automatically created
- **Currency Configuration**: Company currency is automatically set based on the selected country
- **User Management**: 
  - Admin can create Employees and Managers
  - Assign and modify roles (Employee, Manager, Admin)
  - Define manager-employee relationships

### 2. Expense Submission (Employee Role)

Employees can:
- Submit expense claims with details:
  - Amount (supports multiple currencies)
  - Category
  - Description
  - Date
  - Receipt attachments
- View complete expense history
- Track approval status (Approved/Rejected/Pending)

### 3. Approval Workflow (Manager/Admin Role)

**Sequential Approval Process**:
- Expenses follow a defined approval sequence
- Each approver must act before moving to the next level
- Optional manager pre-approval if "IS MANAGER APPROVER" field is checked

**Example Workflow**:
```
Step 1 → Manager
Step 2 → Finance
Step 3 → Director
```

**Manager Capabilities**:
- View pending approval requests
- Approve or reject expenses with comments
- All amounts displayed in company's default currency

### 4. Conditional Approval Rules

The system supports sophisticated approval logic:

- **Percentage Rule**: Expense approved if X% of approvers approve
  - Example: If 60% of approvers approve → Auto-approved
  
- **Specific Approver Rule**: Designated approver can auto-approve
  - Example: If CFO approves → Expense auto-approved
  
- **Hybrid Rules**: Combine multiple conditions
  - Example: 60% approval OR CFO approval
  
- **Combined Flows**: Mix sequential multi-level approvals with conditional rules

### 5. OCR Receipt Scanning

Advanced optical character recognition for receipt processing:
- Scan physical receipts using mobile or desktop camera
- Automatically extract:
  - Amount
  - Date
  - Description
  - Expense lines
  - Expense type
  - Vendor name (e.g., restaurant name)
- Pre-populate expense submission form

## Role-Based Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | • Auto-create company on signup<br>• Manage users and roles<br>• Configure approval rules<br>• View all expenses across organization<br>• Override approvals when necessary |
| **Manager** | • Approve/reject team expenses<br>• View expenses in company's default currency<br>• Access team expense reports<br>• Escalate expenses per configured rules |
| **Employee** | • Submit expense claims<br>• View personal expense history<br>• Check approval status<br>• Upload receipts |

## Technical Specifications

### APIs Used

1. **Country & Currency Data**
   ```
   https://restcountries.com/v3.1/all?fields=name,currencies
   ```
   - Retrieves country information and associated currencies
   - Used for company setup and currency configuration

2. **Currency Conversion**
   ```
   https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}
   ```
   - Real-time currency conversion rates
   - Converts employee expenses to company's default currency

### Design Mockup

View the UI/UX design mockup: [Excalidraw Link](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA)

## Key Workflows

### Expense Submission Flow

1. Employee submits expense (or scans receipt via OCR)
2. System validates and records expense
3. If manager approval required, routes to direct manager
4. Follows sequential approval chain as configured
5. Applies conditional rules at each step
6. Final approval/rejection communicated to employee

### Approval Rule Evaluation

1. Check if manager pre-approval is required
2. Evaluate sequential approvers in order
3. Apply conditional rules (percentage/specific approver/hybrid)
4. Auto-approve if conditions met
5. Continue to next level if approval received
6. Notify employee of final decision

## Benefits

- **Efficiency**: Automated workflows reduce processing time
- **Transparency**: Real-time tracking of expense status
- **Flexibility**: Configurable approval rules for different scenarios
- **Accuracy**: OCR reduces manual entry errors
- **Compliance**: Clear audit trail and approval history
- **Multi-Currency**: Support for global teams and expenses

## Getting Started

### Prerequisites
- User account with appropriate role assignment
- For OCR: Camera-enabled device for receipt scanning
- Internet connection for currency conversions

### First-Time Setup (Admin)

1. Sign up with your email
2. Company and Admin account auto-created
3. Select your country (sets default currency)
4. Create employee and manager accounts
5. Define manager-employee relationships
6. Configure approval workflows and rules
7. Set conditional approval criteria

### For Employees

1. Log in to your account
2. Submit expenses or scan receipts
3. Track approval status in real-time
4. View expense history

### For Managers

1. Log in to view pending approvals
2. Review expense details and receipts
3. Approve or reject with comments
4. Monitor team expenses

## Support

For issues, questions, or feature requests, please contact your system administrator.

---

**Version**: 1.0  
**Last Updated**: October 2025
