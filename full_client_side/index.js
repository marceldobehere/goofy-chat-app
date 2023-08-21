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
    loadKeys();
    console.log(ENV_CLIENT_PUBLIC_KEY);
    console.log(ENV_CLIENT_PUBLIC_KEY_HASH);

    initUserList();

    userListWriteAllUsers();

    updateMainMenuUserList();
    updateMainMenu();

    await delay(50);

    await updateServerStatus();

    await delay(10);

    await refresh();

    setInterval(updateServerStatus, 1000);
}

doServerInit();










async function refresh()
{
    updateAllUsers();
    await showMailsForUser(CURRENT_USER_ID);
}





onReceiveEncrypted('mailRec', (obj) => {

    if (!obj || obj["action"] != "rec")
        return;

    console.log('> MAIL RECEIVED');
    //console.log(obj);

    let from = obj["from"];
    let mailEnc = obj["mail"];
    let mail = rsaStringListIntoString(mailEnc, ENV_CLIENT_PRIVATE_KEY);
    let fromPubKey = obj["public-key"];
    let type = obj["type"];

    //console.log(`FROM: ${from}`);
    //console.log(`MAIL: ${mail}`);

    addRecMail(from, fromPubKey, mail, type);

    refresh();
});






