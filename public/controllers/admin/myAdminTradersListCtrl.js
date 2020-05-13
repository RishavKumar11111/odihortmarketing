app.controller('myAdminTradersListCtrl', function ($scope, $http, $filter) {

    $scope.getTradersList = function () {
        $http.get('http://localhost:3000/admin/getTradersList').then(function success(response) {
            $scope.tradersList = response.data;
            var count = 1;
            angular.forEach($scope.tradersList, function (i) {
                i.DuplicateID = count;
                count++;
            })
            $scope.pageSize = 50;
            $scope.search = '';
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