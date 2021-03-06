'use strict';

/**
 * This is all boilerplate stuff for Express.  Feel free to ignore most of it.
 * The important part is on lines 35-41
 */

var express = require('express')
  , iosockets = require('./sockets')
  , http = require('http')
  , path = require('path');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8888);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//We're assigning the result of http.createServer to our own variable
var servar = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//...and passing it to our sockets
iosockets.start(servar);