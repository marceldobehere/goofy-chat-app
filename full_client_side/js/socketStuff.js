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

function addSocketListenerIfNeeded(channel)
{
    if (!receivePromiseDict[channel])
    {
        receivePromiseDict[channel] = [];

        socket.on(channel, (obj) => {
            //console.log(`> CHAN: ${channel}`);

            let msg = rsaStringListIntoString(obj, ENV_CLIENT_PRIVATE_KEY);
            let msgObj = JSON.parse(msg);
            if (receivePromiseDict[channel].length < 1)
            {
                if (receiveCallBackDict[channel])
                    receiveCallBackDict[channel](msgObj);
                else
                    alert(`> ERROR: No callback for channel ${channel}`);
                return;
            }

            //console.log(receivePromiseDict[channel]);
            //console.log("< POPPING PROMISE")
            receivePromiseDict[channel].pop()(msgObj);
        });
    }
}

function onReceiveEncrypted(channel, callback)
{
    addSocketListenerIfNeeded(channel);

    receiveCallBackDict[channel] = callback;
}

let receivePromiseDict = {};
let receiveCallBackDict = {};

function createOnReceivePromise(channel)
{
    addSocketListenerIfNeeded(channel);
    
    let temp = new Promise(resolve =>
    {
        //console.log("> PUSHING PROMISE");
        receivePromiseDict[channel].push(resolve);
    });
    return temp;
}

