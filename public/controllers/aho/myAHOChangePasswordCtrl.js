app.controller('myAHOChangePasswordCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    var strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{6,})");
    var mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

    $scope.npCheck = {
        'padding-top': '5px',
        'margin-right': '10px'
    };

    $scope.cpCheck = {
        'padding-top': '5px',
        'margin-right': '10px'
    };

    $scope.analyzeNP = function () {
        $scope.pnm = null;
        $scope.nPWDCheck = null;
        $scope.npCheck['color'] = null;
        if (strongRegex.test($scope.txtNewPassword)) {
            $scope.nPWDCheck = "fas fa-check";
            $scope.npCheck['color'] = 'green';
            if ($scope.txtNewPassword !== $scope.txtConfirmPassword && $scope.txtConfirmPassword !== undefined) {
                $scope.nPWDCheck = "fas fa-times";
                $scope.npCheck['color'] = 'red';
                $scope.pnm = 'The New Password and Confirm Password do not match';
            }
            else if ($scope.txtConfirmPassword !== undefined) {
                $scope.cPWDCheck = "fas fa-check";
                $scope.cpCheck['color'] = 'green';
            }
        } else if (mediumRegex.test($scope.txtNewPassword)) {
            $scope.nPWDCheck = "fas fa-exclamation";
            $scope.npCheck['color'] = 'orange';
        } else {
            $scope.nPWDCheck = "fas fa-times";
            $scope.npCheck['color'] = 'red';
        }
    };

    $scope.analyzeCP = function () {
        $scope.pnm = null;
        $scope.cPWDCheck = null;
        $scope.cpCheck['color'] = null;
        if (strongRegex.test($scope.txtConfirmPassword)) {
            if ($scope.txtNewPassword === $scope.txtConfirmPassword) {
                $scope.cPWDCheck = "fas fa-check";
                $scope.cpCheck['color'] = 'green';
                $scope.nPWDCheck = "fas fa-check";
                $scope.npCheck['color'] = 'green';
            } else {
                $scope.cPWDCheck = "fas fa-times";
                $scope.cpCheck['color'] = 'red';
                $scope.pnm = 'The New Password and Confirm Password do not match';
            }
        } else if (mediumRegex.test($scope.txtConfirmPassword)) {
            $scope.cPWDCheck = "fas fa-exclamation";
            $scope.cpCheck['color'] = 'orange';
        } else {
            $scope.cPWDCheck = "fas fa-times";
            $scope.cpCheck['color'] = 'red';
        }
    };

    $scope.randomNoInit = function (rno) {
        $scope.rNo = rno;
    };

    $scope.changePassword = function (isValid) {
        if (isValid) {
            var obj = {};
            obj.OldPassword = sha256(sha256($scope.txtOldPassword) + $scope.rNo);
            obj.NewPassword = sha256($scope.txtNewPassword);
            obj.ConfirmPassword = sha256($scope.txtConfirmPassword);
            if (strongRegex.test($scope.txtNewPassword)) {
                if (sha256($scope.txtOldPassword) !== obj.NewPassword) {
                    if (obj.NewPassword === obj.ConfirmPassword) {
                        $http.post('http://localhost:3000/aho/changePassword', { data: obj }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                            var result = response.data;
                            if (result == 'OK') {
                                alert('Password changed successfully.');
                                clearFields();
                            }
                            else {
                                alert(result);
                                clearFields();
                            }
                        }, function error(response) {
                            console.log(response.status);
                        }).catch(function err(error) {
                            console.log('An error occurred...', error);
                        });
                    }
                    else {
                        alert('The New Password and Confirm Password do not match.');
                        clearFields();
                    }
                }
                else {
                    alert('The Old Password and New Password should not be same.');
                    clearFields();
                }
            }
            else {
                alert('Invalid password. Please enter a strong password.');
                clearFields();
            }
        }
    };

    var clearFields = function () {
        $scope.txtOldPassword = null;
        $scope.txtNewPassword = null;
        $scope.txtConfirmPassword = null;
        $scope.pnm = null;
        $scope.nPWDCheck = null;
        $scope.npCheck['color'] = null;
        $scope.cPWDCheck = null;
        $scope.cpCheck['color'] = null;
    };

});