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

function iframeMenuClose()
{
    // add menu-hidden class to iframe-trust if it doesnt have it and remove menu-shown class if it has it
    let iframeMenu = document.getElementById('iframe-menu');
    iframeMenu.className = iframeMenu.className.replace(' menu-shown', '');

    if (iframeMenu.className.includes('menu-hidden'))
        return;

    iframeMenu.className += ' menu-hidden';
}


function iframeMenuOpen()
{
    document.getElementById("iframe-menu-link").href = ENV_SERVER_ADDRESS;

    // add menu-shown class to main-menu if it doesnt have it and remove menu-hidden class if it has it
    let iframeMenu = document.getElementById('iframe-menu');
    iframeMenu.className = iframeMenu.className.replace(' menu-hidden', '');

    if (iframeMenu.className.includes('menu-shown'))
        return;

    iframeMenu.className += ' menu-shown';
}


function serverAddressChange()
{
    let addr = prompt("Enter server address", ENV_SERVER_ADDRESS);
    if (!addr)
        return;

    if (!addr.startsWith("http://") && !addr.startsWith("https://"))
        addr = "https://" + addr;

    if (addr.endsWith("/"))
        addr = addr.substring(0, addr.length - 1);

    ENV_SERVER_ADDRESS = addr;
    saveObject("SERVER_ADDR", ENV_SERVER_ADDRESS);

    location.reload();
}

function exportProfile()
{
    let tData = LsGetAll();
    let data = {};
    for (let {key, value} of tData)
        data[key] = value;

    let dataStr = JSON.stringify(data);

    downloadTextFile(dataStr, "profile.json");

    alert("Exported profile to profile.json");
}

function importProfile()
{
    let fileSelector = document.createElement('input');
    fileSelector.setAttribute('type', 'file');
    fileSelector.oninput = (data) => {
        console.log(data);
        if (fileSelector.files[0])
        {
            let file = fileSelector.files[0];
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = (evt) => {
                try
                {
                    let data = evt.target.result;
                    let dataObj = JSON.parse(data);

                    //console.log(dataObj);

                    LsReset();
                    for (let key in dataObj)
                        LsSet(key, dataObj[key]);

                    location.reload();
                }
                catch (e)
                {
                    alert("Error parsing file");
                    return;
                }
            }
            reader.onerror = (evt) => {
                alert("Error reading file");
            }
        }
    };

    fileSelector.click();
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

