let app;
let io;
let newSocketCallbacks = [];
let sessions = new Map();

function getSessionFromPublicKey(pKey) {
    for (let [key, value] of sessions)
        if (value["public-key"] == pKey)
            return key;

    return undefined;
}

function getSessionFromSocket(socket) {
    for (let [key, value] of sessions)
        if (key == socket)
            return value;

    return undefined;
}

function getPublicKeyFromSocket(socket) {
    let obj = sessions.get(socket);
    if (!obj)
        return undefined;
    return obj["public-key"];
}

function getUserIdFromSocket(socket) {
    let obj = sessions.get(socket);
    if (!obj)
        return undefined;
    return obj["user-id"];
}

function getUserIdFromPublicKey(pKey) {
    let obj = getSessionFromPublicKey(pKey);
    if (!obj)
        return undefined;
    return obj["user-id"];
}

function deleteSession(socket) {
    if (sessions.has(socket))
        sessions.delete(socket);
}

function _createSession(socket, pKey, _userId) {
    sessions.set(socket,
        {
            "public-key": pKey,
            "user-id": _userId
        });
}

function updateSession(socket, data) {
    sessions.set(socket, data);
}


function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    for (let i = Math.random() * 25; i >= 0; i--)
        Math.random();
    return Math.floor(Math.random() * (max - min + 1) + min);
    ;
}

function createNewSession(socket, pKey, _userId) {
    if (sessions.has(socket))
        deleteSession(socket);

    _createSession(socket, pKey, _userId);

}

function doCallbacks()
{
    for (let callback of newSocketCallbacks)
        callback();
}

function removeDeadSockets()
{
    //console.log("Removing dead sockets");
    // go through every session and check if socket is alive

    for (let [key, value] of sessions)
    {
        //console.log(`Checking socket: ${key.id}`);
        if (!key.connected)
        {
            //console.log(`Removing socket: ${key.id}`);
            sessions.delete(key);
        }
    }
}

function getFullSocketList()
{
    removeDeadSockets();

    return Array.from(sessions.keys());
}


function initApp(_app, _io) {
    app = _app;
    io = _io;

    //_createSession(1234, "gnome");
}

module.exports = {
    initApp,
    createNewSession,
    deleteSession,
    getSessionFromSocket,
    getSessionFromPublicKey,
    getPublicKeyFromSocket,
    getUserIdFromSocket,
    getUserIdFromPublicKey,
    updateSession,
    getRandomIntInclusive,
    getFullSocketList,
    newSocketCallbacks,
    doCallbacks
};