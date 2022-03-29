var http = require('http');

// require the new module
var handler = require('./handler');

var server = http.createServer(handler);

server.listen(3000);

