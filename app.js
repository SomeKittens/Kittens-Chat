
/**
 * Module dependencies.
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
  console.log(req.headers.host);
  res.sendfile(__dirname + '/index.html');
});

app.get('/client.js', function(req, res) {
  //Fix for local testing
  if(req.headers.host.indexOf('localhost') > -1) {
    res.sendfile(__dirname + '/client.localhost.js');
  } else {
    res.sendfile(__dirname + '/client.js');
  }
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var servar = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

iosockets.start(servar);