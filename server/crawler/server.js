var db = require('./db.js');
var express = require("express");

var app = express();

app.get('/', function(req, res){
  res.send("I am a crawler. Go get my <a href=\"/set\">data</a>");
});

app.get('/set', function(req, res){
  res.json(db.countSet);
});

app.get('/links', function(req, res){
  res.json(db.links);
});

app.get('/edges', function(req, res){
  res.json(db.edgeSet);
});

app.listen(8888);