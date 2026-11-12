const mongoose = require("mongoose");

/**
 * Normalizes MongoDB URI by fixing common formatting issues such as:
 * - Duplicate slashes after host (e.g. localhost:27017//studentmart)
 */
function normalizeUri(uri) {
    if (!uri) return "mongodb://127.0.0.1:27017/studentmart";
    // Replace duplicate slashes in the path (e.g., :27017//dbname -> :27017/dbname)
    return uri.replace(/([^:])\/{2,}/g, "$1/");
}

/**
 * Establishes a connection to MongoDB with fallback and event handling.
 */
async function connectDB() {
    let rawUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/studentmart";
    let uri = normalizeUri(rawUri);

    // Mongoose connection options
    const options = {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging 30s
    };

    // Attach lifecycle event listeners once
    if (mongoose.connection.listenerCount("connected") === 0) {
        mongoose.connection.on("connected", () => {
            const host = mongoose.connection.host;
            const dbName = mongoose.connection.name;
            console.log(`✅ MongoDB connected successfully to [${dbName}] on ${host}`);
        });

        mongoose.connection.on("error", (err) => {
            console.error(`❌ MongoDB connection error:`, err.message);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("⚠️  MongoDB disconnected.");
        });
    }

    try {
        await mongoose.connect(uri, options);
        return mongoose.connection;
    } catch (err) {
        // If connecting to 'localhost' failed on Windows due to IPv6 (::1) resolution, retry with 127.0.0.1
        if (uri.includes("localhost:27017")) {
            const ipv4Uri = uri.replace("localhost:27017", "127.0.0.1:27017");
            console.warn(`⚠️  Failed connecting via 'localhost'. Retrying with IPv4: ${ipv4Uri}...`);
            try {
                await mongoose.connect(ipv4Uri, options);
                return mongoose.connection;
            } catch (retryErr) {
                console.error("❌ Retry with 127.0.0.1 also failed:", retryErr.message);
            }
        }

        console.error("\n========================================================");
        console.error("❌ MONGODB CONNECTION FAILED!");
        console.error("URI attempted:", uri);
        console.error("Reason:", err.message);
        console.error("--------------------------------------------------------");
        console.error("💡 Troubleshooting Tips:");
        console.error(" 1. For Local MongoDB on Windows:");
        console.error("    Ensure the service is started. In an Administrator terminal run:");
        console.error("    > net start MongoDB");
        console.error(" 2. For MongoDB Atlas (Cloud):");
        console.error("    Set MONGO_URI in server/.env with your connection string:");
        console.error("    MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/studentmart?retryWrites=true&w=majority");
        console.error("    Ensure your IP is whitelisted under Atlas > Network Access.");
        console.error("========================================================\n");
        throw err;
    }
}

module.exports = connectDB;
