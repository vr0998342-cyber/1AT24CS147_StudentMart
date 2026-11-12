const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        usn: {
            type: String,
            sparse: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer"
        },

        course: {
            type: String,
            default: "Student"
        },

        year: {
            type: String,
            default: "1st Year"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);
