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

function addAnyMail(from, mail)
{
    if (mail["type"] == "image")
    {
        // check if it's an image link or raw data
        // if link then add the image link thing
        // if raw data, then add it to the image localstorage object
        // send a mail with a link to the image localstorage object
        //console.log("> GOT IMG");
        let id;
        do
        {
            id = getRandomIntInclusive(1000000000, 99999999999999);
        } while (getImage(from, id))
        //console.log(`ID: ${id}`);

        setImage(from, id, mail["mail"]);

        let isLink = false;
        //console.log(mail);
        let mailData = mail["mail"]["data"];
        // add check for image links
        if (mailData.startsWith("http://") || mailData.startsWith("https://"))
            isLink = true;

        mail["mail"] = {link:isLink, user:from, id:id};

        addMailToUser(from, mail);
    }
    else if (mail["type"] == "file")
    {
        //console.log("> GOT FILE");
        let id;
        do
        {
            id = getRandomIntInclusive(1000000000, 99999999999999);
        } while (getImage(from, id))
        console.log(`ID: ${id}`);

        setImage(from, id, mail["mail"]);

        mail["mail"] = {link:false, user:from, id:id};

        addMailToUser(from, mail);
    }
    else
    {
        addMailToUser(from, mail);
    }
}

function addRecMail(from, pubKey, data, type)
{
    let user = _getUserAndCheckForPublicKey(from, pubKey);

    user["unread"]++;
    setUserInfo(from, user);

    addAnyMail(from, {side: "left", mail: data, type:type});

    //lastShownId = -1;

    userListMoveUserToTop(from);

    newMsgCount++;

    if (CURRENT_USER_ID == from && (currentUnread > 0 || !atBottom))
    {
        currentUnread++;
    }

    let username = user["nickname"];
    if (!username || username == "")
        username = from;

    let notifData = data;
    if (type == "image")
        notifData = "<Image>";
    else if (type == "file")
        notifData = "<File>";

    if ((!windowVisible() && !canNotify()) || CURRENT_USER_ID != from)
    {
        playNotificationSound();
    }

    showNotification(username, notifData, () => {
        showMailsForUser(from);
    });

    refresh();
}


function addSentMail(from, pubKey, data, type)
{
    let user = _getUserAndCheckForPublicKey(from, pubKey);

    addAnyMail(from, {side: "right", mail: data, type:type});
    //addMailToUser(from, {side: "right", mail: data, type:type});
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
    let enc = StringIntoRsaStringList(JSON.stringify(data), pubKey);
    let sig = createSignature(data, ENV_CLIENT_PRIVATE_KEY);

    replyPromise = createOnReceivePromise('mail');
    sendEncrypted('mail', {action:"send", to: user, mail: enc, type:type, sig:sig});

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
        if (await isImageValid(text))
        {
            if (!confirm(`Send image?`))
                return;

            await doMailSending(undefined, {name: "text", data: text}, "image");

            // clear input box
            document.getElementById('message-input').value = "";
            return;
        }
    }


    if (!file)
        return;

    //console.log(file.name);
    //console.log(file.size);
    let imgData = await toBase64(file);
    //console.log(imgData);

    let isImg = await isImageValid(imgData);
    //console.log(isImg);

    // ask if you want to send the image
    if (!confirm(`Send ${(isImg ? "image" : "file")}?`))
        return;

    await doMailSending(undefined, {name: file.name, data: imgData}, (isImg ? "image" : "file"));
}

