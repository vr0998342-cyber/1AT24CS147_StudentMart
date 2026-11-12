const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "studentmart_jwt_secret_key_2026";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || req.headers.Authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Access denied. Authentication token required."
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access denied. Malformed token."
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id, email, role, name, ... }
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        return res.status(401).json({
            message: "Invalid or expired session token. Please log in again."
        });
    }
};

// Middleware to verify Admin role
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized. Authentication required."
        });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Forbidden. Admin access only."
        });
    }

    next();
};

// Middleware to verify Customer role
const isCustomer = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            message: "Unauthorized. Authentication required."
        });
    }

    if (req.user.role !== "customer") {
        return res.status(403).json({
            message: "Forbidden. Customer access only."
        });
    }

    next();
};

module.exports = {
    verifyToken,
    isAdmin,
    isCustomer,
    JWT_SECRET
};
