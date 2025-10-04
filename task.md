# Expense Management System - Backend Development

## Context
I have an existing frontend for an expense management system built with React. I need you to:
1. First, review the frontend code and identify missing features based on the problem statement and mockup
2. Update the frontend to add any missing UI components and functionality
3. Then build a complete backend API using the PERN stack (PostgreSQL, Express.js, React, Node.js)

## Technology Stack
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **Frontend**: React (already exists, needs updates)
- **Authentication**: JWT-based authentication

---

## Step 1: Frontend Review & Updates

### Review Checklist
Examine the existing frontend and ensure it includes:

#### Authentication & Signup Flow
- [ ] Signup/Login forms with proper validation
- [ ] Country selection dropdown during signup (auto-set company currency)
- [ ] Auto-creation of company and admin user on first signup

#### Admin Dashboard
- [ ] User management interface (Create/Edit/Delete employees and managers)
- [ ] Role assignment dropdown (Employee, Manager)
- [ ] Manager relationship assignment (which employee reports to which manager)
- [ ] Approval rules configuration panel with:
  - [ ] Sequential approver definition (Step 1, Step 2, Step 3, etc.)
  - [ ] Percentage-based rule input (e.g., "60% approval threshold")
  - [ ] Specific approver rule (e.g., "If CFO approves → auto-approve")
  - [ ] Hybrid rule combination
  - [ ] "Is Manager Approver" checkbox toggle
- [ ] View all expenses with override capability
- [ ] Company settings page showing currency

#### Employee Dashboard
- [ ] Expense submission form with fields:
  - [ ] Amount (with currency selector - can differ from company currency)
  - [ ] Category dropdown
  - [ ] Description textarea
  - [ ] Date picker
  - [ ] Receipt upload (for OCR feature)
- [ ] Expense history table with status filters (Approved, Rejected, Pending)
- [ ] Status tracking view showing current approver

