var express = require('express');
// var session = require('express-session');
var app = express();
var path = require('path');
var router = express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var bCrypt = require('bcrypt');

//using flash
// const flash = require('express-flash-notification');
const session = require('express-session');
// app.use(flash());
var cookieParser = require('cookie-parser');

/*  PASSPORT SETUP  */
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function(err, user) {
    cb(err, user);
  });
});

//Middleware
//const ensureAuthentication, authorization = require('passport-middleware');


 /* MONGOOSE SETUP */

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/kfl');
const Schema = mongoose.Schema;
const UserDetail = new Schema({
    name:String,
    email: String,
    password: String,
    bday:String,
    tname:String,
    favteam:String
  });
const UserDetails = mongoose.model('user-login', UserDetail, 'user-login');

var teams = require('./teams.js');

//var crypto    = require('crypto'), hmac, signature;



app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(session({
    key: 'user_id',
    secret: 'somerandonstuffs',
    resave: true,
    saveUninitialized: false,
    cookie: { maxAge: 600000 }
  }));




/* PASSPORT LOCAL AUTHENTICATION */

const LocalStrategy = require('passport-local').Strategy;

passport.use('login',new LocalStrategy(
    {
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
  function(req,email, password, done) {

      UserDetails.findOne({
        'email': email
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          console.log('User Not Found with username '+email);
          return done(null, false, { message: 'Incorrect username.'});
        }

        if (!isValidPassword(user, password)){
            console.log('Invalid Password');
          return done(null, false,{message: 'Invalid Password'});
        //   return done(null, false,req.flash('message', 'Invalid Password'));
        }

        return done(null, user);
      });
  }
));

//LOGIN

app.post('/login_user',
  passport.authenticate('login', { failureRedirect: '/error' }),
  function(req, res) {

    req.session.user = req.user.email;
    req.session.team = req.user.team;
    console.log(req.user.email);


    res.redirect('/profile');

  });


//SignUp
app.post('/sign_up',
  passport.authenticate('sign_up', { failureRedirect: '/error_signup' }),
  function(req, res) {
      req.session.user = req.user.email;
      req.session.team = req.user.team;
        res.redirect('/profile');
  });

passport.use( 'sign_up',new LocalStrategy({
       usernameField : 'email',
       passwordField : 'password',
       passReqToCallback : true
  },
  function(req, email, password, done) {
    findOrCreateUser = function(){
      // find a user in Mongo with provided username
      UserDetails.findOne({email: email},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, {message:'user already exists'});
        } else {
          // if there is no user with that email
          // create the user

      var newUser = new UserDetails();
          // set the user's local credentials
          newUser.name =  req.param('uname');
          newUser.password = createHash(req.param('password'));
          newUser.email = req.param('email');
          newUser.bday = req.param('bday');
          newUser.tname = req.param('tname');
          newUser.favteam = req.param('favteam');
          console.log(newUser.name);

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);
              throw err;
            }
            console.log('User Registration succesful');
            return done(null, newUser);
          });
        }
      });
    };

    // Delay the execution of findOrCreateUser and execute
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));

// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
   }
// check encrypted password validation
   var isValidPassword = function(user, password){
    return bCrypt.compareSync(password, user.password);
  }
// middleware function to check for logged-in users
var sessionChecker = function (req, res, next){
    if (req.session.user && req.cookies.user_id) {
        res.redirect('/');
    } else {
        next();
    }
};


app.use(express.static(__dirname + '/public'));


app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/error', function(req, res) {
    console.log('error login');
        res.json({"message":"Invalid Credentials"});
});
app.get('/error_signup', function(req, res) {
  
  console.log('error signup');
  res.json({"message":"Unable to signup or user may already exist!"});
 
});
app.get('/success',function(req, res) {
    req.session.user = req.user.email;
    req.session.team = req.user.team;
    res.send("Welcome "+ req.user.name + "!!" +'<br><br><a href="/leaderboard">leaderboard</a>' )
  });

app.get('/login', function(req, res) {
    res.sendFile(path.join(__dirname + '/login.html'));
});
app.get('/signup_page', function(req, res) {
    res.sendFile(path.join(__dirname + '/signup.html'));
});
app.get('/profile', function (req, res) {
    if (req.session.user && req.cookies.user_id) {
        res.sendFile(__dirname + '/profile.html');

    }
});
app.get('/leaderboard', function(req, res)  {
    if (req.session.user && req.cookies.user_id) {
        res.sendFile(__dirname + '/leaderboard.html');
    } else {
        console.log('login first');
        res.redirect('/');
    }
});
app.get('/playerDraft', function(req, res)  {
    if (req.session.user && req.cookies.user_id) {
        res.sendFile(__dirname + '/Draft_players.html');
    } else {
        console.log('login first');
        res.redirect('/');
    }
});


app.get('/teams', function(req, res) {

    res.json(teams);
});
app.get('/userTeam', function(req, res) {
    UserDetails.findOne({email: req.session.user},function(err, user) {
        res.json(user);
    })


});

// GET /logout
app.get('/logout', function(req, res) {
    if (req.session) {
      // delete session object
      req.session.destroy(function(err) {
        if(err) {
          console.log('error');
        } else {
            console.log('logout successfully');
        res.redirect('/');
        }
      });
    }
  });



app.listen(3000);
console.log('Listening on port 3000!');
