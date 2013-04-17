!function(){
  'use strict';
  /* global vm: true */
  /* global ko: true */
  
  var ChatViewModel = function() {
    var self = this;
    
    //daytums
    self.rooms = ko.observableArray([
      //TODO: subscribe to individual rooms
      {
        id: 0,
        name: 'General Chat',
        tag: 'general',
        history: ko.observableArray([{
          author: 'Kittens',
          color: 'green',
          text: 'Laura Ip\'s son',
          time: new Date()
        }]),
        occupants: []
      },
      {
        id: 1,
        name: 'Metadiscussion',
        tag: 'meta',
        history: ko.observableArray([]),
        occupants: []
      }
    ]);
    self.hasFocus = true;
    
    //ID of current room
    self.currentRoom = ko.observable(0);
    
    //We set the inital name to 'Connecting...' because management told us it conformed with ISO9001 standards
    self.username = ko.observable('Connecting...');
    self.usercolor = ko.observable();
    
    //Number-crunching things
    //Create a nice-looking timestamp for messages
    self.timestamp = function(dt) {
      //Broke this into several variables instead of one giant one for readability
      var hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()
        , minutes = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
      return ' (' + hours + ':' + minutes + ')';
    };
    
    //Add a message to all of the rooms
    self.broadcast = function(message) {
      ko.utils.arrayForEach(self.rooms(), function(room) {
        room.history.push({
          author: 'System',
          color: 'black',
          text: message,
          time: new Date()
        });
      }); 
    };
  };

  //Attach the VM to our global object (so Socket.io can toy with it)
  window.vm = new ChatViewModel();
  
  //Scrolls to the bottom of the chat window when a new message arrives
  //Also removes any messages over 100
  var scrollToBottom = function() {
    var content = $('#messages');
    
    //Only animate if the user is already at the bottom
    if(content.scrollTop() + content.innerHeight() >= content[0].scrollHeight) {
    
      //TODO
      //FIXME: doesn't always trigger
      //FIXME: Sometimes triggers too much (when we're adding history)
      content.animate({
          scrollTop: content[0].scrollHeight
        }, 400);
    }

    //Remove old messages, improves rendering speed on some browsers
    //Checking both, TODO: refactor
    //ROOMFIX
    if(vm.general().length >= 101) {
      vm.general(vm.general.slice(-100));
    }
    if(vm.meta().length >= 101) {
      vm.meta(vm.meta.slice(-100));
    }
    
    //Change the tab title if the chat doesn't have focus
    if(!vm.hasFocus) {
      document.title = '*New messages in ' + vm.rooms()[vm.currentRoom()].name;
    }
  };
  
  //ROOMFIX
 // vm.general.subscribe(scrollToBottom);
 // vm.meta.subscribe(scrollToBottom);
  
  ko.applyBindings(vm);

  //Don't know where else to put this
  window.onfocus = function() {
    //Workaround for Chrome bug
    //http://stackoverflow.com/a/2952386/1216976
    window.setTimeout(function () { document.title = vm.rooms()[vm.currentRoom()].name; }, 200);
    vm.hasFocus = true;
  };
  window.onblur = function() {
    vm.hasFocus = false;
  };

}(this);