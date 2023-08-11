
// Call this code when the page is done loading.
$(function() {

    // Run a quick encryption/decryption when they click.
    $('#testme').click(function() {

        // Encrypt with the public key...
        var encrypt = new JSEncrypt();
        encrypt.setPublicKey($('#pubkey').val());
        var encrypted = encrypt.encrypt($('#input').val());

        // Decrypt with the private key...
        var decrypt = new JSEncrypt();
        decrypt.setPrivateKey($('#privkey').val());
        var uncrypted = decrypt.decrypt(encrypted);

        // Now a simple check to see if the round-trip worked.
        if (uncrypted == $('#input').val()) {
            alert('It works!!!');
        }
        else {
            alert('Something went wrong....');
        }
    });
});

var generateKeys = function () {
    var sKeySize = $('#key-size').attr('data-value');
    var keySize = parseInt(sKeySize);
    var crypt = new JSEncrypt({default_key_size: keySize});
    var async = $('#async-ck').is(':checked');
    var dt = new Date();
    var time = -(dt.getTime());
    if (async) {
        $('#time-report').text('.');
        var load = setInterval(function () {
            var text = $('#time-report').text();
            $('#time-report').text(text + '.');
        }, 500);
        crypt.getKey(function () {
            clearInterval(load);
            dt = new Date();
            time += (dt.getTime());
            $('#time-report').text('Generated in ' + time + ' ms');
            $('#privkey').val(crypt.getPrivateKey());
            $('#pubkey').val(crypt.getPublicKey());
        });
        return;
    }
    crypt.getKey();
    dt = new Date();
    time += (dt.getTime());
    $('#time-report').text('Generated in ' + time + ' ms');
    $('#privkey').val(crypt.getPrivateKey());
    $('#pubkey').val(crypt.getPublicKey());
};

// If they wish to generate new keys.
$('#generate').click(generateKeys);

generateKeys();

var ENV_CLIENT_PUBLIC_KEY;
var ENV_CLIENT_PRIVATE_KEY;
var ENV_SERVER_PUBLIC_KEY;

{
    let temp = localStorage.getItem("myKey");
    console.log(temp);
    if (!temp)
    {
        alert('bruh');
    }
}