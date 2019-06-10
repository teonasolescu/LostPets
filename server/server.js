require("dotenv").config();
const http = require("http");
const MongoClient = require("mongodb").MongoClient;

const { users } = require("./routes");

http.createServer(async (req, res) => {
    try {
        const client = await MongoClient.connect(process.env.DB_URL, {
            useNewUrlParser: true
        });
        const db = client.db(process.env.DB_NAME);

        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Max-Age": 2592000, // 30 days
            "Content-Type": "application/json"
        };

        if (req.method === "OPTIONS") {
            res.writeHead(204, headers);
            res.end();
            return;
        }

        if (["GET", "POST", "DELETE", "PATCH"].indexOf(req.method) > -1) {
            if (req.url.match(new RegExp(/\/users[a-z0-9/]*/))) {
                return users(req, res, db, headers);
            } else if (req.url.match(new RegExp(/\/pets[a-z0-9/]*/))) {
                res.writeHead(404, headers);
                res.end(`${req.url} is not here.`);
            } else {
                res.writeHead(404, headers);
                res.end(`${req.url} is not here.`);
            }
        }

        res.writeHead(405, headers);
        res.end(`${req.method} is not allowed for the request.`);
    } catch (error) {
        console.log(error);
    }
}).listen(process.env.PORT || 6969);

console.log(`Server started at http://127.0.0.1:${process.env.PORT || 6969}`);
