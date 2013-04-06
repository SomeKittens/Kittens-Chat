!function () {
  'use strict';

  //Save us time by caching the jQuery lookups
  var $input = $('#input')
    , $status = $('#status')
    , $nameModal = $('#selectNameModal')
    , $usernameSelect = $('#usernameSelect');
  
  var connection = io.connect(window.location.protocol + "//" + window.location.host);
  
  //TODO: using `disabled` on $input is an HCI issue.  I don't think we need it, it'll be dropped soon
  connection.on('connect', function () {
    $input.removeAttr('disabled');
  });
  
  //If we've got an error, fake a chat message informing the user of the error
  connection.on('error', function (error) {
    vm.history.push({
      author: 'System',
      text: 'Sorry, but there\'s some problem with your connection or the server is down.',
      color: 'black',
      time: new Date()
    });
  });
  
  //Add the message to our chat (remember, `vm` is attached to the global object in knockout.js)
  connection.on('message', function (message) {
    $input.removeAttr('disabled');
    vm.history.push({
      author: message.author, 
      text: message.text, 
      color: message.color, 
      time: new Date(message.time)
    });
  });
  
  //Load up the chat window with all the messages the user has missed
  connection.on('history', function(history) {
    
    //We have to manually iterate over history because Socket.io is converting our Date object to a string
    for (var i = 0,k=history.length; i < k; i++) {
      vm.history.push({
        author: history[i].author, 
        text: history[i].text, 
        color: history[i].color, 
        time: new Date(history[i].time)
      });
    }
  });
  
  //Server acknowledged our login request, we're good to go!
  //Set the username and color and give us the ability to send messages
  connection.on('loginAck', function(message) {
    vm.usercolor(message.color);
    $input.removeAttr('disabled').focus();
  });
  
  //Someone has logged in, let's welcome them
  connection.on('announce', function(message) {
    vm.history.push({
      author: 'System',
      color: 'black',
      text: message,
      time: new Date()
    });
  });
  
  //Failed connection?  Let's let our user know about it
  //TODO: Move to bootstrap alert
  connection.on('connect_failed', function() {
    $status.text('Error');
    $input.attr('disabled', 'disabled').val('Unable to comminucate with the WebSocket server.  Try refreshing the page.');
  });
  
  //Set up our Bootstrap stuff
  
  //Make things easier for our users who like keyboards
  $nameModal.on('shown', function() {
    $usernameSelect.focus();
  });
  
  //The hide is triggered when the user clicks "start chatting!"
  $nameModal.on('hide', function() {
    vm.username($usernameSelect.val());
    connection.emit('login', {username: vm.username()});
  });
  
  //User can press enter instead of clicking the button
  $usernameSelect.keydown(function(e) {
    if(e.keyCode === 13 && $usernameSelect.val().trim()) {
      $nameModal.modal('hide');
    }
  });

  $nameModal.modal({
    show: true,
    
    //We only want this to be closed when the user has selected a name
    backdrop: 'static',
    keyboard: false
  });
  
  //Send a message if the user hits the enter key
  $input.keydown(function(e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      var msg = $(this).val();
      $(this).val('');
      if (!msg) {
        return;
      }
      connection.emit('message', msg);
      $input.attr('disabled', 'disabled');
    }
  });
}(this);