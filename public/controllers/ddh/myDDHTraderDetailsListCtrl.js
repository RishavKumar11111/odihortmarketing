app.controller('myDDHTraderDetailsListCtrl', function ($scope, $http, $filter) {

    $scope.getTraderDetails = function () {
        $http.get('http://localhost:3000/ddh/getTraderDetails').then(function success(response) {
            $scope.traderDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.sort = function (keyname) {
        $scope.sortKey = keyname;
        $scope.reverse = !$scope.reverse;
    };

});