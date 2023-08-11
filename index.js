const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.setMaxListeners(1000);

var socketList = [];

var socketDict = new Map();

app.get('/', (req, res) => {
    res.redirect('/index/index.html');
});


app.get('/*', (req, res) => {
    let url = req.url;
    //console.log(`URL START: \"${url}\"`);
    if (url.startsWith('/shared/'))
    {

    }
    else
    {
        if (url.indexOf(".") == -1)
        {
            //console.log(` A URL: \"${url}\"`);
            //console.log(` B URL: \"${url + url}\"`);
            res.redirect(url + url + ".html");
            return;
        }
        //url = url + url + ".html";
        url = "/pages" + url;
    }

    url = url.replace("..", "");
    //console.log(`URL END: \"${url}\"`);
    if (url.indexOf("?") != -1)
        url = url.substring(0, url.indexOf("?"));// url.split("?")[0];


    res.sendFile(__dirname + url);
});




const sessionStuff = require("./yesServer/sessionStuff.js");
sessionStuff.initApp(app, io);

const dbStuff = require("./yesServer/simpleDB.js");

const loginManager = require("./yesServer/loginHandling");
loginManager.initApp(app, io, sessionStuff, dbStuff);

const registerManager = require("./yesServer/registerHandling");
registerManager.initApp(app, io, sessionStuff, dbStuff);

const shell = require("./yesServer/shell");
shell.initApp(sessionStuff, dbStuff, loginManager, registerManager);

server.listen(80, () => {
    console.log('listening on *:80');
});

shell.start();