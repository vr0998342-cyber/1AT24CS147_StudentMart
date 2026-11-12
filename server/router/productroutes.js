const express = require("express");
const Product = require("../models/product");
const { verifyToken, isAdmin } = require("../middleware/auth");

const router = express.Router();

// ==============================
// GET ALL PRODUCTS (Public / All Roles)
// Supports search, category filter, price sorting
// ==============================
router.get("/", async (req, res) => {
    try {
        const { search, category, sort } = req.query;
        let query = {};

        if (search && search.trim() !== "") {
            query.name = { $regex: search.trim(), $options: "i" };
        }

        if (category && category !== "All") {
            query.category = { $regex: new RegExp(`^${category}$`, "i") };
        }

        let sortOption = { createdAt: -1 }; // newest first by default
        if (sort === "lowToHigh") {
            sortOption = { price: 1 };
        } else if (sort === "highToLow") {
            sortOption = { price: -1 };
        }

        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch products: " + error.message });
    }
});

// ==============================
// GET SINGLE PRODUCT BY ID
// ==============================
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    } catch (error) {
        console.error("GET PRODUCT DETAILS ERROR:", error);
        res.status(500).json({ message: "Error fetching product details: " + error.message });
    }
});

// ==============================
// CREATE PRODUCT (Admin Only)
// ==============================
router.post("/", verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || !category) {
            return res.status(400).json({
                message: "Name, description, price, and category are required."
            });
        }

        const newProduct = await Product.create({
            name: name.trim(),
            description: description.trim(),
            price: Number(price),
            category: category.trim(),
            image: image ? image.trim() : "",
            stock: stock !== undefined ? Number(stock) : 0
        });

        res.status(201).json({
            message: "Product added successfully",
            product: newProduct
        });
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        res.status(500).json({ message: "Failed to add product: " + error.message });
    }
});

// ==============================
// UPDATE PRODUCT (Admin Only)
// ==============================
router.put("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name.trim();
        if (description !== undefined) updateData.description = description.trim();
        if (price !== undefined) updateData.price = Number(price);
        if (category !== undefined) updateData.category = category.trim();
        if (image !== undefined) updateData.image = image.trim();
        if (stock !== undefined) updateData.stock = Number(stock);

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct
        });
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        res.status(500).json({ message: "Failed to update product: " + error.message });
    }
});

// ==============================
// DELETE PRODUCT (Admin Only)
// ==============================
router.delete("/:id", verifyToken, isAdmin, async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product deleted successfully",
            id: req.params.id
        });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        res.status(500).json({ message: "Failed to delete product: " + error.message });
    }
});

module.exports = router;
