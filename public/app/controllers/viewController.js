var app = angular.module("indexApp", ['ngRoute']);
app.filter('startFrom', function () {
    return function (input, start) {
        //console.log("input " + input);
        //console.log("start "+ start);
        start = +start; //parse to int
        return input.slice(start);
    }
});

var Teams =
    [
        { type: "Essendon" },
        { type: "Adelaide" },
        { type: "Brisbane" },
        { type: "Carlton" },
        { type: "Collingwood" },
        { type: "Fremantle" },
        { type: "Geelong" },
        { type: "Gold Coast" },
        { type: "Greater Western Sydney" },
        { type: "Hawthorn" },
        { type: "Melbourne" },
        { type: "North Melbourne" },
        { type: "Port Adelaide" },
        { type: "Richmond" },
        { type: "St Kilda" },
        { type: "Sydney" },
        { type: "West Coast" },
        { type: "Western Bulldogs" },
    ];

app.controller('HeaderController', function ($scope, $window, $location, $window, $rootScope, $http) {
    //When the route change, this function will call
    $rootScope.$on('$routeChangeStart', function () {
        //console.log("Get token" +$window.localStorage.getItem("token"));
        //Get token

        if ($window.localStorage.getItem("token")) {
            $scope.authenticated = true;
            $scope.UserName = $window.localStorage.getItem("username");
            $window.localStorage.getItem("token");

            console.log("user login");
        }

        else {
            $scope.authenticated = false;
            console.log("user is not login");
        }

        if ($window.localStorage.getItem("playerID")) {
            $scope.showCardToAddToCollection = true;
            var array = [];
            array.push($window.localStorage.getItem("playerName"));
            $scope.cards = array;

            console.log("card" + $scope.cards);
        } else {
            console.log("NO");
            $scope.showCardToAddToCollection = false;

        }

    });
    //Logout function when the user click to the logout button
    $scope.logout = function () {
        console.log("user logout");
        $scope.authenticated = false;
        $window.localStorage.removeItem("token");
        $window.localStorage.removeItem("username");
        $location.path('/Home');
    };

});
//******User Login*****/
app.controller('loginController', function ($scope, $http, $location, $window) {
    console.log("this is login controller");
    if ($window.localStorage.getItem("token")) {
        console.log("user login");
        $location.path("/Home");
    }
    $scope.login = function () {
        console.log($scope.loginData);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/Login",
            data: $scope.loginData
        }).then(function mySuccess(response) {
            if (response.data.success) {
                //set token to local storage
                $window.localStorage.setItem("token", response.data.token);
                $window.localStorage.setItem("username", response.data.username);
                $window.localStorage.setItem("id", response.data.id);
                console.log(response.data.username);
                console.log(response.data.token);
                console.log("id" + response.data.id);
                //set the error meassage
                $scope.successMsg = response.data.message;
                $location.path("/Home");
            }
            else {
                //console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});
//******User Register*****/
app.controller('registerController', function ($scope, $http, $location) {
    console.log("this is register controller");
    $scope.register = function () {
        console.log("This is scope" + $scope.regData.username);
        $scope.errMessage = false;
        $http({
            method: "post",
            url: "/Register",
            data: $scope.regData
        }).then(function mySuccess(response) {
            console.log(response.data.success);
            if (response.data.success) {
                console.log(response.data.message);
                $scope.successMsg = response.data.message;
                $location.path("/login");
            }
            else {
                console.log(response.data.message);
                $scope.errMessage = response.data.message;
            }
        });
    };
});

app.controller('gainPointsController', function ($scope, $window, $http) {
    console.log("Gain Point Controller");
});

//my Account controller
app.controller('myProfileCtr', function ($scope, $window, $http, $location) {
    console.log("Profile controller");
    $scope.currentPage = 0;
    $scope.pageSize = 5;
    $scope.teams = Teams;
    //Set view, 
    $scope.MyTeamDisplay = false;
    $scope.DraftTeamDisplay = false;
    $scope.LeaderBoarDisplay = true;
    var PlayerPools = [];
    var PlayerSelected = [];
    FunctionPoint();
    FunctionLeaderBoard();
    MyRanking();
    function MyRanking() {
        $http({
            method: "post",
            url: "/ViewMyCurrentRank",
            data: { "id": $window.localStorage.getItem("id") }
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.result;
                $scope.MyRanking = res;
                console.log(res);
            }
            else {
                console.log(response.data);
            }
        });
    }
    function FunctionPoint() {
        $http({
            method: "post",
            url: "/GetMyPoint",
            data: { "userId": $window.localStorage.getItem("id") }
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.point;
                console.log(res);
                $scope.point = res;
                $scope.teamName = response.data.teamName;
            }
            else {
                console.log(response.data);
            }
        });
    }
    function FunctionLeaderBoard() {

        $scope.data = [];




        $scope.MyTeamDisplay = false;
        $scope.DraftTeamDisplay = false;
        $scope.LeaderBoarDisplay = true;
        $http({
            method: "post",
            url: "/Leaderboard"
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.result;
                $scope.ResultLeaderboard = res;
                $scope.numberOfPages = function () {
                    return Math.ceil($scope.ResultLeaderboard.length / $scope.pageSize);
                }
                console.log(res);
            }
            else {
                console.log(response.data);
            }
        });
    }
    function FunctionViewMyTeam() {
        $scope.MyTeamDisplay = true;
        $scope.DraftTeamDisplay = false;
        $scope.LeaderBoarDisplay = false;
        console.log("ViewMyTeam");
        //Get the player detail which given the _id to retrived data from the database
        $http({
            method: "post",
            url: "/ViewMyTeam",
            data: { "userId": $window.localStorage.getItem("id") }
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.collections;
                console.log(res);
                //$scope.team = response.data.team;
                $scope.viewTeam = response.data.collections;
            }
            else {
                console.log(response.data.result);
            }
        });
    }
    //leaderboard Display
    $scope.leaderboard = function () {
        FunctionLeaderBoard();
    };
    //Choose the team Draft
    $scope.DraftTeam = function () {
        PlayerSelected = [];
        $scope.playerSelected = [];
        $scope.MyTeamDisplay = false;
        $scope.DraftTeamDisplay = true;
        $scope.LeaderBoarDisplay = false;
        //Get the player detail which given the _id to retrived data from the database
        $http({
            method: "post",
            url: "/ViewPlayerPool"
            //data: { "username": $window.localStorage.getItem("username") }
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.collections;
                console.log(res);
                PlayerPools = response.data.collections;
                $scope.playerPools = PlayerPools;
            }
            else {
                console.log(response.data.result);
            }
        });

    }
    //View team display
    $scope.ViewMyTeam = function () {
        FunctionViewMyTeam();
    }
    //Draft player section
    $scope.SelectPlayerFromTheTeam = function (id, image, playerName) {
        $scope.MyTeamDisplay = false;
        $scope.DraftTeamDisplay = true;
        $scope.LeaderBoardisplay = false;
        // Remove element on the left hand side when the user select the player.
        for (var i = 0; i < PlayerPools.length; i++) {
            if (PlayerPools[i]._id == id) {
                //Add to player select
                PlayerSelected.push(PlayerPools[i]);
                //Remove from player pool
                PlayerPools.splice(i, 1);
            }
        }
        $scope.playerSelected = PlayerSelected;

    }
    $scope.ReturnPlayerFromTheSelectedTeam = function (id, image, playerName) {
        $scope.ViewSelectedTeamDisplay = false;
        $scope.ChooseTeamDisplay = true;
        $scope.ViewLeaderBoardisplay = false;
        // Remove element on the left hand side when the user select the player.
        for (var i = 0; i < PlayerSelected.length; i++) {
            if (PlayerSelected[i]._id == id) {
                //Add to player select
                PlayerPools.push(PlayerSelected[i]);
                //Remove from player pool
                PlayerSelected.splice(i, 1);
            }
        }
        $scope.collections = PlayerPools;

    }
    $scope.SaveTeamSelected = function () {

        console.log("Save team");
        console.log($scope.teamName);
        if (PlayerSelected.length < 2) {
            $scope.errMessage = "Please select your team, your team at least 2 players";
        }
        else if ($scope.teamName === undefined || $scope.teamName === null) {
            $scope.errMessage = "Please type your team name";
        }
        else {
            console.log("Add to my collection clicked");

            var TotalPoint = 0;
            PlayerSelected.forEach(element => {
                TotalPoint += element.point;
            });
            console.log("Point" + TotalPoint);
            //Request the back-end to save it to the database.
            $http({
                method: "post",
                url: "/AddToMyTeam",
                data: { "player": PlayerSelected, "username": $window.localStorage.getItem("username"), teamName: $scope.teamName, id: $window.localStorage.getItem("id"), point: TotalPoint }
            }).then(function mySuccess(response) {
                if (response.data.success) {
                    console.log(response);
                    FunctionViewMyTeam();
                    MyRanking();

                }
                else {
                    console.log(response);
                    $scope.errMessage = response.data.message;

                }
            });



        }
    }
    // End Draft player section
    $scope.GainPoint = function () {
        $location.path("/GainPoint");

    }

});

