var app = require("express")();
var bodyParser = require("body-parser");
var http = require("http").Server(app);

var port = process.env.PORT || 8080;

app.use(bodyParser.urlencoded({ extended: true }));

var maxId = 0;

var initialWords = ["nothing", "just", "fine", "fish", "mine", "sloth", "cat", "and", "again", "or", "and", "not", "are", "the", "the", "surely", "kitchen", "fabric", "no", "not"];
var magnets = {};
initialWords.forEach(function(word) {
  maxId++;
  magnets[maxId] = {
    id: maxId.toString(),
    word: word,
    position: {
      x: Math.floor(Math.random() * 1000),
      y: Math.floor(Math.random() * 1000)
    },
    rotation: Math.random() - 0.5
  };
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

app.get("/", function(req, res) {
  res.send(magnets);
});

app.get("/:magnetId", function(req, res) {
  if (magnets[req.params.magnetId]) {
    res.send(magnets[req.params.magnetId]);
  }
  else {
    res.status(404).end("not found");
  }
});

app.patch("/:magnetId", function(req, res) {
  var magnet = magnets[req.params.magnetId];
  if (!magnet) {
    res.status(404).end("not found");
    return;
  }

  if (isNaN(req.body.rotation) || isNaN(req.body.x) || isNaN(req.body.y)) {
    res.status(403).end("gotcha");
  }

  magnet.x = parseFloat(req.body.x);
  magnet.y = parseFloat(req.body.y);
  magnet.rotation = parseFloat(req.body.rotation);

  res.send(magnet);
});

http.listen(port, function(){
  console.log("listening on " + port);
});
