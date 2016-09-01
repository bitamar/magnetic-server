var app = require('express')();
var bodyParser = require('body-parser');
var http = require('http').Server(app);

var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));

var nextMagnetId = 3;
var magnets = {
  1: {id: 1, word: "nothing", x: 200, y: 200, rotation: 0},
  2: {id: 2, word: "just", x: 300, y: 300, rotation: 0}
};

app.get('/', function(req, res) {
  res.send(magnets);
});

app.get('/:magnetId', function(req, res) {
  if (magnets[req.params.magnetId]) {
    res.send(magnets[req.params.magnetId]);
  }
  else {
    res.status(404).end('not found');
  }
});

app.patch('/:magnetId', function(req, res) {
  var magnet = magnets[req.params.magnetId];
  if (!magnet) {
    res.status(404).end('not found');
    return;
  }

  if (isNaN(req.body.rotation) || isNaN(req.body.x) || isNaN(req.body.y)) {
    res.status(403).end('gotcha');
  }

  magnet.x = parseFloat(req.body.x);
  magnet.y = parseFloat(req.body.y);
  magnet.rotation = parseFloat(req.body.rotation);

  res.send(magnet);
});

http.listen(port, function(){
  console.log('listening on ' + port);
});
