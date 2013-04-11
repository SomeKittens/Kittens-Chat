!function () {
  'use strict';
  /* global:vm true */
  /* global:io true */

  //Save us time by caching the jQuery lookups
  var $input = $('#input')
    , $status = $('#status')
    , $nameModal = $('#selectNameModal')
    , $usernameSelect = $('#usernameSelect');
    
  //General chat is the default room
  var currentRoom = 'general';
  
  var connection = io.connect(window.location.protocol + "//" + window.location.host);
  
  //TODO: using `disabled` on $input is an HCI issue.  I don't think we need it, it'll be dropped soon
  connection.on('connect', function () {
    $input.removeAttr('disabled');
  });
  
  //If we've got an error, fake a chat message informing the user of the error
  connection.on('error', function (error) {
    vm.history.push({
      author: 'System',
      text: 'Sorry, but there\'s some problem with your connection or the server is down.  Error: ' + error,
      color: 'black',
      time: new Date()
    });
  });
  
  //Add the message to our chat (remember, `vm` is attached to the global object in knockout.js)
  connection.on('message', function (payload) {
    var message = payload.data;
    $input.removeAttr('disabled');
    vm[payload.room].push({
      author: message.author,
      text: message.text,
      color: message.color,
      time: new Date(message.time)
    });
  });
  
  //Load up the chat window with all the messages the user has missed
  connection.on('history', function(history) {
    for(var roomHist in history) {
      var hist = history[roomHist]
        , i = hist.length > 100 ? 100: hist.length;
      
      //We have to manually iterate over roomHist because Socket.io is converting our Date object to a string
      while(i--) {
        vm[roomHist].unshift({
          author: hist[i].author, 
          text: hist[i].text, 
          color: hist[i].color, 
          time: new Date(hist[i].time)
        });
      }
    }
  });
  
  //Server acknowledged our login request, we're good to go!
  //Set the username and color and give us the ability to send messages
  connection.on('loginAck', function(message) {
    vm.usercolor(message.color);
    $input.removeAttr('disabled').focus();
  });
  
  //System wants to announce something important.
  //Goes out to all rooms
  connection.on('announce', function(message) {
    vm.general.push({
      author: 'System',
      color: 'black',
      text: message,
      time: new Date()
    });
    vm.meta.push({
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
  
  
  //When the server restarts, it loses our names.
  //So, on reconnect, double check that it still knows us
  connection.on('reconnect', function() {
    connection.emit('remind', {username: vm.username(), color: vm.usercolor()});
  });
  
  //Add roomchange events on clicking the room buttons
  $('#general_chat_link').click(function() {
    connection.emit('roomChange', 'general');
    vm.roomName('General Chat');
  });
  
  $('#metadiscussion_link').click(function() {
    connection.emit('roomChange', 'meta');
    vm.roomName('Metadiscussion');
  });
  
  //Set up our Bootstrap stuff
  //TODO: Refactor into third file
  
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
  
  //Room tabs
  $('#generalTab').click(function(e) {
    e.preventDefault();
    currentRoom = 'general';
    $(this).tab('show');
  });
  
  $('#metaTab').click(function(e) {
    e.preventDefault();
    currentRoom = 'meta';
    $(this).tab('show');
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
      connection.emit('message', {room: currentRoom, data: msg});
      $input.attr('disabled', 'disabled');
    }
  });
}(this);