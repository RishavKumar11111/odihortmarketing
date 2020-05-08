app.controller('myAdminStockOutListCtrl', function ($scope, $http, $filter) {

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/admin/getCategories').then(function success(response) {
            $scope.categories = response.data;
            var categoryAll = { CategoryID: 0, CategoryName: 'All' };
            $scope.categories.unshift(categoryAll);
            $scope.ddlCategories = 0;
            $scope.stockOutDetails = [];
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getDistricts = function () {
        $http.get('http://localhost:3000/admin/getDistricts').then(function success(response) {
            $scope.districts = response.data;
            var districtAll = { DistrictCode: 0, DistrictName: 'All' };
            $scope.districts.unshift(districtAll);
            $scope.ddlDistricts = 0;
            $scope.stockOutDetails = [];
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getStockOutDetails = function () {
        $http.get('http://localhost:3000/admin/getStockOutDetails?districtCode=' + $scope.ddlDistricts + '&categoryID=' + $scope.ddlCategories).then(function success(response) {
            $scope.stockOutDetails = response.data;
            if ($scope.stockOutDetails.length != 0) {
                $scope.totalQuintal = 0;
                $scope.totalNo = 0;
                angular.forEach($scope.stockOutDetails, function (i) {
                    if (i.Unit == 'Q') {
                        $scope.totalQuintal += i.SaleQuantity;
                    }
                    else {
                        $scope.totalNo += i.SaleQuantity;
                    }
                })
            }
            else {
                alert('No Stock Out records found!');
            }
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