app.controller('myDDHStockOutListCtrl', function ($scope, $http, $filter) {

    $scope.rbAreaType = 'Rural';

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/ddh/getCategories').then(function success(response) {
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

    $scope.getBlocks = function () {
        if ($scope.rbAreaType == 'Rural') {
            $http.get('http://localhost:3000/ddh/getBlocks').then(function success(response) {
                $scope.blocks = response.data;
                var blockAll = { BlockCode: 0, BlockName: 'All' };
                $scope.blocks.unshift(blockAll);
                $scope.ddlBlocks = 0;
                $scope.stockOutDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
        else {
            $http.get('http://localhost:3000/ddh/getULBs').then(function success(response) {
                $scope.blocks = response.data;
                var blockAll = { ULBCode: 0, ULBName: 'All' };
                $scope.blocks.unshift(blockAll);
                $scope.ddlBlocks = 0;
                $scope.stockOutDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getStockOutDetails = function () {
        $http.get('http://localhost:3000/ddh/getStockOutDetails?blockCode=' + $scope.ddlBlocks + '&categoryID=' + $scope.ddlCategories + '&areaType=' + $scope.rbAreaType).then(function success(response) {
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