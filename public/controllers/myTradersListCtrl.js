var app = angular.module('myApp', []);

app.controller('myTradersListCtrl', function ($scope, $http, $filter) {

    $scope.getDistricts = function () {
        $http.get('http://localhost:3000/getDistricts').then(function success(response) {
            $scope.districts = response.data;
            var districtAll = { DistrictCode: 0, DistrictName: 'All' };
            $scope.districts.unshift(districtAll);
            $scope.ddlDistricts = 0;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.tradersList = [];
    $scope.getTradersList = function () {
        $http.get('http://localhost:3000/getTradersList?districtCode=' + $scope.ddlDistricts).then(function success(response) {
            $scope.tradersList = response.data;
            if ($scope.tradersList.length > 0) {
                var count = 1;
                angular.forEach($scope.tradersList, function (i) {
                    i.DuplicateID = count;
                    count++;
                })
            }
            else {
                alert('No traders are found in this district.');
                $scope.tradersList = [];
            }
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});