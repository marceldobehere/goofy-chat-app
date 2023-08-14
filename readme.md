# Goofy Chat App
This is a goofy chat/mail app, that allows people to exchange messages which are fully encrypted.

The messages are RSA End-To-End encrypted, so that not even the sever can read them.
The server only holds public keys, and messages which are to be sent.

Also FYI this is still in development.
I only wanted to publish it rn bc it's in a working state.
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
- Right-click on a person to change their nickname
- Middle-click on a person to remove them
- Click on `Add User` to add a new person

### Controls (Chat)
- `Enter` to send message
- Click the `Send` button to send message
- `Shift + Enter` to add new line
- Left-click the background to clear the chat

## How to host locally
1. Clone the repo
2. Run `npm install`
3. Run `npm start`
4. The server is now running at localhost:80


## Why am I making this?
Idk

## TODO
(There is a bit of stuff, since I just made it in like 2 days lmao)
- Add blocking people
- Add a status bar for the server, to see if it is online
- Add notification sounds
- Add a timeout for spam messages and registering
- Check if auto-deletion of messages works
- Add deleting your account
- Add auto deleting after 1 month of inactivity
- Add saving the pending mails to a file in case of a power-off
- Add caching to the goofy json database lmao
- Improve UI
- Make a local site that dynamically loads in the content from the server and stores the data locally
- Host it on my domain
- Make an exporter and importer for chats and or private/public keys
- Make the server not crash sometimes when malformed requests happen smh
- Add a text size limit

## TODO (security)
- Add client side log of public keys
- Add automatic discrepancy checker for public keys
- Set default size of the RSA keys to like 2048 bit or something
- Add a goofy external verification of public key mechanism


## TODO (Maybe)
- Add checking if a person is online
- Add an automatic reconnect to the server, if it goes down temporarily 
- Add custom css importing
- Add custom layout modes
- Add posting (small) images and or files (idk yet)




