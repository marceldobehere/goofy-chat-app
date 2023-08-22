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
    tempSend = false;
}


let updateCalled = false;
async function updateServerStatus()
{
    if (updateCalled)
        return;
    updateCalled = true;

    await _updateServerStatus();

    updateCalled = false;
}

let oldStatus = false;
async function _updateServerStatus()
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

    if (status)
        iframeMenuClose();
}