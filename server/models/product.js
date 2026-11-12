const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            maxlength: 120
        },
        description: {
            type: String,
            required: [true, "Product description is required"],
            trim: true,
            maxlength: 1200
        },
        price: {
            type: Number,
            required: [true, "Product price is required"],
            min: [0, "Price cannot be negative"]
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true,
            maxlength: 60
        },
        image: {
            type: String,
            default: ""
        },
        stock: {
            type: Number,
            default: 0,
            min: [0, "Stock cannot be negative"]
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Product", productSchema);
