# 🎓 StudentMart — Campus Marketplace & Student Store

StudentMart is a full-stack campus e-commerce and student marketplace web application built with **React (Vite)**, **Node.js/Express**, and **MongoDB (Mongoose)** with Role-Based Access Control (RBAC).

---

## 🌟 Features

- 🔐 **Authentication & RBAC**:
  - Secure JWT authentication with role-based routing.
  - **Student / Customer**: Browse campus products, search & filter, cart, place orders, view order status.
  - **Administrator / Faculty**: Product inventory management (create, update, delete) and campus order status fulfillment.
- 🛒 **Campus Storefront**:
  - Categorized products (Electronics, Stationery, Bags & Gear, Apparel).
  - Search by keywords, filter by department category, and sort by price.
- 📦 **Order Lifecycle**:
  - Customer order placement with pickup location preferences.
  - Live status tracking: `Pending` → `Ready for Pickup` → `Completed` / `Cancelled`.
- 🗄️ **Robust MongoDB Integration**:
  - Modular connection with automated IPv4 fallback (`127.0.0.1`), timeout protection, and lifecycle listeners.
  - Database seeder with sample accounts and products.
  - Health check endpoint at `/api/health`.

---

## 📂 Project Architecture

```
1AT24CS147_StudentMart/
├── my_project/               # Frontend (React + Vite)
│   ├── src/
│   │   ├── Components/       # UI Components (Admin & Customer Dashboards, Login, Register, Products)
│   │   ├── styles/           # CSS stylesheets
│   │   ├── utils/            # API client configuration (apiFetch, session helpers)
│   │   ├── App.jsx           # Main router & routes
│   │   └── main.jsx          # Entry point
│   └── package.json
│
├── server/                   # Backend (Node.js + Express + MongoDB)
│   ├── config/
│   │   └── db.js             # Modular Mongoose connection & error handling
│   ├── middleware/
│   │   └── auth.js           # JWT verification & RBAC middleware (isAdmin, isCustomer)
│   ├── models/
│   │   ├── user.js           # User schema (Student & Admin)
│   │   ├── product.js        # Product schema
│   │   └── order.js          # Order schema
│   ├── router/
│   │   ├── authroutes.js     # /api/auth (register, login, profile, toggle-role)
│   │   ├── productroutes.js  # /api/products (CRUD)
│   │   └── orderroutes.js    # /api/orders (place, list, status updates)
│   ├── .env.example          # Environment variable template
│   ├── seed.js               # Database seeding script
│   ├── test-db.js            # Database connection verification tool
│   ├── server.js             # Express API server entry point
│   └── package.json
│
├── .gitignore                # Global git ignore (protects node_modules and .env)
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** (Local Windows service or MongoDB Atlas cloud cluster)

### 2. Backend Setup
```bash
cd server
npm install
```
Configure `server/.env`:
```env
PORT=5002
MONGO_URI=mongodb://127.0.0.1:27017/studentmart
JWT_SECRET=studentmart_jwt_secret_key_2026
```

Test the database connection:
```bash
npm run test-db
```

Seed initial accounts and sample products:
```bash
npm run seed
```

Start the backend API server:
```bash
npm start
```
*API runs at `http://localhost:5002`.*

### 3. Frontend Setup
```bash
cd my_project
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 👥 Demo Credentials (Pre-seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@studentmart.com` | `admin123` |
| **Student (Customer)** | `student@gmail.com` | `123456` |

---

## 📡 API Endpoints

- `GET /api/health` — Live server and database connection health check
- `POST /api/auth/register` — Register student or admin account
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/products` — Get list of campus products (supports `?search=`, `?category=`, `?sort=`)
- `POST /api/products` — Add a product *(Admin only)*
- `PUT /api/products/:id` — Update a product *(Admin only)*
- `DELETE /api/products/:id` — Delete a product *(Admin only)*
- `POST /api/orders` — Place order *(Customer)*
- `GET /api/orders/my-orders` — View customer's orders *(Customer)*
- `GET /api/orders` — View all campus orders *(Admin only)*
- `PUT /api/orders/:id/status` — Update order status *(Admin only)*
