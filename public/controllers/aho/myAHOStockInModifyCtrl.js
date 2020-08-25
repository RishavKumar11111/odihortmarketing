app.controller('myAHOStockInModifyCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/aho/getCategories').then(function success(response) {
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
            $http.get('http://localhost:3000/aho/getItemsByCategory?categoryID=' + categoryID).then(function success(response) {
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
        $http.get('http://localhost:3000/aho/getStockInDetails?categoryID=' + $scope.ddlCategories + '&itemID=' + $scope.ddlItems + '&dateFrom=' + dateFrom + '&dateTill=' + dateTill).then(function success(response) {
            $scope.stockInDetails = response.data;
            if ($scope.stockInDetails.length > 0) {
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

    $scope.getStockInLocationItemDetails = function (i) {
        $scope.refNo = i.ReferenceNo;
        $scope.fID = i.FarmerID;
        $scope.iNm = i.ItemName;
        $scope.ut = i.Unit;
        $http.get('http://localhost:3000/aho/getStockInLocationItemDetails?referenceNo=' + i.ReferenceNo + '&farmerID=' + i.FarmerID + '&itemID=' + i.ItemID + '&farmerName=' + i.FarmerName + '&farmerMobileNo=' + i.FarmerMobileNo).then(function success(response) {
            $scope.stockInLocationItemDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.SIHL = false;
    $scope.SLHI = true;

    $scope.updateStockInDetails = function (i) {
        if (i.Quantity !== null && i.Quantity !== undefined && i.Quantity !== '' && i.CultivationArea !== null && i.CultivationArea !== undefined && i.CultivationArea !== '') {
            var message = confirm('Do you really want to submit the form?');
            if (message) {
                var myData = { StockID: i.StockID, ItemID: i.ItemID, Quantity: i.Quantity, CultivationArea: i.CultivationArea };
                $http.post('http://localhost:3000/aho/updateStockInDetails', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                    var result = response.data;
                    if (result == true) {
                        alert('The Stock In details are updated successfully.');
                        $scope.getStockInDetails();
                        document.getElementById('modifyModal').style.display = "none";
                        document.getElementById('closeModifyModal').click();
                    }
                    else {
                        alert('An error occurred... Please contact the administrator.');
                    }
                }).catch(function error(err) {
                    console.log('An error occurred...', err);
                });
            }
        }
        else {
            alert('Please fill all the fields.');
        }
    };

});