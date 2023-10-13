function loadObject(key)
{
    let temp = localStorage.getItem(key);
    if (temp == null)
        return null;

    return JSON.parse(temp);
}

function saveObject(key, obj)
{
    localStorage.setItem(key, JSON.stringify(obj));
}


function loadEncryptedObject(key)
{
    let temp = localStorage.getItem(key);
    if (temp = null)
        return null;

    //console.log(`RSA> Loading \"${key}\" - ${temp.length} bytes`);
    temp = JSON.parse(temp);
    temp = rsaStringListIntoString(temp, ENV_CLIENT_PRIVATE_KEY);

    return JSON.parse(temp);
}

function saveEncryptedObject(key, obj)
{
    let temp = JSON.stringify(obj);
    temp = StringIntoRsaStringList(temp, ENV_CLIENT_PRIVATE_KEY);
    temp = JSON.stringify(temp);
    //console.log(`RSA> Saving \"${key}\" - ${temp.length} bytes`);
    localStorage.setItem(key, temp);
}

function aesEncrypt(dec)
{
    return CryptoJS.AES.encrypt(dec, ENV_CLIENT_PRIVATE_KEY).toString();
}

function aesDecrypt(enc)
{
    return CryptoJS.AES.decrypt(enc, ENV_CLIENT_PRIVATE_KEY).toString(CryptoJS.enc.Utf8);
}

function loadAesEncryptedObject(key)
{
    let temp = localStorage.getItem(key);
    if (temp == null)
        return null;

    //console.log(`AES> Loading \"${key}\" - ${temp.length} bytes`);
    temp = aesDecrypt(temp, ENV_CLIENT_PRIVATE_KEY);
    return JSON.parse(temp);
}

function saveAesEncryptedObject(key, obj)
{
    let temp = JSON.stringify(obj);
    temp = aesEncrypt(temp);

    //console.log(`AES> Saving \"${key}\" - ${temp.length} bytes`);
    localStorage.setItem(key, temp);
}