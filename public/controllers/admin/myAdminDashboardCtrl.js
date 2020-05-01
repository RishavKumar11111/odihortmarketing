app.controller('myAdminDashboardCtrl', function ($scope, $http, $filter) {

    $scope.getDashboardDetails = function () {
        $http.get('http://localhost:3000/admin/getDashboardDetails').then(function success(response) {
            $scope.getDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});