// get public key from ../data/public-key.txt
const fs = require('fs');
const path = require('path');

const publicKeyPath = path.join(__dirname, '../data/public-key.txt');

let publicKey = fs.readFileSync(publicKeyPath, 'utf8');

const getJsFileWithServerPublicKey = (params) =>
`var ENV_SERVER_PUBLIC_KEY = \`${publicKey}\`;`;

module.exports = getJsFileWithServerPublicKey;