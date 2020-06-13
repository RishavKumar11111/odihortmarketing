var app = angular.module('myApp', []);

app.controller('mySoilPropertiesCtrl', function ($scope, $http, $filter) {

    $scope.getDistrictsByDistrictCodes = function () {
        $http.get("http://localhost:3000/getDistrictsByDistrictCodes?type='properties'").then(function success(response) {
            $scope.districts = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getSoilProperties = function () {
        if ($scope.ddlDistrict != null && $scope.ddlDistrict != undefined && $scope.ddlDistrict != '') {
            window.open('http://localhost:3000/getSoilProperties?districtCode=' + $scope.ddlDistrict, '_blank');
        }
        else {
            alert('Please select the District.');
        }
    };

});