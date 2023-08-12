const fs = require('fs');
const JSEncrypt = require('node-jsencrypt');

let _publicKey;
let _privateKey;


function initApp(privateKeyPath, publicKeyPath)
{
    _privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    _publicKey = fs.readFileSync(publicKeyPath, 'utf8');

    console.log('> Encryption test');
    let testStr = "Hello World!";
    //console.log(`> Test String: ${testStr}`);
    let encryptedStr = encryptStr(testStr);
    //console.log(`> Encrypted String: ${encryptedStr}`);
    let decryptedStr = decryptStr(encryptedStr);
    //console.log(`> Decrypted String: ${decryptedStr}`);
    if (testStr != decryptedStr)
    {
        console.log('> Encryption test failed');
        process.exit(1);
    }
    console.log('> Encryption test done');
    console.log();
}



function encryptClientStr(str, publicKey)
{
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPublicKey(publicKey);
    return jsEncrypt.encrypt(str);
}

function decryptStr(str)
{
    const jsEncrypt = new JSEncrypt();
    jsEncrypt.setPrivateKey(_privateKey);
    return jsEncrypt.decrypt(str);
}

function encryptStr(str)
{
    return encryptClientStr(str, _publicKey);
}

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
        let rsaChunk = encryptClientStr(chunk, pubKey);
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
        let chunk = decryptStr(rsaChunk);
        str += chunk;
    }
    return str;
}

function sendObj(obj, publicKey)
{
    let str = JSON.stringify(obj);
    //console.log(`> Sending: \"${str}\"`);
    let bruh = StringIntoRsaStringList(str, publicKey);
    //console.log(`> Sending encrypted:`);
    //console.log(bruh);
    return bruh;

    //return encryptClientStr(JSON.stringify(obj), publicKey);
}

function receiveObj(strList)
{
    let bruh = rsaStringListIntoString(strList, _privateKey);
    return JSON.parse(bruh);

    // let dec = decryptStr(str);
    // if (dec == "")
    //     return {};
    // return JSON.parse(dec);
}


module.exports = {initApp, encryptClientStr, encryptStr, decryptStr, sendObj, receiveObj};