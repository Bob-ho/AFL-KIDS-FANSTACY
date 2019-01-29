var express = require('express');
// var session = require('express-session');


var formidable = require('formidable');
var app = express();
var path = require('path');
var router = express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var bCrypt = require('bcrypt');
var fs = require('fs');
app.set('views', './views');
app.set('view engine', 'pug');

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
    team:String
  });
const UserDetails = mongoose.model('user-login', UserDetail, 'user-login');


const playerDetails = new Schema({
  name:String,
  playerid: String,
  team: String,
  opponent:String,
  round:String,
  kicks:String,
  marks:String,
  handballs:String,
  disp:String,
  goals:String,
  behinds:String,
  hitouts:String,
  tackles:String,
  rebounds:String,
  inside50:String,
  clearances:String,
  clangers:String,
  freesfor:String,
  freesagainst:String,
  brownlow:String,
  contestedpossessions:String,
  uncontestedpossessions:String,
  contestedmarks:String,
  marksinside50:String,
  onepercenters:String,
  bounces:String,
  goalassists:String,
  timeplayed:String,
});
const playersList = mongoose.model('players-list', playerDetails, 'players-list');

const userTeam = new Schema({
  name:String,
  ownerID:String,
  members: String,
  points: String,
  status:String
});
const userTeams = mongoose.model('team-list', userTeam, 'team-list');

const bridgeTeam = new Schema({
  teamid: String,
  playerid:String
});
const bridgeTeams = mongoose.model('team-bridge', bridgeTeam, 'team-bridge');

// const Board = new Schema({
//   teamid: String,
//   points:String
  
// });
// const leaderBoard = mongoose.model('leader-board', Board, 'leader-board');


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
    req.session.userData= req.user;
    req.session.email = req.user.email;
    req.session.user = req.user.name;
    req.session.team = req.user.team;
    
    console.log(req.session.userData.tname);

    res.redirect('/home');
    
  });


