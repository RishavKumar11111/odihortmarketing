app.controller('myDDHADHDetailsCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

    $scope.getADHDetails = function () {
        $http.get('http://localhost:3000/ddh/getADHDetails').then(function success(response) {
            $scope.adhDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.submitADHDetails = function (i) {
        if (i.ADHName != null && i.ADHName != undefined && i.ADHName != '' && i.ADHMobileNo !== null && i.ADHMobileNo !== '') {
            if (i.ADHMobileNo != undefined) {
                var message = confirm('Do you really want to submit the form?');
                if (message) {
                    i.ADHEmailID = (i.ADHEmailID == '' || i.ADHEmailID == null || i.ADHEmailID == undefined) ? null : i.ADHEmailID;
                    var myData = { ADHUserID: i.ADHUserID, ADHName: i.ADHName, ADHMobileNo: i.ADHMobileNo, ADHEmailID: i.ADHEmailID };
                    $http.post('http://localhost:3000/ddh/submitADHDetails', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                        var result = response.data;
                        if (result == true) {
                            alert('The ADH details are submitted successfully.');
                            $scope.getADHDetails();
                        }
                        else {
                            alert('An error occurred... Please contact the administrator.');
                        }
                    }).catch(function error(err) {
                        console.log('An error occurred...', err);
                    });
                }
            }
            else {
                alert('Please enter a valid Mobile No.');
            }
        }
        else {
            alert('Please fill all the fields.');
        }
    };

    $scope.getADHData = function (i) {
        $scope.distn = i.DistrictName;
        $scope.auid = i.ADHUserID;
        $scope.adhn = i.ADHName;
        $scope.adhmn = i.ADHMobileNo;
        $scope.adheid = i.ADHEmailID;
    };

    $scope.updateADHDetails = function (isValid) {
        if (isValid) {
            var message = confirm('Do you really want to submit the form?');
            if (message) {
                var myData = { ADHUserID: $scope.auid, ADHName: $scope.adhn, ADHMobileNo: $scope.adhmn, ADHEmailID: $scope.adheid };
                $http.post('http://localhost:3000/ddh/submitADHDetails', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                    var result = response.data;
                    if (result == true) {
                        alert('The ADH details are updated successfully.');
                        $scope.getADHDetails();
                        document.getElementById('modifyModal').style.display = "none";
                        document.getElementById('closeModifyModal').click();
                    }
                    else {
                        alert('An error occurred... Please contact the administrator.');
                    }
                }).catch(function error(err) {
                    console.log('An error occurred...', err);
                });
            }
        }
        else {
            alert('Please fill all the fields.');
        }
    };

});