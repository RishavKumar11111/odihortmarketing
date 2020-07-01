app.controller('myAdminStockInOutAvailableDistrictBlockWiseCtrl', function ($scope, $http, $filter) {

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/admin/getCategories').then(function success(response) {
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
            $http.get('http://localhost:3000/admin/getItemsByCategory?categoryID=' + categoryID).then(function success(response) {
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

    $scope.getDistricts = function () {
        $http.get('http://localhost:3000/admin/getDistricts').then(function success(response) {
            $scope.districts = response.data;
            var districtAll = { DistrictCode: 0, DistrictName: 'All' };
            $scope.districts.unshift(districtAll);
            $scope.ddlDistricts = 0;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getStockInOutAvailableDistrictBlockWise = function () {
        $http.get('http://localhost:3000/admin/getStockInOutAvailableDistrictBlockWise?districtCode=' + $scope.ddlDistricts + '&categoryID=' + $scope.ddlCategories + '&itemID=' + $scope.ddlItems).then(function success(response) {
            $scope.stockInOutAvailableDistrictBlockWise = response.data;
            $scope.districtName = $filter('filter')($scope.districts, { DistrictCode: $scope.ddlDistricts }, true)[0].DistrictName;
            $scope.categoryName = $filter('filter')($scope.categories, { CategoryID: $scope.ddlCategories }, true)[0].CategoryName;
            $scope.itemName = $filter('filter')($scope.items, { ItemID: $scope.ddlItems }, true)[0].ItemName;
            $scope.totalStockInQtls = 0;
            $scope.totalStockOutQtls = 0;
            $scope.totalStockAvailableQtls = 0;
            $scope.totalStockInNos = 0;
            $scope.totalStockOutNos = 0;
            $scope.totalStockAvailableNos = 0;
            if ($scope.stockInOutAvailableDistrictBlockWise[0].length > 0) {
                angular.forEach($scope.stockInOutAvailableDistrictBlockWise[0], function (i) {
                    $scope.totalStockInQtls += i.Quantity;
                    $scope.totalStockOutQtls += i.SaleQuantity;
                    $scope.totalStockAvailableQtls += i.AvailableQuantity;
                })
            }
            if ($scope.stockInOutAvailableDistrictBlockWise[1].length > 0) {
                angular.forEach($scope.stockInOutAvailableDistrictBlockWise[1], function (i) {
                    $scope.totalStockInNos += i.Quantity;
                    $scope.totalStockOutNos += i.SaleQuantity;
                    $scope.totalStockAvailableNos += i.AvailableQuantity;
                })
            }
            if ($scope.totalStockInQtls != 0 && $scope.totalStockInNos == 0) {
                document.getElementById('divIDQ').className = document.getElementById('divIDQ').className.replace('col-md-6 col-sm-6', 'col-md-12 col-sm-12');
            }
            else if ($scope.totalStockInNos != 0 && $scope.totalStockInQtls == 0) {
                document.getElementById('divIDN').className = document.getElementById('divIDN').className.replace('col-md-6 col-sm-6', 'col-md-12 col-sm-12');
            }
            else if ($scope.totalStockInQtls != 0 && $scope.totalStockInNos != 0) {
                document.getElementById('divIDQ').className = document.getElementById('divIDQ').className.replace('col-md-12 col-sm-12', 'col-md-6 col-sm-6');
                document.getElementById('divIDN').className = document.getElementById('divIDN').className.replace('col-md-12 col-sm-12', 'col-md-6 col-sm-6');
            }
            $scope.pageSize = 50;
            $scope.search = '';
            if ($scope.totalStockInQtls == 0 && $scope.totalStockOutQtls == 0 && $scope.totalStockAvailableQtls == 0 && $scope.totalStockInNos == 0 && $scope.totalStockOutNos == 0 && $scope.totalStockAvailableNos == 0) {
                alert('No records are available.');
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