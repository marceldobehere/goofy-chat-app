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

console.log(ENV_CLIENT_PUBLIC_KEY);
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

async function doServerInit()
{
    updateMainMenuUserList();
    updateMainMenu();

    setTimeout(updateServerStatus, 100);

    setInterval(updateServerStatus, 1000);
}

function getSocketStatus()
{
    if (!socket)
        return false;

    if (!socket.connected)
        return false;

    if (socket.disconnected)
        return false;

    return true;
}

function getServerStatus()
{
    if (!ENV_SERVER_PUBLIC_KEY)
        return false;

    if (!ENV_USER_ID || ENV_USER_ID == 0)
        return false;

    if (!getSocketStatus())
        return false;

    return true;
}

async function tryReconnect()
{
    if (!ENV_SERVER_PUBLIC_KEY)
    {
        let serverPubKeyFetch = await fetch(ENV_SERVER_ADDRESS + "/calc/public_key.js");

        let serverPubKey = await serverPubKeyFetch.text();
        ENV_SERVER_PUBLIC_KEY = serverPubKey;
    }


    if (!ENV_SERVER_PUBLIC_KEY)
    {
        alert('something went wrong :(');
        return;
    }

    await getUserId();
}

let oldStatus = false;
async function updateServerStatus()
{
    let status = getServerStatus();
    if ((!status && getSocketStatus()) || (status && !oldStatus))
    {
        console.log("> Trying to reconnect.");
        await tryReconnect();
        messageSending = 0;
        status = getServerStatus();
        updateMainMenuUserList();
    }
    oldStatus = status;
    //console.log(`SERVER STATUS: ${status}`);

    let statusDiv = document.getElementById('server-status');
    statusDiv.innerText = status ? "online" : "offline";
    statusDiv.className = status ? "server-online" : "server-offline";
}

doServerInit();



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


function addRecMail(from, pubKey, mail)
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
    MAILS[from]["mails"].push({side: "left", mail: mail});
    //lastShownId = -1;

    MAILS = moveKeyToTopInObject(from, MAILS);
    saveEncryptedObject('MAILS', MAILS);

    newMsgCount++;

    if (CURRENT_USER_ID == from && (currentUnread > 0 || !atBottom))
        currentUnread++;

    refresh();
}


function addSentMail(from, pubKey, mail)
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
    let fromPubKey = obj["public-key"];

    //console.log(`FROM: ${from}`);
    //console.log(`MAIL: ${mail}`);

    addRecMail(from, fromPubKey, mail);

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

    if (!user || !message)
    {
        messageSending = 0;
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
        messageSending = 0;
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
        messageSending = 0;
        return;
    }

    addSentMail(user, pubKey, message);
    console.log('> MAIL SENT!');
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


refresh();
//addRecMail('4840604893320', 'mail1');
//addRecMail('6460427106832', 'mail44');
//addSentMail('user5', 'testo');

if (localStorage.getItem('MAILS'))
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

function mainMenuOpen()
{
    updateMainMenu();

    // add menu-shown class to main-menu if it doesnt have it and remove menu-hidden class if it has it
    let mainMenu = document.getElementById('main-menu');
    mainMenu.className = mainMenu.className.replace(' menu-hidden', '');

    if (mainMenu.className.includes('menu-shown'))
        return;

    mainMenu.className += ' menu-shown';
}

function mainMenuClose()
{
    // add menu-hidden class to main-menu if it doesnt have it and remove menu-shown class if it has it
    let mainMenu = document.getElementById('main-menu');
    mainMenu.className = mainMenu.className.replace(' menu-shown', '');

    if (mainMenu.className.includes('menu-hidden'))
        return;

    mainMenu.className += ' menu-hidden';
}


function serverAddressChange()
{
    let addr = prompt("Enter server address", ENV_SERVER_ADDRESS);
    if (!addr)
        return;

    if (!addr.startsWith("http://") && !addr.startsWith("https://"))
        addr = "http://" + addr;

    if (addr.endsWith("/"))
        addr = addr.substring(0, addr.length - 1);

    ENV_SERVER_ADDRESS = addr;
    saveObject("SERVER_ADDR", ENV_SERVER_ADDRESS);

    location.reload();
}

function exportProfile()
{
    alert('Not implemented yet :(');
}

function importProfile()
{
    alert('Not implemented yet :(');
}

function deleteProfile()
{
    if (!confirm("Are you sure you want to delete everything?"))
        return;

    if (!confirm("Ya really sure??"))
        return;

    resetKeys();
    MAILS = {};
    saveEncryptedObject('MAILS', MAILS);
    location.reload();
}

function updateMainMenuUserList()
{
    /*
    <div class="main-menu-user-list-user">
        <p>User 1 (ID USER_ID_HERE)</p>
        <pre>PUBLIC_KEY_HERE</pre>
    </div>
    */

    let userList = document.getElementById('main-menu-user-list');

    userList.innerHTML = "";

    for (let userId in MAILS)
    {
        let username = MAILS[userId]["nickname"];
        if (!username || username == "")
            username = userId;

        let userDiv = document.createElement("div");
        userDiv.className = "main-menu-user-list-user";

        let userP = document.createElement("p");
        if (username == userId)
            userP.innerText = username;
        else
            userP.innerText = `${username} (ID ${userId})`;

        let userPre = document.createElement("pre");
        userPre.innerText = MAILS[userId]["public-key"];
        userPre.style.display = "block";

        userDiv.append(userP);
        userDiv.append(userPre);
        userList.append(userDiv);
    }
}


function updateMainMenu()
{
    let clientPubKey = document.getElementById('main-menu-client-public-key');
    clientPubKey.innerText = ENV_CLIENT_PUBLIC_KEY;

    let serverPubKey = document.getElementById('main-menu-server-public-key');
    serverPubKey.innerText = ENV_SERVER_PUBLIC_KEY;

    let serverAddr = document.getElementById('main-menu-server-address');
    serverAddr.innerText = ENV_SERVER_ADDRESS;
}

function openCrossCheckMenu()
{
    alert('Not implemented yet :(');
}