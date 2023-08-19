if (!ENV_SERVER_PUBLIC_KEY)
{
    alert('something went wrong :(');
}


// for now the keys will be stored in localStorage
{
    let clientKeys = loadObject('CLIENT_KEYS');
    if (clientKeys)
    {
        ENV_CLIENT_PUBLIC_KEY = clientKeys["public"];
        ENV_CLIENT_PRIVATE_KEY = clientKeys["private"];
    }
    else
    {
        resetKeys();
    }
}

if (!testKeys())
{
    resetKeys();
}

{
    let mails = loadEncryptedObject('MAILS');
    if (mails)
        MAILS = mails;
    else
        MAILS = {};
}

console.log(ENV_SERVER_PUBLIC_KEY);
console.log(ENV_CLIENT_PUBLIC_KEY);
//console.log(ENV_CLIENT_PRIVATE_KEY);

console.log(MAILS);


async function getUserId()
{
    console.log('Getting USER ID');

    let replyPromise;
    let reply;

    // send the server your public key
    replyPromise = createOnReceivePromise('login');
    sendEncrypted('login', {"action":"init", "public-key": ENV_CLIENT_PUBLIC_KEY});

    reply = await replyPromise;

    //console.log('REPLY');
    //console.log(reply);

    if (reply["error"])
    {
        alert(`Error: ${reply["error"]}`);
        return;
    }

    // the server will send you back some encrypted text
    let encryptedText = reply["encrypted-text"];

    //console.log('ENCRYPTED TEXT');
    //console.log(encryptedText);

    // decrypt the text with your private key (DECRYPTED TEXT IS 10 CHARS LONG)
    let decryptedText = decryptStr(encryptedText, ENV_CLIENT_PRIVATE_KEY);
    if (!decryptedText || decryptedText.length != 10)
    {
        alert('Error: Server sent invalid check text');
        return;
    }

    //console.log('DECRYPTED TEXT');
    //console.log(decryptedText);

    // you send back the decrypted text
    replyPromise = createOnReceivePromise('login');
    sendEncrypted('login', {"action":"confirm", "decrypted-text": decryptedText});
    reply = await replyPromise;

    //console.log('FINAL REPLY');
    //console.log(reply);

    // the server will send you back your user id or an error
    if (reply["error"])
    {
        alert(`Error: ${reply["error"]}`);
        return;
    }

    ENV_USER_ID = reply["user-id"];
    console.log(`USER ID: ${ENV_USER_ID}`);

    let userIdSpan = document.getElementById('user-id');
    userIdSpan.innerText = ENV_USER_ID;
    userIdSpan.onclick = () => {navigator.clipboard.writeText(ENV_USER_ID);};
}

getUserId();

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



function chatScroll()
{
    let mailBox = document.getElementById('mails');

    let tempLastScrollY = mailBox.scrollHeight - mailBox.scrollTop;

    if (Math.abs(lastScrollY - tempLastScrollY) > 200)
    {
        showMailsForUser(CURRENT_USER_ID);
    }
    else
    {
        let user = CURRENT_USER_ID;

        if (!user)
            return;
        if (!MAILS[user])
            return;

        atBottom = tempLastScrollY - mailBox.offsetHeight < 50;
        if (MAILS[user]["unread"] != 0 && atBottom)
        {
            MAILS[user]["unread"] = 0;
            saveEncryptedObject('MAILS', MAILS);
            writeAllUsers();
        }
    }
}

let lastShownId = -1;
let lastScrollY = 0;
let newMsgCount = 0;
let atBottom = true;
let currentUnread = 0;
function showMailsForUser(user)
{
    let mailBox = document.getElementById('mails');

    lastScrollY = mailBox.scrollHeight - mailBox.scrollTop;
    //console.log(lastScrollY);
    //console.log(lastScrollY - mailBox.clientHeight);
    atBottom = lastScrollY - mailBox.offsetHeight < 50;

    // #mails
    mailBox.innerHTML = "";

    CURRENT_USER_ID = 0;

    if (!user)
        return;

    if (!MAILS[user])
        return;

    CURRENT_USER_ID = user;

    let mails = MAILS[user]["mails"];


    if (lastShownId != user)
        currentUnread = MAILS[user]["unread"];
    //console.log(`CURRENT UNREAD: ${currentUnread}`);

    let tUnread = currentUnread;
    for (let i = mails.length - 1; i >= 0; i--)
    {
        let mailThing = mails[i];
        let mail = mailThing["mail"];
        let side = mailThing["side"];

        let mailDiv = document.createElement("div");
        mailDiv.className = `item mail side-${side} `;
        mailDiv.innerText = mail;

        if (tUnread > 0)
        {
            mailDiv.className += "new-mail ";
            tUnread--;
        }

        mailBox.prepend(mailDiv);

        if (newMsgCount > 0)
        {
            newMsgCount--;
            if (!atBottom)
            {
                let amt = mailDiv.clientHeight + 11;
                //console.log(`ADDING ${amt} to scroll`);
                lastScrollY += amt;
            }
        }

        if (lastShownId != user)
        {
            if (mailBox.offsetHeight * 1.5 < mailBox.scrollHeight)
                break;
        }
        else
        {
            if (lastScrollY + mailBox.offsetHeight * 1.5 < mailBox.scrollHeight)
                break;
        }

    }

    if (lastShownId != user)
    {
        lastShownId = user;
        mailBox.scrollTop = mailBox.scrollHeight;
    }
    else
    {
        mailBox.scrollTop = mailBox.scrollHeight - lastScrollY;

    }
    lastScrollY = mailBox.scrollHeight - mailBox.scrollTop;


    document.getElementById('message-input').focus();

    if (MAILS[user]["unread"] != 0 && atBottom)
    {
        MAILS[user]["unread"] = 0;
        saveEncryptedObject('MAILS', MAILS);
    }

    writeAllUsers();
}

