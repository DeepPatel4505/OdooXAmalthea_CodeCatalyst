import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// Test database connection
prisma
  .$connect()
  .then(() => {
    console.log("Connected to PostgreSQL database via Prisma");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(-1);
  });

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;
