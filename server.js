const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

// USERS (im RAM)
let users = [
  { key: "4711-ULTRA", active: true }
];

// ROOT
app.get("/", (req, res) => {
  res.send("🚀 WUNDERWUZZI SERVER LÄUFT");
});

// CHECK LICENSE
app.get("/check", (req, res) => {
  const key = req.query.key;

  console.log("CHECK:", key);

  if (!key) return res.send("NO KEY");

  const user = users.find(u => u.key === key);

  if (!user) return res.send("NO USER");

  if (!user.active) return res.send("LICENSE OFF");

  return res.send("OK");
});

// ADD USER
app.get("/add", (req, res) => {
  const key = req.query.key;

  if (!key) return res.send("NO KEY");

  users.push({ key, active: true });

  console.log("ADDED:", key);

  res.send("USER ADDED");
});

// REMOVE USER
app.get("/remove", (req, res) => {
  const key = req.query.key;

  users = users.filter(u => u.key !== key);

  console.log("REMOVED:", key);

  res.send("USER REMOVED");
});

// START
app.listen(PORT, () => {
  console.log("🔥 SERVER RUNNING ON PORT", PORT);
});
