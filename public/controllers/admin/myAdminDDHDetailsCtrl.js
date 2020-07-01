app.controller('myAdminDDHDetailsCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

    $scope.getDDHDetails = function () {
        $http.get('http://localhost:3000/admin/getDDHDetails').then(function success(response) {
            $scope.ddhDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.submitDDHDetails = function (i) {
        if (i.DDHName != null && i.DDHName != undefined && i.DDHName != '' && i.DDHMobileNo !== null && i.DDHMobileNo !== '') {
            if (i.DDHMobileNo != undefined) {
                var message = confirm('Do you really want to submit the form?');
                if (message) {
                    i.DDHEmailID = (i.DDHEmailID == '' || i.DDHEmailID == null || i.DDHEmailID == undefined) ? null : i.DDHEmailID;
                    var myData = { DDHUserID: i.DDHUserID, DDHName: i.DDHName, DDHMobileNo: i.DDHMobileNo, DDHEmailID: i.DDHEmailID };
                    $http.post('http://localhost:3000/admin/submitDDHDetails', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                        var result = response.data;
                        if (result == true) {
                            alert('The DDH details are submitted successfully.');
                            $scope.getDDHDetails();
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

    $scope.getDDHData = function (i) {
        $scope.distn = i.DistrictName;
        $scope.duid = i.DDHUserID;
        $scope.ddhn = i.DDHName;
        $scope.ddhmn = i.DDHMobileNo;
        $scope.ddheid = i.DDHEmailID;
    };

    $scope.updateDDHDetails = function (isValid) {
        if (isValid) {
            var message = confirm('Do you really want to submit the form?');
            if (message) {
                var myData = { DDHUserID: $scope.duid, DDHName: $scope.ddhn, DDHMobileNo: $scope.ddhmn, DDHEmailID: $scope.ddheid };
                $http.post('http://localhost:3000/admin/submitDDHDetails', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                    var result = response.data;
                    if (result == true) {
                        alert('The DDH details are updated successfully.');
                        $scope.getDDHDetails();
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