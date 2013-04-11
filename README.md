Kittens Chat
============

https://twitter.com/RecodingBlog/status/319247673515446273

This here's my attempt to write a neat-o node.js-based chat.  You can find the live demo at http://kittens-chat.herokuapp.com/ but it might not be up-to-date.

Events
======

One of the nice things about Socket.io is that it allows one to define custom events at will.  Kittens Chat uses the following events:

## Emitted by server
 - `history`: Sends an object containing every message recorded (These are still lost in the event of a server restart)
 - `message`: Sends data* about a singular message
 - `loginAck`: Acknowledges a client's login, assigns them a color
 - `announce`: When someone logs in, their username is broadcasted out to welcome them
 
## Emitted by client
 - `login`: Sends the desired username to the server
 - `message`: Sends a message that the user just typed in to the server
 - `remind`: Quick fix for when the server loses all usernames on restart.  `remind` reminds the server of the user's name/color.
 - `roomChange`: The client wants to change to a new room

\* A message is an object with four properties:
 - `author`: Username of person who sent the message
 - `color`: What color the author should display as
 - `text`: Text content of the message.  HTML will be escaped by Knockout.js
 - `time`: Date object of when the message was *recieved by the server*

### TODO for v1:
 - Store history in MongoDB
 - Dynamic system message of the day
 - Format all `message`s in the code to be in the right order (They currently work, just bring them up to standard)
 - Refactor user names/colors.  There should be a central store either on client or server.
 - Write up documentation on installing
 - More permenant logins (session)
 - Create `system` event for messages sent by system (only needing to send a string)

#### More TODO (if you're interested in contributing)
 - Users can create rooms
 - Various Forks/Branches
   - Teaching (Lots of extra comments explaining what's going on)
   - Troll chat (Randomly inserts extra messages, sends messages from other people, etc.)
   - Micro chat (Something intended as a plugin, instead of a complete package.  Think of a small chat in the sidebar)