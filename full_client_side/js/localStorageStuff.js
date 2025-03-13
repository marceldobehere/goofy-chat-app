const ENV_LS_OFFSET = "__GOOFY_CHAT_v1__";

function LsHas(key) {
    return localStorage.getItem(ENV_LS_OFFSET + key) !== null;
}

function LsGet(key) {
    return localStorage.getItem(ENV_LS_OFFSET + key);
}

function LsSet(key, value) {
    localStorage.setItem(ENV_LS_OFFSET + key, value);
}

function LsDel(key) {
    localStorage.removeItem(ENV_LS_OFFSET + key);
}

function LsReset() {
    let keys = LsGetAll();
    for (let i = 0; i < keys.length; i++)
        LsDel(keys[i].key);
}

function LsGetAll() {
    let keys = [];
    for (let i = 0; i < localStorage.length; i++)
        if (localStorage.key(i).startsWith(ENV_LS_OFFSET)) {
            const key = localStorage.key(i).substring(ENV_LS_OFFSET.length);
            keys.push({ key: key, value: localStorage.getItem(localStorage.key(i)) });
        }
    return keys;
}


function loadObject(key)
{
    let temp = LsGet(key);
    if (temp == null)
        return null;

    return JSON.parse(temp);
}

function saveObject(key, obj)
{
    LsSet(key, JSON.stringify(obj));
}


function loadEncryptedObject(key)
{
    let temp = LsGet(key);
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
    LsSet(key, temp);
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
    let temp = LsGet(key);
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
    LsSet(key, temp);
}