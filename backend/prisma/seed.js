import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.approval.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.approvalRule.deleteMany();
  await prisma.userRuleApprover.deleteMany();
  await prisma.userApprovalRule.deleteMany();
  await prisma.presetRuleApprover.deleteMany();
  await prisma.presetApprovalRule.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // Create companies
  console.log("🏢 Creating companies...");
  const techCorp = await prisma.company.create({
    data: {
      name: "TechCorp Solutions",
      defaultCurrency: "USD",
      country: "US",
    },
  });

  const globalInc = await prisma.company.create({
    data: {
      name: "Global Industries Inc",
      defaultCurrency: "EUR",
      country: "DE",
    },
  });

  const startupCo = await prisma.company.create({
    data: {
      name: "StartupCo",
      defaultCurrency: "USD",
      country: "CA",
    },
  });

  // Create users for TechCorp
  console.log("👥 Creating users for TechCorp...");
  const techCorpAdmin = await prisma.user.create({
    data: {
      email: "admin@techcorp.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Sarah",
      lastName: "Johnson",
      role: "ADMIN",
      companyId: techCorp.id,
      isActive: true,
    },
  });

  const techCorpManager1 = await prisma.user.create({
    data: {
      email: "manager1@techcorp.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Michael",
      lastName: "Chen",
      role: "MANAGER",
      companyId: techCorp.id,
      isActive: true,
    },
  });

  const techCorpManager2 = await prisma.user.create({
    data: {
      email: "manager2@techcorp.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Emily",
      lastName: "Rodriguez",
      role: "MANAGER",
      companyId: techCorp.id,
      isActive: true,
    },
  });

  const techCorpEmployee1 = await prisma.user.create({
    data: {
      email: "employee1@techcorp.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "David",
      lastName: "Kim",
      role: "EMPLOYEE",
      companyId: techCorp.id,
      managerId: techCorpManager1.id,
      isActive: true,
    },
  });

  const techCorpEmployee2 = await prisma.user.create({
    data: {
      email: "employee2@techcorp.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Lisa",
      lastName: "Wang",
      role: "EMPLOYEE",
      companyId: techCorp.id,
      managerId: techCorpManager1.id,
      isActive: true,
    },
  });

  const techCorpEmployee3 = await prisma.user.create({
    data: {
      email: "employee3@techcorp.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "James",
      lastName: "Brown",
      role: "EMPLOYEE",
      companyId: techCorp.id,
      managerId: techCorpManager2.id,
      isActive: true,
    },
  });

  // Create users for GlobalInc
  console.log("👥 Creating users for GlobalInc...");
  const globalIncAdmin = await prisma.user.create({
    data: {
      email: "admin@globalinc.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Hans",
      lastName: "Mueller",
      role: "ADMIN",
      companyId: globalInc.id,
      isActive: true,
    },
  });

  const globalIncManager = await prisma.user.create({
    data: {
      email: "manager@globalinc.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Anna",
      lastName: "Schmidt",
      role: "MANAGER",
      companyId: globalInc.id,
      isActive: true,
    },
  });

  const globalIncEmployee = await prisma.user.create({
    data: {
      email: "employee@globalinc.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Klaus",
      lastName: "Weber",
      role: "EMPLOYEE",
      companyId: globalInc.id,
      managerId: globalIncManager.id,
      isActive: true,
    },
  });

  // Create users for StartupCo
  console.log("👥 Creating users for StartupCo...");
  const startupAdmin = await prisma.user.create({
    data: {
      email: "admin@startupco.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Alex",
      lastName: "Thompson",
      role: "ADMIN",
      companyId: startupCo.id,
      isActive: true,
    },
  });

  const startupEmployee = await prisma.user.create({
    data: {
      email: "employee@startupco.com",
      passwordHash: await bcrypt.hash("password123", 12),
      firstName: "Jordan",
      lastName: "Lee",
      role: "EMPLOYEE",
      companyId: startupCo.id,
      isActive: true,
    },
  });

  // Create approval rules for TechCorp
  console.log("📋 Creating approval rules...");

  // Sequential approval rule
  const sequentialRule = await prisma.approvalRule.create({
    data: {
      name: "Standard Sequential Approval",
      companyId: techCorp.id,
      approvalType: "SEQUENTIAL",
      isManagerApprover: true,
      isActive: true,
    },
  });

  // Percentage-based approval rule
  const percentageRule = await prisma.approvalRule.create({
    data: {
      name: "Percentage-Based Approval",
      companyId: techCorp.id,
      approvalType: "PERCENTAGE",
      percentageThreshold: 60,
      isManagerApprover: true,
      isActive: true,
    },
  });

  // Specific approver rule
  const specificRule = await prisma.approvalRule.create({
    data: {
      name: "Finance Team Approval",
      companyId: techCorp.id,
      approvalType: "SPECIFIC_APPROVER",
      specificApproverId: techCorpAdmin.id,
      isManagerApprover: false,
      isActive: true,
    },
  });

  // Hybrid approval rule
  const hybridRule = await prisma.approvalRule.create({
    data: {
      name: "Hybrid Approval Process",
      companyId: techCorp.id,
      approvalType: "HYBRID",
      percentageThreshold: 50,
      specificApproverId: techCorpManager1.id,
      isManagerApprover: true,
      isActive: true,
    },
  });

  // Create approval steps for sequential rule
  await prisma.approvalStep.create({
    data: {
      approvalRuleId: sequentialRule.id,
      stepNumber: 1,
      approverRole: "Manager",
      approverId: techCorpManager1.id,
    },
  });

  await prisma.approvalStep.create({
    data: {
      approvalRuleId: sequentialRule.id,
      stepNumber: 2,
      approverRole: "Finance",
      approverId: techCorpAdmin.id,
    },
  });

  // Create approval steps for percentage rule
  await prisma.approvalStep.create({
    data: {
      approvalRuleId: percentageRule.id,
      stepNumber: 1,
      approverRole: "Manager",
      approverId: techCorpManager1.id,
    },
  });

  await prisma.approvalStep.create({
    data: {
      approvalRuleId: percentageRule.id,
      stepNumber: 2,
      approverRole: "Manager",
      approverId: techCorpManager2.id,
    },
  });

  await prisma.approvalStep.create({
    data: {
      approvalRuleId: percentageRule.id,
      stepNumber: 3,
      approverRole: "Finance",
      approverId: techCorpAdmin.id,
    },
  });

  // Create approval steps for hybrid rule
  await prisma.approvalStep.create({
    data: {
      approvalRuleId: hybridRule.id,
      stepNumber: 1,
      approverRole: "Manager",
      approverId: techCorpManager1.id,
    },
  });

  await prisma.approvalStep.create({
    data: {
      approvalRuleId: hybridRule.id,
      stepNumber: 2,
      approverRole: "Manager",
      approverId: techCorpManager2.id,
    },
  });

  // Create preset approval rules
  console.log("📋 Creating preset approval rules...");

  const presetStandard = await prisma.presetApprovalRule.create({
    data: {
      name: "Standard Approval Process",
      description: "Standard approval process for most expenses",
      isManagerApprover: true,
      approvalType: "SEQUENTIAL",
      useSequence: true,
      isActive: true,
    },
  });

  const presetHighValue = await prisma.presetApprovalRule.create({
    data: {
      name: "High Value Approval Process",
      description: "Multi-level approval for high-value expenses",
      isManagerApprover: true,
      approvalType: "SEQUENTIAL",
      useSequence: true,
      percentageThreshold: 1000,
      isActive: true,
    },
  });

  const presetQuick = await prisma.presetApprovalRule.create({
    data: {
      name: "Quick Approval Process",
      description: "Fast approval for low-value expenses",
      isManagerApprover: true,
      approvalType: "SEQUENTIAL",
      useSequence: true,
      percentageThreshold: 100,
      isActive: true,
    },
  });

  // Create preset rule approvers
  await prisma.presetRuleApprover.create({
    data: {
      presetRuleId: presetStandard.id,
      approverRole: "MANAGER",
      isRequired: true,
      sequenceOrder: 1,
    },
  });

  await prisma.presetRuleApprover.create({
    data: {
      presetRuleId: presetStandard.id,
      approverRole: "ADMIN",
      isRequired: false,
      sequenceOrder: 2,
    },
  });

  await prisma.presetRuleApprover.create({
    data: {
      presetRuleId: presetHighValue.id,
      approverRole: "MANAGER",
      isRequired: true,
      sequenceOrder: 1,
    },
  });

  await prisma.presetRuleApprover.create({
    data: {
      presetRuleId: presetHighValue.id,
      approverRole: "ADMIN",
      isRequired: true,
      sequenceOrder: 2,
    },
  });

  await prisma.presetRuleApprover.create({
    data: {
      presetRuleId: presetQuick.id,
      approverRole: "MANAGER",
      isRequired: true,
      sequenceOrder: 1,
    },
  });

  // Create user-specific approval rules
  console.log("👤 Creating user-specific approval rules...");

  // User approval rule for techCorpEmployee1
  const userRule1 = await prisma.userApprovalRule.create({
    data: {
      userId: techCorpEmployee1.id,
      ruleName: "David's Standard Approval",
      description: "Standard approval process for David Kim",
      isManagerApprover: true,
      managerId: techCorpManager1.id,
      approvalType: "SEQUENTIAL",
      useSequence: true,
      isActive: true,
      isPreset: false,
    },
  });

  // User approval rule for techCorpEmployee2
  const userRule2 = await prisma.userApprovalRule.create({
    data: {
      userId: techCorpEmployee2.id,
      ruleName: "Lisa's High-Value Approval",
      description: "High-value approval process for Lisa Wang",
      isManagerApprover: true,
      managerId: techCorpManager1.id,
      approvalType: "SEQUENTIAL",
      useSequence: true,
      percentageThreshold: 500,
      isActive: true,
      isPreset: false,
    },
  });

  // User approval rule for techCorpEmployee3
  const userRule3 = await prisma.userApprovalRule.create({
    data: {
      userId: techCorpEmployee3.id,
      ruleName: "James's Quick Approval",
      description: "Quick approval process for James Brown",
      isManagerApprover: true,
      managerId: techCorpManager2.id,
      approvalType: "SEQUENTIAL",
      useSequence: true,
      percentageThreshold: 200,
      isActive: true,
      isPreset: false,
    },
  });

  // Create user rule approvers
  await prisma.userRuleApprover.create({
    data: {
      userRuleId: userRule1.id,
      approverId: techCorpManager1.id,
      isRequired: true,
      sequenceOrder: 1,
    },
  });

  await prisma.userRuleApprover.create({
    data: {
      userRuleId: userRule1.id,
      approverId: techCorpAdmin.id,
      isRequired: false,
      sequenceOrder: 2,
    },
  });

  await prisma.userRuleApprover.create({
    data: {
      userRuleId: userRule2.id,
      approverId: techCorpManager1.id,
      isRequired: true,
      sequenceOrder: 1,
    },
  });

  await prisma.userRuleApprover.create({
    data: {
      userRuleId: userRule2.id,
      approverId: techCorpAdmin.id,
      isRequired: true,
      sequenceOrder: 2,
    },
  });

  await prisma.userRuleApprover.create({
    data: {
      userRuleId: userRule3.id,
      approverId: techCorpManager2.id,
      isRequired: true,
      sequenceOrder: 1,
    },
  });

  // Create sample expenses
  console.log("💰 Creating sample expenses...");

  // Approved expenses
  const expense1 = await prisma.expense.create({
    data: {
      amount: 125.5,
      currency: "USD",
      amountInCompanyCurrency: 125.5,
      exchangeRate: 1.0,
      category: "Meals & Entertainment",
      description: "Client dinner at Restaurant ABC",
      expenseDate: new Date("2024-01-15"),
      status: "APPROVED",
      employeeId: techCorpEmployee1.id,
      companyId: techCorp.id,
      currentApproverId: null,
      currentApprovalStep: 0,
    },
  });

  const expense2 = await prisma.expense.create({
    data: {
      amount: 89.99,
      currency: "USD",
      amountInCompanyCurrency: 89.99,
      exchangeRate: 1.0,
      category: "Office Supplies",
      description: "Stationery and office materials",
      expenseDate: new Date("2024-01-20"),
      status: "APPROVED",
      employeeId: techCorpEmployee2.id,
      companyId: techCorp.id,
      currentApproverId: null,
      currentApprovalStep: 0,
    },
  });

  // Pending expenses
  const expense3 = await prisma.expense.create({
    data: {
      amount: 250.0,
      currency: "USD",
      amountInCompanyCurrency: 250.0,
      exchangeRate: 1.0,
      category: "Travel",
      description: "Business trip to New York",
      expenseDate: new Date("2024-01-25"),
      status: "PENDING",
      employeeId: techCorpEmployee1.id,
      companyId: techCorp.id,
      currentApproverId: techCorpManager1.id,
      currentApprovalStep: 1,
    },
  });

  const expense4 = await prisma.expense.create({
    data: {
      amount: 75.0,
      currency: "USD",
      amountInCompanyCurrency: 75.0,
      exchangeRate: 1.0,
      category: "Transportation",
      description: "Uber rides for client meetings",
      expenseDate: new Date("2024-01-28"),
      status: "PENDING",
      employeeId: techCorpEmployee3.id,
      companyId: techCorp.id,
      currentApproverId: techCorpManager2.id,
      currentApprovalStep: 1,
    },
  });

  // Rejected expense
  const expense5 = await prisma.expense.create({
    data: {
      amount: 500.0,
      currency: "USD",
      amountInCompanyCurrency: 500.0,
      exchangeRate: 1.0,
      category: "Meals & Entertainment",
      description: "Expensive team dinner",
      expenseDate: new Date("2024-01-30"),
      status: "REJECTED",
      employeeId: techCorpEmployee2.id,
      companyId: techCorp.id,
      currentApproverId: null,
      currentApprovalStep: 0,
    },
  });

  // Multi-currency expense
  const expense6 = await prisma.expense.create({
    data: {
      amount: 150.0,
      currency: "EUR",
      amountInCompanyCurrency: 165.0, // Converted to USD
      exchangeRate: 1.1,
      category: "Travel",
      description: "Hotel accommodation in Berlin",
      expenseDate: new Date("2024-02-01"),
      status: "PENDING",
      employeeId: techCorpEmployee1.id,
      companyId: techCorp.id,
      currentApproverId: techCorpManager1.id,
      currentApprovalStep: 1,
    },
  });

  // GlobalInc expenses
  const expense7 = await prisma.expense.create({
    data: {
      amount: 200.0,
      currency: "EUR",
      amountInCompanyCurrency: 200.0,
      exchangeRate: 1.0,
      category: "Office Supplies",
      description: "Software licenses",
      expenseDate: new Date("2024-02-05"),
      status: "APPROVED",
      employeeId: globalIncEmployee.id,
      companyId: globalInc.id,
      currentApproverId: null,
      currentApprovalStep: 0,
    },
  });

  // StartupCo expenses
  const expense8 = await prisma.expense.create({
    data: {
      amount: 45.0,
      currency: "USD",
      amountInCompanyCurrency: 45.0,
      exchangeRate: 1.0,
      category: "Meals & Entertainment",
      description: "Team lunch",
      expenseDate: new Date("2024-02-10"),
      status: "PENDING",
      employeeId: startupEmployee.id,
      companyId: startupCo.id,
      currentApproverId: startupAdmin.id,
      currentApprovalStep: 1,
    },
  });

  // Create some approval records
  console.log("✅ Creating approval records...");

  // Approval for expense1
  await prisma.approval.create({
    data: {
      expenseId: expense1.id,
      approverId: techCorpManager1.id,
      stepNumber: 1,
      status: "APPROVED",
      comments: "Approved - valid business expense",
      approvedAt: new Date("2024-01-16"),
    },
  });

  await prisma.approval.create({
    data: {
      expenseId: expense1.id,
      approverId: techCorpAdmin.id,
      stepNumber: 2,
      status: "APPROVED",
      comments: "Final approval granted",
      approvedAt: new Date("2024-01-16"),
    },
  });

  // Approval for expense2
  await prisma.approval.create({
    data: {
      expenseId: expense2.id,
      approverId: techCorpManager1.id,
      stepNumber: 1,
      status: "APPROVED",
      comments: "Office supplies approved",
      approvedAt: new Date("2024-01-21"),
    },
  });

  // Rejection for expense5
  await prisma.approval.create({
    data: {
      expenseId: expense5.id,
      approverId: techCorpManager1.id,
      stepNumber: 1,
      status: "REJECTED",
      comments: "Expense too high for team dinner",
      approvedAt: new Date("2024-01-31"),
    },
  });

  // Approval for expense7
  await prisma.approval.create({
    data: {
      expenseId: expense7.id,
      approverId: globalIncManager.id,
      stepNumber: 1,
      status: "APPROVED",
      comments: "Software licenses approved",
      approvedAt: new Date("2024-02-06"),
    },
  });

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`- Companies created: 3`);
  console.log(`- Users created: 11`);
  console.log(`- Legacy approval rules created: 4`);
  console.log(`- Approval steps created: 7`);
  console.log(`- Preset approval rules created: 3`);
  console.log(`- Preset rule approvers created: 5`);
  console.log(`- User-specific approval rules created: 3`);
  console.log(`- User rule approvers created: 5`);
  console.log(`- Expenses created: 8`);
  console.log(`- Approvals created: 5`);

  console.log("\n🔑 Demo Login Credentials:");
  console.log("TechCorp:");
  console.log("  Admin: admin@techcorp.com / password123");
  console.log("  Manager: manager1@techcorp.com / password123");
  console.log("  Employee: employee1@techcorp.com / password123");
  console.log("\nGlobalInc:");
  console.log("  Admin: admin@globalinc.com / password123");
  console.log("  Manager: manager@globalinc.com / password123");
  console.log("  Employee: employee@globalinc.com / password123");
  console.log("\nStartupCo:");
  console.log("  Admin: admin@startupco.com / password123");
  console.log("  Employee: employee@startupco.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
