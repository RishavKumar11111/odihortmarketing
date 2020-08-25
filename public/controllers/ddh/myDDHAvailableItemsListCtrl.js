app.controller('myDDHAvailableItemsListCtrl', function ($scope, $http, $filter) {

    $scope.foundFruits = false;
    $scope.foundVegetables = false;
    $scope.foundFlowers = false;
    $scope.foundPlantationCrops = false;
    $scope.foundSpices = false;
    $scope.getItemDetails = function () {
        $http.get('http://localhost:3000/ddh/getItemDetails').then(function success(response) {
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

    $scope.getItemDetailsBGVWise = function (itemID) {
        $http.get('http://localhost:3000/ddh/getItemDetailsBGVWise?itemID=' + itemID).then(function success(response) {
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