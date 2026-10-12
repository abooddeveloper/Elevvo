const http = require("http");
const fs = require("fs");
const os = require("os");
const process = require("process");



const server = http.createServer((req, res) => {
    if (req.url === `/api/users` && req.method === `GET`) {
        fs.readFile(`./ResData.json`, `utf-8`, (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.write(JSON.stringify({ error: "Failed to read file" }));
                res.end();
            } else {
                res.writeHead(200, { "Content-Type": "application/json" } );
                res.write(data);
                res.end();
            }
            
        });
    }
    else if (req.url === `/` && req.method === `GET`) {
        fs.readFile(`./msg.json`, `utf-8`, (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Failed to read file" }));
            } else {
                res.writeHead(200, { "Content-Type": "application/json" } );
                res.write(data);
                res.end();
            }
        });
    }
    else if (req.url === `/api/health` && req.method === `GET`) {
        const healthData = {
            platform: os.platform(),
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };

        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(healthData));
        res.end();
    }
     else{
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Not Found" }));
            }
});
//------------------------
server.listen(8000, () => {
  console.log("Listening to port 8000!");
});
