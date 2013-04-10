!function(){
  'use strict';
  /* global vm: true */
  /* global ko: true */
  
  var ChatViewModel = function() {
    var self = this;
    
    //daytums
    self.history = ko.observableArray([]);
    self.hasFocus = true;
    self.roomName = ko.observable('General Chat');
    
    //We set the inital name to 'Connecting...' because management told us it conformed with ISO9001 standards
    self.username = ko.observable('Connecting...');
    self.usercolor = ko.observable();
    
    //Number-crunching things
    self.timestamp = function(dt) {
      //Broke this into several variables instead of one giant one for readability
      var hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()
        , minutes = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
      return ' (' + hours + ':' + minutes + ')'; 
    };
  };

  //Attach the VM to our global object (so Socket.io can toy with it)
  window.vm = new ChatViewModel();
  
  //Scroll to the bottom of the chat window when a new message arrives
  vm.history.subscribe(function() {
    var content = $('#content');
    
    //Only animate if the user is already at the bottom
    if(content.scrollTop() + content.innerHeight() >= content[0].scrollHeight) {
    
      //FIXME: doesn't always trigger
      //FIXME: Sometimes triggers too much (when we're adding history)
      content.animate({
          scrollTop: content[0].scrollHeight
        }, 400);
    }

    //Remove old messages, improves rendering speed on some browsers
    if(vm.history().length >= 101) {
      vm.history(vm.history.slice(-100));
    }
    
    //Change the tab title if the chat doesn't have focus
    if(!vm.hasFocus) {
      document.title = '*New messages in ' + vm.roomName();
    }
  });
  
  ko.applyBindings(vm);

  //Don't know where else to put this
  window.onfocus = function() {
    //TODO: use the room title when we move to that
    document.title = vm.roomName();
    vm.hasFocus = true;
  };
  window.onblur = function() {
    vm.hasFocus = false;
  };

}(this);