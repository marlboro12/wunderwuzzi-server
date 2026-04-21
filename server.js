const express = require("express");
const app = express();

app.use(express.json());

// PORT (Render wichtig!)
const PORT = process.env.PORT || 3000;

// 🔥 SIMPLE MEMORY DB
let users = {};

// ==========================
// ROOT
// ==========================
app.get("/", (req, res) => {
  res.send("🚀 WUNDERWUZZI SERVER LÄUFT");
});

// ==========================
// ADD USER
// ==========================
// Beispiel:
// /add?key=4711-ULTRA
app.get("/add", (req, res) => {
  const key = req.query.key;

  if (!key) {
    return res.send("KEY FEHLT");
  }

  // 30 Tage gültig
  const expire = Date.now() + 30 * 24 * 60 * 60 * 1000;

  users[key] = expire;

  console.log("USER ADDED:", key);

  res.send("USER ADDED");
});

// ==========================
// CHECK USER
// ==========================
// Beispiel:
// /check?key=4711-ULTRA
app.get("/check", (req, res) => {
  const key = req.query.key;

  console.log("CHECK:", key);

  if (!key) {
    return res.send("NO KEY");
  }

  if (!users[key]) {
    return res.send("NO USER");
  }

  if (users[key] < Date.now()) {
    return res.send("EXPIRED");
  }

  return res.send("ACTIVE");
});

// ==========================
// RESET
// ==========================
app.get("/reset", (req, res) => {
  users = {};
  res.send("RESET DONE");
});

// ==========================
// START SERVER
// ==========================
app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING");
  console.log("PORT:", PORT);
});
