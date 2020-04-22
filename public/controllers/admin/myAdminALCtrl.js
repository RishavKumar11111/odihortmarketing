app.controller('myAdminALCtrl', function ($scope, $http) {

    $scope.getAuditLog = function () {
        $http.get('http://localhost:3000/admin/getAuditLog').then(function success(response) {
            $scope.auditLogs = response.data;
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