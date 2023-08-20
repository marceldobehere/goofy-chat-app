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


const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
});


function isImageValid(src) {
    // Create new offscreen image to test
    var image_new = new Image();
    image_new.src = src;
    // Get accurate measurements from that.
    if ((image_new.width>0)&&(image_new.height>0)){
        return true;
    } else {
        return false;
    }
}


const delay = ms => new Promise(res => setTimeout(res, ms));




