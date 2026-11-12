const express = require("express");
const Order = require("../models/order");
const Product = require("../models/product");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// ==============================
// 1. PLACE ORDER (Customer - verifyToken)
// POST /api/orders
// ==============================
router.post("/", verifyToken, async (req, res) => {
    try {
        const { items, pickupLocation, notes } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty. Please add items to place an order." });
        }

        // Calculate total amount & sanitize items
        let totalAmount = 0;
        const formattedItems = [];

        for (const item of items) {
            const quantity = Number(item.quantity) || 1;
            const price = Number(item.price) || 0;
            totalAmount += price * quantity;

            formattedItems.push({
                product: item.product || item._id,
                name: item.name,
                price: price,
                quantity: quantity,
                image: item.image || ""
            });

            // Optional: adjust stock if product ID exists in DB
            if (item.product || item._id) {
                const prodId = item.product || item._id;
                try {
                    await Product.findByIdAndUpdate(prodId, {
                        $inc: { stock: -quantity }
                    });
                } catch (stockErr) {
                    console.warn("Could not decrement stock for:", prodId);
                }
            }
        }

        const newOrder = await Order.create({
            customer: req.user.id,
            customerName: req.user.name || "Student Customer",
            customerEmail: req.user.email,
            items: formattedItems,
            totalAmount: Number(totalAmount.toFixed(2)),
            pickupLocation: pickupLocation || "Main Student Center",
            status: "Pending",
            notes: notes ? notes.trim() : ""
        });

        res.status(201).json({
            message: "Order placed successfully!",
            order: newOrder
        });
    } catch (error) {
        console.error("PLACE ORDER ERROR:", error);
        res.status(500).json({ message: "Failed to place order: " + error.message });
    }
});

// ==============================
// 2. GET CURRENT USER'S ORDERS (Customer - verifyToken)
// GET /api/orders/my-orders
// ==============================
router.get("/my-orders", verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user.id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("GET MY ORDERS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch orders: " + error.message });
    }
});

// ==============================
// 3. GET ALL CAMPUS ORDERS (Admin - verifyToken & isAdmin)
// GET /api/orders
// ==============================
router.get("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status && status !== "All") {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .sort({ createdAt: -1 })
            .populate("customer", "name email course year");

        res.json(orders);
    } catch (error) {
        console.error("GET ALL ORDERS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch all orders: " + error.message });
    }
});

// ==============================
// 4. UPDATE ORDER STATUS (Admin - verifyToken & isAdmin)
// PUT /api/orders/:id/status
// ==============================
router.put("/:id/status", verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ["Pending", "Ready for Pickup", "Completed", "Cancelled"];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
            });
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({
            message: `Order status updated to '${status}'`,
            order
        });
    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        res.status(500).json({ message: "Failed to update order status: " + error.message });
    }
});

module.exports = router;
