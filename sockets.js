'use strict';

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

var history = []
  , colors = ['maroon', 'red', 'orange', 'yellow', 'olive', 'purple', 'fuchsia', 'lime', 'green', 'navy', 'blue', 'aqua', 'teal', 'silver', 'gray'];  
  
//Randomize colors
colors.sort(function() { return Math.random() > 0.5; } );

/**
 * Our Socket.IO server that's responsible for all this tomfoolery
 * It manages user logins/disconnects as well as ensuring everyone gets messages that are sent
 * @param  {HTTPServer} server A server created by the http package with http.createServer()
 */
exports.start = function(server) {
  var io = require('socket.io').listen(server);
  
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
    
    if(history.length) {
      socket.emit('history', history);
    }
    
    //Message is ONLY for sending us a chat message
    socket.on('message', function (data) {
      console.log((new Date()) + ' Received Message from ' + username + ': ' + data);
      
      data = data.escape();
      
      //Detect URLs
      var urlpattern = /\bhttps?:\/\/[^\s<>"`{}|\^\[\]\\]+/g
      
        //jpeg doesn't have a period so they're all four chars long, simplifying the substring call later
        , imgExts = ['.png', '.jpg', 'jpeg', '.gif'];
      data = data.replace(urlpattern, function(url) {
        
        //Unescape ampersands in the URL
        var originalURL = url.replace('&amp', '&');
        
        //If it's a image, onebox it
        if(imgExts.indexOf(originalURL.slice(-4)) > -1) {
          return '<a href="' + originalURL + '" target="_blank" rel="nofollow"><img src="' + originalURL + '" alt="image sent by ' + username + '" /></a>';
        } else {
          
          //Make it a regular URL
          return '<a href="' + originalURL + '" target="_blank" rel="nofollow">' + originalURL + '</a>';
        }
      });
      
      var obj = {
        time: (new Date()).getTime(),
        text: data,
        author: username,
        color: userColor
      };
      
      //Add this message to history
      history.push(obj);

      //Send the message to all connected sockets
      io.sockets.emit('message', obj);
    });
    
    //When the user choses a username
    //TODO: Check if the name's taken and respond with an error
    socket.on('login', function(data) {
      username = data.username.escape();
      //FIXME: It'll give us undefined when we run out of colors (16)
      userColor = colors.shift();
      socket.emit('loginAck', { color: userColor });
      console.log((new Date()) + ' User is known as: "' + username + '" with ' + userColor + ' color.');
      
      //Tell everyone this guy logged in
      io.sockets.emit('announce', 'Welcome <span style="color: ' + userColor +'">' + username + '</span> to the chatroom');
    });
    
    //Log the disconnect and free up their color
    socket.on('disconnect', function(data) {
      if (username && userColor) {
        console.log((new Date()) + " Peer " + socket.id + " disconnected.");
        colors.push(userColor);
      }
    });
  });
};