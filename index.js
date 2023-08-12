const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.setMaxListeners(1000);

const calcServiceDict = {};

const calcServiceManager = require('./yesServer/calcServiceManager.js');
calcServiceManager.initStuff(__dirname, calcServiceDict);
calcServiceManager.reloadAllCalcServices();


app.get('/', (req, res) => {
    res.redirect('/index/index.html');
});

app.get('/*', (req, res) => {
    let url = req.url;
    //console.log(`URL START: \"${url}\"`);
    if (url.startsWith('/shared/'))
    {

    }
    else if (url.startsWith('/calc/'))
    {
        let calcPath = url.substring("/calc/".length);
        let calcName = calcPath;
        if (calcName.indexOf('?') != -1)
            calcName = calcName.substring(0, calcName.indexOf('?'));
        //console.log(`CALC NAME: \"${calcName}\"`);
        let calcService = calcServiceDict[calcName];
        // calcservice is a function that gets optional url parameters an returns a string which will get sent as the file

        let paramStr = calcPath.substring(calcName.length + 1);
        // example: bruh=123&yes=true

        let params = {};
        let paramList = paramStr.split("&");
        for (let i = 0; i < paramList.length; i++)
        {
            let param = paramList[i];
            let key = param.substring(0, param.indexOf("="));
            let value = param.substring(param.indexOf("=") + 1);
            params[key] = value;
        }

        //console.log(`PARAMS: ${JSON.stringify(params)}`);
        let result = calcService(params);
        res.send(result);
        return;
    }
    else
    {
        if (url.indexOf(".") == -1)
        {
            res.redirect(url + url + ".html");
            return;
        }
        url = "/pages" + url;
    }

    url = url.replace("..", "");

    if (url.indexOf("?") != -1)
        url = url.substring(0, url.indexOf("?"));

    res.sendFile(__dirname + url);
});


const dbStuff = require("./yesServer/simpleDB.js");

const encryptionStuff = require("./yesServer/encryptionStuff.js");
const keyPath = __dirname + "/data/";
encryptionStuff.initApp(keyPath+"private-key.txt", keyPath+"public-key.txt");

const socketSessionStuff = require("./yesServer/socketSessionStuff.js");
socketSessionStuff.initApp(encryptionStuff, io, dbStuff);

const registerManager = require("./yesServer/registerHandling");
registerManager.initApp(encryptionStuff, app, io, dbStuff, socketSessionStuff);

const mailManager = require("./yesServer/mailHandling");
mailManager.initApp(encryptionStuff, app, io, dbStuff, socketSessionStuff);

const shell = require("./yesServer/shell");
shell.initApp(dbStuff, registerManager, calcServiceManager);

server.listen(80, () => {
    console.log('listening on *:80');
});

shell.start();