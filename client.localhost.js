$(function () {
  'use strict';
  
  var content = $('#content')
    , input = $('#input')
    , status = $('#status')
    , myColor = false
    , myName = false
    , addMessage = function(author, message, color, dt) {
      content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':' + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes()) + ': ' + message + '</p>');
    };
    
  //When the user picks a username, emit a login event

  var connection = io.connect('http://localhost/');
  
  connection.on('connect', function () {
    input.removeAttr('disabled');
    status.text('Choose name:');
  });
  
  connection.on('error', function (error) {
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your connection or the server is down.'
    }));
  });
  
  connection.on('message', function (message) {
    console.log(message);
    //TODO: Make this whole system make sense with custom events
    if (message.type === 'history') { 
      for (var i = 0; i < message.data.length; i++) {
        addMessage(message.data[i].author, message.data[i].text, message.data[i].color, new Date(message.data[i].time));
      }
    } else if (message.type === 'message') { 
      input.removeAttr('disabled'); 
      addMessage(message.data.author, message.data.text, message.data.color, new Date(message.data.time));
    } else {
      console.log('Hmm..., I\'ve never seen JSON like this: ', message);
    }
  });
  
  connection.on('newUser', function(message) {
    myColor = message.color;
    status.text(myName + ': ').css('color', myColor);
    input.removeAttr('disabled').focus();
  });
  
  connection.on('connect_failed', function() {
    status.text('Error');
    input.attr('disabled', 'disabled').val('Unable to comminucate with the WebSocket server.');
  });
  
  //Set up our Bootstrap stuff
  $('#selectNameModal').modal('show');
  $('#selectNameModal').on('hide', function() {
    myName = $('#username_select').val();
    connection.emit('login', {username: myName});
  });
  $('#page-info .close').on('click', function() {
    $(this).parent().remove();
  });
  
  input.keydown(function (e) {
    if (e.keyCode === 13) {
      var msg = $(this).val();
      if (!msg) {
        return;
      }
      connection.emit('message', msg);
      $(this).val('');
      input.attr('disabled', 'disabled');
      if (myName === false) {
        myName = msg;
      }
    }
  });
});