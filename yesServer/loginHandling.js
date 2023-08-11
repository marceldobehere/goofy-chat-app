let app;
let io;
let sessionStuff;
let dbStuff;
const sec = require("./security.js");


function initApp(_app, _io, _sessionStuff, _dbStuff)
{
    app = _app;
    io = _io;
    sessionStuff = _sessionStuff;
    dbStuff = _dbStuff;

    io.on('connection', (socket) => {
        socket.on('login', (obj) => {
            let username = obj["username"];
            let password = obj["password"];
            if (!password)
                password = "";
            password = sec.hashString(password);
            let action = obj["action"];
            console.log(`> User Login Stuff: Action: \"${action}\", Username: \"${username}\", Password (hash): \"${password}\"`);

            if (action == "login")
            {
                let test = dbStuff.getUser(username);
                if (!test)
                    socket.emit("login", {action: action, error:"User does not exist"});
                else
                {
                    if (test.password != password) // password invalid
                        socket.emit("login", {action: action, error:"Password invalid"});
                    else
                    {
                        let _session = sessionStuff.getSessionFromUsername(username);
                        if (_session == undefined)
                            _session = sessionStuff.createNewSession(username);

                        socket.emit("login", {action: action, error:0, session:_session});
                    }
                }
            }
        });

        socket.on('logoff', (obj) => {
            let sessionId = obj["session"];
            console.log(`> User Logoff: Session: \"${sessionId}\"`);

            sessionStuff.deleteSession(sessionId);
            socket.emit("logoff", {action: "logoff", error:0});
        });
    });
}

module.exports = {initApp};