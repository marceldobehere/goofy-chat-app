function _getUserAndCheckForPublicKey(from, pubKey)
{
    let user = getUserInfo(from);
    if (!user)
    {
        addUser(from);
        user = getUserInfo(from);
    }

    if (user["public-key"] != pubKey)
    {
        if (user["public-key"] != "")
        {
            console.log("WARNING: PUBLIC KEY CHANGED FOR USER " + from + "!");
            console.log("OLD: " + user["public-key"]);
            console.log("NEW: " + pubKey);
            alert(`WARNING: PUBLIC KEY CHANGED FOR USER ${from}!`);
        }
        else
        {
            user["public-key"] = pubKey;
            setUserInfo(from, user);
            updateMainMenuUserList();
        }
    }

    return user;
}

function addRecMail(from, pubKey, data, type)
{
    let user = _getUserAndCheckForPublicKey(from, pubKey);

    user["unread"]++;
    setUserInfo(from, user);

    addMailToUser(from, {side: "left", mail: data, type:type});
    //lastShownId = -1;

    userListMoveUserToTop(from);

    newMsgCount++;

    if (CURRENT_USER_ID == from && (currentUnread > 0 || !atBottom))
        currentUnread++;

    refresh();
}


function addSentMail(from, pubKey, data, type)
{
    let user = _getUserAndCheckForPublicKey(from, pubKey);

    addMailToUser(from, {side: "right", mail: data, type:type});
    userListMoveUserToTop(from);

    newMsgCount++;
    currentUnread = 0;

    refresh();
}


let tempSend = false;
async function doMailSending(user, data, type)
{
    if (tempSend)
        return;
    tempSend = true;
    await _doMailSending(user, data, type);
    unmarkAllMessages();
    tempSend = false;
}


async function _doMailSending(user, data, type)
{
    if (!user)
        user = CURRENT_USER_ID;

    if (!user || !data || !type)
        return;

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

    let pubKey = reply["public-key"];
    let enc = StringIntoRsaStringList(data, pubKey);

    replyPromise = createOnReceivePromise('mail');
    sendEncrypted('mail', {action:"send", "to": user, "mail": enc, type:type});

    reply = await replyPromise;

    if (reply["error"])
    {
        alert(`Error: ${reply["error"]}`);
        return;
    }

    addSentMail(user, pubKey, data, type);
    console.log('> MAIL SENT!');
}



let messageSending = 0;
async function messageSend()
{
    if (messageSending > 0)
    {
        messageSending++;

        if (messageSending > 20)
        {
            messageSending = 0;
            console.log("SEND MAIL ANYWAY");
        }


        setTimeout(messageSend, 60);
        return;
    }
    messageSending++;

    let user = CURRENT_USER_ID;
    let message = document.getElementById('message-input').value;
    document.getElementById('message-input').value = "";

    await doMailSending(user, message, "text");

    unmarkAllMessages();

    messageSending = 0;
}

function msgKeyPressed(event)
{
    let key = event.keyCode;
    let shift = event.shiftKey;
    if (key == 13 && !shift)
    {
        setTimeout(messageSend, 0);
        event.preventDefault();
    }
}











async function imagePastedInTextArea(event)
{
    console.log("PASTE");
    const dT = event.clipboardData || window.clipboardData;
    const file = dT.files[0];

    // check for potentially an image link
    if (!file)
    {
        let text = dT.getData('text');
        if (isImageValid(text))
        {
            if (!confirm(`Send image?`))
                return;

            await doMailSending(undefined, text, "image");

            // clear input box
            document.getElementById('message-input').value = "";
            return;
        }
    }


    if (!file)
        return;

    console.log(file);
    console.log(file.size);
    let imgData = await toBase64(file);
    console.log(imgData);

    // ask if you want to send the image
    if (!confirm(`Send image?`))
        return;

    await doMailSending(undefined, imgData, "image");
}

