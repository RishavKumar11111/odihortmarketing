var app = angular.module('myApp', ['angular.filter']);

app.filter('capitalize', function () {
    return function (input) {
        if (input != null) {
            input = input.toLowerCase().split(' ');
            for (var i = 0; i < input.length; i++) {
                input[i] = input[i].charAt(0).toUpperCase() + input[i].substring(1);
            }
            return input.join(' ');
        }
        else {
            return false;
        }
    }
    // return function (input) {
    //     return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    // }
});

app.controller('myHomeCtrl', function ($scope, $http) {

    $scope.foundFruits = false;
    $scope.foundVegetables = false;
    $scope.foundFlowers = false;
    $scope.foundPlantationCrops = false;
    $scope.foundSpices = false;
    $scope.getItemDetails = function () {
        $http.get('http://localhost:3000/getItemDetails').then(function success(response) {
            $scope.itemDetails = response.data;
            angular.forEach($scope.itemDetails, function (i) {
                if (i.CategoryName == 'Fruits') {
                    $scope.foundFruits = true;
                }
                if (i.CategoryName == 'Vegetables') {
                    $scope.foundVegetables = true;
                }
                if (i.CategoryName == 'Flowers') {
                    $scope.foundFlowers = true;
                }
                if (i.CategoryName == 'Plantation Crops') {
                    $scope.foundPlantationCrops = true;
                }
                if (i.CategoryName == 'Spices') {
                    $scope.foundSpices = true;
                }
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getItemDetailsDistrictWise = function (itemID) {
        $scope.itemDetailsBGVWise = [];
        $scope.totalBalanceBGVWise = 0;
        $http.get('http://localhost:3000/getItemDetailsDistrictWise?itemID=' + itemID).then(function success(response) {
            $scope.itemDetailsDistrictWise = response.data;
            $scope.totalBalanceDistrictWise = 0;
            angular.forEach($scope.itemDetailsDistrictWise, function (i) {
                $scope.totalBalanceDistrictWise += i.Balance;
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.itemDetailsBGVWise = [];
    $scope.getItemDetailsBGVWise = function (districtCode, itemID) {
        $http.get('http://localhost:3000/getItemDetailsBGVWise?districtCode=' + districtCode + '&itemID=' + itemID).then(function success(response) {
            $scope.itemDetailsBGVWise = response.data;
            $scope.totalBalanceBGVWise = 0;
            angular.forEach($scope.itemDetailsBGVWise, function (i) {
                $scope.totalBalanceBGVWise += i.Balance;
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});