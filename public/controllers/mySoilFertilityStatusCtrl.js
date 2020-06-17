var app = angular.module('myApp', []);

app.controller('mySoilFertilityStatusCtrl', function ($scope, $http, $filter) {

    $scope.getSoilNutrients = function () {
        $scope.soilTypeName = $filter('filter')($scope.soilTypes, { SoilTypeID: $scope.ddlSoilType }, true)[0].SoilTypeName;
        $http.get('http://localhost:3000/getSoilNutrients?soilType=' + $scope.soilTypeName).then(function success(response) {
            $scope.soilNutrients = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getSoilTypes = function () {
        $http.get('http://localhost:3000/getSoilTypes').then(function success(response) {
            $scope.soilTypes = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getDistrictsByDistrictCodes = function () {
        $http.get("http://localhost:3000/getDistrictsByDistrictCodes?type='fertilityStatus'").then(function success(response) {
            $scope.districts = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.checkSoilFertilityMaps = function () {
        $scope.notFound = '';
        if ($scope.ddlSoilNutrient != null && $scope.ddlSoilNutrient != undefined && $scope.ddlSoilNutrient != '' && $scope.ddlSoilType != null && $scope.ddlSoilType != undefined && $scope.ddlSoilType != '' && $scope.ddlDistrict != null && $scope.ddlDistrict != undefined && $scope.ddlDistrict != '') {
            $scope.soilNutrientName = $filter('filter')($scope.soilNutrients, { SoilNutrientID: $scope.ddlSoilNutrient }, true)[0].SoilNutrientName;
            $scope.soilTypeName = $filter('filter')($scope.soilTypes, { SoilTypeID: $scope.ddlSoilType }, true)[0].SoilTypeName;
            $http.get('http://localhost:3000/checkSoilFertilityMaps?soilNutrientName=' + $scope.soilNutrientName + '&soilTypeName=' + $scope.soilTypeName + '&districtCode=' + $scope.ddlDistrict).then(function success(response) {
                if (response.data == 'The Soil Fertility Map is found.') {
                    window.open('http://localhost:3000/getSoilFertilityMaps?soilNutrientName=' + $scope.soilNutrientName + '&soilTypeName=' + $scope.soilTypeName + '&districtCode=' + $scope.ddlDistrict, '_blank');
                }
                else {
                    $scope.notFound = response.data;
                }
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
        else {
            alert('Please select Soil Parameter, Soil Type and District.');
        }
    };

});