let app;
let io;
let dbStuff;
let enc;
let socketSessionStuff;
const sec = require("./security.js");
const socketSessionManager = require("./socketSessionStuff");
const fs = require("fs");

function logWithTime(str)
{
    console.log(`[${new Date().toLocaleString()}] ${str}`);
}

let globalMailList = [];

function tempCallback()
{
    sendAllMailsPossible();
}

function backUpMailList()
{
    try
    {
        let savedMails = JSON.stringify(globalMailList);
        // save file to /data/mails.txt
        fs.writeFileSync(__dirname + "/../data/mails_backup.txt", savedMails);
        logWithTime(`> Backed up Mails to \"${__dirname + "/../data/mails_backup.txt"}\"`);
    }
    catch (e)
    {
        logWithTime(`> Error while backing up mails: ${e}`);
    }
}

function initApp(_enc, _app, _io, _dbStuff, _socketSessionStuff)
{
    socketSessionStuff = _socketSessionStuff;
    enc = _enc;
    app = _app;
    io = _io;
    dbStuff = _dbStuff;

    if (fs.existsSync(__dirname + "/../data//mails_backup.txt"))
    {
        let fileData = fs.readFileSync(__dirname + "/../data//mails_backup.txt", 'utf-8');
        let mails = JSON.parse(fileData);
        for (let mail of mails)
            globalMailList.push(mail);

        console.log(`> Loaded Mails from \"${__dirname + "/../data//mails_backup.txt"}\"`);
    }
    setInterval(backUpMailList, 1000 * 60 * 60 * 1); // every hour

    socketSessionStuff.newSocketCallbacks.push(tempCallback);

    io.on('connection', (socket) => {
        socket.on('mail', (obj1) => {
            try
            {
                //console.log("> Mail");
                let obj = enc.receiveObj(obj1);
                //console.log(obj);

                if (!obj)
                {
                    console.log("> Error while parsing JSON");
                    return;
                }

                if (!obj["action"])
                {
                    console.log("> No Action");
                    return;
                }

                let action = obj["action"];


                if (action == "req-pub-key")
                {
                    logWithTime("M> Request public key");
                    let session = socketSessionStuff.getSessionFromSocket(socket);
                    if (!session)
                    {
                        console.log("> Session not found");
                        return;
                    }

                    let clientPubKey = session["public-key"];
                    let usrId = obj["user-id"];
                    let usr = dbStuff.getUser(usrId);
                    if (!usr)
                    {
                        socket.emit("mail", enc.sendObj({action: action, error: "User does not exist"}, clientPubKey));
                        console.log("> User not found");
                        return;
                    }

                    let pubKey = usr["public-key"];
                    socket.emit("mail", enc.sendObj({action: action, "public-key": pubKey, error: 0}, clientPubKey));
                    return;
                }
                else if (action == "send")
                {
                    logWithTime("M> Send Mail");
                    //console.log(obj);

                    let session = socketSessionStuff.getSessionFromSocket(socket);
                    if (!session)
                    {
                        console.log("> Session not found");
                        return;
                    }

                    let clientPubKey = session["public-key"];
                    let usr = dbStuff.getUser(session["user-id"]);
                    if (!usr)
                    {
                        socket.emit("mail", enc.sendObj({action: action, error: "You do not exist"}, clientPubKey));
                        console.log("> User not found");
                        return;
                    }

                    let mail =
                        {
                            to: obj["to"],
                            from: usr["userId"],
                            "public-key": usr["public-key"], // this is the public key of the sender
                            mail: obj["mail"],
                            type: obj["type"],
                            sig: obj["sig"],
                            date: new Date()
                        };

                    let mailSize = JSON.stringify(mail).length;
                    //console.log(mailSize);
                    if (mailSize > 500000)
                    {
                        socket.emit("mail", enc.sendObj({action: action, error: "Mail Size is over 500KB"}, clientPubKey));
                        console.log(`> Mail size is over 500KB (${mailSize})`);
                        return;
                    }

                    globalMailList.push(mail);

                    socket.emit("mail", enc.sendObj({action: action, error: 0}, clientPubKey));

                    sendAllMailsPossible();
                    return;
                }
            }
            catch (e)
            {
                logWithTime(`> Error while handling mail: ${e}`);
            }


        });
    });
}

function deleteOldMails()
{
    // will remove all mails older than a week

    let now = new Date();
    let week = 1000 * 60 * 60 * 24 * 7;
    let weekAgo = new Date(now.getTime() - week);

    for (let i = 0; i < globalMailList.length; i++)
    {
        let mail = globalMailList[i];
        if (mail["date"] < weekAgo)
        {
            globalMailList.splice(i, 1);
            i--;
        }
    }
}

function getMailsForUser(userId, remove)
{
    let mails = [];
    for (let i = 0; i < globalMailList.length; i++)
    {
        let mail = globalMailList[i];
        if (mail["to"] == userId)
        {
            mails.push(mail);
            if (remove)
            {
                globalMailList.splice(i, 1);
                i--;
            }
        }
    }

    return mails;
}

let tempMail = false;
function sendAllMailsPossible()
{
    if (tempMail)
        return;
    tempMail = true;
    // go through all active sockets and send all mails possible
    // if a mail is sent, remove it from the list

    //console.log("BEFORE");
    //console.log(globalMailList);

    deleteOldMails();

    let sockets = socketSessionManager.getFullSocketList();
    for (let i = 0; i < sockets.length; i++)
    {
        let socket = sockets[i];
        let session = socketSessionStuff.getSessionFromSocket(socket);
        if (!session)
            continue;
        //console.log(`Session found: ${JSON.stringify(session)}`);

        let usr = dbStuff.getUser(session["user-id"]);
        if (!usr)
            continue;
        let pubKey = usr["public-key"];
        //console.log(`User found: ${JSON.stringify(usr)}`);

        let mails = getMailsForUser(usr["userId"], true);
        if (mails.length == 0)
            continue;
        //console.log(`Mails found: ${JSON.stringify(mails)}`);

        for (let mail of mails)
        {
            logWithTime("M> Sending mail to " + usr["userId"]);
            socket.emit("mailRec", enc.sendObj({action: "rec", "mail": mail["mail"], "from": mail["from"], type:mail["type"], sig:mail["sig"], "public-key": mail["public-key"]}, session["public-key"]));

        }
    }


    //console.log("AFTER");
    //console.log(globalMailList);

    tempMail = false;
}

module.exports = {initApp, sec, globalMailList, backUpMailList, logWithTime};