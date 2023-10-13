var notifications = [];
var notificationsWork = false;
async function checkNotifications()
{
    notificationsWork = false;
    //console.log(window.location.protocol);
    if (window.location.protocol != "https:" && window.location.protocol != "http:"
        && window.location.protocol != "localhost:")
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

function showNotification(title, msg, callback)
{
    if (!ENV_ALLOW_NOTIFICATIONS)
    {
        //console.log(`> Not showing notification: ${msg} (notifications disabled)`);
        return;
    }
    if (!notificationsWork)
    {
        //console.log(`> Not showing notification: ${msg} (notifications dont work)`);
        return;
    }

    if (windowHasFocus() || document.visibilityState == "visible")
    {
        //console.log(`> Not showing notification: ${msg} (window has focus)`);
        return;
    }

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


function toggleNotification()
{
    ENV_ALLOW_NOTIFICATIONS = !ENV_ALLOW_NOTIFICATIONS;
    saveObject("ALLOW_NOTIFICATIONS", ENV_ALLOW_NOTIFICATIONS);
    updateNotificationButton(ENV_ALLOW_NOTIFICATIONS);
}

function updateNotificationButton(allow)
{
    let btn = document.getElementById("main-menu-not-button");

    if (allow)
        btn.innerText = "Disable notifications";
    else
        btn.innerText = "Enable notifications";
}