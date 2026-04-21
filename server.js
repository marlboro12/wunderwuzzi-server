const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ==========================
// CONFIG
// ==========================
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = "4711";

// ⚠️ BESSER: in Render ENV speichern!
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://wunderuser:wunder1234@cluster0.plfxa0v.mongodb.net/?retryWrites=true&w=majority";

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
// ROOT
// ==========================
app.get("/", (req, res) => {
    res.send("🚀 WUNDERWUZZI SERVER LÄUFT");
});

// ==========================
// ADD USER
// Beispiel:
// /add?key=4711&user=4711-ULTRA&days=30
// ==========================
app.get("/add", async (req, res) => {
    const { key, user, days } = req.query;

    if (key !== ADMIN_KEY) {
        return res.status(403).send("❌ NO ADMIN");
    }

    if (!user) {
        return res.status(400).send("❌ NO USER");
    }

    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + (parseInt(days) || 30));

    try {
        await db.collection("licenses").updateOne(
            { user: user },
            {
                $set: {
                    user: user,
                    expireAt: expireDate,
                    updatedAt: new Date()
                }
            },
            { upsert: true }
        );

        res.send(`✅ USER ADDED: ${user} | Exp: ${expireDate}`);
    } catch (err) {
        res.status(500).send("❌ DB ERROR");
    }
});

// ==========================
// CHECK USER
// Beispiel:
// /check?key=4711-ULTRA
// ==========================
app.get("/check", async (req, res) => {
    const { key } = req.query;

    if (!key) {
        return res.send("NO USER");
    }

    try {
        const user = await db.collection("licenses").findOne({ user: key });

        if (!user) {
            return res.send("NO USER");
        }

        if (new Date(user.expireAt) > new Date()) {
            return res.send("ACTIVE");
        } else {
            return res.send("EXPIRED");
        }

    } catch (err) {
        res.send("ERROR");
    }
});

// ==========================
// DELETE USER
// ==========================
app.get("/delete", async (req, res) => {
    const { key, user } = req.query;

    if (key !== ADMIN_KEY) {
        return res.status(403).send("NO ADMIN");
    }

    if (!user) {
        return res.send("NO USER");
    }

    try {
        await db.collection("licenses").deleteOne({ user: user });
        res.send("DELETED");
    } catch (err) {
        res.send("ERROR");
    }
});

// ==========================
// SERVER START
// ==========================
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
