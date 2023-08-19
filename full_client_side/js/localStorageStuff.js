function loadObject(key)
{
    let temp = localStorage.getItem(key);
    if (!temp)
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
    if (!temp)
        return null;

    temp = JSON.parse(temp);
    temp = rsaStringListIntoString(temp, ENV_CLIENT_PRIVATE_KEY);
    return JSON.parse(temp);
}

function saveEncryptedObject(key, obj)
{
    let temp = JSON.stringify(obj);
    temp = StringIntoRsaStringList(temp, ENV_CLIENT_PRIVATE_KEY);
    temp = JSON.stringify(temp);
    localStorage.setItem(key, temp);
}