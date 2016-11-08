var express = require('express');
var passport = require('passport');
// var expressSession = require('express-session');
// var googleStrategy = require('passport-google-oauth2').Strategy;
var auth = require('./auth');
var bodyParser = require('body-parser')
var mongo = require('mongodb').MongoClient;
var bCrypt = require('bcrypt-nodejs');
var app = express();

// var flash = require('connect-flash');


app.set('views','./views');
app.set('view engine','jade');
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./styles'));
// app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
// app.use(flash());

// Passport needs to be able to serialize and deserialize users to support persistent login sessions
var user_logged ;	//this variable is gone when passport is ready
passport.serializeUser(function(user, done) {
	console.log('serializing user: ');console.log(user);
	user_logged = user;
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
	    console.log('deserializing user:',user);
	    done(err, user);
	});
});

var url = 'mongodb://localhost:27017/myproject';
var db;
mongo.connect(url,function (err,database) {
	if (err) return console.log(err)
	console.log('Connected to mongo');
	auth.login(passport,database);
	auth.signup(passport,database);

	db = database;
	var server = app.listen(app.get('port'), function() {
		console.log('Express server listening on port ' + server.address().port);
	});
});

var router = express.Router();

router.get('/',function (req,res) {
	res.render('index');
});

router.get('/signup',function (req,res) {
	res.render('signup');
});

router.get('/user',function (req,res) {
	res.render('user',{user:user_logged});
});

router.get('/delete_user',function (req,res) {
	res.render('delete',{user:user_logged});
});

router.get('/update_user',function (req,res) {
	res.render('update',{user:user_logged});
});


app.get('/manage', function(req, res){
	db.collection('user').find().toArray(function(err, result){
		if(err) return console.log(err)
			res.render('manage',{users:result})
	})
})

router.post('/login', passport.authenticate('login', { successRedirect: '/user',
                             failureRedirect: '/' }));

router.post('/signup',passport.authenticate('signup', { successRedirect: '/',
                             failureRedirect: '/signup' }));

router.post('/delete_user',function (req,res) {
	if (auth.isValidPassword(user_logged,req.body.password)) {
		db.collection('user').findOneAndDelete({username:user_logged.username},function (err, result) {
	            if (err) return console.log(err)

	                res.end(JSON.stringify(result))
	            })
		res.redirect('/');
	}
	else
	{
		res.send('Senha incorreta');
	};
});

router.post('/update_user', function(req, res){
	console.log('req.body');
	console.log(req.body);
	if (req.body.phone == '')
	{
		req.body.phone = user_logged.phone;
	}
	else
	{
		user_logged.phone = req.body.phone;
	}
	if (req.body.email == '')
	{
		req.body.email = user_logged.email;
	}
	else
	{
		user_logged.email = req.body.email;
	}
	db.collection('user').updateOne({username:user_logged.username},
	{
		$set:{
			email: req.body.email,
			phone: req.body.phone
		}
	},function (err, result) {
		if (err) return console.log(err)
		console.log(JSON.stringify(result));
		res.end(JSON.stringify(result))
	})
	res.redirect('/user')
})


router.get('/signout', function(req, res) {
		req.logout();
		user_logged = undefined;
		res.redirect('/');
});
app.use('/', router);
