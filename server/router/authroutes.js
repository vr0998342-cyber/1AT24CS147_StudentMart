const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { verifyToken, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Helper to sign JWT
const signToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role,
            name: user.name
        },
        JWT_SECRET,
        { expiresIn: "7d" }
    );
};

// ==============================
// REGISTER
// ==============================
router.post("/register", async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            role,
            course,
            year
        } = req.body;

        // Check empty fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required"
            });
        }

        // Validate email format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered. Please login instead."
            });
        }

        // Role determination: default 'customer', allow 'admin' if specified
        const assignedRole = role === "admin" ? "admin" : "customer";

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: assignedRole,
            course: course || "Computer Science",
            year: year || "1st Year"
        });

        // Generate JWT
        const token = signToken(newUser);

        // Send response with token & role
        res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                course: newUser.course,
                year: newUser.year
            }
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({
            message: "Server error during registration: " + error.message
        });
    }
});

// ==============================
// LOGIN
// ==============================
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT with role
        const token = signToken(user);

        // Login successful response
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "customer",
                course: user.course || "Student",
                year: user.year || "1st Year"
            }
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({
            message: "Server error during login: " + error.message
        });
    }
});

// ==============================
// GET CURRENT USER PROFILE
// ==============================
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ user });
    } catch (error) {
        console.error("PROFILE ERROR:", error);
        res.status(500).json({ message: "Server error: " + error.message });
    }
});

// ============================================
// DEVELOPER SETUP HELPER: TOGGLE / PROMOTE ROLE
// ============================================
router.post("/toggle-role", async (req, res) => {
    try {
        const { email, targetRole } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required to toggle role" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: "User not found with email: " + email });
        }

        const newRole = targetRole || (user.role === "admin" ? "customer" : "admin");
        user.role = newRole;
        await user.save();

        const token = signToken(user);

        res.json({
            message: `User role successfully updated to '${newRole}'`,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                course: user.course,
                year: user.year
            }
        });
    } catch (error) {
        console.error("TOGGLE ROLE ERROR:", error);
        res.status(500).json({ message: "Error updating role: " + error.message });
    }
});

module.exports = router;
