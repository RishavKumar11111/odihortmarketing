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
            // setTimeout(function () {
            //     document.getElementById('divVegetables').style.maxHeight = document.getElementById('divFruits').offsetHeight + 'px';
            //     document.getElementById('divFlowers').style.minHeight = document.getElementById('divPlantationCrops').offsetHeight + 'px';
            // }, 1000);
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getItemDetailsDistrictWise = function (itemID) {
        $scope.itemDetailsBGVWise = [];
        $scope.totalBalanceBGVWise = 0;
        $http.get('http://localhost:3000/admin/getItemDetailsDistrictWise?itemID=' + itemID).then(function success(response) {
            $scope.itemDetailsDistrictWise = response.data;
            $scope.totalBalanceDistrictWise = 0;
            angular.forEach($scope.itemDetailsDistrictWise, function (i) {
                $scope.totalBalanceDistrictWise += i.Balance;
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
            $scope.totalBalanceBGVWise = 0;
            angular.forEach($scope.itemDetailsBGVWise, function (i) {
                $scope.totalBalanceBGVWise += i.Balance;
            });
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});