# Goofy Chat App
This is a goofy chat/mail app, that allows people to exchange messages which are fully encrypted.

The messages are RSA End-To-End encrypted, so that not even the sever can read them.
The server only holds public keys, and messages which are to be sent.

Also FYI this is still in development.
I only wanted to publish it rn bc it's in a working state.
So feel free to experiment with it, but don't expect it to be perfect.



![test](/images/yes.png)



## How to use the website/app
1. Visit the client [here](https://goofy.marceldobehere.com). (Or open the full_client_side folder locally) (It's sometimes hosted here [here](https://dono-03.danbot.host:1747/))
3. Connect to a server in the settings. (This will be done automatically if you join from my link above)
4. Read your number/id
5. Add other people
6. Chat with em

## Controls

### Controls (User List)
- Click on a person to select them
- Right-click on a person to change their nickname
- Middle-click on a person to remove them
- Click on `Add User` to add a new person

### Controls (Chat)
- `Enter` to send message
- Click the `Send` button to send message
- `Shift + Enter` to add new line
- Left-click the background to clear the chat
- Ctrl + V to paste text, image links, images or files into the chat (only supports small files rn)

## How to host locally
1. Clone the repo
2. Run `npm install`
3. Run `npm start`
4. The server is now running at localhost:443/localhost:80
5. If you visit the localhost website, you will get redirected to the client hosted on github
6. If you want to modify the client, open the index.html file locally


## Why am I making this?
Idk

## TODO
- Add blocking people
- Add a timeout for spam messages and registering
- Check if auto timeout/deletion of messages works
- Make deleting your account send that request to the server too
- Add auto deleting profiles after 4 months of inactivity or something
- Add group chats
- Add manual/offline message encrypter/decrypter

## TODO (security)
- Set default size of the RSA keys to like 2048 bit or something

## TODO (Maybe)
- Add checking if a person is online




## Credits
- [JS ENCRYPT](https://github.com/travist/jsencrypt)
- [Socket.io](https://socket.io)
- [Crypto JS](https://github.com/brix/crypto-js)



## So is this actually secure?

If the user id of the other person is correct, then I would say yes.

All the data will be encrypted so that not even a malicious server could read it.


The only issues would be either you getting hacked or you getting the wrong user id.

Also possibly brute forcing the encryption in the future maybe?

