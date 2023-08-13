# Goofy Chat App
This is a goofy chat/mail app, that allows people to exchange messages which are fully encrypted.

The messages are RSA End-To-End encrypted, so that not even the sever can read them.
The server only holds public keys, and messages which are to be sent.

Also FYI this is still in development.
I only wanted to publish it rn bc its in a working state.
So feel free to experiment with it, but don't expect it to be perfect.



![test](/images/yes.png)



## How to use the website/app
1. Go to the website (either hosted by me (not yet), by someone else or locally)
2. Read your number/id
3. Add other people
4. Chat with em

## Controls

### Controls (User List)
- Click on a person to select them
- Right click on a person to change their nickname
- Middle click on a person to remove them
- Click on `Add User` to add a new person

### Controls (Chat)
- `Enter` to send message
- Click the `Send` button to send message
- `Shift + Enter` to add new line
- Left click the background to clear the chat

## How to host locally
1. Clone the repo
2. Run `npm install`
3. Run `npm start`
4. The server is now running at localhost:80


## TODO
(There is a bit of stuff, since I just made it in like 2 days lmao)
- Add blocking people
- Add notification sounds
- Add a timeout for spam messages and registering
- Check if auto-deletion of messages works
- Add deleting your account
- Add auto deleting after 1 month of inactivity
- Add saving the pending mails to a file in case of a poweroff
- Add caching to the goofy json database lmao
- Improve UI
- Make a local site that dynamically loads in the content from the server and stores the data locally
- Host it on my domain
- Make an exporter and importer for chats and or private/public keys
- Make the server not crash sometimes when malformed requests happen smh


## TODO (Maybe)
- Add checking if a person is online
- Add custom css importing
- Add custom layout modes


## Why?
Idk


## Credits
 - [JS ENCRYPT](https://github.com/travist/jsencrypt)




