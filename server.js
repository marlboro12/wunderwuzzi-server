<<<<<<< HEAD
const http = require("http");
const { MongoClient } = require("mongodb");

const PORT = 5000;

const uri = "mongodb://127.0.0.1:27017";
const client = new MongoClient(uri);

let db;

async function startServer() {
    await client.connect();
    db = client.db("wunderwuzzi");

    console.log("🧠 DB verbunden");

    const server = http.createServer((req, res) => {

        if (req.method === "GET" && req.url === "/") {
            res.writeHead(200);
            return res.end("SERVER OK");
        }

        if (req.method === "POST" && req.url === "/login") {

            let body = "";
            req.on("data", chunk => body += chunk.toString());

            req.on("end", () => {

                console.log("📥 LOGIN:", body);

                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    return res.end(JSON.stringify({ status: "error" }));
                }

                if (data.user === "4711" && data.token === "ABC123") {
                    return res.end(JSON.stringify({ status: "ok" }));
                }

                return res.end(JSON.stringify({ status: "denied" }));
            });

            return;
        }

        if (req.method === "POST" && req.url === "/trade") {

            let body = "";
            req.on("data", chunk => body += chunk.toString());

            req.on("end", async () => {

                console.log("📊 TRADE:", body);

                let data;

                try {
                    data = JSON.parse(body);
                } catch {
                    return res.end(JSON.stringify({ status: "error" }));
                }

                await db.collection("trades").insertOne({
                    symbol: data.symbol,
                    type: data.type,
                    profit: parseFloat(data.profit),
                    balance: parseFloat(data.balance),
                    time: new Date()
                });

                res.writeHead(200);
                return res.end(JSON.stringify({ status: "saved" }));
            });

            return;
        }

        res.writeHead(404);
        res.end();
    });

    server.listen(PORT, () => {
        console.log("🚀 SERVER LÄUFT AUF PORT 5000");
    });
}

startServer();
=======
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

    if (!db) return res.send("DB NOT READY ❌");

    if (key !== ADMIN_KEY) return res.send("NO ACCESS");
    if (!user) return res.send("NO USER");

    const expireDate = Date.now() + (days || 30) * 86400000;

    await db.collection("users").insertOne({
        key: user,
        expires: expireDate
    });

    console.log("✅ USER GESPEICHERT:", user);

    res.send("USER ADDED");
});

// CHECK USER
app.get("/check", async (req, res) => {
    if (!db) return res.send("DB NOT READY ❌");

    const { key } = req.query;

    const user = await db.collection("users").findOne({ key });

    if (!user) return res.send("NO USER");

    if (user.expires > Date.now()) {
        return res.send("ACTIVE");
    }

    return res.send("EXPIRED");
});

// DEBUG (zeigt alle User)
app.get("/debug", async (req, res) => {
    if (!db) return res.send("DB NOT READY ❌");

    const users = await db.collection("users").find().toArray();
    res.json(users);
});

// ==========================
// START SERVER (WICHTIG FIX)
// ==========================
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server läuft auf Port ${PORT}`);
    });
});
>>>>>>> b4ccd19ff664b723fccaf4dfef8b7200a8c7e984
