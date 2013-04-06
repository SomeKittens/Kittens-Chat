!function(){
  'use strict';

  function chatViewModel() {
    var self = this;
    
    //daytums
    self.history = ko.observableArray([]);
    
    //We set the inital name to 'Connecting...' because management told us it conformed with ISO9001 standards
    self.username = ko.observable('Connecting...');
    self.usercolor = ko.observable();
    
    //Number-crunching things
    self.timestamp = function(dt) {
      //Broke this into several variables instead of one giant one for readability
      var hours = dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()
        , minutes = dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes();
      return ' @ ' + hours + ':' + minutes + ' : '; 
    }
  };

  //Attach the VM to our global object (so Socket.io can toy with it)
  window.vm = new chatViewModel();
  
  //Scroll to the bottom of the chat window when a new message arrives
  vm.history.subscribe(function() {
    var content = $('#content');
    
    //Only animate if the user is already at the bottom
    if(content.scrollTop() + content.innerHeight() >= content[0].scrollHeight) {
    
      //FIXME: doesn't always trigger 
      content.animate({
          scrollTop: content[0].scrollHeight
        }, 400);
    }
  });
  
  ko.applyBindings(vm);
}(this);