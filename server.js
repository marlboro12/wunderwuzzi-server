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