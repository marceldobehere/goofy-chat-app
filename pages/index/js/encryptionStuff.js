var generateKeys = function ()
{
    var sKeySize = $('#key-size').attr('data-value');
    var keySize = parseInt(sKeySize);

    var crypt = new JSEncrypt({default_key_size: keySize});
    crypt.getKey();

    return {"public": crypt.getPublicKey(), "private": crypt.getPrivateKey()};
};

function testKeys()
{
    let testStr1 = 'Hello, world!';

    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(ENV_CLIENT_PUBLIC_KEY);
    let encrypted = encrypt.encrypt(testStr1);

    // Decrypt with the private key...
    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(ENV_CLIENT_PRIVATE_KEY);
    let testStr2 = decrypt.decrypt(encrypted);

    // Now a simple check to see if the round-trip worked.
    if (testStr2 == testStr1)
        return true;
    else
    {
        alert('Something went wrong....');
        return false;
    }
}

function resetKeys()
{
    let keys = generateKeys();
    ENV_CLIENT_PUBLIC_KEY = keys["public"];
    ENV_CLIENT_PRIVATE_KEY = keys["private"];

    saveObject('CLIENT_KEYS', keys);
}

function encryptStr(str, publicKey)
{
    let encrypt = new JSEncrypt();
    encrypt.setPublicKey(publicKey);
    return encrypt.encrypt(str);
}

function decryptStr(str, privateKey)
{
    let decrypt = new JSEncrypt();
    decrypt.setPrivateKey(privateKey);
    return decrypt.decrypt(str);
}

function encryptClientStr(str)
{
    return encryptStr(str, ENV_CLIENT_PUBLIC_KEY);
}

function decryptClientStr(str)
{
    return decryptStr(str, ENV_CLIENT_PRIVATE_KEY);
}
