require("dotenv").config();
const connectDB = require("./config/db");

async function test() {
    console.log("Testing MongoDB connection...");
    const conn = await connectDB();
    console.log(`Connection successful! Host: ${conn.host}, Database: ${conn.name}`);
    process.exit(0);
}

test().catch((err) => {
    console.error("Connection failed:", err.message);
    process.exit(1);
});
