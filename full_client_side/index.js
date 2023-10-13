function loadKeys()
{
    let clientKeys = loadObject('CLIENT_KEYS');
    if (clientKeys)
    {
        ENV_CLIENT_PUBLIC_KEY = clientKeys["public"];
        ENV_CLIENT_PUBLIC_KEY_HASH = hashString(ENV_CLIENT_PUBLIC_KEY);
        ENV_CLIENT_PRIVATE_KEY = clientKeys["private"];
    }
    else
        resetKeys();


    if (!testKeys())
        resetKeys();
}



async function doServerInit()
{
    loadAndApplyStoredCss();

    loadKeys();
    console.log(ENV_CLIENT_PUBLIC_KEY);
    console.log(ENV_CLIENT_PUBLIC_KEY_HASH);

    const queryString = window.location.search;
    console.log(queryString);
    if (queryString.indexOf("?source=") == 0)
    {
        let source = queryString.substring("?source=".length);
        source = source.replace("_", ":");
        console.log(source);

        ENV_SERVER_ADDRESS = "https://" + source;
        console.log(ENV_SERVER_ADDRESS);
        saveObject("SERVER_ADDR", ENV_SERVER_ADDRESS);

        console.log(window.location.href);

        // remove the source param from the url and reload
        let tempUrl = window.location.href;
        tempUrl = tempUrl.substring(0, tempUrl.indexOf("?source="));
        console.log(tempUrl);

        window.location.href = tempUrl;
    }

    if (ENV_SERVER_ADDRESS == "")
        serverAddressChange();

    initUserList();

    userListWriteAllUsers();

    updateMainMenuUserList();
    updateMainMenu();

    await delay(50);

    await updateServerStatus();

    await delay(10);

    await refresh();

    setInterval(updateServerStatus, 1000);

    setTimeout(doCheckIfServerDomainMaybeDiff, 3500);

    await checkNotifications();

    updateNotificationButton(ENV_ALLOW_NOTIFICATIONS);
    updateMsgSoundButton(ENV_ALLOW_MSG_SOUND);
}

try
{
    doServerInit();
}
catch (e)
{
    console.log(e);
    alert(`A FATAL ERROR OCCURED! ${e}`);

    if (prompt("RESET ALL DATA"))
    {
        clearAllData();
        location.reload();
    }
}


function doCheckIfServerDomainMaybeDiff()
{
    if (getSocketStatus())
        return;

    iframeMenuOpen();
}







async function refresh()
{
    updateAllUsers();
    await showMailsForUser(CURRENT_USER_ID);

    if (CURRENT_USER_ID == 0)
        hideChatWindow();
    else
        showChatWindow();
}



let mailRecCount = 0;
onReceiveEncrypted('mailRec', async (obj) => {

    if (!obj || obj["action"] != "rec")
        return;

    while (mailRecCount > 0)
        await delay(50);
    mailRecCount++;

    console.log('> MAIL RECEIVED');
    //console.log(obj);

    let from = obj["from"];
    let mailEnc = obj["mail"];
    let mail = JSON.parse(await rsaStringListIntoStringAsync(mailEnc, ENV_CLIENT_PRIVATE_KEY));
    let fromPubKey = obj["public-key"];
    let type = obj["type"];
    let sig = obj["sig"];

    if (hashString(fromPubKey) != from)
    {
        console.log('> ERROR: INVALID FROM ID');
        alert("ERROR: RECEIVED MAIL HAS INVALID FROM ID");
        return;
    }

    if (!verifySignature(mail, sig, fromPubKey))
    {
        console.log('> ERROR: INVALID SIGNATURE');
        alert("ERROR: RECEIVED MAIL HAS INVALID SIGNATURE");
        return;
    }

    //console.log(`FROM: ${from}`);
    //console.log(`MAIL: ${mail}`);

    addRecMail(from, fromPubKey, mail, type);

    refresh();

    mailRecCount--;
});






