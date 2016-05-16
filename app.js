// Define the necessary variables
var proxyServer = require('http-proxy'),
    http = require("http"),
    url = require("url"),
    fs = require("fs"),
    portscanner = require("portscanner"),
    proxy = proxyServer.createProxyServer({}),
    servers = [],
    available = [];

// Scan all of the servers to see which ones are available
var scan = servers => {
    servers.forEach(server => {
        portscanner.checkPortStatus(parseInt(server.port), server.hostname, (err, result) => {
            if(err) { throw err; }
            var iden = available.some(elem => elem.port === server.port && elem.hostname === server.hostname);
            if(result === "open" && !iden) {
                var obj = {
                    "hostname": server.hostname,
                    "port": server.port,
                    "protocol": "http:"
                };
                available.push(obj);
            }
            else if(result === "closed" && iden) {
                for(var i = 0; i < available.length; i++) {
                    if(available[i].port === server.port && available[i].hostname === server.hostname) {
                        available.splice(i, 1);
                    }
                }
            }
        });
    });
};

// Read and parse the servers file to identify all of the workers and start up the proxy server to handle the load balancing
fs.readFile("servers.txt", "utf8", (err, data) => {
    if(err) { throw err; }
    var collection = data.split("\n");
    for(var j = 0; j < collection.length; j++) {
        if(collection[j] !== "") {
            var server = collection[j].split(",");
            if(server[1].indexOf("\r") !== -1) { server[1] = server[1].substring(0, server[1].indexOf("\r")); }
            var obj = {
                "hostname": server[0],
                "port": server[1],
                "protocol": "http:"
            };
            servers.push(obj);
        }
    }
    scan(servers);
    setInterval(() => { scan(servers); }, 1000 * 60);
    http.createServer((req, res) => {
        if(available.length > 0) {
            var target = available.shift();
            proxy.web(req, res, {"target": url.format(target)});
            proxy.on("error", (err, req, res) => {
                scan(servers);
                if(available.length > 0) {
                    target = available.shift();
                    proxy.web(req, res, {"target": url.format(target)});
                }
                else { res.end("<body>All of the workers are down it seems!</body>"); }
            });
            available.push(target);
        }
        else { res.end("<body>All of the workers are down it seems!</body>"); }
    }).listen(80, () => { console.log("The server is now listening!"); });
});