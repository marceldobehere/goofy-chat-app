function chatScroll()
{
    showMailsForUser(CURRENT_USER_ID);

    // let mailBox = document.getElementById('mails');
    // let tempLastScrollY = mailBox.scrollHeight - mailBox.scrollTop;
    // let bottom = tempLastScrollY - mailBox.offsetHeight < 50;
    //
    //
    // showMailsForUser(CURRENT_USER_ID);
    //
    // //console.log(`SCROLL: ${tempLastScrollY}`);
    // //console.log(`BOTTOM: ${bottom}`);
}



let lastShownId = -1;
let lastScrollY = 0;
let newMsgCount = 0;
let atBottom = true;
let currentUnread = 0;
let lastUserId = -1;

let MSG_BOTTOM_INDEX = 0;
let MSG_TOP_INDEX = 0;
let MSG_LENGTH = 0;



function clearChatWindow()
{
    let mailBox = document.getElementById('mails');
    mailBox.innerHTML = "";

    lastShownId = -1;
    lastScrollY = 0;
    newMsgCount = 0;
    atBottom = true;
    currentUnread = 0;
    lastUserId = CURRENT_USER_ID;

    MSG_BOTTOM_INDEX = -1;
    MSG_TOP_INDEX = -1;
    MSG_LENGTH = 0;

    console.log("CLEARING CHAT WINDOW");
}

function addMailBlock(mailThing, container, bottom)
{
    //console.log(mailThing);
    let mail = mailThing["mail"];
    let side = mailThing["side"];
    let mailType = mailThing["type"];
    if (!mailType)
        mailType = "text";

    let mailDiv = document.createElement("div");
    mailDiv.className = `item mail side-${side} `;
    if (mailType == "text")
        mailDiv.innerText = mail;
    else if (mailType == "image")
    {
        if (ENV_AUTOLOAD_IMAGES)
        {
            let img = document.createElement("img");
            img.src = mail;
            img.oncontextmenu = (event) =>
            {
                event.stopPropagation();
                return true;
            };


            img.style.display = "block";
            if (side == "left")
                img.style.marginRight = "max";
            else
                img.style.marginLeft = "auto";
            mailDiv.append(img);
        }
        else
        {
            mailDiv.innerText = `<NOT LOADED IMAGE>`;
        }
    }
    else
        mailDiv.innerText = `<${mailType}> ${mail}`;

    if (bottom)
        container.append(mailDiv);
    else
        container.prepend(mailDiv);

    return mailDiv;
}





let doingScroll = false;
function showMailsForUser(user)
{
    if (doingScroll)
        return;
    doingScroll = true;
    _showMailsForUser(user)
    doingScroll = false;
}

function _showMailsForUser(user)
{
    CURRENT_USER_ID = 0;

    if (!user)
        return;

    let userInfo = getUserInfo(user);
    if (!userInfo)
        return;

    CURRENT_USER_ID = user;

    if (CURRENT_USER_ID != lastUserId)
        clearChatWindow();


    let mailBox = document.getElementById('mails');


    // lastScrollY = mailBox.scrollHeight - mailBox.scrollTop;
    // //console.log(lastScrollY);
    // //console.log(lastScrollY - mailBox.clientHeight);
    // atBottom = lastScrollY - mailBox.offsetHeight < 50;


    let tempLastScrollY = mailBox.scrollHeight - mailBox.scrollTop;
    let bottom = tempLastScrollY - mailBox.offsetHeight < 50;


    let mails = getAllMailsFromUser(user);

    if (lastShownId != user)
        currentUnread = userInfo["unread"];
    //console.log(`CURRENT UNREAD: ${currentUnread}`);

    if (MSG_BOTTOM_INDEX == -1)
    {
        MSG_BOTTOM_INDEX = 0;
        MSG_TOP_INDEX = 0;
        MSG_LENGTH = mails.length;
    }


    if (mails.length < MSG_LENGTH)
    {
        clearChatWindow();
        return;
    }
    else if (mails.length > MSG_LENGTH)
    {
        let diff = mails.length - MSG_LENGTH;
        MSG_BOTTOM_INDEX += diff;
        MSG_TOP_INDEX += diff;
        MSG_LENGTH = mails.length;
    }

    // load newer messages below
    let tUnread = currentUnread;
    for (let i = MSG_BOTTOM_INDEX - 1; i >= 0; i--)
    {
        let aI = mails.length - 1 - i;
        let mailDiv = addMailBlock(mails[aI], mailBox, true);
        if (tUnread - i > 0)
            mailDiv.className += "new-mail ";
        if (bottom)
        {
            let height = mailDiv.clientHeight + 13;
            mailBox.scrollTop += height;
            //console.log(`v SCROLLING: ${height}`);
        }
    }
    MSG_BOTTOM_INDEX = 0;

    // load older messages above
    while (MSG_TOP_INDEX < mails.length)
    {
        // if enough loaded we stop
        let size = mailBox.scrollTop + mailBox.offsetHeight;
        if (size > mailBox.offsetHeight * 1.5)
            break;


        let aI = mails.length - 1 - MSG_TOP_INDEX;
        let mailDiv = addMailBlock(mails[aI], mailBox, false);
        if (tUnread - MSG_TOP_INDEX > 0)
            mailDiv.className += "new-mail ";
        MSG_TOP_INDEX++;


        if (bottom)
        {
            let height = mailDiv.clientHeight + 13;
            mailBox.scrollTop += height;
            //console.log(`^ SCROLLING: ${height}`);
        }
    }

    // maybe unload mails if they are far up

    document.getElementById('message-input').focus();

    if (userInfo["unread"] != 0 && bottom)
    {
        userInfo["unread"] = 0;
        setUserInfo(user, userInfo);
    }

    updateAllUsers();
}



function chatRightClick(event)
{
    if (event["button"] != 2)
        return;

    let user = CURRENT_USER_ID;

    let userInfo = getUserInfo(user);
    if (!userInfo)
        return;

    let userName = userInfo["nickname"];
    if (!userName || userName == "")
        userName = user;

    // ask if you want to delete the chat with this user
    if (confirm(`Delete all mails from \""${userName}?\"`))
    {
        removeMailsFromUser(user);
        initMailsForUser(user);
        refresh();
    }
}

function unmarkAllMessages()
{
    let user = CURRENT_USER_ID;

    let userInfo = getUserInfo(user);
    if (!userInfo)
        return;

    let unread = userInfo["unread"];
    userInfo["unread"] = 0;
    setUserInfo(user, userInfo);

    // go through the last x messages and remove the new-mail class
    let mailBox = document.getElementById('mails');
    let children = mailBox.children;

    for (let i = 0; i < children.length; i++)
    {
        let child = children[i];
        child.className = child.className.replace("new-mail ", "");
    }

    refresh();
}