//SignUp
app.post('/sign_up',
  passport.authenticate('sign_up', { failureRedirect: '/error_signup' }),
  function(req, res) {
      req.session.user = req.user.email;
      req.session.team = req.user.team;
      req.session.userData = req.user;
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

            var newTeam = new userTeams();
          // set the team name
              newTeam.name =  newUser.tname;
              newTeam.ownerID = newUser._id;
              newTeam.save(function(err){
                if (err){
                  console.log('Error in Saving Team: '+err);
                  throw err;
                }
                console.log('User Team Creation Succesful');
                return done(null, newTeam);
              });

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
    res.sendFile(path.join(__dirname + '/views/index.html'));
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


app.get('/home', function (req, res) {
    if (req.session.user && req.cookies.user_id) {
      res.render('home', { username: req.session.user, teamName: req.session.userData.tname });
        // res.sendFile(__dirname + '/profile.html');
    }
});

app.get('/profile', function(req, res)  {
  if (req.session.user && req.cookies.user_id) {
    res.redirect('/home');
  } else {
      console.log('login first');
      res.redirect('/');
  }
});


app.get('/leaderboard', function(req, res)  {
    if (req.session.user && req.cookies.user_id) {
      var myid = req.session.userData._id;
      console.log("myid: "+myid);
      var myteamID = req.session.myTeam;
      
        userTeams.find(function(err,thisTeam){
          if (err){
            console.log('Error in Loading data: '+err);
            return done(err);
          }
          // already exists
          if (thisTeam) {
            // req.session.myTeam = thisTeam[0]._id;
            for(i=0;i<thisTeam.length;i++){
              console.log(""+thisTeam[i].name+" has total points of :"+thisTeam[i].points);
            }
             req.session.listofteams = thisTeam;
             res.render('leaderboard', { 
               username: req.session.user, 
               teamName: req.session.userData.tname, 
               listteams: req.session.listofteams });      
                  
          } 
        }).sort({points: -1});// descending order of teams linked to points
      
      
    } else {
        console.log('login first');
        res.redirect('/');
    }

  });


app.post('/addPlayers',function(req,res,done) {
    
    var newPlayer = new playersList();
        // set the user's local credentials
        newPlayer.name =  req.param('pname');
        newPlayer.imgsrc = req.param('imgsrc');
        newPlayer.team = req.param('team');
        newPlayer.age = req.param('age');
        newPlayer.points = req.param('points');
        newPlayer.status = req.param('status');
        console.log(newPlayer.name);

        // var newTeam = new userTeams();
        //     newTeam.name = newPlayer.team;


        // save the user
        newPlayer.save(function(err) {
          if (err){
            console.log('Error in Saving user: '+err);
            throw err;
          }
          console.log('User Registration succesful');
          return done(null, newPlayer);
        });
      
  
  res.redirect("/getplayers");
});


app.get('/getplayers', function(req, res,done) {
  // console.log('Error in Loading data: ');
    // find a player in Mongo with 
    playersList.find(function(err, playerdata) {
      // In case of any error return
      if (err){
        console.log('Error in Loading data: '+err);
        return done(err);
      }
      // already exists
      if (playerdata) {
        req.session.ListPlayers = playerdata;
        console.log(req.session.ListPlayers[0].name);
        // res.json(playerdata.name);

        res.render('playerdraft', { username: req.session.user, 
          teamName: req.session.userData.tname, 
          playerlist: req.session.ListPlayers });
        
        return done(null, false, {message:' found'});
      } 
      // console.log('players found');
      
    });

  // Delay the execution of findOrCreateUser and execute
  // the method in the next tick of the event loop
  // process.nextTick(findOrCreatePlayer);
  
  
});
app.post('/savePlayers', function(req, res) {
  
  
    var IDList = (req.param('IDList')).split(",");
    console.log("Result "+IDList);
    
    var mytname = req.session.userData.tname;
    var myid = req.session.userData._id;
    console.log("myid: "+myid);
    var myteamID = findmyTeamID();
  
    
    function findmyTeamID(){
      userTeams.find({ownerID: myid},function(err,thisTeam){
        if (err){
          console.log('Error in Loading data: '+err);
          return done(err);
        }
        // already exists
        if (thisTeam) {
          req.session.myTeam = thisTeam[0]._id;
          console.log("myteamid: "+thisTeam[0]._id);
          findmyPlayers(req.session.myTeam);
        } 
      });
     
    }
    function findmyPlayers(myteamID){
      console.log("IDLIST" + IDList.length);

      bridgeTeams.find({teamid: myteamID},function(err, teamData) {
    
        // In case of any error return
        if (err){
          console.log('Error in Loading data: '+err);
          return done(err);
        }
        // already exists
        if (teamData  && teamData.length != 0) {
          //  players already in table
          console.log("IF"+teamData.length);


          // delete old data 
          for(i=0;i<teamData.length;i++){
            var thisID = teamData[i]._id;
            console.log('I index: '+i);
            for(j=0;j<IDList.length;j++){
              var newID = IDList[j];
              console.log('J index: '+j);
              if(thisID == newID){
                bridgeTeams.deleteOne({_id: thisID},function(err){
                  if (err){
                    console.log('doc not deleted : '+err);
                    throw err;
                    }
                  
                  if(obj){
                    
                  }
                  });
                }
              }
            }
          //


          if(IDList.length != 0 ){
            savenewPlayers(myteamID);
          }else{
            findnewPlayers(myteamID);
          }
        } 
        else {
          // no players in table
            console.log("ELSE");
            if(IDList.length != 0 ){
              savenewPlayers(myteamID);
            }else{
              findnewPlayers(myteamID);
            }
        }
    });
    }
    function savenewPlayers(myteamID){
      for(i =0; i<IDList.length;i++){
        var newBridge = new bridgeTeams();
        newBridge.teamid = myteamID;
        newBridge.playerid = IDList[i];
        newBridge.save(function(err) {
          if (err){
            console.log('Error in Saving player in team: '+err);
            throw err;
            }
        });
      }

      findnewPlayers(myteamID);
      
    }
    async function findnewPlayers(myteamID){

      let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("done!"), 2000)
      });
    
      let result = await promise; // wait till the promise resolves (*)


      bridgeTeams.find({teamid: myteamID},function(err, newteamData) {
    
        // In case of any error return
        if (err){
          console.log('Error in Loading data: '+err);
          return done(err);
        }
        //  exists
        if (newteamData) {
          var teamPlayerList = []; 
          console.log("length" + newteamData.length + newteamData[0]);
         
          for(i =0;i<newteamData.length;i++){
            playersList.find({_id: newteamData[i]},function(err, thisplayerdata) {
              // In case of any error return
              if (err){
                console.log('Error in Loading data: '+err);
                return done(err);
              }
              // already exists
              if (thisplayerdata) {
                teamPlayerList.push(thisplayerdata);
                console.log(thisplayerdata);

              } 
              });
          }
          req.session.ListPlayers = teamPlayerList;
            
        }
      });

      res.render('myteam', { 
        username: req.session.user, 
        teamName: req.session.userData.tname, 
        teamplayers: req.session.ListPlayers 
      });  
    }
     
  
});
app.get('/myteam',function(req,res){
 
    var mytname = req.session.userData.tname;
    var myid = req.session.userData._id;
    console.log("myid: "+myid);
    var myteamID = findmyTeamID();

    
    function findmyTeamID(){
      userTeams.find({ownerID: myid},function(err,thisTeam){
        if (err){
          console.log('Error in Loading data: '+err);
          return done(err);
        }
        // already exists
        if (thisTeam) {
          req.session.myTeam = thisTeam[0]._id;
          console.log("myteamid: "+thisTeam[0]._id);
          findnewPlayers(req.session.myTeam);
        } 
      });
    
    }
    async function findnewPlayers(myteamID){

      let promise = new Promise((resolve, reject) => {
        setTimeout(() => resolve("done!"), 2000)
      });
    
      let result = await promise; // wait till the promise resolves (*)


      bridgeTeams.find({teamid: myteamID},function(err, newteamData) {
    
        // In case of any error return
        if (err){
          console.log('Error in Loading data: '+err);
          return done(err);
        }
        //  exists
        if (newteamData && newteamData.length != 0) {
          var teamPlayerList = []; 
          console.log("length " + newteamData.length);
        
          for(i =0;i<newteamData.length;i++){
            playersList.find({_id: newteamData[i].playerid},function(err, thisplayerdata) {
              // In case of any error return
              if (err){
                console.log('Error in Loading data: '+err);
                return done(err);
              }
              // already exists
              if (thisplayerdata) {
                teamPlayerList.push(thisplayerdata[0]);
                console.log(thisplayerdata[0]);
                console.log(teamPlayerList.length);
              } 
              });
           }
           if(teamPlayerList.length == 5) {
            req.session.ListPlayers = teamPlayerList; 
            console.log(req.session.ListPlayers);
            res.render('myteam', { 
              username: req.session.user, 
              teamName: req.session.userData.tname, 
              teamplayers: req.session.ListPlayers 
            });
          }
         } else {
          res.redirect("/getplayers");
         }

       });
 
     
    }

       
});


