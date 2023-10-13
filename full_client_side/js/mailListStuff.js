async function chatScroll()
{
    await showMailsForUser(CURRENT_USER_ID);

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

async function insertImageYes(mailDiv, img, side)
{
    await img.decode();

    img.style.display = "block";
    if (side == "left")
        img.style.marginRight = "max";
    else
        img.style.marginLeft = "auto";
    mailDiv.append(img);


    //console.log(`> IMG 1: ${img.width}x${img.height}`);
    let newSize = calculateAspectRatioFit(img.width, img.height, 300, 150);
    img.width = newSize.width;
    img.height = newSize.height;
    //console.log(`> IMG 2: ${img.width}x${img.height}`);
}

async function addMailBlock(mailThing, container, bottom)
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
        {
            let tempData = getImage(mail["user"], mail["id"]);
            if (tempData["data"] == undefined)
                setImage(mail["user"], mail["id"], {data: tempData, name: "unknown"});
        }

        let img = document.createElement("img");
        img.oncontextmenu = (event) =>
        {
            event.stopPropagation();
            return true;
        };

        try
        {
            let actuallyAddImage = true;
            //console.log(mail);
            if (!ENV_AUTOLOAD_IMAGES)
            {
                if (mail["link"])
                    actuallyAddImage = "link";
                else
                    actuallyAddImage = "image";
            }
            else if (mail["link"])
            {
                if (ENV_AUTOLOAD_LINK_IMAGES)
                {
                    img.src = getImage(mail["user"], mail["id"])["data"];
                    actuallyAddImage = true;
                }
                else
                    actuallyAddImage = "link";
            }
            else
            {
                img.src = getImage(mail["user"], mail["id"])["data"];
                actuallyAddImage = true;
            }

            if (actuallyAddImage == true)
            {
                await insertImageYes(mailDiv, img, side);
            }
            else if (actuallyAddImage == "link")
            {
                mailDiv.innerText = `<CLICK TO LOAD (${getImage(mail["user"], mail["id"])["data"]})>`;
                mailDiv.className += " interactable ";
                mailDiv.onclick = async () =>
                {
                    img.src = getImage(mail["user"], mail["id"])["data"];
                    mailDiv.innerText = "";
                    await insertImageYes(mailDiv, img, side);
                }
            }
            else
            {
                mailDiv.innerText = `<CLICK TO LOAD IMAGE>`;
                mailDiv.className += " interactable ";
                mailDiv.onclick = async () =>
                {
                    img.src = getImage(mail["user"], mail["id"]);
                    mailDiv.innerText = "";
                    await insertImageYes(mailDiv, img, side);
                }
            }
        }
        catch (e)
        {
            let file = getImage(mail["user"], mail["id"]);
            mailDiv.innerText = `<CLICK TO DOWNLOAD \"${file["name"]}\">`;
            mailDiv.className += " interactable ";
            mailDiv.onclick = async () =>
            {
                downloadBase64File(file["data"], file["name"]);
            }
        }
    }
    else if (mailType == "file")
    {
        {
            let tempData = getImage(mail["user"], mail["id"]);
            if (tempData["data"] == undefined)
                setImage(mail["user"], mail["id"], {data: tempData, name: "unknown"});
        }

        let file = getImage(mail["user"], mail["id"]);
        mailDiv.innerText = `<CLICK TO DOWNLOAD \"${file["name"]}\">`;
        mailDiv.className += " interactable ";
        mailDiv.onclick = async () =>
        {
            downloadBase64File(file["data"], file["name"]);
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
async function showMailsForUser(user)
{
    if (doingScroll)
        return;
    doingScroll = true;
    await _showMailsForUser(user);
    doingScroll = false;
}

async function _showMailsForUser(user)
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
        let mailDiv = await addMailBlock(mails[aI], mailBox, true);
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
        let mailDiv = await addMailBlock(mails[aI], mailBox, false);
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

    if (userInfo["unread"] != 0)
    {
        if (bottom)
        {
            userInfo["unread"] = 0;
            setUserInfo(user, userInfo);
        }
        else
        {

        }
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
        removeImagesFromUser(user);
        initImagesForUser(user);
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


function showChatWindow()
{
    document.getElementById('mail-div').className = "item-container mails menu-shown";
    document.getElementById('no-mail-div').className = "item-container mails menu-hidden";
}

function hideChatWindow()
{
    document.getElementById('mail-div').className = "item-container mails menu-hidden";
    document.getElementById('no-mail-div').className = "item-container mails menu-shown";
}