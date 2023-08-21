function moveKeyToTopInObject(key, obj)
{
    let value = obj[key];
    delete obj[key];

    let newObj = {};
    newObj[key] = value;

    let first = true;
    for (let k in obj)
    {
        if (first)
        {
            if (key == k)
                return obj;
            first = false;
        }
        newObj[k] = obj[k];
    }

    return newObj;
}

function moveValueToTopInArray(value, arr)
{
    let index = arr.indexOf(value);
    if (index == -1)
        return arr;

    arr.splice(index, 1);
    arr.unshift(value);

    return arr;
}


const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});


async function isImageValid(src)
{
    // Create new offscreen image to test
    try
    {
        let img = new Image();
        img.src = src;

        await img.decode();

        // Get accurate measurements from that.
        if (Math.min(img.width,img.height) > 0)
            return true;

        return false;
    }
    catch (e)
    {
        return false;
    }
}


const delay = ms => new Promise(res => setTimeout(res, ms));




function hashString(str) {
    let hash = 0, i, chr;
    if (str === 0) return hash;
    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    const adder = (1<<30)*4;
    if (hash < 0)
        hash += adder;

    return hash;
}

function getRandomIntInclusive(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    for (let i = Math.random() * 25; i >= 0; i--)
        Math.random();

    return Math.floor(Math.random() * (max - min + 1) + min);
}


// https://stackoverflow.com/questions/3971841/how-to-resize-images-proportionally-keeping-the-aspect-ratio
/**
 * Conserve aspect ratio of the original region. Useful when shrinking/enlarging
 * images to fit into a certain area.
 *
 * @param {Number} srcWidth width of source image
 * @param {Number} srcHeight height of source image
 * @param {Number} maxWidth maximum available width
 * @param {Number} maxHeight maximum available height
 * @return {Object} { width, height }
 */
function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
}