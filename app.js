var express = require("express");
var http = require("http");

var port = "3000";
var app = express();

app.use(express.static(__dirname + "/public"));
http.createServer(app).listen(port);