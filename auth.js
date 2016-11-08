var LocalStrategy   = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');

exports.login = function(passport,db)
{
	passport.use('login', new LocalStrategy({
            passReqToCallback : true
        },
        function(req, username, password, done) {
            // check in mongo if a user with username exists or not
            db.collection('user').findOne({username:req.body.username},function (err,user) {
                    // In case of any error, return using the done method
                    if (err)
                        return done(err);
                    // Username does not exist, log the error and redirect back
                    if (!user){
                        console.log('User Not Found with username '+username);
                        return done(null, false, req.flash('message', 'User Not found.'));
                    }
                    // User exists but wrong password, log the error
                    if (!isValidPassword(user, password)){
                        console.log('Invalid Password');
                        return done(null, false, req.flash('message', 'Invalid Password')); // redirect back to login page
                    }
                    // User and password both match, return user from done method
                    // which will be treated like success
                    return done(null, user);
                }
            );

        })
    );



}
var isValidPassword = function(user, password){
        return bCrypt.compareSync(password, user.password);
    }
exports.isValidPassword = isValidPassword;

// // var user = {username:String,email:String,phone:String};
// exports.isAuthenticated = function (req, res, next) {
//     // if user is authenticated in the session, call the next() to call the next request handler
//     // Passport adds this method to request object. A middleware is allowed to add properties to
//     // request and response objects

//     if (req.isAuthenticated()){
//             console.log('entrou!!!!');
//             // user.username = req.body.username;
//             // user.email = req.body.email;
//             // user.phone = req.body.phone;
//             return next();
//     }
//     console.log('user not authenticated!!!!');
//     // if the user is not authenticated then redirect him to the login page
//     res.redirect('/');
// }

exports.signup = function(passport,db){
	passport.use('signup', new LocalStrategy({
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            findOrCreateUser = function(){
                // find a user in Mongo with provided username
                db.collection('user').findOne({username:req.body.username},function (err,user) {
                    // In case of any error, return using the done method
                    if (err){
                        console.log('Error in SignUp: '+err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists with username: '+username);
                        return done(null, false, req.flash('message','User Already Exists'));
                    } else {
                        // if there is no user with that email
                        // create the user
                        req.body.password = createHash(req.body.password);
                        var new_user =req.body;
                        db.collection('user').save(new_user,function (err,result) {
                            if (err)
                                return console.log(err);
                            console.log('saved to database');
                            return done(null, new_user);
                        });
                    }
                });
            };
            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

    // Generates hash using bCrypt
    var createHash = function(password){
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    }
}
