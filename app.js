var proxyServer = require('http-proxy'),
    http = require("http"),
    url = require("url"),
    fs = require("fs");
//     // port = parseInt(process.argv[2]);





// fs.readFile("servers.txt", "utf8", (err, data) => {
//     if(err) { throw err; }
//     var collection = data.split("\n"),
//         servers = [],
//         wait = collection.length;
//     collection.forEach(iter => {
//         var server = iter.split(",");
//         if(server[1].indexOf("\r") !== -1) { server[1] = server[1].substring(0, server[1].indexOf("\r")); }
//         var obj = {
//             "host": server[0],
//             "port": parseInt(server[1])
//         };
//         servers.push(server);
//         wait--;
//     });
//     if(wait == 0) {
//         // console.log(collection, servers);
//         proxyServer.createServer((req, res, proxy) => {
//             var target = servers.shift();
//             console.log(target, servers);
//             proxy.proxyRequest(req, res, target);
//             console.log(target);
//             servers.push(target);
//         }).listen(80, () => {
//             console.log("The server is now listening!");
//         });
//     }
// });


// var http = require('http'),
//     httpProxy = require('http-proxy');
// var servers =  ['http://localhost', 'http://localhost:81'];

// var proxy = httpProxy.createProxyServer();
// // var count = 0;
// http.createServer(function(req,res){
//     loadBalanceProxy(req,res);
// }).listen(8080);

// var currentServer = 1;
// function loadBalanceProxy(req, res){
//     var cur = currentServer%servers.length;
//     currentServer++;
//     var target = servers[cur];
//     proxy.web(req, res, {
//         target: target
//     });
// }

var proxy = proxyServer.createProxyServer({});




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
    // console.log(wait);
    if(wait == 0) {
        // console.log(collection, servers);

        // console.log(servers);
        // `${target.host}:${target.port}` == target.host + ":" + target.port

        // var server = http.createServer(function(req, res) {
        //       // You can define here your custom logic to handle the request
        //       // and then proxy the request.
        //     proxy.web(req, res, { target: 'http://127.0.0.1:5060' });
        // });


        http.createServer((req, res) => {
            // console.log("herro");
            var target = servers.shift();

            // console.log(req.url);
            var curURL = url.parse(req.url);
            curURL.hostname = target.host;
            curURL.port = target.port;
            curURL.protocol = "http";


            // console.log(target, target.host + ":" + target.port);
            // proxy.proxyRequest(req, res, target);
            // console.log(url.format(curURL));
            // console.log(curURL);
            console.log("path: " + curURL.path + " sending to: " + curURL.port);
            var tmp = "http:" + url.format(target);
            console.log(tmp);
            proxy.web(req, res, {"target": tmp});
            // console.log("host: " + curURL.path + " sending to: " + curURL.port);
            // console.log(target);
            servers.push(target);
        }).listen(8080, () => {
            console.log("The server is now listening!");
        });
    }
});





// var servers = [
//     {
//         host: "localhost",
//         port: 8080
//     },
//     {
//         host: "localhost",
//         port: 80
//     }
// ];

// proxyServer.createServer(function (req, res, proxy) {
//     var target = servers.shift();
//     proxy.proxyRequest(req, res, target);
//     servers.push(target);
// }).listen(port);










// var httpProxy = require('http-proxy'),
//     http = require('http'),
//     addresses;

//     // routing hash
// addresses = {
//   'localhost:8000': {
//     host: 'localhost',
//     port: 80
//   },
//   // 'localhost:8080': {
//   //   host: 'localhost',
//   //   port: 81
//   // }
//   'default': {
//     host: 'localhost',
//     port: 81
//   }
// };

// // create servers on localhost on ports specified by param
// function createLocalServer(ports) {
//   ports.forEach(function(port) {
//     http.createServer(function (req, res) {
//       res.writeHead(200, {'Content-Type': 'text/html'});
//       res.end('<h1>Hello from ' + port + '</h1');
//     }).listen(port);
//   });
//   console.log('Servers up on ports ' + ports.join(',') + '.');  
// }
// createLocalServer([80, 81]);

// console.log('======================================\nRouting table:\n---');
// Object.keys(addresses).forEach(function(from) {
//   console.log(from + ' ==> ' + addresses[from].host + ':' + addresses[from].port);
// });