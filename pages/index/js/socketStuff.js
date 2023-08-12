var socket = io();
console.log("> Global Socket Loaded");

function StringIntoRsaStringList(str, pubKey)
{
    // we need to split the string into chunks of 100 bytes
    let rawStrList = [];
    let strLen = str.length;
    for (let i = 0; i < strLen; )
    {
        let chunk = str.substring(i, i + 100);
        rawStrList.push(chunk);
        i += 100;
    }

    let rsaStrList = [];
    for (let i = 0; i < rawStrList.length; i++)
    {
        let chunk = rawStrList[i];
        let rsaChunk = encryptStr(chunk, pubKey);
        rsaStrList.push(rsaChunk);
    }

    return rsaStrList;
}

function rsaStringListIntoString(rsaStrList, privKey)
{
    let str = "";
    for (let i = 0; i < rsaStrList.length; i++)
    {
        let rsaChunk = rsaStrList[i];
        let chunk = decryptStr(rsaChunk, privKey);
        str += chunk;
    }
    return str;
}


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

function createOnReceivePromise(channel)
{
    return new Promise(resolve =>
    {
        socket.on(channel, (obj) => {
            let msg = rsaStringListIntoString(obj, ENV_CLIENT_PRIVATE_KEY);
            let msgObj = JSON.parse(msg);
            resolve(msgObj);
        });
    });
}

