const express = require("express");
const app = express();

app.use(express.json());

// 🔥 USER DATABASE (einfach, später DB möglich)
let users = {};

// ================= CHECK =================
app.get("/check", (req, res) => {
    const user = req.query.user;

    if(users[user] && users[user] > Date.now())
        return res.send("ACTIVE");

    return res.send("EXPIRED");
});

// ================= STRIPE WEBHOOK =================
app.post("/webhook", (req, res) => {
    const event = req.body;

    if(event.type === "checkout.session.completed")
    {
        const user_id = event.data.object.client_reference_id;

        if(user_id)
        {
            users[user_id] = Date.now() + (30 * 24 * 60 * 60 * 1000);

            console.log("User aktiviert:", user_id);
        }
    }

    res.sendStatus(200);
});

// ================= START =================
app.listen(3000, () => {
    console.log("SERVER RUNNING");
});