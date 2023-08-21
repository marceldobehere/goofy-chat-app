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

    clearAllData();
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

    let users = getAllUsers();
    for (let userId of users)
    {
        let userInfo = getUserInfo(userId);

        let username = userInfo["nickname"];
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
        userPre.innerText = userInfo["public-key"];
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
