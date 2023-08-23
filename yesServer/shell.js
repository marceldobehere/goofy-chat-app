const sec = require("./security");
let dbStuff;
let registerManager;
let calcServiceManager;
let mailManager;
const fs = require("fs");

function stringify(obj)
{
    var cache = [];
    let res = JSON.stringify(obj, (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (cache.includes(value)) return;
            cache.push(value);
        }
        return value;
    });
    cache = null;
    return res;
}



function initApp(_dbStuff, _registerManager, _calcServiceManager, _mailManager)
{
    dbStuff = _dbStuff;
    registerManager = _registerManager;
    calcServiceManager = _calcServiceManager;
    mailManager = _mailManager;
}

const _readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

async function readLine()
{
    let promise = new Promise((resolve, reject) => {
        _readline.question("", (answer) => {
            resolve(answer);
        });
    });

    return promise;
}


async function start()
{
    console.log("> Shell started!");
    while (true)
    {
        const cmd = await readLine();
        if (cmd.startsWith("/exit"))
        {
            console.log("> Exiting...");
            process.exit(0);
            continue;
        }
        else if (cmd.startsWith("/reload calc services") || cmd.startsWith("/rel calc"))
        {
            calcServiceManager.reloadAllCalcServices();
            console.log("> Reloaded all calc services!");
            continue;
        }
        else if (cmd.startsWith("/show all mails"))
        {
            console.log(mailManager.globalMailList);
            continue;
        }
        else if (cmd.startsWith("/save all mails"))
        {
            let savedMails = JSON.stringify(mailManager.globalMailList);
            // save file to /data/mails.txt
            fs.writeFileSync(__dirname + "/../data/mails.txt", savedMails);
            console.log(`> Saved Mails to \"${__dirname + "/../data/mails.txt"}\"`);
            continue;
        }
        else if (cmd.startsWith("/load all mails"))
        {
            // clear mail array
            // load data from /data/mails.txt
            // parse data
            // add mails to mail array

            if (!cmd.startsWith("/load all mails add"))
                mailManager.globalMailList.length = 0;

            let fileData = fs.readFileSync(__dirname + "/../data/mails.txt", 'utf-8');
            let mails = JSON.parse(fileData);
            for (let mail of mails)
                mailManager.globalMailList.push(mail);

            console.log(`> Loaded Mails from \"${__dirname + "/../data/mails.txt"}\"`);
            continue;
        }

        // else if (cmd.startsWith("/show all users"))
        // {
        //     console.log("> Showing all users...");
        //     let users = dbStuff.getAllUsers();
        //     for (let user of users)
        //     {
        //         console.log(` - ${user["username"]} (${user["email"]})`);
        //     }
        //     continue;
        // }
        // else if (cmd.startsWith("/show online users"))
        // {
        //     console.log("> Showing online users...");
        //     let sessions = sessionStuff.sessionList;
        //     for (let session of sessions)
        //     {
        //         let username = session[1]["username"];
        //         let user = dbStuff.getUser(username);
        //         console.log(` - ${user["username"]} (${user["email"]})`);
        //     }
        //     continue;
        // }
        // else if (cmd.startsWith("/show all sessions full"))
        // {
        //     console.log("> Showing all sessions...");
        //     let sessions = sessionStuff.sessionList;
        //     for (let session of sessions)
        //     {
        //         let username = session[1]["username"];
        //         let user = dbStuff.getUser(username);
        //         console.log(` - ${session[0]}: ${user["username"]} (${user["email"]}) - ${session[1]["socket"] ? "[socketStuff]" : "[no socketStuff]"}`);
        //     }
        //     continue;
        // }
        // else if (cmd.startsWith("/show all sessions"))
        // {
        //     console.log("> Showing all sessions...");
        //     let sessions = sessionStuff.sessionList;
        //     for (let session of sessions)
        //     {
        //         let username = session[1]["username"];
        //         let user = dbStuff.getUser(username);
        //         console.log(` - ${session[0]}: ${user["username"]} (${user["email"]})`);
        //     }
        //     continue;
        // }
        //
        // else if (cmd.startsWith("/hash "))
        // {
        //     let args = cmd.split(" ");
        //     let hash = registerManager.sec.hashString(args[1]);
        //     console.log(`> Hash: ${hash}`);
        //     continue;
        // }
        // else if (cmd.startsWith("/kick session "))
        // {
        //     let args = cmd.split(" ");
        //     let session = parseInt(args[2]);
        //     if (sessionStuff.sessionList.has(session))
        //     {
        //         sessionStuff.deleteSession(session);
        //         console.log(`> Session ${session} kicked!`);
        //     }
        //     else
        //         console.log(`> Session ${session} not found!`);
        //     continue;
        // }

        console.log('> Invalid command!');
    }
}

module.exports = {initApp, start};