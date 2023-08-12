const jsonDB = require('./jsonDB');


function getAllUsers()
{
    return jsonDB.readAllUsers();
}

function getUser(userId)
{
    let data = getAllUsers();
    for (let usr of data)
        if (usr.userId == userId)
            return usr;

    return undefined;
}

function getUserFromPublicKey(pKey)
{
    let data = getAllUsers();
    for (let usr of data)
        if (usr["public-key"] == pKey)
            return usr;

    return undefined;
}

function saveUser(user)
{
    let data = getAllUsers();
    for (let i = 0; i < data.length; i++)
        if (data[i].userId == user.userId)
        {
            data[i] = user;
            break;
        }

    jsonDB.writeAllUsers(data);
}

function removeUser(userId)
{
    let data = getAllUsers();
    for (let i = 0; i < data.length; i++)
        if (data[i].userId == userId)
        {
            data.splice(i, 1);
            break;
        }

    jsonDB.writeAllUsers(data);
}

function addUser(user)
{
    let data = getAllUsers();
    for (let i = 0; i < data.length; i++)
        if (data[i].userId == user.userId)
            return;

    data.push(user);
    jsonDB.writeAllUsers(data);
}

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    for (let i = Math.random() * 25; i >= 0; i--)
        Math.random();
    return Math.floor(Math.random() * (max - min + 1) + min);
    ;
}

function createUser(publicKey)
{
    let user = getUserFromPublicKey(publicKey);
    if (user)
        return user;

    let userId = getRandomIntInclusive(1000000, 9999999999999);
    while (getUser(userId))
        userId = getRandomIntInclusive(1000000, 9999999999999);

    user = {
        "userId": userId,
        "public-key": publicKey
    };

    addUser(user);
    return user;
}

module.exports = {getAllUsers, getUser, saveUser, removeUser, addUser, createUser, getUserFromPublicKey};