var app = angular.module('myHomeLoginApp', []);

app.controller('myLoginCtrl', function ($scope, $http) {

    var getCaptcha = function () {
        $scope.URL = 'http://localhost:3000/captcha';
    };
    getCaptcha();
});