app.get('/earnPoints', function (req, res) {
  if (req.session.user && req.cookies.user_id) {
    res.render('earnPoints', { username: req.session.user, teamName: req.session.userData.tname });
      // res.sendFile(__dirname + '/profile.html');
  }
});

app.get('/webCrawler', function (req, res) {
  if (req.session.user && req.cookies.user_id) {

        fs.readFile('public/2018_stats.txt', 'utf-8', function(err, data) {
            if (err)
              return console.log(err);
            splitData = data.split("\n");  
            headers = splitData[0];
            console.log('headers: ' + headers);
            bodyData = [];
            for(i=1; i<splitData.length; i++) {
              //save each player in db table
              var newPlayer = new playersList();
              var playerDetails = splitData[i].split(",");
                
              if(playerDetails[2] != undefined){
                newPlayer.name = playerDetails[0].replace(/"/g,"");
                newPlayer.playerid = playerDetails[1];
                newPlayer.team = playerDetails[2].replace(/"/g,"");
                newPlayer.opponent = playerDetails[3].replace(/"/g,"");
                newPlayer.round = playerDetails[4].replace(/"/g,"");
                newPlayer.kicks = playerDetails[5];
                newPlayer.marks = playerDetails[6];
                newPlayer.handballs = playerDetails[7];
                newPlayer.disp = playerDetails[8];
                newPlayer.goals = playerDetails[9];
                newPlayer.behinds = playerDetails[10];
                newPlayer.hitouts = playerDetails[11];
                newPlayer.tackles = playerDetails[12];
                newPlayer.rebounds = playerDetails[13];
                newPlayer.inside50 = playerDetails[14];
                newPlayer.clearances = playerDetails[15];
                newPlayer.clangers = playerDetails[16];
                newPlayer.freesfor = playerDetails[17];
                newPlayer.freesagainst = playerDetails[18];
                newPlayer.brownlow = playerDetails[19];
                newPlayer.contestedpossessions = playerDetails[20];
                newPlayer.uncontestedpossessions = playerDetails[21];
                newPlayer.contestedmarks = playerDetails[22];
                newPlayer.marksinside50 = playerDetails[23];
                newPlayer.onepercenters = playerDetails[24];
                newPlayer.bounces = playerDetails[25];
                newPlayer.goalassists = playerDetails[26];
                newPlayer.timeplayed = playerDetails[27];
              }

              
              newPlayer.save(function(err) {
                if (err){
                  console.log('Error in Saving user: '+err);
                  throw err;
                }
                if(i > 9105){
                console.log('Players saved succesfully ; Count = '+i);
                }
              });

              bodyData.push(newPlayer);
            }
            console.log(splitData.length);
            console.log('result read: ' + bodyData.length);
        });
   
    
    res.redirect("/home");
      // res.sendFile(__dirname + '/profile.html');
  }
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



app.listen(8080);
console.log('Listening on port 8080!');
