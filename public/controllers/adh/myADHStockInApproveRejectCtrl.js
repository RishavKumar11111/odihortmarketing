app.controller('myADHStockInApproveRejectCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.rbAreaType = 'Rural';

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/adh/getCategories').then(function success(response) {
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
            $http.get('http://localhost:3000/adh/getItemsByCategory?categoryID=' + categoryID).then(function success(response) {
                $scope.items = response.data;
                var itemAll = { ItemID: 0, ItemName: 'All' };
                $scope.items.unshift(itemAll);
                $scope.ddlItems = 0;
                clearData();
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getBlocks = function () {
        if ($scope.rbAreaType == 'Rural') {
            $http.get('http://localhost:3000/adh/getBlocks').then(function success(response) {
                $scope.blocks = response.data;
                var blockAll = { BlockCode: 0, BlockName: 'All' };
                $scope.blocks.unshift(blockAll);
                $scope.ddlBlocks = 0;
                clearData();
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
        else {
            $http.get('http://localhost:3000/adh/getULBs').then(function success(response) {
                $scope.blocks = response.data;
                var blockAll = { ULBCode: 0, ULBName: 'All' };
                $scope.blocks.unshift(blockAll);
                $scope.ddlBlocks = 0;
                clearData();
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getStockInDetails = function () {
        $http.get('http://localhost:3000/adh/getStockInDetails?blockCode=' + $scope.ddlBlocks + '&categoryID=' + $scope.ddlCategories + '&areaType=' + $scope.rbAreaType + '&itemID=' + $scope.ddlItems).then(function success(response) {
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

    $scope.getLocationItemDetails = function (i) {
        $scope.refNo = i.ReferenceNo;
        $scope.fID = i.FarmerID;
        $scope.iNm = i.ItemName;
        $scope.ut = i.Unit;
        $http.get('http://localhost:3000/adh/getLocationItemDetails?referenceNo=' + i.ReferenceNo + '&farmerID=' + i.FarmerID + '&itemID=' + i.ItemID).then(function success(response) {
            $scope.locationItemDetails = response.data;
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
                $http.post('http://localhost:3000/adh/updateStockInDetails', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                    var result = response.data;
                    if (result == true) {
                        alert('The Stock In details are updated successfully.');
                        $scope.getStockInDetails();
                        clearData();
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

    $scope.recordArray = [];
    $scope.toggleAll = function () {
        var toggleStatus = !$scope.isAllSelected;
        angular.forEach($scope.stockInDetails, function (item) {
            item.selected = toggleStatus;
        });
        if (!$scope.isAllSelected == true) {
            angular.forEach($scope.stockInDetails, function (item) {
                item.selected = toggleStatus;
                $scope.recordArray.push({ 'ReferenceNo': item.ReferenceNo, 'FarmerID': item.FarmerID, 'ItemID': item.ItemID });
            });
        }
        else {
            $scope.recordArray = [];
        }
    };

    $scope.optionToggled = function (selected, obj) {
        $scope.isAllSelected = $scope.stockInDetails.every(function (item) {
            return item.selected;
        });
        if (selected == false) {
            $scope.recordArray.splice($scope.recordArray.findIndex(function (i) {
                return i.ReferenceNo === obj.ReferenceNo && i.FarmerID === obj.FarmerID && i.ItemID === obj.ItemID;
            }), 1);
        }
        else {
            $scope.recordArray.push({ 'ReferenceNo': obj.ReferenceNo, 'FarmerID': obj.FarmerID, 'ItemID': obj.ItemID });
        }
    };

    $scope.finalizeStockIn = function (i) {
        if ($scope.recordArray.length > 0) {
            var message = confirm('Do you really want to submit the form?');
            if (message) {
                var myData = {};
                myData.Remarks = ($scope.txtRemarks !== null && $scope.txtRemarks !== undefined && $scope.txtRemarks !== '') ? $scope.txtRemarks : null;
                myData.Status = i;
                $http.post('http://localhost:3000/adh/finalizeStockIn', { data: { array: $scope.recordArray, obj: myData } }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                    var result = response.data;
                    if (result == true) {
                        alert('The Stock In details are submitted successfully.');
                        $scope.getStockInDetails();
                        clearData();
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
            alert('Please select atleast one record.');
        }
    };

    var clearData = function () {
        $scope.txtRemarks = null;
        $scope.isAllSelected = false;
        $scope.stockInDetails = [];
        $scope.recordArray = [];
    };

});