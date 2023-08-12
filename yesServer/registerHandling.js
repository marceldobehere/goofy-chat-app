let app;
let io;
let dbStuff;
let enc;
const sec = require("./security.js");


function initApp(_enc, _app, _io, _dbStuff)
{
    enc = _enc;
    app = _app;
    io = _io;
    dbStuff = _dbStuff;

    io.on('connection', (socket) => {
        socket.on('login', (obj1) => {
            console.log("> Login");
            let obj = enc.receiveObj(obj1);
            console.log(obj);
            let action = obj["action"];
            if (action == "init")
            {
                let clientPubKey = obj["public-key"];
                console.log(`> Client public key: ${clientPubKey}`);
                socket.emit("login", enc.sendObj({action: 'A', error:'BRUHUS SERVUS'}, clientPubKey));
            }



            // let username = obj["username"];
            // let email = obj["email"];
            // let password = obj["password"];
            // if (!password)
            //     password = "";
            // password = sec.hashString(password);
            // let action = obj["action"];
            // console.log(`> User Register Stuff: Action: \"${action}\", Username: \"${username}\", Password (hash): \"${password}\"`);
            //
            // if (action == "register")
            // {
            //     let test = dbStuff.getUser(username);
            //     if (test != undefined)
            //         socket.emit("register", {action: action, error:"User already exists"});
            //     else
            //     {
            //         dbStuff.addUser({username:username, email:email, password:password,'profile-pic':"default"});
            //         socket.emit("register", {action: action, error:0});
            //     }
            // }
        });
    });
}

module.exports = {initApp, sec};