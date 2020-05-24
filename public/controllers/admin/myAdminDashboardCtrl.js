app.controller('myAdminDashboardCtrl', function ($scope, $http, $filter) {

    $scope.getDashboardNoDetails = function () {
        $http.get('http://localhost:3000/admin/getDashboardNoDetails').then(function success(response) {
            $scope.dashboardNoDetails = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.destroyGraph = function () {
        if (chartSAQ) chartSAQ.destroy();
        if (chartSIQ) chartSIQ.destroy();
        if (chartSOQ) chartSOQ.destroy();
        $scope.stockInOutAvailableDistrictBlockWise = [];
        $scope.totalStockInQtls = 0;
        $scope.totalStockOutQtls = 0;
        $scope.totalStockAvailableQtls = 0;
        $scope.totalStockInNos = 0;
        $scope.totalStockOutNos = 0;
        $scope.totalStockAvailableNos = 0;
    };

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

    var ctxSAQ = document.querySelector("#chartSAQ");
    var chartSAQ = null;
    var ctxSIQ = document.querySelector("#chartSIQ");
    var chartSIQ = null;
    var ctxSOQ = document.querySelector("#chartSOQ");
    var chartSOQ = null;
    $scope.getAvailabilityDetails = function () {
        $scope.ddlDistricts = ($scope.ddlDistricts == undefined || $scope.ddlDistricts == null || $scope.ddlDistricts == '') ? 0 : $scope.ddlDistricts;
        $scope.ddlItems = ($scope.ddlItems == undefined || $scope.ddlItems == null || $scope.ddlItems == '') ? 0 : $scope.ddlItems;
        $scope.ddlCategories = ($scope.ddlCategories == undefined || $scope.ddlCategories == null || $scope.ddlCategories == '') ? 0 : $scope.ddlCategories;
        $http.get('http://localhost:3000/admin/getStockInOutAvailableDistrictBlockWise?districtCode=' + $scope.ddlDistricts + '&categoryID=' + $scope.ddlCategories + '&itemID=' + $scope.ddlItems).then(function success(response) {
            $scope.stockInOutAvailableDistrictBlockWise = response.data;
            if ($scope.stockInOutAvailableDistrictBlockWise.length > 0) {
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
                if ($scope.totalStockAvailableQtls != 0 || $scope.totalStockAvailableNos != 0) {
                    var districtsblocks = [];
                    var availableQuantitiesQtls = [];
                    var availableQuantitiesNos = [];
                    var stockInQuantitiesQtls = [];
                    var stockInQuantitiesNos = [];
                    var stockOutQuantitiesQtls = [];
                    var stockOutQuantitiesNos = [];
                    angular.forEach($scope.stockInOutAvailableDistrictBlockWise[0], function (i) {
                        if (i.DistrictName != undefined) {
                            districtsblocks.push(i.DistrictName);
                        }
                        availableQuantitiesQtls.push(i.AvailableQuantity);
                        stockInQuantitiesQtls.push(i.Quantity);
                        stockOutQuantitiesQtls.push(i.SaleQuantity);
                    })
                    angular.forEach($scope.stockInOutAvailableDistrictBlockWise[1], function (i) {
                        if (i.BlockName != undefined) {
                            districtsblocks.push(i.BlockName);
                        }
                        availableQuantitiesNos.push(i.AvailableQuantity);
                        stockInQuantitiesNos.push(i.Quantity);
                        stockOutQuantitiesNos.push(i.SaleQuantity);
                    })
                    var optionsSAQ = {
                        series: [{
                            name: 'Available Quantity (in Lakh Nos.)',
                            type: 'column',
                            data: availableQuantitiesNos
                        }, {
                            name: 'Available Quantity (in Qtls.)',
                            type: 'area',
                            data: availableQuantitiesQtls
                        }],
                        chart: {
                            height: 350,
                            type: 'line',
                            stacked: false,
                        },
                        stroke: {
                            width: [0, 2, 5],
                            curve: 'smooth'
                        },
                        plotOptions: {
                            bar: {
                                columnWidth: '50%'
                            }
                        },
                        fill: {
                            opacity: [0.85, 0.25, 1],
                            gradient: {
                                inverseColors: false,
                                shade: 'light',
                                type: "vertical",
                                opacityFrom: 0.85,
                                opacityTo: 0.55,
                                stops: [0, 100, 100, 100]
                            }
                        },
                        labels: districtsblocks,
                        markers: {
                            size: 0
                        },
                        xaxis: {
                            type: 'category'
                        },
                        yaxis: {
                            title: {
                                text: 'Available Quantity',
                            },
                            min: 0
                        },
                        tooltip: {
                            shared: true,
                            intersect: false,
                            y: {
                                formatter: function (y) {
                                    if (typeof y !== "undefined") {
                                        return y.toFixed(0) + "";
                                    }
                                    return y;
                                }
                            }
                        }
                    };
                    var optionsSIQ = {
                        series: [{
                            name: 'Stock In Quantity (in Lakh Nos.)',
                            data: stockInQuantitiesNos
                        }, {
                            name: 'Stock In Quantity (in Qtls.)',
                            data: stockInQuantitiesQtls
                        }],
                        colors: ['rgb(0, 143, 251)', 'rgb(0, 227, 150)'],
                        chart: {
                            type: 'bar',
                            height: 350
                        },
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: '75%',
                                endingShape: 'rounded'
                            },
                        },
                        dataLabels: {
                            enabled: false
                        },
                        stroke: {
                            show: true,
                            width: 2,
                            colors: ['transparent']
                        },
                        xaxis: {
                            categories: districtsblocks,
                        },
                        yaxis: {
                            title: {
                                text: 'Stock In Quantity'
                            }
                        },
                        fill: {
                            opacity: 1
                        },
                        tooltip: {
                            y: {
                                formatter: function (val) {
                                    return val
                                }
                            }
                        }
                    };
                    var optionsSOQ = {
                        series: [{
                            name: 'Stock Out Quantity (in Lakh Nos.)',
                            data: stockOutQuantitiesNos
                        }, {
                            name: 'Stock Out Quantity (in Qtls.)',
                            data: stockOutQuantitiesQtls
                        }],
                        colors: ['rgb(0, 143, 251)', 'rgb(0, 227, 150)'],
                        chart: {
                            type: 'bar',
                            height: 350
                        },
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: '75%',
                                endingShape: 'rounded'
                            },
                        },
                        dataLabels: {
                            enabled: false
                        },
                        stroke: {
                            show: true,
                            width: 2,
                            colors: ['transparent']
                        },
                        xaxis: {
                            categories: districtsblocks,
                        },
                        yaxis: {
                            title: {
                                text: 'Stock Out Quantity'
                            }
                        },
                        fill: {
                            opacity: 1
                        },
                        tooltip: {
                            y: {
                                formatter: function (val) {
                                    return val
                                }
                            }
                        }
                    };
                    chartSAQ = new ApexCharts(ctxSAQ, optionsSAQ);
                    chartSAQ.render();
                    chartSIQ = new ApexCharts(ctxSIQ, optionsSIQ);
                    chartSIQ.render();
                    chartSOQ = new ApexCharts(ctxSOQ, optionsSOQ);
                    chartSOQ.render();
                }
                else {
                    $scope.destroyGraph();
                    alert('No records are available.');
                }
            }
            else {
                alert('No records are available.');
            }
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

});