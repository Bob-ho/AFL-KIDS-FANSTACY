var express = require('express');// ExperssJS Framework
var app = express();// Invoke express to variable for use in application
var bodyParser = require('body-parser'); // Node.js body parsing middleware. Parses incoming request bodies in a middleware before your handlers, available under req.body.
var router = express.Router(); // Invoke the Express Router
var appRoutes = require('./app/routes/api')(router); // Import the application end points/API
var path = require('path');
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
app.use(expressValidator());
app.use(bodyParser.json()); // Body-parser middleware
app.use(express.static(__dirname + '/public')); // Allow front end to access public folder
app.use(appRoutes);
app.enable('trust proxy');

//var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var morgan = require("morgan");









cfenv = require('cfenv');// Cloud Foundry Environment Variables
appEnv = cfenv.getAppEnv();// Grab environment variables

// Use SSL connection provided by Bluemix. No setup required besides redirecting all HTTP requests to HTTPS
if (!appEnv.isLocal) {
    app.use(function (req, res, next) {
        if (req.secure) // returns true is protocol = https
            next();
        else
            res.redirect('https://' + req.headers.host + req.url);
    });
}
app.use(morgan("dev"));






/********************************
Local Environment Variables
 ********************************/
if(appEnv.isLocal){
    require('dotenv').load();// Loads .env file into environment
}

/******************************** 
 MongoDB Connection
 ********************************/

//Detects environment and connects to appropriate DB
if(appEnv.isLocal){
    //const url = "mongodb+srv://hominh:HMTmibt10@gettingstarted-uypci.mongodb.net/test?retryWrites=true";
    mongoose.connect(process.env.LOCAL_MONGODB_URL);
    //mongoose.connect(url);

    sessionDB = process.env.LOCAL_MONGODB_URL;
   console.log('Your MongoDB is running at ' + process.env.LOCAL_MONGODB_URL);
   //console.log('Your MongoDB is running at ' + url);
}
// Connect to MongoDB Service on Bluemix
else if(!appEnv.isLocal) {
    var mongoDbUrl, mongoDbOptions = {};
    var mongoDbCredentials = appEnv.services["compose-for-mongodb"][0].credentials;
    var ca = [new Buffer(mongoDbCredentials.ca_certificate_base64, 'base64')];
    mongoDbUrl = mongoDbCredentials.uri;
    mongoDbOptions = {
      mongos: {
        ssl: true,
        sslValidate: true,
        sslCA: ca,
        poolSize: 1,
        reconnectTries: 1
      }
    };

    console.log("Your MongoDB is running at ", mongoDbUrl);
    mongoose.connect(mongoDbUrl, mongoDbOptions); // connect to our database
    sessionDB = mongoDbUrl;
}
else{
    console.log('Unable to connect to MongoDB.');
}

// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://hominh:<HMTmibt10>@gettingstarted-uypci.mongodb.net/test?retryWrites=true";
// //const uri = "mongodb+srv://kay:myRealPassword@cluster0.mongodb.net/admin";
// const client = new MongoClient(uri);
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//  // perform actions on the collection object
//   client.close();
// });

app.get("*", function (req, res) {
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

/********************************
Ports
********************************/
app.listen(appEnv.port, appEnv.bind, function () {
    console.log("Node server running on " + appEnv.url);
});