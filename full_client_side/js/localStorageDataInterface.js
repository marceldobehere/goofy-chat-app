// Localstorage will look like this
// USER_[USER ID] -> user data object
// MAILS_[USER ID] -> mails array
// IMAGES_[USER ID] -> images object (key: image id, value: image data)
// USERS -> array of user ids

// this will provide a cached interface for loading and writing data to localstorage

let _USER_DATA = {};
let _MAILS = {};
let _IMAGES = {};
let _USERS = [];

// make user list actually stored in another localstorage thing to preserve order

function initUserList()
{
    _USERS = _loadUsers();
}

function clearAllData()
{
    _USER_DATA = {};
    _MAILS = {};
    _IMAGES = {};
    _USERS = [];

    localStorage.clear();
}

function removeUser(userId)
{
    removeMailsFromUser(userId);
    removeImagesFromUser(userId);
    removeUserInfo(userId);

    if (_USERS.includes(userId+""))
    {
        _USERS.splice(_USERS.indexOf(userId+""), 1);
        saveAesEncryptedObject(`USERS`, _USERS);
    }
}

function addUser(userId)
{
    addUserInfo(userId);
    initMailsForUser(userId);
    initImagesForUser(userId);

    if (!_USERS.includes(userId+""))
    {
        _USERS.push(userId+"");
        saveAesEncryptedObject(`USERS`, _USERS);
    }
}

function removeUserInfo(userId)
{
    if (localStorage.getItem(`USER_${userId}`))
        localStorage.removeItem(`USER_${userId}`);

    if (_USERS.includes(userId+""))
    {
        _USERS.splice(_USERS.indexOf(userId+""), 1);
        saveAesEncryptedObject(`USERS`, _USERS);
    }
}

function removeMailsFromUser(userId)
{
    if (localStorage.getItem(`MAILS_${userId}`))
        localStorage.removeItem(`MAILS_${userId}`);

    if (_MAILS[userId+""])
        delete _MAILS[userId+""];
}

function removeImagesFromUser(userId)
{
    if (localStorage.getItem(`IMAGES_${userId}`))
        localStorage.removeItem(`IMAGES_${userId}`);

    if (_IMAGES[userId+""])
        delete _IMAGES[userId+""];
}

function _loadUsers()
{
    let users = loadAesEncryptedObject(`USERS`);
    if (!users)
    {
        users = [];
        saveAesEncryptedObject(`USERS`, users);
    }
    return users;
}

function getAllUsers()
{
    return _USERS;
}

function setAllUsers(users)
{
    _USERS = users;
    saveAesEncryptedObject(`USERS`, users);
}

function getUserInfo(userId)
{
    if (!_USER_DATA[userId+""])
        _USER_DATA[userId+""] = loadAesEncryptedObject(`USER_${userId}`);

    return _USER_DATA[userId+""];
}

function setUserInfo(userId, info)
{
    _USER_DATA[userId+""] = info;
    saveAesEncryptedObject(`USER_${userId}`, info);

    if (!_USERS.includes(userId+""))
    {
        _USERS.push(userId+"");
        saveAesEncryptedObject(`USERS`, _USERS);
    }
}

function addUserInfo(userId)
{
    let info =
        {
            userId: userId,
            nickname: "",
            unread: 0,
            "public-key": ""
        };

    setUserInfo(userId+"", info);
}

function initMailsForUser(userId)
{
    if (!_MAILS[userId+""])
        _MAILS[userId+""] = [];

    if (!loadAesEncryptedObject(`MAILS_${userId}`))
        saveAesEncryptedObject(`MAILS_${userId}`, _MAILS[userId+""]);
}

function initImagesForUser(userId)
{
    if (!_IMAGES[userId+""])
        _IMAGES[userId+""] = {};

    if (!loadAesEncryptedObject(`IMAGES_${userId}`))
        saveAesEncryptedObject(`IMAGES_${userId}`, _IMAGES[userId+""]);
}



function getAllMailsFromUser(userId)
{
    if (!_MAILS[userId+""])
    {
        _MAILS[userId+""] = loadAesEncryptedObject(`MAILS_${userId}`);
    }

    return _MAILS[userId+""];
}

function addMailToUser(userId, mail)
{
    let mails = getAllMailsFromUser(userId);
    mails.push(mail);
    saveAesEncryptedObject(`MAILS_${userId}`, mails);
}

function removeMailFromUser(userId, mailId)
{
    let mails = getAllMailsFromUser(userId);
    for (let i = 0; i < mails.length; i++)
        if (mails[i].id == mailId)
        {
            mails.splice(i, 1);
            break;
        }

    saveAesEncryptedObject(`MAILS_${userId}`, mails);
}


function getImage(userId, imageId)
{
    if (!_IMAGES[userId+""])
        _IMAGES[userId+""] = loadAesEncryptedObject(`IMAGES_${userId}`);

    return _IMAGES[userId+""][imageId+""];
}

function setImage(userId, imageId, image)
{
    if (!_IMAGES[userId+""])
        _IMAGES[userId+""] = loadAesEncryptedObject(`IMAGES_${userId}`);

    _IMAGES[userId+""][imageId+""] = image;
    saveAesEncryptedObject(`IMAGES_${userId}`, _IMAGES[userId+""]);
}

function removeImage(userId, imageId)
{
    if (!_IMAGES[userId+""])
        _IMAGES[userId+""] = loadAesEncryptedObject(`IMAGES_${userId}`);

    delete _IMAGES[userId+""][imageId+""];
    saveAesEncryptedObject(`IMAGES_${userId+""}`, _IMAGES[userId+""]);
}