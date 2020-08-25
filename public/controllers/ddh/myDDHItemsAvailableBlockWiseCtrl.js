app.controller('myDDHItemsAvailableBlockWiseCtrl', function ($scope, $http, $filter) {

    $scope.rbAreaType = 'Rural';

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/ddh/getCategories').then(function success(response) {
            $scope.categories = response.data;
            var categoryAll = { CategoryID: 0, CategoryName: 'All' };
            $scope.categories.unshift(categoryAll);
            $scope.ddlCategories = 0;
            var itemAll = { ItemID: 0, ItemName: 'All' };
            $scope.items = [];
            $scope.items.unshift(itemAll);
            $scope.ddlItems = 0;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getItemsByCategory = function (categoryID) {
        if (categoryID != undefined) {
            $http.get('http://localhost:3000/ddh/getItemsByCategory?categoryID=' + categoryID).then(function success(response) {
                $scope.items = response.data;
                var itemAll = { ItemID: 0, ItemName: 'All' };
                $scope.items.unshift(itemAll);
                $scope.ddlItems = 0;
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getBlocks = function () {
        $scope.blocks = [];
        $scope.ddlBlocks = null;
        if ($scope.rbAreaType == 'Rural') {
            $http.get('http://localhost:3000/ddh/getBlocks').then(function success(response) {
                $scope.blocks = response.data;
                var blockAll = { BlockCode: 0, BlockName: 'All' };
                $scope.blocks.unshift(blockAll);
                $scope.ddlBlocks = 0;
                $scope.itemsAvailable = [];
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
                $scope.itemsAvailable = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getAvailabilityDetails = function () {
        $http.get('http://localhost:3000/ddh/getAvailabilityDetails?blockCode=' + $scope.ddlBlocks + '&categoryID=' + $scope.ddlCategories + '&areaType=' + $scope.rbAreaType + '&itemID=' + $scope.ddlItems).then(function success(response) {
            $scope.itemsAvailable = response.data;
            if ($scope.itemsAvailable.length > 0) {
                var k = $filter('filter')($scope.blocks, { BlockCode: $scope.ddlBlocks }, true)[0];
                if (k == undefined) {
                    $scope.blockName = $filter('filter')($scope.blocks, { ULBCode: $scope.ddlBlocks }, true)[0].ULBName;
                }
                else {
                    $scope.blockName = k.BlockName;
                }
                $scope.categoryName = $filter('filter')($scope.categories, { CategoryID: $scope.ddlCategories }, true)[0].CategoryName;
                $scope.itemName = $filter('filter')($scope.items, { ItemID: $scope.ddlItems }, true)[0].ItemName;
                $scope.totalQuintal = 0;
                $scope.totalNo = 0;
                angular.forEach($scope.itemsAvailable, function (i) {
                    if (i.Unit == 'Q') {
                        $scope.totalQuintal += i.Balance;
                    }
                    else {
                        $scope.totalNo += i.Balance;
                    }
                })
                $scope.pageSize = 50;
                $scope.search = '';
            }
            else {
                alert('No items are available.');
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

    $scope.getLocationDetails = function (i) {
        $scope.iNm = i.ItemName;
        $scope.ut = i.Unit;
        $scope.refNo = i.ReferenceNo;
        $scope.fID = i.FarmerID;
        $scope.at = i.AreaType;
        $scope.bNm = i.BlockName;
        $scope.gNm = i.GPName;
        $scope.vNm = i.VillageName;
    };

});