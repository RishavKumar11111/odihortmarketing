app.controller('myAdminUnavailableItemsListCtrl', function ($scope, $http, $filter) {

    $scope.getUnavailableItems = function () {
        $http.get('http://localhost:3000/admin/getUnavailableItems').then(function success(response) {
            $scope.unavailableItems = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});