Kittens Chat
============

https://twitter.com/RecodingBlog/status/319247673515446273

This here's my attempt to write a neat-o node.js-based chat.  You can find the live demo at http://kittens-chat.herokuapp.com/ but it might not be up-to-date.

Events
======

One of the nice things about Socket.io is that it allows one to define custom events at will.  Kittens Chat uses the following events:

## Emitted by server
 - `history` - Sends an object containing every message recorded (These are still lost in the event of a server restart)
 - `message` - Sends data* about a singular message
 - `loginAck` - Acknowledges a client's login, assigns them a color
 
## Emitted by client
 - `login` - Sends the desired username to the server
 - `message` - Sends a message that the user just typed in to the server

\* A message is an object with four properties:
 - `author`: Username of person who sent the message
 - `color`: What color the author should display as
 - `text`: Text content of the message.  HTML will be escaped by Knockout.js
 - `time`: Date object of when the message was *recieved by the server*

### TODO:
 - Multiple rooms
 - Oneboxing of gifs, etc
 - Store history in MongoDB
 - Various Forks-Teaching, troll chat, micro chat
 - System message of the day