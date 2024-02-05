



function userListWriteAllUsers()
{
    let users = getAllUsers();
    for (let userId of users)
    {
        if (CURRENT_USER_ID == 0)
            CURRENT_USER_ID = userId;

        userListAddUser(userId, false);
    }

    updateAllUsers();
}

function userListAddUser(userId, update)
{
    let usersDiv = document.getElementById('users');

    let userInfo = getUserInfo(userId);

    let username = userInfo["nickname"];
    if (!username || username == "")
        username = userId;

    let userBtn = document.createElement("button");
    userBtn.id = `USER_${userId}`;
    userBtn.className = "item user ";

    userBtn.onclick = () => {userClicked(userId, userBtn)};
    userBtn.oncontextmenu = () => {userRightClicked(userId, userBtn); return false;};
    userBtn.onmouseup = () => {userMiddleClicked(userId, event);};

    let userSpan = document.createElement("span");
    userSpan.id = `USER-NAME_${userId}`;
    userSpan.className = "";
    userSpan.textContent = username;
    userBtn.appendChild(userSpan);

    let unreadDiv = document.createElement("div");
    unreadDiv.id = `USER-UNREAD_${userId}`;
    unreadDiv.className = "unread";
    unreadDiv.textContent = "0";
    unreadDiv.style.display = "none";
    userBtn.appendChild(unreadDiv);

    usersDiv.appendChild(userBtn);

    if (update == undefined || update == true)
        updateAllUsers();
}

function userListUserExistsInDiv(userId)
{
    let userBtn = document.getElementById(`USER_${userId}`);
    return userBtn != null;
}

function userListRemoveUser(user)
{
    if (!userListUserExistsInDiv(user))
        return;

    let usersDiv = document.getElementById('users');
    let userBtn = document.getElementById(`USER_${user}`);

    usersDiv.removeChild(userBtn);
}
function userListMoveUserToTop(userId)
{
    if (!userListUserExistsInDiv(userId))
        userListAddUser(userId, false);

    let usersDiv = document.getElementById('users');
    let userBtn = document.getElementById(`USER_${userId}`);

    usersDiv.removeChild(userBtn);
    usersDiv.insertBefore(userBtn, usersDiv.firstChild);

    let users = getAllUsers();
    moveValueToTopInArray(userId+"", users);
    setAllUsers(users);

    updateAllUsers();
}

function updateAllUsers()
{
    let users = getAllUsers();
    for (let userId of users)
    {
        if (CURRENT_USER_ID == 0)
            CURRENT_USER_ID = userId;

        let userInfo = getUserInfo(userId);

        // update username
        let username = userInfo["nickname"];
        if (!username || username == "")
            username = userId;

        let userSpan = document.getElementById(`USER-NAME_${userId}`);
        userSpan.textContent = username;

        // update unread
        let unreadDiv = document.getElementById(`USER-UNREAD_${userId}`);
        unreadDiv.textContent = userInfo["unread"];
        if (userInfo["unread"] > 0)
            unreadDiv.style.display = "inline";
        else
            unreadDiv.style.display = "none";

        // update active user
        let userBtn = document.getElementById(`USER_${userId}`);
        if (userId == CURRENT_USER_ID)
            userBtn.className = "item user user-active";
        else
            userBtn.className = "item user";
    }
}



async function userClicked(user, btn)
{
    //console.log(`USER CLICKED: ${user}`);

    await showMailsForUser(user);
}

function userRightClicked(user, element)
{
    //console.log(`USER RIGHT CLICKED: ${user}`);
    //showMailsForUser(user);

    let userInfo = getUserInfo(user);

    let nickname = prompt("Enter nickname for user", userInfo["nickname"], "");
    if (nickname == null)
        return;

    userInfo["nickname"] = nickname;
    setUserInfo(user, userInfo);
    refresh();
}

function userMiddleClicked(user, event)
{
    //console.log(`USER MIDDLE CLICKED: ${user}`);

    if (event["button"] != 1)
        return;

    let userInfo = getUserInfo(user);
    let userName = userInfo["nickname"];
    if (!userName || userName == "")
        userName = user;

    // ask if you want to delete the user
    if (confirm(`Delete \"${userName}\"?`))
    {

        userListRemoveUser(user);
        removeUser(user);
        clearChatWindow();
        if (CURRENT_USER_ID == user)
            CURRENT_USER_ID = 0;
        refresh();
    }
}

async function addUserClick() {
    // add new user by id
    let user = prompt("Enter user id of person you want to add", "");
    if (!user)
        return;

    if (getUserInfo(user))
    {
        alert("User already exists!");
        return;
    }

    let replyPromise;
    let reply;

    // send the server your public key
    replyPromise = createOnReceivePromise('mail');
    sendEncrypted('mail', {"action":"req-pub-key", "user-id": user});
    reply = await replyPromise;

    if (reply["error"])
    {
        alert(`Error: ${reply["error"]}`);
        return;
    }

    addUser(user);
    userListAddUser(user, true);
    CURRENT_USER_ID = user;
    refresh();
}