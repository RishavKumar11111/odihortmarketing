app.controller('myAdminItemsAvailableDistrictWiseCtrl', function ($scope, $http, $filter) {

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

    $scope.getAvailabilityDetails = function () {
        $http.get('http://localhost:3000/admin/getAvailabilityDetails?districtCode=' + $scope.ddlDistricts + '&categoryID=' + $scope.ddlCategories + '&itemID=' + $scope.ddlItems).then(function success(response) {
            $scope.itemsAvailable = response.data;
            if ($scope.itemsAvailable.length > 0) {
                $scope.districtName = $filter('filter')($scope.districts, { DistrictCode: $scope.ddlDistricts }, true)[0].DistrictName;
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
        $scope.sdNm = i.SubDivisionName;
        $scope.at = i.AreaType;
        $scope.bNm = i.BlockName;
        $scope.gNm = i.GPName;
        $scope.vNm = i.VillageName;
    };

});