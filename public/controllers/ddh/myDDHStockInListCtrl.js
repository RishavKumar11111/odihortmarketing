app.controller('myDDHStockInListCtrl', function ($scope, $http, $filter) {

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
                $scope.stockInDetails = [];
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
                $scope.stockInDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getStockInDetails = function () {
        var date = document.getElementById("dateRange").value;
        var dateFrom = '';
        var dateTill = '';
        $scope.displayDate = '';
        if (date !== undefined && date !== null && date !== '') {
            dateFrom = date.split(' - ')[0].split("-").reverse().join("-");
            dateTill = date.split(' - ')[1].split("-").reverse().join("-");
            // $scope.displayDate = new Date(dateFrom).toString().substring(4, 15) + ' - ' + new Date(dateTill).toString().substring(4, 15);
            $scope.displayDate = date.split(' - ')[0].split("-").join("/") + ' - ' + date.split(' - ')[1].split("-").join("/");
        }
        $http.get('http://localhost:3000/ddh/getStockInDetails?blockCode=' + $scope.ddlBlocks + '&categoryID=' + $scope.ddlCategories + '&areaType=' + $scope.rbAreaType + '&itemID=' + $scope.ddlItems + '&dateFrom=' + dateFrom + '&dateTill=' + dateTill).then(function success(response) {
            $scope.stockInDetails = response.data;
            if ($scope.stockInDetails.length > 0) {
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
                angular.forEach($scope.stockInDetails, function (i) {
                    if (i.Unit == 'Q') {
                        $scope.totalQuintal += i.Quantity;
                    }
                    else {
                        $scope.totalNo += i.Quantity;
                    }
                })
                $scope.pageSize = 50;
                $scope.search = '';
            }
            else {
                alert('No Stock In records found!');
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

    $scope.getStockInLocationItemDetails = function (i) {
        $scope.iNm = i.ItemName;
        $scope.ut = i.Unit;
        $scope.refNo = i.ReferenceNo;
        $scope.fID = i.FarmerID;
        $http.get('http://localhost:3000/ddh/getStockInLocationItemDetails?referenceNo=' + i.ReferenceNo + '&farmerID=' + i.FarmerID + '&itemID=' + i.ItemID + '&subDivisionCode=' + i.SubDivisionCode + '&farmerName=' + i.FarmerName + '&farmerMobileNo=' + i.FarmerMobileNo).then(function success(response) {
            $scope.stockInlocationItemDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});