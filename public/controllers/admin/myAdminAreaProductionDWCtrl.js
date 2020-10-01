app.controller('myAdminAreaProductionDWCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

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

    $scope.bindEstimate = function () {
        $scope.ddlEstimate = null;
        if ($scope.ddlFinancialYear == '2019-20') {
            $scope.estimates = [{ 'EstimateID': 'All', 'EstimateName': 'All' }, { 'EstimateID': '1st Estimate - 10th December 2019', 'EstimateName': '1st Estimate - 10th December 2019' }, { 'EstimateID': '2nd Estimate - 10th May 2020', 'EstimateName': '2nd Estimate - 10th May 2020' }, { 'EstimateID': '3rd Estimate - 10th August 2020', 'EstimateName': '3rd Estimate - 10th August 2020' }, { 'EstimateID': 'Final Estimate - 10th December 2020', 'EstimateName': 'Final Estimate - 10th December 2020' }];
        }
        else {
            $scope.estimates = [{ 'EstimateID': 'All', 'EstimateName': 'All' }, { 'EstimateID': '1st Estimate - 10th December 2020', 'EstimateName': '1st Estimate - 10th December 2020' }, { 'EstimateID': '2nd Estimate - 10th May 2021', 'EstimateName': '2nd Estimate - 10th May 2021' }, { 'EstimateID': '3rd Estimate - 10th August 2021', 'EstimateName': '3rd Estimate - 10th August 2021' }, { 'EstimateID': 'Final Estimate - 10th December 2021', 'EstimateName': 'Final Estimate - 10th December 2021' }];
        }
    };

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/admin/getCategories').then(function success(response) {
            $scope.categories = response.data;
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
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.calculateProductivity = function (i) {
        if (i.hasOwnProperty('TotalArea') && i.hasOwnProperty('Production')) {
            var k = (i.TotalArea == undefined || i.TotalArea == null || i.TotalArea == '') ? 0.00 : i.TotalArea;
            var l = (i.Production == undefined || i.Production == null || i.Production == '') ? 0.00 : i.Production;
            i.productivity = (parseFloat(l / k).toFixed(2) == "NaN" || parseFloat(l / k).toFixed(2) == "Infinity") ? null : parseFloat(l / k).toFixed(2) + ' ' + i.Unit + ' / Ha.';
        }
    };

    $scope.getReport = function () {
        if ($scope.ddlDistricts !== null && $scope.ddlDistricts !== undefined && $scope.ddlFinancialYear !== null && $scope.ddlFinancialYear !== undefined && $scope.ddlEstimate !== null && $scope.ddlEstimate !== undefined && $scope.ddlCategories !== null && $scope.ddlCategories !== undefined && $scope.ddlItems !== null && $scope.ddlItems !== undefined) {
            $http.get('http://localhost:3000/admin/getReport?districtCode=' + $scope.ddlDistricts + '&categoryID=' + $scope.ddlCategories + '&estimate=' + $scope.ddlEstimate + '&financialYear=' + $scope.ddlFinancialYear + '&itemID=' + $scope.ddlItems).then(function success(response) {
                $scope.report = response.data;
                if ($scope.report.length > 0) {
                    $scope.sumTotalArea = 0;
                    $scope.sumProduction = 0;
                    $scope.sumFruitsBearingArea = 0;
                    var sumProductivity = 0;
                    var un = $filter('filter')($scope.items, { ItemID: $scope.ddlItems }, true)[0].Unit;
                    $scope.unitName = (un == 'Q') ? 'MT' : 'Lakh Nos.';
                    $scope.categoryName = $filter('filter')($scope.categories, { CategoryID: $scope.ddlCategories }, true)[0].CategoryName;
                    $scope.itemName = $filter('filter')($scope.items, { ItemID: $scope.ddlItems }, true)[0].ItemName;
                    angular.forEach($scope.report, function (i) {
                        if (i.hasOwnProperty('TotalArea') && i.hasOwnProperty('Production')) {
                            var k = (i.TotalArea == undefined || i.TotalArea == null || i.TotalArea == '') ? 0.00 : i.TotalArea;
                            var l = (i.Production == undefined || i.Production == null || i.Production == '') ? 0.00 : i.Production;
                            i.productivity = (parseFloat(l / k).toFixed(2) == "NaN" || parseFloat(l / k).toFixed(2) == "Infinity") ? 0 : parseFloat(l / k).toFixed(2);
                            sumProductivity = sumProductivity + parseFloat(i.productivity);
                        }
                        if (i.hasOwnProperty('TotalArea')) {
                            var m = (i.TotalArea == undefined || i.TotalArea == null || i.TotalArea == '') ? 0.00 : i.TotalArea;
                            $scope.sumTotalArea = $scope.sumTotalArea + m;
                        }
                        if (i.hasOwnProperty('Production')) {
                            var n = (i.Production == undefined || i.Production == null || i.Production == '') ? 0.00 : i.Production;
                            $scope.sumProduction = $scope.sumProduction + n;
                        }
                        if (i.hasOwnProperty('FruitsBearingArea')) {
                            var o = (i.FruitsBearingArea == undefined || i.FruitsBearingArea == null || i.FruitsBearingArea == '') ? 0.00 : i.FruitsBearingArea;
                            $scope.sumFruitsBearingArea = $scope.sumFruitsBearingArea + o;
                        }
                    });
                    $scope.avgProductivity = parseFloat(sumProductivity / $scope.report.length).toFixed(2);
                    if ($scope.sumTotalArea == 0 && $scope.sumProduction == 0) {
                        alert('No record is found.');
                        $scope.report = [];
                    }
                }
                else {
                    alert('No record is found.');
                }
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

});