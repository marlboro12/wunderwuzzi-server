const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

// ==========================
// ⚙️ CONFIG
// ==========================
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = "4711"; // <-- ÄNDERN!

const MONGO_URI = "mongodb+srv://wunderuser:wunder1234@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(MONGO_URI);

let db;

// ==========================
// 🔌 CONNECT DB
// ==========================
async function connectDB() {
  await client.connect();
  db = client.db("wunderwuzzi");
  console.log("✅ MongoDB connected");
}
connectDB();

// ==========================
// 🏠 ROOT
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 WUNDERWUZZI PRO SERVER LIVE");
});

// ==========================
// ➕ ADD LICENSE (ADMIN)
// ==========================
app.get("/add", async (req, res) => {
  const { key, admin } = req.query;

  if (admin !== ADMIN_KEY)
    return res.status(403).send("NO ADMIN ACCESS");

  if (!key) return res.send("NO KEY");

  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 Tage

  await db.collection("licenses").updateOne(
    { key },
    { $set: { key, expires, hwid: null } },
    { upsert: true }
  );

  res.send("USER ADDED");
});

// ==========================
// 🔍 CHECK LICENSE
// ==========================
app.get("/check", async (req, res) => {
  const { key, hwid } = req.query;

  if (!key) return res.send("NO KEY");

  const user = await db.collection("licenses").findOne({ key });

  if (!user) return res.send("NO USER");

  // Ablauf prüfen
  if (user.expires < Date.now()) return res.send("EXPIRED");

  // HWID prüfen / setzen
  if (!user.hwid && hwid) {
    await db.collection("licenses").updateOne(
      { key },
      { $set: { hwid } }
    );
  } else if (user.hwid && hwid && user.hwid !== hwid) {
    return res.send("HWID LOCKED");
  }

  res.send("ACTIVE");
});

// ==========================
// ❌ DELETE LICENSE
// ==========================
app.get("/delete", async (req, res) => {
  const { key, admin } = req.query;

  if (admin !== ADMIN_KEY)
    return res.status(403).send("NO ADMIN ACCESS");

  await db.collection("licenses").deleteOne({ key });

  res.send("DELETED");
});

// ==========================
// 📋 LIST ALL (ADMIN)
// ==========================
app.get("/list", async (req, res) => {
  const { admin } = req.query;

  if (admin !== ADMIN_KEY)
    return res.status(403).send("NO ADMIN ACCESS");

  const users = await db.collection("licenses").find().toArray();
  res.json(users);
});

// ==========================
app.listen(PORT, () => {
  console.log(`🔥 SERVER RUNNING ON PORT ${PORT}`);
});
