const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ==========================
// CONFIG
// ==========================
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = "4711";

const MONGO_URI = "mongodb+srv://wunderuser:wunder1234@cluster0.plfxa0v.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(MONGO_URI);

let db;

// ==========================
// DB CONNECT
// ==========================
async function connectDB() {
    try {
        await client.connect();
        db = client.db("wunderwuzzi");
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB Fehler:", err);
    }
}

connectDB();

// ==========================
// ROUTES
// ==========================

// ROOT
app.get("/", (req, res) => {
    res.send("🚀 WUNDERWUZZI SERVER LÄUFT");
});

// ADD USER
app.get("/add", async (req, res) => {
    const { key, user, days } = req.query;

    if (key !== ADMIN_KEY) return res.send("NO ACCESS");
    if (!user) return res.send("NO USER");

    const expireDate = Date.now() + (days || 30) * 86400000;

    await db.collection("users").insertOne({
        key: user,
        expires: expireDate
    });

    res.send("USER ADDED");
});

// CHECK USER
app.get("/check", async (req, res) => {
    const { key } = req.query;

    const user = await db.collection("users").findOne({ key });

    if (!user) return res.send("NO USER");

    if (user.expires > Date.now()) {
        return res.send("ACTIVE");
    }

    return res.send("EXPIRED");
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
