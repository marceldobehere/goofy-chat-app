function loadKeys()
{
    let clientKeys = loadObject('CLIENT_KEYS');
    if (clientKeys)
    {
        ENV_CLIENT_PUBLIC_KEY = clientKeys["public"];
        ENV_CLIENT_PRIVATE_KEY = clientKeys["private"];
    }
    else
        resetKeys();


    if (!testKeys())
        resetKeys();
}


function loadMails()
{
    let mails = loadEncryptedObject('MAILS');
    if (mails)
        MAILS = mails;
    else
        MAILS = {};
}


async function doServerInit()
{
    loadKeys();

    loadMails();

    console.log(ENV_CLIENT_PUBLIC_KEY);
    console.log(MAILS);
    // if (localStorage.getItem('MAILS'))
    //     console.log(`MAIL SIZE: ${localStorage.getItem('MAILS').length}`)


    updateMainMenuUserList();
    updateMainMenu();

    await delay(50);

    await updateServerStatus();

    refresh();

    setInterval(updateServerStatus, 1000);
}

doServerInit();










function refresh()
{
    writeAllUsers();
    showMailsForUser(CURRENT_USER_ID);
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
    let type = obj["type"];

    //console.log(`FROM: ${from}`);
    //console.log(`MAIL: ${mail}`);

    addRecMail(from, fromPubKey, mail, type);

    refresh();
});






