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

    console.log('SENDING INIT');

    // send the server your public key
    replyPromise = createOnReceivePromise('login');
    sendEncrypted('login', {"action":"init", "public-key": ENV_CLIENT_PUBLIC_KEY});

    console.log('WAITING FOR REPLY');
    reply = await replyPromise;

    console.log('REPLY');
    console.log(reply);

    if (reply["error"])
    {
        alert(reply["error"]);
        return;
    }

    // the server will send you back some encrypted text
    let encryptedText = reply["encrypted-text"];

    console.log('ENCRYPTED TEXT');
    console.log(encryptedText);

    // decrypt the text with your private key (DECRYPTED TEXT IS 10 CHARS LONG)
    let decryptedText = decryptStr(encryptedText, ENV_CLIENT_PRIVATE_KEY);
    if (decryptedText.length != 10)
    {
        alert('Something went wrong...');
        return;
    }

    console.log('DECRYPTED TEXT');
    console.log(decryptedText);

    // you send back the decrypted text
    replyPromise = createOnReceivePromise('login');
    sendEncrypted('login', {"action":"confirm", "decrypted-text": decryptedText});
    reply = await replyPromise;

    console.log('FINAL REPLY');
    console.log(reply);

    // the server will send you back your user id or an error
    if (reply["error"])
    {
        alert(reply["error"]);
        return;
    }

    ENV_USER_ID = reply["user-id"];
    console.log(`USER ID: ${ENV_USER_ID}`);
}

getUserId();

function writeAllUsers()
{
    // #users
    $('#users').empty();
}

function showMailsForUser(user)
{
    // #mails
    $('#mails').empty();

    if (!user)
        return;
}

function refresh()
{
    writeAllUsers();
    showMailsForUser();

}

refresh();

onReceiveEncrypted('mail', (obj) => {
    console.log('MAIL RECEIVED');
    console.log(obj);
    //MAILS.push(obj);
    //saveEncryptedObject('MAILS', MAILS);

    refresh();
});
