var ENV_CLIENT_PUBLIC_KEY;
var ENV_CLIENT_PRIVATE_KEY;
var ENV_SERVER_PUBLIC_KEY;
var ENV_USER_ID;
var MAILS;

var ENV_SERVER_ADDRESS = loadObject("SERVER_ADDR");
if (!ENV_SERVER_ADDRESS)
{
    ENV_SERVER_ADDRESS = "http://localhost";
    saveObject("SERVER_ADDR", ENV_SERVER_ADDRESS);
}

var CURRENT_USER_ID = 0;