function refresh()
{
    writeAllUsers();
    showMailsForUser(CURRENT_USER_ID);
}


function moveKeyToTopInObject(key, obj)
{
    let value = obj[key];
    delete obj[key];

    let newObj = {};
    newObj[key] = value;

    let first = true;
    for (let k in obj)
    {
        if (first)
        {
            if (key == k)
                return obj;
            first = false;
        }
        newObj[k] = obj[k];
    }

    return newObj;
}


function addRecMail(from, mail)
{
    if (!MAILS[from])
        MAILS[from] = {nickname: "", mails: [], unread: 0};

    MAILS[from]["unread"]++;
    MAILS[from]["mails"].push({side: "left", mail: mail});
    //lastShownId = -1;

    MAILS = moveKeyToTopInObject(from, MAILS);
    saveEncryptedObject('MAILS', MAILS);

    newMsgCount++;

    if (CURRENT_USER_ID == from && (currentUnread > 0 || !atBottom))
        currentUnread++;

    refresh();
}


function addSentMail(from, mail)
{
    if (!MAILS[from])
        MAILS[from] = {nickname: "", mails: [], unread: 0};

    MAILS[from]["mails"].push({side: "right", mail: mail});
    MAILS = moveKeyToTopInObject(from, MAILS);
    saveEncryptedObject('MAILS', MAILS);

    newMsgCount++;
    currentUnread = 0;

    refresh();
}

onReceiveEncrypted('mail', (obj) => {

    if (!obj || obj["action"] != "rec")
        return;

    console.log('MAIL RECEIVED');
    //console.log(obj);

    let from = obj["from"];
    let mailEnc = obj["mail"];
    let mail = rsaStringListIntoString(mailEnc, ENV_CLIENT_PRIVATE_KEY);

    //console.log(`FROM: ${from}`);
    //console.log(`MAIL: ${mail}`);

    addRecMail(from, mail);

    refresh();
});


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
function resetAllMails()
{
    MAILS = {};
    saveEncryptedObject('MAILS', MAILS);
    refresh();
}



let messageSending = false;
async function messageSend()
{
    if (messageSending)
    {
        setTimeout(messageSend, 60);
        return;
    }
    messageSending = true;

    let user = CURRENT_USER_ID;
    let message = document.getElementById('message-input').value;
    document.getElementById('message-input').value = "";

    if (!user || !message)
    {
        messageSending = false;
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
        messageSending = false;
        return;
    }

    let pubKey = reply["public-key"];
    let enc = StringIntoRsaStringList(message, pubKey);

    replyPromise = createOnReceivePromise('mail');
    sendEncrypted('mail', {action:"send", "to": user, "mail": enc});

    reply = await replyPromise;

    if (reply["error"])
    {
        alert(`Error: ${reply["error"]}`);
        messageSending = false;
        return;
    }

    addSentMail(user, message);
    console.log('> MAIL SENT!');
    messageSending = false;
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


refresh();
//addRecMail('4840604893320', 'mail1');
//addRecMail('6460427106832', 'mail44');
//addSentMail('user5', 'testo');

console.log(`MAIL SIZE: ${localStorage.getItem('MAILS').length}`)



function chatRightClick(event)
{
    if (event["button"] != 2)
        return;

    user = CURRENT_USER_ID;

    if (!MAILS[user])
        return;

    let userName = MAILS[user]["nickname"];
    if (!userName || userName == "")
        userName = user;

    // ask if you want to delete the chat with this user
    if (confirm(`Delete all mails from \""${userName}?\"`))
    {
        MAILS[user]["mails"] = [];
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

alert("Yo, you should not be using the client served by the server. Please open the file locally or use the one hosted on the github");
window.location.href = "https://marceldobehere.github.io/goofy-chat-app/full_client_side/";