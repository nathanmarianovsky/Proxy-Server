<h1 align=center>Proxy-Server</h1>


# Table of Contents

- [Setting Up](#setting-up)
- [Purpose of the Server and Setting Up the Workers](#purpose-of-the-server-and-setting-up-the-workers)
- [Running the Server](#running-the-server)


# Setting Up
I have to assume that you have npm and git installed and so in order to get started first copy the repository over to your local machine. Inside the root directory of the project as administrator run:
```js
npm install
```
This will handle the installation of all node_modules.


# Purpose of the Server and Setting Up the Workers
This server is intended to handle the load balancing for a given app that has multiple workers running the same code. In essense you want all of your traffic to hit the proxy server and let it delegate the work among its workers. To provide your workers open the "servers.txt" file and change:
```
hostname1,port1
```
to
```
mywebsite.com,80
```
for each worker you have, with no restriction on how many workers you can have. In the case where a worker dies, the app continues running given there some workers remaining and every set interval the server rechecks the workers. Specifically on the line"
```js
setInterval(() => { scan(servers); }, 1000 * 60);
```
you can change "60" to however many seconds you want the server to wait until it rechecks. With "60" seconds, the default wait time is "1" minute. If it happens that all of the workers are dead, the proxy server will respond with:
```
All of the workers are down it seems!
```


# Running the Server
If you want to change the port of the proxy-server simply change "80" to whatever you want at "app.js":
```js
}).listen(80, () => {
    console.log("The server is now listening!");
});
```
and to run the server simply run:
```js
node app.js
```
as an administrator in the root directory. If you see:
```
The server is now listening!
```
the server has officially been launched and is listening on the port you provided.