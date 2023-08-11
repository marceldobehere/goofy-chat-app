let app;
let io;

let sessions = new Map();

function getSessionFromUsername(username)
{
    //console.log(sessions);
    for (let [key, value] of sessions)
    {
        if (value["username"] == username)
            return key;
    }
    return undefined;
}

function getSessionFromId(sessionId)
{
    //console.log(sessions);
    for (let [key, value] of sessions)
    {
        if (key == sessionId)
            return value;
    }
    return undefined;
}

function getSessionFromSocket(socketId)
{
    //console.log(sessions);
    for (let [key, value] of sessions)
    {
        if (value["socket"] == socketId)
            return {id: key, session: value};
    }
    return undefined;
}

function getUserNameFromSession(sessionId)
{
    let obj = sessions.get(sessionId);
    if (!obj)
        return undefined;
    return obj["username"];
}

function deleteSession(sessionId)
{
    if (sessions.has(sessionId))
        sessions.delete(sessionId);
}

function _createSession(sessionId, username)
{
    sessions.set(sessionId,
        {
            "username":username,
            "socket": undefined,
            "hosting-room": undefined,
            "joined-room": undefined
        });
}

function updateSession(sessionId, session)
{
    sessions.set(sessionId, session);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    for (let i = Math.random()*25; i >= 0; i--)
        Math.random();
    return Math.floor(Math.random() * (max - min + 1) + min);;
}

function createNewSession(username)
{
    while (sessions.size < 5000)
    {
        let session = getRandomIntInclusive(1000000000, 9999999999);
        if (sessions.has(session))
            continue;
        _createSession(session, username);
        //console.log(sessions);
        return session;
    }
}



function initApp(_app, _io)
{
    app = _app;
    io = _io;

    //_createSession(1234, "gnome");
}

module.exports = {initApp, getUserNameFromSession, getSessionFromSocket, deleteSession, getSessionFromId, updateSession, _createSession, createNewSession, getSessionFromUsername, getRandomIntInclusive,sessionList:sessions};