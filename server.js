var express = require("express");

var app = express();

app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    
    res.sendFile('index.html');
})

var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('The app is listening on: ' + port);
})