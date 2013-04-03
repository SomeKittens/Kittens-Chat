'use strict';

var history = []
  , clients = []
  // Will be replaced when we move to Knockout JS
  , htmlEntities = function(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  //TODO: Change color to randomly-generated Hex
  , colors = [ 'red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange' ];  
  
//Randomize colors
colors.sort(function() { return Math.random() > 0.5; } );

exports.start = function(server) {
  var io = require('socket.io').listen(server);
  

  io.sockets.on('connection', function (socket) {
    console.log('New friend connected!');
    
    var index = clients.push(socket.id) - 1
      , userName
      , userColor;
    
    if(history.length) {
      socket.emit('message', {type: 'history', data: history});
    }
    
    socket.on('message', function (data) {
      console.log(data);
      if (!(userName)) {
      //This is the first time we've seen them
        userName = htmlEntities(data);
        userColor = colors.shift();
        socket.emit('message', { type: 'color', data: userColor });
        console.log((new Date()) + ' User is known as: "' + userName + '" with ' + userColor + ' color.');
      } else { 
        console.log((new Date()) + ' Received Message from ' + userName + ': ' + data);
              
        var obj = {
          time: (new Date()).getTime(),
          text: htmlEntities(data),
          author: userName,
          color: userColor
        };
        history.push(obj);
        history = history.slice(-100);

        socket.emit('message', {type: 'message', data: obj});
        socket.broadcast.emit('message', {type: 'message', data: obj});
      }
    });
    
    socket.on('disconnect', function(data) {
      if (userName && userColor) {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        clients.splice(index, 1);
        colors.push(userColor);
      }
    });
  });
};