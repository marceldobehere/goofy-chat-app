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

    temp = decryptClientStr(temp);
    return JSON.parse(temp);
}

function saveEncryptedObject(key, obj)
{
    let temp = JSON.stringify(obj);
    temp = encryptClientStr(temp);

    localStorage.setItem(key, temp);
}