#### Manager Dashboard
- [ ] Pending approvals queue
- [ ] Expense review modal with:
  - [ ] All expense details (amount shown in company's default currency)
  - [ ] Approve/Reject buttons
  - [ ] Comments textarea
  - [ ] Approval history/trail
- [ ] Team expenses view

#### Additional Frontend Features
- [ ] OCR receipt scanning interface with preview
- [ ] Currency conversion display (show original and converted amounts)
- [ ] Real-time approval status updates
- [ ] Notification system for approval requests

### Missing Features to Add
After reviewing, add any missing components from the mockup including:
- Proper navigation based on user role
- Breadcrumb navigation
- Status badges (Approved, Rejected, Pending)
- Data tables with sorting and filtering
- Form validation feedback
- Loading states and error handling

---

## Step 2: Backend Development

### Database Schema Design

Create PostgreSQL tables with proper relationships:

#### 1. Users Table
```sql
- id (UUID, primary key)
- email (unique, not null)
- password_hash (not null)
- first_name
- last_name
- role (enum: 'admin', 'manager', 'employee')
- company_id (foreign key)
- manager_id (foreign key to users.id, nullable)
- created_at
- updated_at
```

#### 2. Companies Table
```sql
- id (UUID, primary key)
- name
- country
- default_currency (3-letter code)
- created_at
- updated_at
```

#### 3. Expenses Table
```sql
- id (UUID, primary key)
- employee_id (foreign key to users.id)
- company_id (foreign key)
- amount (decimal)
- currency (3-letter code)
- amount_in_company_currency (decimal, calculated)
- category
- description
- expense_date
- receipt_url (nullable)
- ocr_data (jsonb, nullable)
- status (enum: 'pending', 'approved', 'rejected')
- current_approver_id (foreign key to users.id, nullable)
- current_approval_step (integer)
- created_at
- updated_at
```

#### 4. Approval_Rules Table
```sql
- id (UUID, primary key)
- company_id (foreign key)
- is_manager_approver (boolean)
- approval_type (enum: 'sequential', 'percentage', 'specific_approver', 'hybrid')
- percentage_threshold (integer, nullable)
- specific_approver_id (foreign key to users.id, nullable)
- created_at
- updated_at
```

#### 5. Approval_Steps Table
```sql
- id (UUID, primary key)
- approval_rule_id (foreign key)
- step_number (integer)
- approver_id (foreign key to users.id)
- approver_role (string, e.g., 'Manager', 'Finance', 'Director')
- created_at
```

#### 6. Approvals Table (Approval History)
```sql
- id (UUID, primary key)
- expense_id (foreign key)
- approver_id (foreign key to users.id)
- step_number (integer)
- status (enum: 'approved', 'rejected')
- comments (text)
- approved_at
- created_at
```

---

### API Endpoints to Implement

#### Authentication
- `POST /api/auth/signup` - Create company, admin user, set currency based on country
- `POST /api/auth/login` - Return JWT token
- `POST /api/auth/logout`
- `GET /api/auth/me` - Get current user info

#### Users (Admin only)
- `POST /api/users` - Create employee/manager
- `GET /api/users` - List all users in company
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user (role, manager assignment)
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/manager` - Assign manager to employee

#### Expenses
- `POST /api/expenses` - Submit expense (Employee)
- `GET /api/expenses` - Get expenses (filtered by role and permissions)
- `GET /api/expenses/:id` - Get expense details with approval trail
- `PUT /api/expenses/:id` - Update expense (Employee, only if pending)
- `DELETE /api/expenses/:id` - Delete expense (Admin override)
- `POST /api/expenses/:id/approve` - Approve expense (Manager/Admin)
- `POST /api/expenses/:id/reject` - Reject expense (Manager/Admin)
- `GET /api/expenses/pending-approvals` - Get expenses waiting for current user's approval

#### Approval Rules (Admin only)
- `POST /api/approval-rules` - Create approval rule
- `GET /api/approval-rules` - Get company's approval rules
- `PUT /api/approval-rules/:id` - Update approval rule
- `DELETE /api/approval-rules/:id` - Delete approval rule
- `POST /api/approval-rules/:id/steps` - Add approval step
- `PUT /api/approval-rules/:id/steps/:stepId` - Update approval step
- `DELETE /api/approval-rules/:id/steps/:stepId` - Remove approval step

#### OCR
- `POST /api/ocr/scan` - Upload receipt, extract data, return structured expense data

#### Currency
- `GET /api/currencies/countries` - Get countries with currencies (proxy to restcountries API)
- `GET /api/currencies/convert` - Convert amount between currencies (proxy to exchangerate API)

---

## Business Logic Requirements

### 1. Signup Flow
- When user signs up, auto-create Company record with selected country's currency
- Create first user as Admin role
- Store JWT token for authentication

### 2. Expense Submission
- Accept expense in any currency
- Convert to company's default currency using exchange rate API
- Store both original and converted amounts
- Determine approval flow based on company's rules
- If "is_manager_approver" is true, set current_approver_id to employee's manager
- Otherwise, start with first step in sequential approval or apply conditional rules

### 3. Approval Workflow Logic

#### Sequential Approval:
- Expense moves through defined steps (Manager → Finance → Director)
- Each approver sees expense only when it's their turn
- On approval: move to next step or mark as approved if final step
- On rejection: mark expense as rejected immediately

#### Percentage Rule:
- Count total approvers
- Track number of approvals
- Auto-approve when percentage threshold is met (e.g., 60%)

#### Specific Approver Rule:
- If specific approver (e.g., CFO) approves, auto-approve entire expense
- Skip remaining steps

#### Hybrid Rule:
- Combine percentage OR specific approver
- Approve if EITHER condition is met

#### Manager Approver Flow:
- If enabled, manager must approve first before other rules apply
- After manager approval, proceed to conditional/sequential flow

### 4. Currency Conversion
- Fetch real-time rates from exchangerate API
- Cache rates for 1 hour to avoid excessive API calls
- Display both original and converted amounts in UI
- Store conversion rate used at time of submission

### 5. OCR Implementation
- Accept image upload (JPEG, PNG, PDF)
- Use OCR library (Tesseract.js or cloud OCR service)
- Extract: amount, date, vendor name, expense type
- Return structured JSON for auto-filling expense form
- Store OCR data in jsonb column for audit trail

### 6. Role-Based Access Control
- Implement middleware to check user role and permissions
- Admin: Full access to all resources
- Manager: Can only see/approve team expenses and their subordinates' expenses
- Employee: Can only see their own expenses

### 7. Data Validation
- Validate expense amount > 0
- Validate date is not in future
- Validate currency codes against ISO 4217
- Validate approver exists and has appropriate role
- Prevent circular manager relationships

---

## Error Handling
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Return structured error responses: `{ error: true, message: "...", code: "ERROR_CODE" }`
- Log errors for debugging
- Handle database constraint violations gracefully

---

## Security Requirements
- Hash passwords using bcrypt (minimum 10 rounds)
- Validate and sanitize all inputs
- Implement rate limiting on auth endpoints
- Use parameterized queries to prevent SQL injection
- Validate JWT tokens on protected routes
- Implement CORS properly

---

## Additional Features
- Email notifications when expense is approved/rejected (optional)
- Audit logging for all approval actions
- Pagination for expense lists (default 20 per page)
- Search and filtering for expenses (by status, date range, amount range, category)
- Export expenses to CSV (Admin feature)

---

## Testing Requirements
- Write API tests for critical endpoints
- Test approval workflow logic thoroughly
- Test currency conversion accuracy
- Test role-based access restrictions

---

## Environment Variables

Create `.env` file with:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/expense_management
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
OCR_API_KEY=your-ocr-api-key
FRONTEND_URL=http://localhost:3000
```

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── environment.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── roleCheck.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Expense.js
│   │   ├── ApprovalRule.js
│   │   └── Approval.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── expenseController.js
│   │   ├── approvalController.js
│   │   └── ocrController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── expenses.js
│   │   ├── approvals.js
│   │   └── ocr.js
│   ├── services/
│   │   ├── currencyService.js
│   │   ├── ocrService.js
│   │   ├── approvalService.js
│   │   └── emailService.js
│   ├── utils/
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── migrations/
│   └── app.js
├── tests/
├── package.json
└── README.md
```

---

## Implementation Order

### 1. Frontend Review (Day 1)
- Audit existing frontend against mockup
- List all missing components
- Update/add missing UI elements

### 2. Database Setup (Day 1)
- Create PostgreSQL database
- Write and run migrations
- Set up connection pooling

### 3. Authentication (Day 2)
- Implement signup with company creation
- Implement login with JWT
- Create auth middleware

### 4. User Management (Day 2-3)
- CRUD operations for users
- Manager assignment
- Role management

### 5. Expense Submission (Day 3-4)
- Create expense endpoint
- Currency conversion integration
- Expense listing with filters

### 6. Approval Rules (Day 4-5)
- Approval rule configuration
- Sequential approver setup
- Conditional rule logic

### 7. Approval Workflow (Day 5-6)
- Approve/reject endpoints
- Workflow state management
- Approval history tracking

### 8. OCR Integration (Day 6-7)
- Receipt upload
- OCR processing
- Data extraction

### 9. Testing & Refinement (Day 7-8)
- API testing
- Integration testing
- Bug fixes

---

## Deliverables

1. Fully functional backend API
2. Database migrations
3. API documentation (Postman collection or Swagger)
4. README with setup instructions
5. Environment variables template
6. Updated frontend with all features from mockup

---

## Notes

- Follow RESTful API design principles
- Use async/await for all asynchronous operations
- Implement proper error handling throughout
- Add comments for complex business logic
- Use ESLint and Prettier for code formatting
- Commit code regularly with meaningful commit messages

---

## Getting Started

Start by reviewing the frontend code and listing what needs to be added based on the mockup. Then proceed with backend development following the implementation order above.

This guide provides a complete roadmap to first review and update your frontend, then build the backend systematically while ensuring all features from the problem statement and mockup are implemented.