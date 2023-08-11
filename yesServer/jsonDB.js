const fs = require('fs');

function readAllUsers()
{
    const data = fs.readFileSync('./data/users.json', 'utf8');
    return JSON.parse(data);
}

function writeAllUsers(users)
{
    const data = JSON.stringify(users, null, 4);
    fs.writeFileSync('./data/users.json', data, 'utf8');
}






module.exports = {readAllUsers, writeAllUsers};