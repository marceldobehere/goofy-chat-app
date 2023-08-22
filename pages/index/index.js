//alert(window.location.href);


let source = window.location.href;

console.log(source);

source = source.substring(source.indexOf("https://") + "https://".length);
source = source.substring(0, source.indexOf("/"));
source = source.replace(":", "_");

// make a new url to point to https://marceldobehere.github.io/goofy-chat-app/full_client_side/
// add the source to the end of the new url as a parameter
// redirect to the new url

console.log(source);

let newUrl = "https://marceldobehere.github.io/goofy-chat-app/full_client_side/?source=" + source;

console.log(newUrl);

window.location.href = newUrl;

