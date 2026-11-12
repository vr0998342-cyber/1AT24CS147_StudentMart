const bcrypt = require("bcryptjs");
require("dotenv").config();

const connectDB = require("./config/db");
const User = require("./models/user");
const Product = require("./models/product");
const Order = require("./models/order");

async function seedDatabase() {
    try {
        console.log("Connecting to MongoDB...");
        await connectDB();
        console.log("Connected to MongoDB for seeding.");

        // 1. Create or Update Admin User
        const adminEmail = "admin@studentmart.com";
        const adminPassword = await bcrypt.hash("admin123", 10);

        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            adminUser = await User.create({
                name: "Campus Administrator",
                email: adminEmail,
                password: adminPassword,
                role: "admin",
                course: "Staff / Admin",
                year: "Faculty"
            });
            console.log(` Created default Admin account: ${adminEmail} (password: admin123)`);
        } else {
            adminUser.role = "admin";
            await adminUser.save();
            console.log(` Admin account verified: ${adminEmail}`);
        }

        // 2. Create or Update Customer User
        const studentEmail = "student@gmail.com";
        const studentPassword = await bcrypt.hash("123456", 10);

        let studentUser = await User.findOne({ email: studentEmail });
        if (!studentUser) {
            studentUser = await User.create({
                name: "Student Customer",
                email: studentEmail,
                password: studentPassword,
                role: "customer",
                course: "Computer Science",
                year: "3rd Year"
            });
            console.log(` Created default Customer account: ${studentEmail} (password: 123456)`);
        } else {
            console.log(` Customer account verified: ${studentEmail}`);
        }

        // 3. Seed Sample Campus Products if empty
        const count = await Product.countDocuments();
        if (count === 0) {
            const sampleProducts = [
                {
                    name: "Casio FX-991CW Scientific Calculator",
                    description: "Advanced engineering calculator with solar + battery backup, suitable for all semester exams.",
                    price: 1250,
                    category: "Electronics",
                    stock: 15,
                    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80"
                },
                {
                    name: "Campus Waterproof Laptop Backpack",
                    description: "Durable 25L backpack with 15.6 inch padded laptop compartment and water bottle holder.",
                    price: 899,
                    category: "Bags & Gear",
                    stock: 20,
                    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80"
                },
                {
                    name: "Engineering Drawing & Drafting Instrument Kit",
                    description: "Complete mini-drafter, compass, set squares, and scale ruler set for 1st & 2nd year labs.",
                    price: 450,
                    category: "Stationery",
                    stock: 30,
                    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=80"
                },
                {
                    name: "Official StudentMart Campus Hoodie (Unisex - L)",
                    description: "Premium fleece pullover college hoodie with embroidered student crest.",
                    price: 999,
                    category: "Apparel",
                    stock: 25,
                    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80"
                },
                {
                    name: "Spiral Ruled Project Notebooks (Set of 4)",
                    description: "200-page single ruled spiral notebooks with thick 70gsm bleed-proof paper.",
                    price: 240,
                    category: "Stationery",
                    stock: 50,
                    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80"
                },
                {
                    name: "USB-C 7-in-1 Multiport Hub Adapter",
                    description: "HDMI 4K, 3x USB 3.0, SD Card Reader, and 100W Power Delivery pass-through.",
                    price: 1100,
                    category: "Electronics",
                    stock: 12,
                    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop&q=80"
                }
            ];

            await Product.insertMany(sampleProducts);
            console.log(` Inserted ${sampleProducts.length} sample products into StudentMart.`);
        } else {
            console.log(` Database already contains ${count} products.`);
        }

        console.log("\n=======================================================");
        console.log(" SEEDING COMPLETED SUCCESSFULLY!");
        console.log("-------------------------------------------------------");
        console.log(" Admin Login:    admin@studentmart.com / admin123");
        console.log(" Customer Login: student@gmail.com     / 123456");
        console.log("=======================================================\n");

        process.exit(0);
    } catch (err) {
        console.error("Seeding Error:", err.message);
        process.exit(1);
    }
}

seedDatabase();
