var app = angular.module('myApp', []);

app.controller('myDDHListCtrl', function ($scope, $http, $filter) {

    $scope.getDDHDetails = function () {
        $http.get('http://localhost:3000/getDDHDetails').then(function success(response) {
            $scope.ddhDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});