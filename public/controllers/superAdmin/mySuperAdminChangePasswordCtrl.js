app.controller('mySuperAdminChangePasswordCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

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

    $scope.randomNoInit = function (rno) {
        $scope.rNo = rno;
    };

    $scope.changePassword = function (isValid) {
        if (isValid) {
            var obj = {};
            obj.OldPassword = sha256(sha256($scope.txtOldPassword) + $scope.rNo);
            obj.NewPassword = sha256($scope.txtNewPassword);
            obj.ConfirmPassword = sha256($scope.txtConfirmPassword);
            if (sha256($scope.txtOldPassword) !== obj.NewPassword) {
                if (obj.NewPassword === obj.ConfirmPassword) {
                    $http.post('http://localhost:3000/superAdmin/changePassword', { data: obj }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
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