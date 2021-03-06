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
app.controller('myGameCtr', function ($scope, $window, $http, $location,$interval) {
    console.log("myGame controller");
    $scope.currentPage = 0;
    $scope.pageSize = 10;
    $scope.myFunc = function () {
        console.log("Search" + $scope.Search);
        var array = [];
        //Get the player detail which given the _id to retrived data from the database
        $http({
            method: "post",
            url: "/ViewPlayerPool"
            //data: { "username": $window.localStorage.getItem("username") }
        }).then(function mySuccess(response) {
            if (response.data.success) {
                $scope.playerPools = response.data.collections;
                $scope.playerPools.forEach(element => {
                    if (element.TeamName == $scope.Search) {
                        console.log("element " + element.TeamName + "name " + element.playerName);
                        array.push(element);
                    }
                });
                $scope.playerPools = array;
            }
            else {
                console.log(response.data.result);
            }
        });
    };
    $scope.myFuncPlayerName = function () {
        console.log("PlayerName " + $scope.PlayerName);
        $scope.playerPools = [];
        var array = [];
        //Get the player detail which given the _id to retrived data from the database
        $http({
            method: "post",
            url: "/ViewPlayerPool"
            //data: { "username": $window.localStorage.getItem("username") }
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.collections;
                //console.log($scope.playerPools);
                res.forEach(element => {
                    // console.log("element " + element.playerName) ;
                    if (element.playerName == $scope.PlayerName) {
                        console.log("name " + element.TeamName);
                        array.push(element);
                    }
                });
                $scope.playerPools = array;
                $scope.PlayerName = "";
            }
            else {
                console.log(response.data.result);
            }
        });

    };

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
        console.log("Hi");
        $http({
            method: "post",
            url: "/ViewMyCurrentRank",
            data: { "id": $window.localStorage.getItem("id") }
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.result;
                $scope.MyRanking = res;
                console.log("view my rank" + res);
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
        function getTime() {
            $http({
                method: "get",
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
            });
    
        }
        $interval(function () {
            getTime();
        }, 1000);
        // $http({
        //     method: "post",
        //     url: "/Leaderboard"
        // }).then(function mySuccess(response) {
        //     if (response.data.success) {
        //         var res = response.data.result;
        //         $scope.ResultLeaderboard = res;
        //         $scope.numberOfPages = function () {
        //             return Math.ceil($scope.ResultLeaderboard.length / $scope.pageSize);
        //         }
        //         console.log(res);
        //     }
        //     else {
        //         console.log(response.data);
        //     }
        // });
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
                PlayerPools = res;
                $scope.playerPools = res;
                $scope.numberOfPages = function () {
                    return Math.ceil($scope.playerPools.length / $scope.pageSize);
                }
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
                    FunctionPoint();
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

app.controller('AFLTimerController', function ($scope, $interval, $http, $window) {
    function getTime() {
        $http({
            method: "get",
            url: "/getTime"
        }).then(function mySuccess(response) {
            if (response.data.success) {
                var res = response.data.Time;
                console.log(res);
                $scope.theTime = res;
                $scope.Round = response.data.round;
            }
        });

    }
    $interval(function () {
        getTime();
    }, 1000);
});


app.controller('PlayerStaticController', function ($scope, $http, $location, $window) {

    console.log("PlayerStaticController");
    // var urlParams = $location.search();
    // var index = urlParams.index;
    //console.log("index" + $window.localStorage.getItem("index"));
    //$scope.round = $window.localStorage.getItem("index");
    $scope.currentPage = 0;
    $scope.pageSize = 15;
    $http({
        method: "post",
        url: "/PlayerStatic"
    }).then(function mySuccess(response) {
        if (response.data.success) {
            var res = response.data.result;
            $scope.round = response.data.round;
            //console.log(res);
            $scope.Header = res[0];
            //console.log("Header " + res[0]);
            var AddPoint = [];
            res.forEach(element => {
                // if (element[4] == $window.localStorage.getItem("index")) {

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
                    var value = 0;
                    for (var i = 5; i <= 27; i++) {
                        value += Number(element[i]);
                    }

                    var data = [{ Point: value }];
                    data.push(element);
                    AddPoint.push(data);
                //}
            });
            console.log(AddPoint);

            $scope.PlayerStatic = AddPoint;
            //console.log(res);
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

        .when("/myGame", {
            templateUrl: "app/views/page/myGame.html",
            controller: 'myGameCtr'
        })
        .otherwise({ redirectTo: "/" });
    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });
});
