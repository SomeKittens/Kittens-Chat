!function () {
  'use strict';

  var content = $('#content')
    , input = $('#input')
    , status = $('#status')
    , nameModal = $('#selectNameModal');
  
  var connection = io.connect(window.location.protocol + "//" + window.location.host);
  
  connection.on('connect', function () {
    input.removeAttr('disabled');
  });
  
  connection.on('error', function (error) {
    content.html($('<p>', {
      text: 'Sorry, but there\'s some problem with your connection or the server is down.'
    }));
  });
  
  connection.on('message', function (message) {
    input.removeAttr('disabled');
    vm.history.push({
      author: message.author, 
      text: message.text, 
      color: message.color, 
      time: new Date(message.time)
    });
  });
  
  connection.on('history', function(history) {
    for (var i = 0,k=history.length; i < k; i++) {
      vm.history.push({
        author: history[i].author, 
        text: history[i].text, 
        color: history[i].color, 
        time: new Date(history[i].time)
      });
    }
  });
  
  connection.on('newUser', function(message) {
    vm.user().color = message.color;
    status.text(vm.user().name + ': ').css('color', vm.user().color);
    input.removeAttr('disabled').focus();
  });
  
  connection.on('connect_failed', function() {
    status.text('Error');
    input.attr('disabled', 'disabled').val('Unable to comminucate with the WebSocket server.');
  });
  
  //Set up our Bootstrap stuff
  nameModal.modal({
    show: true,
    backdrop: 'static'
  });
  nameModal.on('hide', function() {
    vm.user().name = $('#username_select').val();
    connection.emit('login', {username: vm.user().name});
  });
  
  input.keydown(function (e) {
    if (e.keyCode === 13) {
      e.preventDefault();
      var msg = $(this).val();
      $(this).val('');
      if (!msg) {
        return;
      }
      connection.emit('message', msg);
      input.attr('disabled', 'disabled');
    }
  });
}();