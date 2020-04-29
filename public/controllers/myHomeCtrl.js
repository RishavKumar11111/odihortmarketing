var app = angular.module('myApp', []);

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
        $http.get('http://localhost:3000/getItemDetailsDistrictWise?itemID=' + itemID).then(function success(response) {
            $scope.itemDetailsDistrictWise = response.data;
            console.log($scope.itemDetailsDistrictWise);
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});