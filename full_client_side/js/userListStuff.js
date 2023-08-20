function writeAllUsers()
{
    // #users
    let userDiv = document.getElementById('users');
    userDiv.innerHTML = "";

    for (let userId in MAILS)
    {
        if (CURRENT_USER_ID == 0)
            CURRENT_USER_ID = userId;


        let userName = MAILS[userId]["nickname"];
        if (!userName || userName == "")
            userName = userId;

        let userBtn = document.createElement("button");
        userBtn.className += "item user ";
        if (userId == CURRENT_USER_ID)
            userBtn.className += "user-active ";
        userBtn.innerText = userName;
        userBtn.onclick = () => {userClicked(userId, userBtn)};
        userBtn.oncontextmenu = () => {userRightClicked(userId, userBtn); return false;};
        userBtn.onauxclick = () => {userMiddleClicked(userId, event);};

        let unread = MAILS[userId]["unread"];
        if (unread > 0)
        {
            let unreadDiv = document.createElement("div");
            unreadDiv.className = "unread";
            unreadDiv.innerText = unread;
            userBtn.append(unreadDiv);
        }


        userDiv.append(userBtn);
    }
}

function userClicked(user, btn)
{
    //console.log(`USER CLICKED: ${user}`);

    showMailsForUser(user);
}

function userRightClicked(user, element)
{
    //console.log(`USER RIGHT CLICKED: ${user}`);
    showMailsForUser(user);

    let nickname = prompt("Enter nickname for user", MAILS[user]["nickname"], "");
    if (nickname == null)
        return;

    MAILS[user]["nickname"] = nickname;
    saveEncryptedObject('MAILS', MAILS);
    refresh();
}

function userMiddleClicked(user, event)
{
    //console.log(`USER MIDDLE CLICKED: ${user}`);

    if (event["button"] != 1)
        return;

    let userName = MAILS[user]["nickname"];
    if (!userName || userName == "")
        userName = user;

    // ask if you want to delete all mails from this user
    if (confirm(`Delete \"${userName}\"?`))
    {
        delete MAILS[user];
        saveEncryptedObject('MAILS', MAILS);
        refresh();
    }
}

async function addUserClick() {
    // add new user by id
    let user = prompt("Enter user id of person you want to add", "");
    if (!user)
        return;

    if (MAILS[user])
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

    MAILS[user] = {nickname: "", mails: [], unread: 0};
    CURRENT_USER_ID = user;
    saveEncryptedObject('MAILS', MAILS);
    refresh();
}