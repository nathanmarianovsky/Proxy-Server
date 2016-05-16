// Define the necessary variables
var proxyServer = require('http-proxy'),
    http = require("http"),
    url = require("url"),
    mkdirp = require('mkdirp'),
    fs = require("fs"),
    moment = require("moment"),
    portscanner = require("portscanner"),
    proxy = proxyServer.createProxyServer({}),
    servers = [],
    available = [];

// Create the logs directory if it does not already exist
mkdirp(__dirname + "/logs", err => {
    if(err) { throw err; }
    var opts = {
        "logDirectory": __dirname + "/logs",
        "fileNamePattern":"<DATE>.log",
        "dateFormat":"YYYY.MM.DD"
    };
    var log = require("simple-node-logger").createRollingFileLogger(opts);

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
        log.setLevel("info");
        log.info("Current scan on ", moment().format("LTS"), " shows that ", available.length.toString(), " workers are available out of ", servers.length.toString());
    };

    // Read and parse the servers file to identify all of the workers and start up the proxy server to handle the load balancing
    fs.readFile("servers.txt", "utf8", (err, data) => {
        if(err) { 
            log.setLevel("error");
            log.info("Error thrown on " + moment().format("LTS") + ": " + err.toString());
            throw err;
        }
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
                log.setLevel("info");
                log.info("Forwarding ", url.parse(req.url).pathname, " on ", moment().format("LTS"), " to ", url.format(target));
                proxy.web(req, res, {"target": url.format(target)});
                proxy.on("error", (err, req, res) => {
                    scan(servers);
                    if(available.length > 0) {
                        target = available.shift();
                        log.setLevel("info");
                        log.info("Forwarding " + url.parse(req.url).pathname + " on " + moment().format("LTS") + " to " + url.format(target));
                        proxy.web(req, res, {"target": url.format(target)});
                    }
                    else { 
                        log.setLevel("warn");
                        log.info("On ", moment().format("llll"), " all of the workers seem to be down!");
                        res.end("<body>All of the workers are down it seems!</body>"); 
                    }
                });
                available.push(target);
            }
            else { 
                log.setLevel("warn");
                log.info("On ", moment().format("llll"), " all of the workers seem to be down!");
                res.end("<body>All of the workers are down it seems!</body>"); 
            }
        }).listen(80, () => { console.log("The server is now listening!"); });
    });
});
