var connectionOptions =  {
    "force new connection" : true,
    "reconnectionAttempts": "Infinity", //avoid having user reconnect manually in order to prevent dead clients after a server restart
    "timeout" : 10000, //before connect_error and connect_timeout are emitted.
    "transports" : ["websocket", "polling"]
};

if (ENV_SERVER_ADDRESS.startsWith("https://"))
    connectionOptions["secure"] = true;

var socket = io(ENV_SERVER_ADDRESS, connectionOptions);


console.log("> Global Socket Loaded");

function sendEncrypted(channel, obj)
{
    let str = JSON.stringify(obj);
    let bruh = StringIntoRsaStringList(str, ENV_SERVER_PUBLIC_KEY);
    socket.emit(channel, bruh);
}

function onReceiveEncrypted(channel, callback)
{
    socket.on(channel, (obj) => {
        let msg = rsaStringListIntoString(obj, ENV_CLIENT_PRIVATE_KEY);
        let msgObj = JSON.parse(msg);
        callback(msgObj);
    });
}

let receivePromiseDict = {};

function createOnReceivePromise(channel)
{
    if (!receivePromiseDict[channel])
    {
        socket.on(channel, (obj) => {
            //console.log(`> CHAN: ${channel}`);

            let msg = rsaStringListIntoString(obj, ENV_CLIENT_PRIVATE_KEY);
            let msgObj = JSON.parse(msg);
            receivePromiseDict[channel](msgObj);
        });
    }
    
    let temp = new Promise(resolve =>
    {
        receivePromiseDict[channel] = resolve;
    });
    return temp;
}

