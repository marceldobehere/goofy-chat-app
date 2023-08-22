var generateKeys = function ()
{
    var crypt = new JSEncrypt();
    crypt.getKey();

    return {"public": crypt.getPublicKey(), "private": crypt.getPrivateKey()};
};

function testRsa()
{
    let testStr1 = 'Hello, world!';

    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(ENV_CLIENT_PUBLIC_KEY);
    let encrypted = encrypt.encrypt(testStr1);

    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(ENV_CLIENT_PRIVATE_KEY);
    let testStr2 = decrypt.decrypt(encrypted);

    if (testStr2 == testStr1)
        return true;

    alert('RSA CHECK FAILED!');
    return false;
}

function testAes()
{
    let testStr1 = 'Hello, world!';

    let encrypted = CryptoJS.AES.encrypt('Hello, world!', ENV_CLIENT_PRIVATE_KEY);

    let testStr2 = CryptoJS.AES.decrypt(encrypted, ENV_CLIENT_PRIVATE_KEY).toString(CryptoJS.enc.Utf8);

    if (testStr1 == testStr2)
        return true;


    alert('AES CHECK FAILED!');
    return false;
}

function testKeys()
{
    let work = true;
    work &= testRsa();
    work &= testAes();

    if (work)
        console.log("> Encryption with keys works");
    else
        console.log("> Encryption with keys is broken :(");

    return work;
}

function resetKeys()
{
    let keys = generateKeys();
    ENV_CLIENT_PUBLIC_KEY = keys["public"];
    ENV_CLIENT_PUBLIC_KEY_HASH = hashString(ENV_CLIENT_PUBLIC_KEY);
    ENV_CLIENT_PRIVATE_KEY = keys["private"];

    saveObject('CLIENT_KEYS', keys);
}

let _encrypt = new JSEncrypt();
function encryptStr(str, publicKey)
{
    _encrypt.setPublicKey(publicKey);
    return _encrypt.encrypt(str);
}


let _decrypt = new JSEncrypt();
function decryptStr(str, privateKey)
{
    _decrypt.setPrivateKey(privateKey);
    return _decrypt.decrypt(str);
}

function encryptClientStr(str)
{
    return encryptStr(str, ENV_CLIENT_PUBLIC_KEY);
}

function decryptClientStr(str)
{
    return decryptStr(str, ENV_CLIENT_PRIVATE_KEY);
}

function StringIntoRsaStringList(str, pubKey)
{
    if (!pubKey)
    {
        alert(`Error: StringIntoRsaStringList() called with no public key!`);
        return [];
    }
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
    if (!privKey)
    {
        alert(`Error: rsaStringListIntoString() called with no private key!`);
        return "";
    }

    let str = "";
    for (let i = 0; i < rsaStrList.length; i++)
    {
        let rsaChunk = rsaStrList[i];
        let chunk = decryptStr(rsaChunk, privKey);
        str += chunk;
    }
    return str;
}

async function StringIntoRsaStringListAsync(str, pubKey)
{
    if (!pubKey)
    {
        alert(`Error: StringIntoRsaStringList() called with no public key!`);
        return [];
    }
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
        await delay(10);
        rsaStrList.push(rsaChunk);
    }

    return rsaStrList;
}

async function rsaStringListIntoStringAsync(rsaStrList, privKey)
{
    if (!privKey)
    {
        alert(`Error: rsaStringListIntoString() called with no private key!`);
        return "";
    }

    let str = "";
    for (let i = 0; i < rsaStrList.length; i++)
    {
        let rsaChunk = rsaStrList[i];
        let chunk = decryptStr(rsaChunk, privKey);

        await delay(10);
        str += chunk;
    }
    return str;
}