const express = require('express');
const app = express();
const http = require('http');
const https = require('https');
var cors = require('cors');
const fs = require('fs');



// if /data folder doesnt exist, create it

if (!fs.existsSync(__dirname + "/data"))
{
    fs.mkdirSync(__dirname + "/data");

    // add empty users.json
    fs.writeFileSync(__dirname + "/data/users.json", "[]");
}

const USE_HTTPS = true;

if (USE_HTTPS && !fs.existsSync(__dirname + "/data/ssl"))
{
    console.log("SSL FOLDER DOESNT EXIST");
    console.log("> Either host the server using http (set USE_HTTPS to false) or create the ssl keys.");
    console.log();
    console.log("To create the ssl keys, open a terminal in the data folder and run the following commands:");
    console.log("mkdir ssl");
    console.log("cd ssl");
    console.log("openssl genrsa -out key.pem");
    console.log("openssl req -new -key key.pem -out csr.pem");
    console.log("openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem");
    return;
}


var server;
if (!USE_HTTPS)
    server = http.createServer(app);
else
    server = https.createServer(
        {
            key: fs.readFileSync(__dirname + "/data/ssl/key.pem"),
            cert: fs.readFileSync(__dirname + "/data/ssl/cert.pem"),
        },
        app);

const { Server } = require("socket.io");
const io = new Server(server);

io.setMaxListeners(1000);

const calcServiceDict = {};


app.get('/', (req, res) => {
    res.redirect('/index/index.html');
});

app.get('/*', cors(), (req, res) => {
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
        res.bodyUsed = true;
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

const calcServiceManager = require('./yesServer/calcServiceManager.js');
calcServiceManager.initStuff(__dirname, calcServiceDict);
calcServiceManager.reloadAllCalcServices();

const shell = require("./yesServer/shell");
shell.initApp(dbStuff, registerManager, calcServiceManager);



server.listen(80, () => {
    console.log('listening on *:80');
});

shell.start();