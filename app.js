// Define the necessary variables
var proxyServer = require('http-proxy'),
    http = require("http"),
    url = require("url"),
    fs = require("fs"),
    proxy = proxyServer.createProxyServer({});

// Read and parse the servers file to identify all of the workers and start up the proxy server to handle the load balancing
fs.readFile("servers.txt", "utf8", (err, data) => {
    if(err) { throw err; }
    var collection = data.split("\n"),
        servers = [],
        wait = collection.length;
    collection.forEach(iter => {
        var server = iter.split(",");
        if(server[1].indexOf("\r") !== -1) { server[1] = server[1].substring(0, server[1].indexOf("\r")); }
        var obj = {
            "hostname": server[0],
            "port": server[1]
        };
        servers.push(obj);
        wait--;
    });
    if(wait == 0) {
        http.createServer((req, res) => {
            var target = servers.shift();
            proxy.web(req, res, {"target": "http:" + url.format(target)});
            servers.push(target);
        }).listen(80, () => {
            console.log("The server is now listening!");
        });
    }
});