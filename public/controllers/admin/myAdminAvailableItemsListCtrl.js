app.controller('myAdminAvailableItemsListCtrl', function ($scope, $http, $filter) {

    $scope.foundFruits = false;
    $scope.foundVegetables = false;
    $scope.foundFlowers = false;
    $scope.foundPlantationCrops = false;
    $scope.foundSpices = false;
    $scope.getItemDetails = function () {
        $http.get('http://localhost:3000/admin/getItemDetails').then(function success(response) {
            $scope.itemDetails = response.data;
            angular.forEach($scope.itemDetails, function (i) {
                if (i.CategoryName == 'Fruits') {
                    $scope.foundFruits = true;
                }
                if (i.CategoryName == 'Vegetables') {
                    $scope.foundVegetables = true;
                }
                if (i.CategoryName == 'Flowers') {
                    $scope.foundFlowers = true;
                }
                if (i.CategoryName == 'Plantation Crops') {
                    $scope.foundPlantationCrops = true;
                }
                if (i.CategoryName == 'Spices') {
                    $scope.foundSpices = true;
                }
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getItemDetailsDistrictWise = function (itemID) {
        $scope.itemDetailsBGVWise = [];
        $scope.totalQuantityBGVWise = 0;
        $http.get('http://localhost:3000/admin/getItemDetailsDistrictWise?itemID=' + itemID).then(function success(response) {
            $scope.itemDetailsDistrictWise = response.data;
            $scope.totalQuantityDistrictWise = 0;
            angular.forEach($scope.itemDetailsDistrictWise, function (i) {
                $scope.totalQuantityDistrictWise += i.Quantity;
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.itemDetailsBGVWise = [];
    $scope.getItemDetailsBGVWise = function (districtCode, itemID) {
        $http.get('http://localhost:3000/admin/getItemDetailsBGVWise?districtCode=' + districtCode + '&itemID=' + itemID).then(function success(response) {
            $scope.itemDetailsBGVWise = response.data;
            $scope.totalQuantityBGVWise = 0;
            angular.forEach($scope.itemDetailsBGVWise, function (i) {
                $scope.totalQuantityBGVWise += i.Quantity;
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});