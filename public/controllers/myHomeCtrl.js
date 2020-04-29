var app = angular.module('myApp', []);

app.controller('myHomeCtrl', function ($scope, $http) {

    $scope.getItemDetails = function () {
        $http.get('http://localhost:3000/getItemDetails').then(function success(response) {
            $scope.itemDetails = response.data;
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