var express = require('express');
var passport = require('passport');
var expressSession = require('express-session');
var googleStrategy = require('passport-google-oauth2').Strategy;
var auth = require('./auth');
var bodyParser = require('body-parser')
var fs = require('fs');

var app = express();


app.set('views','./views');
app.set('view engine','jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./styles'));
// app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());

// Passport needs to be able to serialize and deserialize users to support persistent login sessions
passport.serializeUser(function(user, done) {
	console.log('serializing user: ');console.log(user);
	done(null, user._id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
	    console.log('deserializing user:',user);
	    done(err, user);
	});
});
auth.login(passport);
auth.signup(passport);
app.set('port', process.env.PORT || 3000);

var router = express.Router();

router.get('/',function (req,res) {
	res.render('index');
});

router.post('/login',function (req,res) {
	var username = req.body.username;
	var html = 'Hello: ' + username + '.<br>' +
             '<a href="/">Try again.</a>';

	res.send(html);
});

router.get('/signup',function (req,res) {
	res.render('signup');
});

app.use('/', router);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});