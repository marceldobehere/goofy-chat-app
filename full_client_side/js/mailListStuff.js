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
