app.controller('myDDHStockOutCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.rbAreaType = 'Rural';

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/ddh/getCategories').then(function success(response) {
            $scope.categories = response.data;
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
                $scope.stockDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getBlocks = function () {
        if ($scope.rbAreaType == 'Rural') {
            $http.get('http://localhost:3000/ddh/getBlocks').then(function success(response) {
                $scope.blocks = response.data;
                $scope.gps = [];
                $scope.villages = [];
                $scope.ddlGPs = null;
                $scope.ddlVillages = null;
                var blockAll = { BlockCode: 0, BlockName: 'All' };
                $scope.blocks.unshift(blockAll);
                $scope.stockDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
        else {
            $http.get('http://localhost:3000/ddh/getULBs').then(function success(response) {
                $scope.blocks = response.data;
                $scope.gps = [];
                $scope.villages = [];
                $scope.ddlGPs = null;
                $scope.ddlVillages = null;
                var blockAll = { ULBCode: 0, ULBName: 'All' };
                $scope.blocks.unshift(blockAll);
                $scope.stockDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getGPsByBlock = function () {
        if ($scope.ddlBlocks !== null && $scope.ddlBlocks !== undefined && $scope.ddlBlocks !== '') {
            $http.get('http://localhost:3000/ddh/getGPsByBlock?blockCode=' + $scope.ddlBlocks).then(function success(response) {
                $scope.gps = response.data;
                var gpAll = { GPCode: 0, GPName: 'All' };
                $scope.gps.unshift(gpAll);
                $scope.ddlGPs = 0;
                var villageAll = { VillageCode: 0, VillageName: 'All' };
                $scope.villages = [];
                $scope.villages.unshift(villageAll);
                $scope.ddlVillages = 0;
                $scope.stockDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getVillagesByGP = function () {
        if ($scope.ddlGPs !== null && $scope.ddlGPs !== undefined && $scope.ddlGPs !== '') {
            $http.get('http://localhost:3000/ddh/getVillagesByGP?gpCode=' + $scope.ddlGPs).then(function success(response) {
                $scope.villages = response.data;
                var villageAll = { VillageCode: 0, VillageName: 'All' };
                $scope.villages.unshift(villageAll);
                $scope.ddlVillages = 0;
                $scope.stockDetails = [];
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getStockDetails = function (overloading) {
        $scope.isAllSelected = false;
        if ($scope.ddlItems !== null && $scope.ddlItems !== undefined && $scope.ddlItems !== '' && $scope.ddlBlocks !== null && $scope.ddlBlocks !== undefined && $scope.ddlBlocks !== '') {
            if ($scope.rbAreaType == 'Rural' && $scope.ddlGPs !== null && $scope.ddlGPs !== undefined && $scope.ddlGPs !== '' && $scope.ddlVillages !== null && $scope.ddlVillages !== undefined && $scope.ddlVillages !== '') {
                $http.get('http://localhost:3000/ddh/getStockDetails?itemID=' + $scope.ddlItems + '&blockCode=' + $scope.ddlBlocks + '&gpCode=' + $scope.ddlGPs + '&villageCode=' + $scope.ddlVillages).then(function success(response) {
                    $scope.stockDetails = response.data;
                    if ($scope.stockDetails.length == 0 && overloading !== 'successfully') {
                        alert('No stock record found!');
                    }
                }, function error(response) {
                    console.log(response.status);
                }).catch(function err(error) {
                    console.log('An error occurred...', error);
                });
            }
            else {
                if (($scope.ddlGPs == null || $scope.ddlGPs == undefined || $scope.ddlGPs == '') && ($scope.ddlVillages == null || $scope.ddlVillages == undefined || $scope.ddlVillages == '')) {
                    $http.get('http://localhost:3000/ddh/getStockDetails?itemID=' + $scope.ddlItems + '&blockCode=' + $scope.ddlBlocks).then(function success(response) {
                        $scope.stockDetails = response.data;
                        if ($scope.stockDetails.length == 0 && overloading !== 'successfully') {
                            alert('No stock record found!');
                        }
                    }, function error(response) {
                        console.log(response.status);
                    }).catch(function err(error) {
                        console.log('An error occurred...', error);
                    });
                }
                else {
                    alert('An error occurred! Please try again.');
                    $scope.ddlGPs == null;
                    $scope.ddlVillages == null;
                }
            }
        }
        else {
            alert('Please select item and block.');
        }
    };

    $scope.stockArray = [];
    $scope.toggleAll = function () {
        var toggleStatus = !$scope.isAllSelected;
        angular.forEach($scope.stockDetails, function (item) {
            item.selected = toggleStatus;
        });
        if (!$scope.isAllSelected == true) {
            angular.forEach($scope.stockDetails, function (item) {
                item.selected = toggleStatus;
                $scope.stockArray.push({ 'StockID': item.StockID });
            });
        }
        else {
            $scope.stockArray = [];
            angular.forEach($scope.stockDetails, function (i) {
                if (i.hasOwnProperty('SaleQuantity')) {
                    i.SaleQuantity = null;
                    delete i.SaleQuantity;
                }
            });
        }
    };

    $scope.resetStockDetails = function () {
        $scope.isAllSelected = false;
        $scope.stockArray = [];
        angular.forEach($scope.stockDetails, function (i) {
            i.selected = false;
            if (i.hasOwnProperty('SaleQuantity')) {
                i.SaleQuantity = null;
                delete i.SaleQuantity;
            }
        });
    };

    $scope.optionToggled = function (selected, stockID, obj) {
        $scope.isAllSelected = $scope.stockDetails.every(function (item) {
            return item.selected;
        });
        if (selected == false) {
            $scope.stockArray.splice($scope.stockArray.findIndex(function (i) {
                return i.StockID === stockID;
            }), 1);
            if (obj.hasOwnProperty('SaleQuantity')) {
                obj.SaleQuantity = null;
                delete obj.SaleQuantity;
            }
        }
        else {
            $scope.stockArray.push({ 'StockID': stockID });
        }
    };

    // $scope.submitStockOut = function (isValid) {
    //     if (isValid) {
    //         if ($scope.stockArray.length > 0) {
    //             var count = 0;
    //             angular.forEach($scope.stockDetails, function (i) {
    //                 if (i.hasOwnProperty('SaleQuantity')) {
    //                     if (i.SaleQuantity == 0 || i.SaleQuantity == '0' || i.SaleQuantity == '' || i.SaleQuantity == null || i.SaleQuantity == undefined) {}
    //                     else {
    //                         count++;
    //                     }
    //                 }
    //             });
    //             if (count !== $scope.stockArray.length) {
    //                 alert('Please enter the Sale quantity for all the selected Stock records. Sale Quantity value must be greater than 0.');
    //             }
    //             else {
    //                 var counter = 0;
    //                 angular.forEach($scope.stockDetails, function (i) {
    //                     if (i.hasOwnProperty('SaleQuantity') && i.SaleQuantity <= i.Quantity) {
    //                         counter++;
    //                     }
    //                 });
    //                 if (counter !== $scope.stockArray.length) {
    //                     alert('The Sale quantity must be less than or equal to the total Quantity available.');
    //                 }
    //                 else {
    //                     var message = confirm('Do you really want to submit the form?');
    //                     if (message) {
    //                         angular.forEach($scope.stockDetails, function (i) {
    //                             angular.forEach($scope.stockArray, function (j) {
    //                                 if (j.StockID == i.StockID) {
    //                                     j.SaleQuantity = i.SaleQuantity;
    //                                 }
    //                             });
    //                         });
    //                         var myData = {};
    //                         myData.Remarks = ($scope.txtRemarks !== null && $scope.txtRemarks !== undefined && $scope.txtRemarks !== '') ? $scope.txtRemarks : null;
    //                         $http.post('http://localhost:3000/ddh/submitStockOut', { data: { array: $scope.stockArray, obj: myData } }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
    //                             var result = response.data;
    //                             if (result == true) {
    //                                 alert('The Stock Out details are submitted successfully.');
    //                                 $scope.getStockDetails('successfully');
    //                                 $scope.txtRemarks = null;
    //                                 $scope.isAllSelected = false;
    //                                 $scope.stockDetails = [];
    //                                 $scope.stockArray = [];
    //                             }
    //                             else {
    //                                 alert('An error occurred... Please contact the administrator.');
    //                             }
    //                         }).catch(function error(err) {
    //                             console.log('An error occurred...', err);
    //                         });
    //                     }
    //                 }
    //             }
    //         }
    //         else {
    //             alert('Please select a stock record.');
    //         }
    //     }
    //     else {
    //         alert('Please fill all the fields.');
    //     }
    // };

});