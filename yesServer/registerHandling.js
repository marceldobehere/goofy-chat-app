let app;
let io;
let dbStuff;
let enc;
let socketSessionStuff;
const sec = require("./security.js");
const socketSessionManager = require("./socketSessionStuff");


function initApp(_enc, _app, _io, _dbStuff, _socketSessionStuff)
{
    socketSessionStuff = _socketSessionStuff;
    enc = _enc;
    app = _app;
    io = _io;
    dbStuff = _dbStuff;

    io.on('disconnect', (socket) => {
        console.log("S> Disconnect");
        socketSessionStuff.delete(socket);
    });

    io.on('connection', (socket) => {
        console.log("S> Connect");
        socket.on('login', (obj1) => {
            console.log("> Login");
            let obj = enc.receiveObj(obj1);
            console.log(obj);
            let action = obj["action"];

            if (action == "init")
            {
                console.log("R> Init");

                let clientPubKey = obj["public-key"];
                //console.log(`> Client public key: ${clientPubKey}`);

                let usr = dbStuff.getUserFromPublicKey(clientPubKey);
                if (!usr)
                    usr = dbStuff.createUser(clientPubKey);

                //console.log(usr);
                socketSessionStuff.createNewSession(socket, clientPubKey, usr["userId"]);

                // encrypted-text
                let decryptedText = sec.makeRandomString(10);
                console.log(`> Decrypted text: ${decryptedText}`);
                let encryptedText = enc.encryptClientStr(decryptedText, clientPubKey);
                console.log(`> Encrypted text: ${encryptedText}`);
                socket.emit("login", enc.sendObj({action: action, "encrypted-text": encryptedText, error:0}, clientPubKey));

                let session = socketSessionStuff.getSessionFromSocket(socket);
                session["decryptedText"] = decryptedText;
                socketSessionStuff.updateSession(socket, session);
                return;
            }
            else if (action == "confirm") {
                console.log("R> Confirm");
                //console.log(obj);

                let session = socketSessionStuff.getSessionFromSocket(socket);
                //console.log(session);

                if (!session)
                {
                    console.log("> Session not found");
                    //socket.emit("login", enc.sendObj({action: action, error:'Session not found'}, clientPubKey));
                    return;
                }

                let clientPubKey = session["public-key"];

                let decryptedText = session["decryptedText"];
                console.log(`> Decrypted text: ${decryptedText}`);

                let clientDecryptedText = obj["decrypted-text"];
                console.log(`> Client decrypted text: ${clientDecryptedText}`);

                if (decryptedText != clientDecryptedText)
                {
                    console.log("> Decrypted text mismatch");
                    socket.emit("login", enc.sendObj({action: action, error:'Decrypted text mismatch'}, clientPubKey));
                    return;
                }

                let userId = session["user-id"];
                console.log(`> User ID: ${userId}`);

                socket.emit("login", enc.sendObj({action: action, "user-id": userId, error:0}, clientPubKey));

                socketSessionStuff.doCallbacks();
                return;
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