## Credits
- [JS ENCRYPT](https://github.com/travist/jsencrypt)
- [Socket.io](https://socket.io)






## So is this actually 100% secure?
Well it's complicated.

(This is going to be a lot of text, so If you want you can skip to the [TL;DR](#takeaways-tldr))

Realistically if a person that you trust is hosting it, then yes.
But in the current state, it is possible to set up a malicious server that will circumvent the encryption.
(Which funnily enough could be the case for most centralised E2E encrypted chat apps)



### Well how could you circumvent the **END-TO-END** encryption?
It's actually quite simple:



#### Ideal Example of direct encrypted communication

Firstly imagine the people trying to send a message in real life:

- First they would need to exchange public keys in person.
- Then Person A could encrypt their message with the public key of Person b.
- Since Person B has the private key to their public key, only they can actually decrypt the message.
- Meaning that no-one, except for Person B, can read the message contents. (Excluding Person A that wrote it and possibly brute force attacks, etc.)

Seems pretty secure, right? 
Well it is.


#### More realistic example of indirect encrypted communication

But now imagine trying to exchange public keys indirectly.
(That means that you have to rely on a 3rd party to deliver all messages.)

At first glance, it seems that you could easily exchange public keys and the message would be encrypted.
And that would be the case, **unless** the 3rd party lies with the public keys.

A simple scenario:
- Person A requests the public key of Person B.
- The 3rd party sees this and generates their own public key.
- Now instead of sending the public key of Person B, they send their own public key to Person A.
- Person A, not being able to check, will see nothing wrong and encrypt the message with the given key.
- Now Person A wants to send the encrypted message to Person B.
- Of course our 3rd party needs to "deliver" the message.
- During that time they will decrypt the message with their own private key.
- Then they have your message.
- And then they will simply encrypt it again with the actual public key of Person B.
- Now they'll send Person B the encrypted message.
- Neither Person A nor Person B would be able to notice.

Of course this works both ways, so the 3rd party or server could be reading all the encrypted traffic both ways from all people.

### Why does this matter here?

Well basically using the internet, you normally cant reach any client directly, without them exposing their IP/Port and you often rely on proxies or servers to transmit the data from one connected client to another.

That means that in a lot of cases the public key exchange would happen indirectly through some kind of often centralized server.

And if the server is malicious, it could very well just do exactly what was said above and intercept all traffic.


### Is everything unsafe now???

In my opinion, I am not sure.

Of course, if you have a direct peer to peer connection and or don't rely on any centralized server, it could very well be secure.

But if everything goes through at least one node, which could be malicious, then that's no longer guaranteed.

Sadly even if I have the code open source, I, or anyone else, could be hosting something completely different, that just *looks* the same on the outside.

It's especially problematic when you can't even see how exactly the information gets encrypted or what the public/private key is.


### Is there anything you can do about it?

Well that is also complicated.

The most logical thing to do, would be to check the public keys of both users.
Though you would have to either rely on reliable external sources, or cross-check multiple ones.

Or you could try to check them in a smart, or in my case goofy, way.

The most simple approach would be, to send your public key or the hash over and then have the other person check it.
This could even be automated!

Problem solved? Nope.

If the server was listening in on your conversations, it could very well notice that you are sending *your* public key over and just edit the message, before passing it over.
It could easily generate hashes based on both peoples public keys and do a simple string replace for them.

That applies to almost all automatic checks you could implement. As long as there is a chance of the server knowing the "handshake", it could easily automatically detect and circumvent it.


### So what now?

Well glad that you asked.

The only real easy way would be to send some kind of checksum in a non-machine-detectable way.
You have to consider that in a normal chat environment, people would probably be sending a lot of words and possibly numbers.


So why not try to hide it using words and possibly numbers?

Well that's the exact idea. Though a part of it.

You would make an algorithm that takes in a public key and returns a "random" but normal sound sentence based on it.
The only issue is, that the server can also use it.

But you can counteract this by also having a second key/seed for the random sentence generation.
It could be anything from a word to a number to a string.

(Best would be to make it as hard to detect in a machine way as possible)

Then the algorithm would generate a random normal sounding sentence based on the public key and the external key/seed.

You could then send the other person that in an *organic* way, and they could then check.

All without the server noticing!


Of course, you would have to be somewhat careful not to make an advanced server detect it!

But if the random sentence generator has a lot of possible keys and the output changes drastically then a machine won't have a chance.

(Of course the implementation and actual algorithm would have to run client side so that the server can't just spoof that lol)


And if all that is the case then yes you would know that no-one is spying on you, *probably*.


(This is what I plan on adding soon, because why not)


### So the problem is finally solved?

For automatic systems, *probably*. (I have no idea, how good ML could be at spotting it, but for now it should probably be fine)

Buuut there is one last issue! And this one is a lot of pain.

Let's say that you are a target to the server owner. They could serve you the wrong public key, but not only that. 

They could just be impersonating the person you want to talk to.

If that is the case, then you can forget checking public keys, because you could have the correct public key, but to the wrong person.
Of course that also has some issues, like that the person you want to talk to, might not be getting any messages at all, and they might try to contact you because of that in other ways.

So that is not too likely. Still a possibility though!


### Takeaways (TL;DR)

- To be able to trust the end-to-end encryption being actually between you and the correct person, you should really exchange public keys.

  - The easiest way would be by exchanging them on a different and reliable/secure platform or in real life. (For example, possibly the platform you exchanged user-ids on.)

  - If that is not a viable option, and you are probably not too much of a wanted target on the server, you could try sending a checksum in a hidden way. (Once I implement it, I will probably add a guide on how you would do that)

- If something says, that its `end to end encrypted` but you have no idea how it exactly works and or can't fully check, you might want to take it with a grain of salt.

- Security is strange


Just FYI I am not a cyber-security specialist by any means. 

I might be missing something very obvious and this could have potentially been solved in a different and fully reliable way ages ago.
If that is the case, please let me know! I would be very interested in learning the specifics.


Also, if you have any thoughts, ideas or suggestions in regard to this whole thing, feel free to start a discussion in the repo or contact me!





