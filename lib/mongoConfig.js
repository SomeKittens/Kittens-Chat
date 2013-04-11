'use strict';

//Using `mongeese` as a variable name here so as to avoid confusion outside of this file
var mongeese = require('mongoose');

//We're on the live site (Heroku)
if(process.env.NODE_ENV = 'production') {
  mongeese.connect(process.env.MONGOHQ_URL);
  
//localhost testing
} else {
  mongeese.connect('mongodb://localhost/chat');
}

module.exports = {
  mongoose: mongeese,
  message: mongeese.model('Message', {
    author: String,
    color: String,
    text: String,
    time: Date
  }),
  user: mongeese.model('User', {
    name: String,
    color: String,
    lastSeen: Date
  })
  /* TODO
  room: mongeese.model('Room', {
    name: String,
    url: String,
    
    //Because why not?
    private: Boolean
    
    //Probably should have some sort of admin thing
    roomOwners: [String]
  }
  */
}