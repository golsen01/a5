var express = require('express');

var app = express();//express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send('<h1>Hello World!</h1>');
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
