app.controller('myAdminFarmersCountCtrl', function ($scope, $http, $filter) {

    $scope.getFarmersCount = function () {
        $http.get('http://localhost:3000/admin/getFarmersCount').then(function success(response) {
            $scope.farmersCount = response.data;
            $scope.totalFarmers = $scope.farmersCount[0];
            $scope.farmersCount.shift();
            $scope.districtWiseFarmersCount = $scope.farmersCount;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getFarmerDetailsDistrictWise = function (districtCode, districtName) {
        $http.get('http://localhost:3000/admin/getFarmerDetailsDistrictWise?districtCode=' + districtCode).then(function success(response) {
            $scope.farmerDetailsDistrictWise = response.data;
            $scope.fddw = UniqueArraybyId($scope.farmerDetailsDistrictWise, "FarmerMobileNo");
            $scope.districtName = districtName
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    function UniqueArraybyId(collection, keyname) {
        var output = [], keys = [];
        angular.forEach(collection, function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });
        return output;
    };

});