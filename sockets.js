'use strict';

var history = []
  , clients = []
  // Will be replaced when we move to Knockout JS
  , htmlEntities = function(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  , colors = ['maroon', 'red', 'orange', 'yellow', 'olive', 'purple', 'fuchsia', 'white', 'lime', 'green', 'navy', 'blue', 'aqua', 'teal', 'black', 'silver', 'gray'];  
  
//Randomize colors
colors.sort(function() { return Math.random() > 0.5; } );

exports.start = function(server) {
  var io = require('socket.io').listen(server)
    , username
    , userColor;
  
  //Heroku "doesn't support" Websockets yet, so we need to tell socket.io to use long polling
  //https://devcenter.heroku.com/articles/using-socket-io-with-node-js-on-heroku
  io.configure(function() {
    io.set('transports', ['xhr-polling']);
    io.set('polling duration', 10);
    io.set('log level', 2);
  });

  io.sockets.on('connection', function (socket) {
    console.log('New friend connected!');
    
    var index = clients.push(socket.id) - 1;
    
    if(history.length) {
      socket.emit('history', history);
    }
    
    //Message is ONLY for sending us a chat message
    socket.on('message', function (data) {
      console.log((new Date()) + ' Received Message from ' + username + ': ' + data);

      var obj = {
        time: (new Date()).getTime(),
        text: htmlEntities(data),
        author: username,
        color: userColor
      };
      history.push(obj);
      history = history.slice(-100);

      socket.emit('message', {type: 'message', data: obj});
      socket.broadcast.emit('message', {type: 'message', data: obj});
    });
    
    //When the user choses a username
    socket.on('login', function(data) {
      username = htmlEntities(data.username);
      //FIXME: It'll give us undefined when we run out of colors (17)
      userColor = colors.shift();
      socket.emit('newUser', { color: userColor });
      console.log((new Date()) + ' User is known as: "' + username + '" with ' + userColor + ' color.');
    });
    
    socket.on('disconnect', function(data) {
      if (username && userColor) {
        console.log((new Date()) + " Peer " + socket.id + " disconnected.");
        clients.splice(index, 1);
        colors.push(userColor);
      }
    });
  });
};