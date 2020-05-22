var app = angular.module('myApp', []);

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
            alert('An OTP has been sent to your registered Mobile No. ending with ' + document.getElementById('mno').value);
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
        else if (document.getElementById('msg').value == 'Password already used') {
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
                alert('An OTP has been sent to your registered Mobile No. ending with ' + document.getElementById('mno').value + ' again.');
                document.getElementById('otp').value = null;
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

    $scope.npCheck = {};
    $scope.cpCheck = {};

    $scope.analyzeNP = function (value) {
        $scope.pnm = null;
        $scope.nPWDCheck = null;
        $scope.npCheck['color'] = null;
        if (strongRegex.test(value)) {
            $scope.nPWDCheck = "glyphicon glyphicon-ok";
            $scope.npCheck['color'] = 'green';
            if ($scope.np !== $scope.cp && $scope.cp !== undefined) {
                $scope.nPWDCheck = "glyphicon glyphicon-remove";
                $scope.npCheck['color'] = 'red';
                $scope.pnm = 'The New Password and Confirm Password do not match';
            }
            else if ($scope.cp !== undefined) {
                $scope.cPWDCheck = "glyphicon glyphicon-ok";
                $scope.cpCheck['color'] = 'green';
            }
        } else if (mediumRegex.test(value)) {
            $scope.nPWDCheck = "glyphicon glyphicon-alert";
            $scope.npCheck['color'] = 'orange';
        } else {
            $scope.nPWDCheck = "glyphicon glyphicon-remove";
            $scope.npCheck['color'] = 'red';
        }
    };

    $scope.analyzeCP = function (value) {
        $scope.pnm = null;
        $scope.cPWDCheck = null;
        $scope.cpCheck['color'] = null;
        if (strongRegex.test(value)) {
            if ($scope.np === $scope.cp) {
                $scope.cPWDCheck = "glyphicon glyphicon-ok";
                $scope.cpCheck['color'] = 'green';
                $scope.nPWDCheck = "glyphicon glyphicon-ok";
                $scope.npCheck['color'] = 'green';
            } else {
                $scope.cPWDCheck = "glyphicon glyphicon-remove";
                $scope.cpCheck['color'] = 'red';
                $scope.pnm = 'The New Password and Confirm Password do not match';
            }
        } else if (mediumRegex.test(value)) {
            $scope.cPWDCheck = "glyphicon glyphicon-alert";
            $scope.cpCheck['color'] = 'orange';
        } else {
            $scope.cPWDCheck = "glyphicon glyphicon-remove";
            $scope.cpCheck['color'] = 'red';
        }
    };

});