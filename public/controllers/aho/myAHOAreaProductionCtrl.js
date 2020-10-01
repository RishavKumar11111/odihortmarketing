app.controller('myAHOAreaProductionCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.bindEstimate = function () {
        $scope.ddlEstimate = null;
        if ($scope.ddlFinancialYear == '2019-20') {
            $scope.estimates = [{'EstimateID': 'All', 'EstimateName': 'All'}, {'EstimateID': '1st Estimate - 10th December 2019', 'EstimateName': '1st Estimate - 10th December 2019'}, {'EstimateID': '2nd Estimate - 10th May 2020', 'EstimateName': '2nd Estimate - 10th May 2020'}, {'EstimateID': '3rd Estimate - 10th August 2020', 'EstimateName': '3rd Estimate - 10th August 2020'}, {'EstimateID': 'Final Estimate - 10th December 2020', 'EstimateName': 'Final Estimate - 10th December 2020'}];
        }
        else {
            $scope.estimates = [{'EstimateID': 'All', 'EstimateName': 'All'}, {'EstimateID': '1st Estimate - 10th December 2020', 'EstimateName': '1st Estimate - 10th December 2020'}, {'EstimateID': '2nd Estimate - 10th May 2021', 'EstimateName': '2nd Estimate - 10th May 2021'}, {'EstimateID': '3rd Estimate - 10th August 2021', 'EstimateName': '3rd Estimate - 10th August 2021'}, {'EstimateID': 'Final Estimate - 10th December 2021', 'EstimateName': 'Final Estimate - 10th December 2021'}];
        }
    };

    $scope.getCategories = function () {
        $http.get('http://localhost:3000/aho/getCategories').then(function success(response) {
            $scope.categories = response.data;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getCropDetails = function () {
        if ($scope.ddlFinancialYear !== null && $scope.ddlFinancialYear !== undefined && $scope.ddlEstimate !== null && $scope.ddlEstimate !== undefined && $scope.ddlCategories !== null && $scope.ddlCategories !== undefined) {
            $http.get('http://localhost:3000/aho/getCropDetails?categoryID=' + $scope.ddlCategories + '&estimate=' + $scope.ddlEstimate + '&financialYear=' + $scope.ddlFinancialYear).then(function success(response) {
                $scope.cropDetails = response.data;
                if ($scope.cropDetails.length > 0) {
                    angular.forEach($scope.cropDetails, function (i) {
                        if (i.hasOwnProperty('TotalArea') && i.hasOwnProperty('Production')) {
                            var k = (i.TotalArea == undefined || i.TotalArea == null || i.TotalArea == '') ? 0.00 : i.TotalArea;
                            var l = (i.Production == undefined || i.Production == null || i.Production == '') ? 0.00 : i.Production;
                            i.productivity = (parseFloat(l / k).toFixed(2) == "NaN" || parseFloat(l / k).toFixed(2) == "Infinity") ? null : parseFloat(l / k).toFixed(2) + ' ' + i.Unit + ' / Ha.';
                        }
                    });
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

    $scope.calculateProductivity = function (i) {
        if (i.hasOwnProperty('TotalArea') && i.hasOwnProperty('Production')) {
            var k = (i.TotalArea == undefined || i.TotalArea == null || i.TotalArea == '') ? 0.00 : i.TotalArea;
            var l = (i.Production == undefined || i.Production == null || i.Production == '') ? 0.00 : i.Production;
            i.productivity = (parseFloat(l / k).toFixed(2) == "NaN" || parseFloat(l / k).toFixed(2) == "Infinity") ? null : parseFloat(l / k).toFixed(2) + ' ' + i.Unit + ' / Ha.';
        }
    };

    $scope.submitAP = function (type) {
        if ($scope.ddlFinancialYear !== null && $scope.ddlFinancialYear !== undefined && $scope.ddlEstimate !== null && $scope.ddlEstimate !== undefined && $scope.ddlEstimate !== 'All' && $scope.ddlCategories !== null && $scope.ddlCategories !== undefined) {
            var counter = 0;
            if ($scope.ddlCategories == 1 || $scope.ddlCategories == 4) {
                angular.forEach($scope.cropDetails, function (i) {
                    if (i.hasOwnProperty('TotalArea') && i.hasOwnProperty('FruitsBearingArea') && i.hasOwnProperty('Production')) {
                        if (i.TotalArea !== null && i.TotalArea !== undefined && i.TotalArea !== '' && i.FruitsBearingArea !== null && i.FruitsBearingArea !== undefined && i.FruitsBearingArea !== '' && i.Production !== null && i.Production !== undefined && i.Production !== '') {
                            counter++;
                        }
                    }
                });
            }
            else {
                angular.forEach($scope.cropDetails, function (i) {
                    if (i.hasOwnProperty('TotalArea') && i.hasOwnProperty('Production')) {
                        if (i.TotalArea !== null && i.TotalArea !== undefined && i.TotalArea !== '' && i.Production !== null && i.Production !== undefined && i.Production !== '') {
                            counter++;
                        }
                    }
                });
            }
            if (counter == $scope.cropDetails.length) {
                var count = 0;
                if ($scope.ddlCategories == 1 || $scope.ddlCategories == 4) {
                    angular.forEach($scope.cropDetails, function (i) {
                        if (i.hasOwnProperty('TotalArea') && i.hasOwnProperty('FruitsBearingArea')) {
                            if (i.FruitsBearingArea <= i.TotalArea) {
                                count++;
                            }
                        }
                    });
                }
                else {
                    angular.forEach($scope.cropDetails, function (i) {
                        i.FruitsBearingArea = null;
                        count++;
                    });
                }
                if (count == $scope.cropDetails.length) {
                    var myObj = {
                        financialYear: $scope.ddlFinancialYear,
                        estimate: $scope.ddlEstimate,
                        type: type
                    };
                    $http.post('http://localhost:3000/aho/submitAreaProduction', { data: { arr: $scope.cropDetails, obj: myObj } }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                        var result = response.data;
                        if (result == true) {
                            alert('The Area & Production details are submitted successfully.');
                            $scope.getCropDetails();
                        }
                        else {
                            alert('An error occurred... Please contact the administrator.');
                        }
                    }).catch(function error(err) {
                        console.log('An error occurred...', err);
                    });
                }
                else {
                    alert('Fruits Bearing Area cannot be more than Total Area.');
                }
            }
            else {
                alert('Please enter all the fields containing Total Area, Fruits Bearing Area (where required) & Production');
            }
        }
        else {
            alert('Please select the Financial Year, Estimate & Category.');
        }
    };

});