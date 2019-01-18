//Import the User model
var User = require("../models/user");
var Player = require("../models/player");
var Team = require("../models/team");
var jwt = require('jsonwebtoken');
var aflSecrete = "IamVerySecreteWhereYoucouldnotFineMe";
module.exports = function (router) {
    //*****Check team name, it is only allow unique team name*/
    router.post('/GetMyPoint', function (req, res) {
        console.log("Get point" + req.body.userId);
        //Look at the Player DB 
        User.findOne({ _id: req.body.userId }).select("Point TeamName").exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log("result" + result);
                res.json({ success: true, point: result.Point, teamName: result.TeamName });

            }
        });


    });
    //*****Add To My Collection */
    router.post('/AddToMyTeam', function (req, res) {
        console.log("Add to my team");
        console.log(req.body.id);
        console.log(req.body.point);
        User.findByIdAndUpdate(req.body.id, { $set: { TeamName: req.body.teamName, Point: req.body.point } }, { new: true }, function (err, update) {
            if (err) {
                console.log("Team name has already existed");
                res.json({ success: false, message: 'Team name has already existed' });
            } else {
                Team.deleteMany({ userID: req.body.id }, function (err) {
                    if (err) {
                        console.log(err);
                        res.json({ success: false, message: err });
                    }
                    else {
                        console.log("Deleted the team that match the player");
                        for (var i = 0; i < req.body.player.length; i++) {
                            console.log(req.body.player[i]);
                            var team = new Team();
                            team.playerID = req.body.player[i];
                            team.userID = req.body.id;
                            team.save(function (err) {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                        setTimeout(function () {
                            res.json({ success: true });
                        }, 1000);

                    }

                });
            }

        });
    });

    //*****View Player pool */
    router.post('/ViewPlayerPool', function (req, res) {
        //Look at the Player DB 
        Player.find({}).exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {

                res.json({ success: true, collections: result });

            }
        });

    });
    //*****View Player by ID */
    router.post('/ViewPlayerID', function (req, res) {
        var playerId = req.body.player;
        console.log(playerId);
        //Look at the Player DB 
        Player.find({ _id: playerId }).exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                res.json({ success: true, collections: result });

            }
        });

    });
    //*****View All User Point */
    router.post('/Leaderboard', function (req, res) {
        User.find({}).sort('-Point').exec(function (err, result) {
            if (err) {
                console.log(err);
            } else {
                console.log(result);
                res.json({ success: true, result: result });
            }
        });

    });
    //*****View User team */
    router.post('/ViewMyTeam', function (req, res) {
        var userId = req.body.userId;
        var array = [];
        Team.find({ userID: userId }).select("playerID userID").exec(function (err, result) {
            console.log(result);
            result.forEach(function (item) {
                //Look at the Player DB 
                Player.findOne({ _id: item.playerID }).exec(function (err, inresult) {
                    console.log(inresult)
                    //Add to the Player collectoin
                    array.push(inresult);
                });
            });
            setTimeout(function () {
                console.log(array);
                res.json({ success: true, collections: array });
            }, 1000);

        });
    });
    //*****Get player detail */
    router.post('/getPlayerDetail', function (req, res) {
        console.log(req.body.id);
        Player.findOne({ _id: req.body.id }).exec(function (err, result) {
            if (err) {
                console.log("error" + err);
                throw err;
            }
            if (!result) {
                console.log("result");
                res.json({ success: false, message: "Could not get job detail" });
            }
            else {
                console.log("pass");
                res.json({ success: true, result: result });
            }
        });
    });
    //*****Add player details*/
    router.post('/AddPlayer', function (req, res) {
        var player = new Player();
        player.imageLink = req.body.imageLink;
        player.playerName = req.body.playerName;
        player.point = req.body.point;
        console.log(player);

        player.save(function (err) {
            if (err) {
                res.json({ success: false, message: 'Unable to save to the database', m: err });
                return;
            }

            res.json({ success: true, message: 'Player created!' });

        });
    });


    //*****User route**********
    //Login route
    router.post('/Login', function (req, res) {
        //Check the password is empty or not
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        var errors = req.validationErrors();
        if (errors) {
            res.json({ success: false, message: "Username, password was left empty" });
        }
        else {
            //look at the database to get the username, password and email base on the username
            User.findOne({ username: req.body.username }).select("_id username password email").exec(function (err, result) {
                if (err) {
                    throw err;
                }
                if (!result) {
                    res.json({ success: false, message: "Could not authenticated user" });
                }
                else if (result) {
                    var valid = result.ComparePassword(req.body.password);
                    if (!valid) {
                        res.json({ success: false, message: "Could not authenticated password" });
                    }
                    else {
                        //generate the token
                        var token = jwt.sign({ _id: result._id, username: result.username, email: result.email }, aflSecrete, { expiresIn: '2h' });
                        res.json({ success: true, message: "User authenticated", id: result._id, token: token, username: result.username });

                    }
                }

            });
        }
    });
    //Register route
    router.post('/Register', function (req, res) {

        // Validation prior to checking DB. Front end validation exists, but this functions as a fail-safe
        req.checkBody('username', 'Username is required').notEmpty();
        req.checkBody('password', 'Password is required').notEmpty();
        req.checkBody('email', 'Email is required').notEmpty();
        console.log(req.body.username);
        console.log(req.body);

        var errors = req.validationErrors(); // returns an object with results of validation check
        if (errors) {
            res.json({ success: false, message: 'Username, email or password was left empty' });
            return;
        }


        //Create the user object of the User Model
        var user = new User();
        //Assign the name, password, email
        user.username = req.body.username;
        user.password = req.body.password;
        user.email = req.body.email;
        //Save to the database
        user.save(function (err) {
            if (err) {
                res.json({ success: false, message: err });
                return;
            }
            else {
                res.json({ success: true, message: 'user created!' });
            }
        });
    });

    return router;
}


