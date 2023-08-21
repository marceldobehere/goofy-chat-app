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

    if (ENV_USER_ID != ENV_CLIENT_PUBLIC_KEY_HASH)
    {
        alert('Error: Server sent invalid user id!');
        ENV_USER_ID = 0;
        return;
    }

    let userIdSpan = document.getElementById('user-id');
    userIdSpan.innerText = ENV_USER_ID;
    userIdSpan.onclick = () => {navigator.clipboard.writeText(ENV_USER_ID);};
}


