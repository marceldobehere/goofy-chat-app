

function addRecMail(from, pubKey, data, type)
{
    if (!MAILS[from])
        MAILS[from] = {nickname: "", "public-key":pubKey, mails: [], unread: 0};

    if (MAILS[from]["public-key"] != pubKey)
    {
        if (MAILS[from]["public-key"])
        {
            alert('WARNING: Public key changed for user ' + from);
        }
        else
        {
            MAILS[from]["public-key"] = pubKey;
            saveEncryptedObject('MAILS', MAILS);
            updateMainMenuUserList();
        }
    }

    MAILS[from]["unread"]++;
    MAILS[from]["mails"].push({side: "left", mail: data, type:type});
    //lastShownId = -1;

    MAILS = moveKeyToTopInObject(from, MAILS);
    saveEncryptedObject('MAILS', MAILS);

    newMsgCount++;

    if (CURRENT_USER_ID == from && (currentUnread > 0 || !atBottom))
        currentUnread++;

    refresh();
}


function addSentMail(from, pubKey, data, type)
{
    if (!MAILS[from])
        MAILS[from] = {nickname: "",  "public-key":pubKey, mails: [], unread: 0};

    if (MAILS[from]["public-key"] != pubKey)
    {
        if (MAILS[from]["public-key"])
        {
            alert('WARNING: Public key changed for user ' + from);
        }
        else
        {
            MAILS[from]["public-key"] = pubKey;
            saveEncryptedObject('MAILS', MAILS);
            updateMainMenuUserList();
        }
    }


    MAILS[from]["mails"].push({side: "right", mail: data, type:type});
    MAILS = moveKeyToTopInObject(from, MAILS);
    saveEncryptedObject('MAILS', MAILS);

    newMsgCount++;
    currentUnread = 0;

    refresh();
}





async function doMailSending(user, data, type)
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
            messageSending = 0;

        setTimeout(messageSend, 60);
        return;
    }
    messageSending++;

    let user = CURRENT_USER_ID;
    let message = document.getElementById('message-input').value;
    document.getElementById('message-input').value = "";

    await doMailSending(user, message, "text");

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



function resetAllMails()
{
    MAILS = {};
    saveEncryptedObject('MAILS', MAILS);
    refresh();
}