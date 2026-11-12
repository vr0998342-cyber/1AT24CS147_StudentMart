const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./router/authroutes");
const productRoutes = require("./router/productroutes");
const orderRoutes = require("./router/orderroutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Database & server health check endpoint
app.get("/api/health", (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };
  res.json({
    status: dbState === 1 ? "ok" : "degraded",
    database: states[dbState] || "unknown",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    message: "StudentMart API is running",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    endpoints: {
      health: "/api/health",
      auth: "/api/auth (register, login, profile, toggle-role)",
      products: "/api/products (GET public, POST/PUT/DELETE admin-only)",
      orders: "/api/orders (POST customer, GET /my-orders customer, GET / admin, PUT /:id/status admin)"
    }
  });
});

const PORT = process.env.PORT || 5002;

// Connect to MongoDB and start server
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(` 🎓 StudentMart API Server running on http://localhost:${PORT}`);
      console.log(` 🔐 Role-Based Access Control (RBAC) Enabled`);
      console.log(` 📡 Health check: http://localhost:${PORT}/api/health`);
      console.log(`------------------------------------------------------`);
      console.log(` 🛠️  DEVELOPER SETUP / ADMIN PROMOTION HELPER:`);
      console.log(`    To promote an existing user to 'admin' in MongoDB:`);
      console.log(`    > mongosh`);
      console.log(`    > use studentmart`);
      console.log(`    > db.users.updateOne({ email: "student@gmail.com" }, { $set: { role: "admin" } })`);
      console.log(``);
      console.log(`    Or run the seed script to create both accounts & products:`);
      console.log(`    > npm run seed`);
      console.log(`      Admin:    admin@studentmart.com / admin123`);
      console.log(`      Customer: student@gmail.com     / 123456`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error("Failed to start server due to DB connection error:", error.message);
    process.exit(1);
  }
}

startServer();
