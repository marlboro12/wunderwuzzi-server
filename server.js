const express = require("express");
const app = express();

app.use(express.json());

// 🌍 PORT (wichtig für Render!)
const PORT = process.env.PORT || 3000;

// 🧠 USER DATABASE (einfach – später DB möglich)
let users = {};

// =====================================
// 🏠 ROOT (damit "Kann nicht GET /" weg ist)
// =====================================
app.get("/", (req, res) => {
  res.send("🚀 WUNDERWUZZI SERVER LÄUFT");
});

// =====================================
// ✅ CHECK ENDPOINT (für EA)
// Beispiel: /check?user=4711
// =====================================
app.get("/check", (req, res) => {
  const user = req.query.user;

  if (!user) {
    return res.status(400).send("NO USER");
  }

  if (users[user] && users[user] > Date.now()) {
    return res.send("ACTIVE");
  }

  return res.send("EXPIRED");
});

// =====================================
// 💳 WEBHOOK (Stripe Simulation / später echt)
// =====================================
app.post("/webhook", (req, res) => {
  const event = req.body;

  console.log("Webhook received:", event);

  // Beispiel: Stripe Event
  if (event.type === "checkout.session.completed") {
    const user_id = event.data.object.client_reference_id;

    if (user_id) {
      // 30 Tage aktivieren
      users[user_id] = Date.now() + (30 * 24 * 60 * 60 * 1000);

      console.log("User aktiviert:", user_id);
    }
  }

  res.sendStatus(200);
});

// =====================================
// ➕ MANUELL USER AKTIVIEREN (TEST)
// Beispiel: /activate?user=4711
// =====================================
app.get("/activate", (req, res) => {
  const user = req.query.user;

  if (!user) {
    return res.status(400).send("NO USER");
  }

  users[user] = Date.now() + (30 * 24 * 60 * 60 * 1000);

  res.send("USER ACTIVATED: " + user);
});

// =====================================
// 🚀 SERVER START
// =====================================
app.listen(PORT, () => {
  console.log("=================================");
  console.log("🚀 SERVER RUNNING");
  console.log("PORT:", PORT);
  console.log("=================================");
});
