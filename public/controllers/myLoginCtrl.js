var app = angular.module('myApp', []);

app.controller('myLoginCtrl', function ($scope, $http) {

    var getCaptcha = function () {
        $scope.URL = 'http://localhost:3000/captcha';
    };
    getCaptcha();
});