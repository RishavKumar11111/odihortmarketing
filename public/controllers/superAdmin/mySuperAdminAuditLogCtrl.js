app.controller('mySuperAdminAuditLogCtrl', function ($scope, $http, $filter) {

    $scope.getAuditLog = function () {
        $http.get('http://localhost:3000/superAdmin/getAuditLog').then(function success(response) {
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