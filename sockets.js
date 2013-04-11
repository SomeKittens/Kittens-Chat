'use strict';

var chatHistory = {
      general: [],
      meta: []
    }
  , colors = ['maroon', 'red', 'orange', 'olive', 'purple', 'fuchsia', 'lime', 'green', 'navy', 'blue', 'aqua', 'teal', 'silver', 'gray'];
  //, mongoose = require('./lib/mongoConfig');

//Function to escape HTML special characters in a string
// http://stackoverflow.com/a/13538245/1216976
String.prototype.escape = function() {
  var tagsToReplace = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;'
  };
  return this.replace(/[&<>]/g, function(tag) {
      return tagsToReplace[tag] || tag;
  });
};
  
//Randomize colors
colors.sort(function() { return Math.random() > 0.5; } );

/**
 * Our Socket.IO server that's responsible for all this tomfoolery
 * It manages user logins/disconnects as well as ensuring everyone gets messages that are sent
 * @param  {HTTPServer} server A server created by node's http package with http.createServer()
 */
exports.start = function(server) {
  var io = require('socket.io').listen(server)
  
    //Message of the day, set statically here, will be dynamic in future versions
    , motd = 'This here is the MOTD';
  
  //Heroku "doesn't support" Websockets yet, so we need to tell socket.io to use long polling
  //https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
  io.configure(function() {
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
    
    //Makes it easier to see the important messages
    io.set('log level', 2);
  });

  io.sockets.on('connection', function (socket) {
    console.log('New friend connected!');
    
    var username
      , userColor;
      //, userRoom = 'General';
      
    //Default room (Empty string room is for system broadcasts)
    //TODO: system broadcasts
    //socket.join(userRoom);
    
    //Message is ONLY for sending us a chat message
    socket.on('message', function (payload) {
      console.log((new Date()) + ' Received Message from ' + username + ': ' + payload.data);

      var data = payload.data.escape()
      
        //Detect URLs
        , urlpattern = /\bhttps?:\/\/[^\s<>"`{}|\^\[\]\\]+/g
      
        //jpeg doesn't have a period so they're all four chars long, simplifying the slice call later
        , imgExts = ['.png', '.jpg', 'jpeg', '.gif', '.ico'];
        
      data = data.replace(urlpattern, function(url) {
        
        //Unescape ampersands in the URL
        var originalURL = url.replace('&amp', '&');
        
        //If it's a image, onebox it
        if(imgExts.indexOf(originalURL.slice(-4)) > -1) {
          return '<a href="' + originalURL + '" target="_blank" rel="nofollow"><img src="' + originalURL + '" alt="image sent by ' + username + '" /></a>';
        } else {
          
          //Otherwise, make it a regular URL
          return '<a href="' + originalURL + '" target="_blank" rel="nofollow">' + originalURL + '</a>';
        }
      });
      
      //Add message to history
      //TODO: Not DRY
      chatHistory[payload.room].push({
        time: (new Date()).getTime(),
        text: data,
        author: username,
        color: userColor
      });
      
      //The chat message object
      var messagePayload = {
        room: payload.room,
        data: {
          time: (new Date()).getTime(),
          text: data,
          author: username,
          color: userColor
        }
      };
      
      //Send the message to all connected sockets
      io.sockets.emit('message', messagePayload);
    });
    
    //When the user choses a username
    //TODO: Check if the name's taken and respond with an error
    socket.on('login', function(data) {
      username = data.username;
      //FIXME: It'll give us undefined when we run out of colors (16)
      userColor = colors.shift();
      socket.emit('loginAck', { color: userColor });
      console.log((new Date()) + ' User is known as: "' + username + '" with ' + userColor + ' color.');
      
      if(motd) {
        socket.emit('announce', motd);
      }
      
      if(chatHistory.general.length || chatHistory.meta.length) {
        socket.emit('history', chatHistory);
      }
      
      //Tell everyone this guy logged in
      //We're escaping here because messages are rendered as HTML
      io.sockets.emit('announce', 'Welcome <span style="color: ' + userColor +'">' + username.escape() + '</span> to the chatroom');
    });
    
    //Move our client to a new room
    /*
    socket.on('roomChange', function(roomName) {
      console.log('Changing user ' + username + ' to room ' + roomName);
      socket.leave(userRoom);
      socket.join(roomName);
      userRoom = roomName;
      console.log(io.sockets.manager.roomClients[socket.id]);
      socket.emit('message', {
        time: (new Date()).getTime(),
        text: 'You are now in room ' + roomName,
        author: 'System',
        color: 'black'
      });
      
      io.sockets.in(userRoom).emit('announce', 'Welcome <span style="color: ' + userColor +'">' + username.escape() + '</span> to ' + userRoom);
    });
    */
    
    //Client sends this on reconnect.  If there's been a server reboot, we've forgotten them
    //This probably won't be needed with sessions (I hope)
    socket.on('remind', function(data) {
      if(!(username)) {
        
        //Oh noes!  Tell us your secrets!
        username = data.username;
        userColor = data.color;
        
        //Pull their color from the free colors
        var coloridx = colors.indexOf(userColor);
        if(coloridx) {
          colors.splice(coloridx, 1);
        }
      }
    });
    
    //Log the disconnect and free up their color
    socket.on('disconnect', function() {
      if (username && userColor) {
        console.log((new Date()) + ' ' + username + " with id " + socket.id + " disconnected.");
        colors.push(userColor);
      }
    });
  });
};