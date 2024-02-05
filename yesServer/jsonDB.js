const fs = require('fs');

let tempUsers = undefined;

function readAllUsers()
{
    if (tempUsers === undefined)
        tempUsers = fs.readFileSync('./data/users.json', 'utf8');

    return JSON.parse(tempUsers);
}

function writeAllUsers(users)
{
    tempUsers = JSON.stringify(users, null, 4);
    fs.writeFileSync('./data/users.json', tempUsers, 'utf8');
}


module.exports = {readAllUsers, writeAllUsers};