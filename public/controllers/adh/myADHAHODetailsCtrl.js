app.controller('myADHAHODetailsCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.emailRegex = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

    $scope.getBlockULBs = function () {
        $http.get('http://localhost:3000/adh/getBlockULBs').then(function success(response) {
            $scope.blockULBs = [];
            angular.forEach(response.data, function (i) {
                if (!$scope.blockULBs.some(j => j.BlockCode == i.BlockCode)) {
                    $scope.blockULBs.push(i);
                }
                else {
                    var found = $scope.blockULBs.find(k => k.BlockCode == i.BlockCode);
                    found.ULBCode += ', ' + i.ULBCode;
                    found.ULBName += ', ' + i.ULBName;
                }
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.populateBlockULBs = [];
    $scope.getValue = function () {
        $scope.populateBlockULBs = [];
        angular.forEach($scope.blockULBs, function (i) {
            if (i.selected) {
                $scope.populateBlockULBs.push(i);
            }
        });
    };

    $scope.removeData = function (index, blockCode) {
        $scope.populateBlockULBs.splice(index, 1);
        angular.forEach($scope.blockULBs, function (i) {
            if (i.selected && i.BlockCode == blockCode) {
                i.selected = false;
            }
        });
    };

    var myData = [];
    $scope.registerAHO = function (isValid) {
        if ($scope.txtAHOMobileNo != undefined) {
            if (isValid) {
                var message = confirm('Do you really want to submit the form?');
                if (message) {
                    $scope.txtAHOEmailID = ($scope.txtAHOEmailID == '' || $scope.txtAHOEmailID == null || $scope.txtAHOEmailID == undefined) ? null : $scope.txtAHOEmailID;
                    if ($scope.populateBlockULBs.length > 0) {
                        angular.forEach($scope.populateBlockULBs, function (i) {
                            var k = {};
                            k.AHOUserID = 'AHO_' + i.BlockCode.toString();
                            k.BlockName = i.BlockName;
                            myData.push(k);
                        });
                        var myObj = {
                            AHOName: $scope.txtAHOName,
                            AHOMobileNo: $scope.txtAHOMobileNo,
                            AHOEmailID: $scope.txtAHOEmailID
                        }
                        $http.post('http://localhost:3000/adh/registerAHOs', { data: { arrData: myData, objData: myObj } }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                            var result = response.data;
                            if (result == 'OK') {
                                alert('AHOs(s) are registered to their respective Block(s).');
                                clearData();
                            }
                            else if (result == 'This Mobile No. is already registered against another AHO.') {
                                alert(result);
                                myData = [];
                            }
                            else {
                                console.log(response.status);
                                clearData();
                            }
                        }, function error(response) {
                            console.log(response.status);
                        }).catch(function err(error) {
                            console.log('An error occurred...', error);
                        });
                    }
                    else {
                        alert('Please select atleast one Block for registration of AHO.');
                    }
                }
            }
            else {
                alert('Please fill all the fields.');
            }
        }
        else {
            alert('Please enter a valid Mobile No.');
        }
    };

    var clearData = function () {
        $scope.getBlockULBs();
        $scope.populateBlockULBs = [];
        myData = [];
        $scope.txtAHOName = null;
        $scope.txtAHOMobileNo = null;
        $scope.txtAHOEmailID = null;
        $scope.getRegisteredAHOs();
    };

    $scope.getRegisteredAHOs = function () {
        $http.get('http://localhost:3000/adh/getRegisteredAHOs').then(function success(response) {
            $scope.registeredAHOs = [];
            angular.forEach(response.data, function (i) {
                if (!$scope.registeredAHOs.some(j => j.AHOUserID == i.AHOUserID)) {
                    $scope.registeredAHOs.push(i);
                }
                else {
                    var found = $scope.registeredAHOs.find(k => k.AHOUserID == i.AHOUserID);
                    found.ULBName += ', ' + i.ULBName;
                }
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.removeAHO = function (i) {
        if (confirm('Do you want to remove ' + i.AHOUserID + ' from the allotted Block - ' + i.BlockName + '?')) {
            var myData = { AHOUserID: i.AHOUserID };
            $http.post('http://localhost:3000/adh/removeAHO', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                var result = response.statusText;
                if (result == 'OK') {
                    alert('The AHO was successfully removed from the allotted Block.');
                    clearData();
                }
                else {
                    console.log(response.status);
                    clearData();
                }
            }).catch(function error(err) {
                console.log('An error occurred...', err);
            });
        }
    };

});