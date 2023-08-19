// get public key from ../data/public-key.txt
const fs = require('fs');
const path = require('path');

const publicKeyPath = path.join(__dirname, '../data/public-key.txt');

let publicKey = fs.readFileSync(publicKeyPath, 'utf8');

const getJsFileWithServerPublicKey = (params) =>
{
    if (params["set-var"] == "true")
        return `var ENV_SERVER_PUBLIC_KEY = \`${publicKey}\`;`;
    else
        return publicKey;
}

module.exports = getJsFileWithServerPublicKey;