app.controller('AFLTimerController', function ($scope, $window, $http, $location) {
    Date.prototype.addDays = function (days) {
        var date = new Date("Jan 24, 2019 00:00:00");
        date.setDate(date.getDate() + days);
        return date;
    }
    var date = new Date();
    var d = 0;
    var array = [];
    var getRound = [];
    for (var round = 1; round <= 23; round++) {
        var valueDay = date.addDays(d);
        d += 7;
        getRound.push(valueDay);
        var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        //console.log(valueDay);

        var value = { "Round": round, "Date": valueDay.getHours() + " hours " + valueDay.getMinutes() + " minutes " + valueDay.getSeconds() + " seconds, at " + valueDay.getDate() + " " + months[valueDay.getMonth()] + " " + valueDay.getFullYear() }
        array.push(value);
    }
    $scope.Round = array;
    //console.log(array);

    var index = 0;
    console.log(getRound[0].getTime());
    //var countDownDate = new Date("Jan 28, 2019 00:00:00").getTime();
    var countDownDate = getRound[index].getTime();

    // Update the count down every 1 second
    var x = setInterval(function () {

        // Get todays date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Output the result in an element with id="demo"
        document.getElementById("demo").innerHTML = days + "d " + hours + "h "
            + minutes + "m " + seconds + "s ";
        $scope.CountDownTimer = 1;
        console.log($scope.CountDownTimer);

        // If the count down is over, write some text 
        if (distance < 0) {
           // clearInterval(x);
            index++;
            console.log(index);
             countDownDate = getRound[index].getTime();
            // document.getElementById("demo").innerHTML = "EXPIRED";
        }
    }, 1000);
});


