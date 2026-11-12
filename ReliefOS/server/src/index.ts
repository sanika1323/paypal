import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/database.js";
import emergencyRoutes from "./routes/emergency.routes.js";
import organizationRoutes from "./routes/organization.routes.js";
import productRoutes from "./routes/product.routes.js";
import reliefRequestRoutes from "./routes/relief-request.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import vendorOfferRoutes from "./routes/vendorOffer.routes.js";
import procurementRoutes from "./routes/procurement.routes.js";
import agentRoutes from "./routes/agent.routes.js";
import approvalRoutes from "./routes/approval.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/products", productRoutes);
app.use("/api/relief-requests", reliefRequestRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/vendor-offers", vendorOfferRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/approvals", approvalRoutes);
app.use("/api/payments", paymentRoutes);


// Basic API + database health check
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      application: "ReliefOS",
      api: "running",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(503).json({
      success: false,
      application: "ReliefOS",
      api: "running",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`ReliefOS API running on http://localhost:${PORT}`);
});