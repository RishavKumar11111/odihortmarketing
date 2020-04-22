var app = angular.module('myHomeFPApp', []);

app.controller('myForgotPWDCtrl', function ($scope, $http) {

    var getCaptcha = function () {
        $scope.URL = 'http://localhost:3000/captcha';
    };
    getCaptcha();

    $scope.abc = true;
    $scope.def = false;
    $scope.xyz = false;
    $scope.showHide = function () {
        if (document.getElementById('msg').value.includes('Accepted')) {
            alert('An OTP has been sent to your registered Mobile No.');
            $scope.abc = false;
            $scope.def = true;
            $scope.xyz = false;
        }
        else if (document.getElementById('msg').value == 'Wrong OTP') {
            alert('Invalid OTP');
            $scope.abc = false;
            $scope.def = true;
            $scope.xyz = false;
        }
        else if (document.getElementById('msg').value == 'Correct OTP') {
            $scope.abc = false;
            $scope.def = false;
            $scope.xyz = true;
        }
        else if (document.getElementById('msg').value == 'Password updated successfully.') {
            alert('Password updated successfully.');
            location.href = 'http://localhost:3000/login';
        }
    };

    $scope.sendOTP = function () {
        $http.get('http://localhost:3000/sendOTP').then(function success(response1) {
            if (response1.data.includes('Accepted')) {
                alert('An OTP has been sent to your registered Mobile No.');
            }
            else {
                alert('Oops! An error occurred.');
            }
        }, function error(response1) {
            console.log(response1.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})");
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    $scope.npCheck = {
        'padding-top': '8px'
    };

    $scope.cpCheck = {
        'padding-top': '8px'
    };

    $scope.analyzeNP = function (value) {
        if (strongRegex.test(value)) {
            $scope.nPWDCheck = "glyphicon glyphicon-ok";
            $scope.npCheck['color'] = 'green';
        } else if (mediumRegex.test(value)) {
            $scope.nPWDCheck = "glyphicon glyphicon-remove";
            $scope.npCheck['color'] = 'orange';
        } else {
            $scope.nPWDCheck = "glyphicon glyphicon-remove";
            $scope.npCheck['color'] = 'red';
        }
    };

    $scope.analyzeCP = function (value) {
        $scope.pnm = null;
        if (strongRegex.test(value)) {
            if ($scope.txtNewPassword === $scope.txtConfirmPassword) {
                $scope.cPWDCheck = "glyphicon glyphicon-ok";
                $scope.cpCheck['color'] = 'green';
            } else {
                $scope.cPWDCheck = "glyphicon glyphicon-remove";
                $scope.cpCheck['color'] = 'red';
                $scope.pnm = 'The New Password and Confirm Password do not match';
            }
        } else if (mediumRegex.test(value)) {
            $scope.cPWDCheck = "glyphicon glyphicon-remove";
            $scope.cpCheck['color'] = 'orange';
        } else {
            $scope.cPWDCheck = "glyphicon glyphicon-remove";
            $scope.cpCheck['color'] = 'red';
        }
    };

});