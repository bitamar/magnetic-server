var app = require('express')();
var http = require('http').Server(app);

var port = process.env.PORT || 8080;

var magnets = {
  1: {id: 1, word: "nothing", x: 200, y: 200, rotation: 0},
  2: {id: 2, word: "just", x: 300, y: 300, rotation: 0}
};

app.get('/', function(req, res){
  res.send(magnets);
});

http.listen(port, function(){
  console.log('listening on ' + port);
});
