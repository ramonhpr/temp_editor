var express = require('express');
var url = require('url');
var bodyParser = require('body-parser');
var mongo = require("mongodb").MongoClient


var app = express();
var urlencoderParser = bodyParser.urlencoded({ extended: false})
var db; 

//allow template engine
app.set('view engine', 'ejs')

//JavaScript files should go on public directory
app.use(express.static('public'))

//allows server to read JSON
app.use(bodyParser.json())

mongo.connect('mongodb://localhost:27017/testdb', function(err, database){
	if (err) return console.log(err)

	db = database;

	var server = app.listen(8081, function(){
		var host = server.address().address;
		var port = server.address().port;

		console.log("Server running at http://%s%s", host, port);
	})

});

app.get('/manage', function(req, res){
	db.collection('users').find().toArray(function(err, result){
		if(err) return console.log(err)
			
		res.render('usersManager.ejs', {users: result})
	})
})

app.get('/*', function(req, res){
	var pathname = url.parse(req.url).pathname;
	console.log("Request for " + pathname + " received.");
	res.sendFile( __dirname + "/" + pathname);
})

app.post('/new_user_submit', urlencoderParser, function(req, res){

	db.collection('users').save(req.body, function(err, result){
		if (err) return console.log(err)

	    console.log('saved to database')
	    //res.redirect('/index.html')
	})

	console.log(req.body);
	res.end(JSON.stringify(req.body));
})

app.post('/update_user_submit', urlencoderParser, function(req, res){
	var content = req.body;
	db.collection('users').update({email:req.body.email},
	{
		$set:{
			username: content.username,
			phone: content.phone
		}
	},function (err, result) {
		if (err) return console.log(err)

		res.end(JSON.stringify(result))
	})
})

app.post('/delete_user_submit', urlencoderParser, function(req, res){
	db.collection('users').remove({email:req.body.email},function (err, result) {
		if (err) return console.log(err)

		res.end(JSON.stringify(result))
	})
})

