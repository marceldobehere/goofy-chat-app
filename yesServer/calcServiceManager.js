const path = require("path");
const fs = require("fs");
let mainDirName;
let calcDir;
let calcServiceDict;

function initStuff(_mainDirName, _calcServiceDict)
{
    mainDirName = _mainDirName;
    calcDir = path.join(mainDirName, 'calc');

    calcServiceDict = _calcServiceDict;
}

function reloadAllCalcServices()
{
    // go through each js file in the calc folder and require it and put it into the dict with the filename as the key and the value
    // use sync operation to go through each file

    // clear the dict manually to not loose reference to the dict
    for (var prop in calcServiceDict) {
        if (calcServiceDict.hasOwnProperty(prop)) {
            delete calcServiceDict[prop];
        }
    }


    const calcFiles = fs.readdirSync(calcDir);

    for (const file of calcFiles)
    {
        if (file.endsWith(".js"))
        {
            let servicePath = path.join(calcDir, file);

            let calcService = require(servicePath);
            delete require.cache[require.resolve(servicePath)];
            calcService = require(servicePath);

            calcServiceDict[file] = calcService;
        }
    }
    //console.log();

    //console.log(calcServiceDict);
}

module.exports = {initStuff, reloadAllCalcServices};