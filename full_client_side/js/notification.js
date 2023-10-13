var notifications = [];
var notificationsWork = false;
async function checkNotifications()
{
    notificationsWork = false;
    //console.log(window.location.protocol);
    if (window.location.protocol != "https:" && window.location.protocol != "http:"
        && window.location.protocol != "localhost:")
        return;

    if (!ENV_ALLOW_NOTIFICATIONS)
        return;

    if (!("Notification" in window))
        return;

    if (Notification.permission === "granted")
    {
        notificationsWork = true;
        return;
    }

    if (Notification.permission !== "denied")
    {
        if (await Notification.requestPermission())
            notificationsWork = true;
    }
}

const windowHasFocus = function () {
    if (document.hasFocus()) return true
    let hasFocus = false

    window.addEventListener('focus', function () {
        hasFocus = true
    })
    window.focus()

    return hasFocus
}

function clearNotifications()
{
    if (!notificationsWork)
        return;

    //console.log(notifications)
    for (let not of notifications) {
        //console.log(`> Closing notification: ${not.body}`);
        not.close();
    }

    notifications = [];
}

function windowVisible()
{
    return (windowHasFocus() || document.visibilityState == "visible")
}
function canNotify()
{
    if (!ENV_ALLOW_NOTIFICATIONS)
        return false;
    if (!notificationsWork)
        return false;
    if (windowVisible())
        return false;


    return true;
}

function showNotification(title, msg, callback)
{
    if (!canNotify())
        return;

    //console.log(`> Showing notification: ${msg}`);

    const notification = new Notification(title, {body: msg});
    notifications.push(notification);

    notification.onclick = (ev) =>
    {
        clearNotifications();

        if (typeof callback == "function")
            callback(ev);
        window.focus();
    };
}

window.addEventListener('focus', () =>
{
    clearNotifications();
});

window.addEventListener('visibilitychange', () =>
{
    if (document.visibilityState == "visible")
        clearNotifications();
});


async function toggleNotification()
{
    ENV_ALLOW_NOTIFICATIONS = !ENV_ALLOW_NOTIFICATIONS;
    saveObject("ALLOW_NOTIFICATIONS", ENV_ALLOW_NOTIFICATIONS);
    updateNotificationButton(ENV_ALLOW_NOTIFICATIONS);
    await checkNotifications();
}

async function toggleMsgSound()
{
    ENV_ALLOW_MSG_SOUND = !ENV_ALLOW_MSG_SOUND;
    saveObject("ALLOW_MSG_SOUND", ENV_ALLOW_MSG_SOUND);
    updateMsgSoundButton(ENV_ALLOW_MSG_SOUND);
}

function updateNotificationButton(allow)
{
    let btn = document.getElementById("main-menu-not-button");

    if (allow)
        btn.innerText = "Disable notifications";
    else
        btn.innerText = "Enable notifications";
}

function updateMsgSoundButton(allow)
{
    let btn = document.getElementById("main-menu-msg-sound-button");

    if (allow)
        btn.innerText = "Disable message sounds";
    else
        btn.innerText = "Enable message sounds";
}


let msgSound = new Audio("./shared/audio/not.wav");
function playNotificationSound()
{
    if (!ENV_ALLOW_MSG_SOUND)
        return;

    msgSound.play().then();
}