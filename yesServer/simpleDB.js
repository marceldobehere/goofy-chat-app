const jsonDB = require('./jsonDB');


function getAllUsers()
{
    return jsonDB.readAllUsers();
}

function getUser(username)
{
    let data = getAllUsers();
    for (let usr of data)
        if (usr.username == username)
            return usr;

    return undefined;
}

function saveUser(user)
{
    let data = getAllUsers();
    for (let i = 0; i < data.length; i++)
        if (data[i].username == user.username)
        {
            data[i] = user;
            break;
        }

    jsonDB.writeAllUsers(data);
}

function removeUser(username)
{
    let data = getAllUsers();
    for (let i = 0; i < data.length; i++)
        if (data[i].username == username)
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
        if (data[i].username == user.username)
            return;

    data.push(user);
    jsonDB.writeAllUsers(data);
}

module.exports = {getAllUsers, getUser, saveUser, removeUser, addUser};