app.controller('PlayerStaticController', function ($scope, $window, $http, $location) {
    console.log("PlayerStaticController");
    $scope.currentPage = 0;
    $scope.pageSize = 15;
    $http({
        method: "post",
        url: "/PlayerStatic"
    }).then(function mySuccess(response) {
        if (response.data.success) {
            var res = response.data.result;
            //console.log(res);
            $scope.Header = res[0];
            //console.log("Header " + res[0]);

            res.forEach(element => {
                //console.log(element[2]);
                switch (element[2]) {

                    case "ES":
                        element[2] = "Essendon";
                        break;
                    case "RI":
                        element[2] = "Richmond";
                        break;
                    case "AD":
                        element[2] = "Adelaide";
                        break;
                    case "BL":
                        element[2] = "Brisbane";
                        break;
                    case "CA":
                        element[2] = "Carlton";
                        break;
                    case "CW":
                        element[2] = "Collingwood";
                        break;
                    case "FR":
                        element[2] = "Fremantle";
                        break;
                    case "GE":
                        element[2] = "Geelong";
                        break;
                    case "GC":
                        element[2] = "Gold Coast";
                        break;

                    case "GW":
                        element[2] = "Greater Western Sydney";
                        break;
                    case "HW":
                        element[2] = "Hawthorn";
                        break;
                    case "ME":
                        element[2] = "Melbourne";
                        break;
                    case "NM":
                        element[2] = "North Melbourne";
                        break;
                    case "PA":
                        element[2] = "Port Adelaide";
                        break;
                    case "SK":
                        element[2] = "St Kilda";
                        break;
                    case "SY":
                        element[2] = "Sydney";
                        break;
                    case "WC":
                        element[2] = "West Coast";
                        break;
                    case "WB":
                        element[2] = "Western Bulldogs";
                        break;
                    default:
                }
            });


            $scope.PlayerStatic = res;
            $scope.numberOfPages = function () {
                return Math.ceil($scope.PlayerStatic.length / $scope.pageSize);
            }
            //console.log("Team" + res);
        }
        else {
            console.log(response.data);
        }
    });
});

//App configuration
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        .when("/Home", {
            templateUrl: "app/views/page/home.html"
        })
        .when("/", {
            templateUrl: "app/views/page/home.html"
        })
        .when("/register", {
            templateUrl: "app/views/page/register.html",
            controller: 'registerController'
        })
        .when("/login", {
            templateUrl: "app/views/page/login.html",
            controller: 'loginController'
        })
        .when("/GainPoint", {
            templateUrl: "app/views/page/GainPoints.html",
            controller: 'gainPointsController'
        })
        .when("/PlayerStatic", {
            templateUrl: "app/views/page/PlayerStatic.html",
            controller: 'PlayerStaticController'
        })
        .when("/AFLTimer", {
            templateUrl: "app/views/page/AFLTimer.html",
            controller: 'AFLTimerController'
        })

        .when("/myProfile", {
            templateUrl: "app/views/page/myProfile.html",
            controller: 'myProfileCtr'
        })
        .otherwise({ redirectTo: "/" });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
