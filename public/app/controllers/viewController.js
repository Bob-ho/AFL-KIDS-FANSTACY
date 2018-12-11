var app = angular.module("indexApp", ['ngRoute']);
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
                console.log(response.data.username);
                console.log(response.data.token);
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

//my Account controller
app.controller('myProfileCtr', function ($scope, $window, $routeParams, $http) {
    console.log("Profile controller");
    $scope.Display = true;
    var PlayerPools = [];
    var PlayerSelected = [];
    //Get the player detail which given the _id to retrived data from the database
    $http({
        method: "post",
        url: "/ViewPlayerPool",
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
    
    $scope.SelectPlayerFromTheTeam = function (id, image, playerName) {
        // Remove element on the left hand side when the user select the player.
        for(var i = 0; i < PlayerPools.length; i++) {
            if(PlayerPools[i]._id == id) {
                //Add to player select
                PlayerSelected.push(PlayerPools[i]);
                 //Remove from player pool
                PlayerPools.splice(i, 1);
            }
        } 
        $scope.playerSelected = PlayerSelected;

    }
    $scope.ReturnPlayerFromTheSelectedTeam = function (id, image, playerName) {
        
        // Remove element on the left hand side when the user select the player.
        for(var i = 0; i < PlayerSelected.length; i++) {
            if(PlayerSelected[i]._id == id) {
                //Add to player select
                PlayerPools.push(PlayerSelected[i]);
                 //Remove from player pool
                 PlayerSelected.splice(i, 1);
            }
        } 
        $scope.collections = PlayerPools;

    }
    //leaderboard Display
    $scope.leaderboard = function () {
        console.log("hello leaderboard");
        $scope.Display = false;
    };
    //Choose the team display
    $scope.chooseYourTeam = function () {
        console.log("chooseYourTeam");
        $scope.Display = true;
    }
    $scope.SaveTeamSelected = function () {
        console.log("Save team");
        console.log($scope.teamName);
        if(PlayerSelected.length == 0)
        {
            $scope.errMessage = "Please select your team";
        }
        if ($scope.teamName === undefined || $scope.teamName === null) {
            $scope.errMessage = "Please type your team name"; 
       }
    
    }

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
