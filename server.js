var express = require("express");
var Bing = require("node-bing-api")({accKey: process.env.API_KEY});
var mongo = require("mongodb").MongoClient;
var url = require("url");
var dburl = 'mongodb://'+process.env.DB_LOGIN+':123456789@ds023245.mlab.com:23245/image-search'

var app = express();

app.use(express.static(__dirname + "/public"));

app.get('/', function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    
    res.sendFile('index.html');
})

mongo.connect(dburl, function(dberr, db) {
    if(dberr) throw dberr;
    var collection = db.collection('latest');
    //get latest search results
    app.get('/latest/', function(req, res) {
        res.writeHead(200, {'Content-Type':'application/JSON'});
        collection.findOne({
            _id: '1'
        }, function(err, doc) {
            if (err) throw err;
            res.end(JSON.stringify(doc.data));
        })
    })
    //get the search results
    app.get('/search/:search*', function(req, res) {
        res.writeHead(200, {'Conten-Type':'application/JSON'});
        var searchResults;
        var skip = 0;
        var query = url.parse(req.url).query;
        //if query exists deal with it
        if(query) {
            if(query.split('=')[0] == 'offset') {
                skip = +query.split('=')[1].replace('&', '');
            }
        }
        //search bing images
        Bing.images(req.params.search, {skip: skip, top: 10}, function(err, response, body) {
            if (err) throw err;
            var latest;
            collection.findOne({
                _id: '1'
            }, function(err, doc) {
                if(err) throw err;
                var date = new Date();
                latest = doc;
                latest.data.pop();
                latest.data.unshift({
                    term: req.params.search,
                    when: date.toString()
                });
                collection.replaceOne({
                    _id: '1'
                }, latest);
                
            })
            searchResults = body.d.results;
            var filteredResults = [];
            
            searchResults.forEach(function(element) {
                filteredResults.push({Title: element.Title, ImageURL: element.MediaUrl, SourceURL: element.SourceUrl})
            })
            
            res.end(JSON.stringify(filteredResults));
            
            
        })
    })
})

var port = process.env.PORT || 8080;

app.listen(port, function() {
    console.log('The app is listening on: ' + port);
})