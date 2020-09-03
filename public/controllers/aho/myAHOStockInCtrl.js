app.controller('myAHOStockInCtrl', function ($scope, $http, $filter) {

    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    $scope.rbAreaType = 'Rural';

    $scope.getDistrictName = function () {
        $http.get('http://localhost:3000/aho/getDistrictName').then(function success(response) {
            $scope.districtName = response.data[0].DistrictName;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.txtFNPH = '';
    $scope.txtFMNPH = '';
    $scope.txtANPH = 'Enter Aadhaar No.'
    $scope.dataAvailable = false;
    $scope.getFarmerDetails = function () {
        if ($scope.txtFarmerID !== null && $scope.txtFarmerID !== '' && $scope.txtFarmerID !== undefined) {
            $http.get('https://apicol.nic.in/api/FarmerData?farmerID=' + $scope.districtName + '/' + $scope.txtFarmerID).then(function success(res) {
                if (res.data.ErrorMessage == null) {
                    $scope.dataAvailable = true;
                    $scope.txtFarmerName = res.data.VCHFARMERNAME;
                    $scope.txtFNPH = ($scope.txtFarmerName == null || $scope.txtFarmerName == '') ? "Enter Farmer Name" : '';
                    $scope.txtFarmerMobileNo = res.data.VCHMOBILENO;
                    $scope.txtFMNPH = ($scope.txtFarmerMobileNo == null || $scope.txtFarmerMobileNo == '') ? "Enter Farmer Mobile No." : '';
                    $scope.txtAadhaarNo = null;
                    $scope.txtANPH = '';
                    $scope.lgdVC = res.data.LGDVillageCode;
                    if ($scope.lgdVC !== null) {
                        getLocationDetails($scope.lgdVC)
                    }
                    else {
                        $scope.getBlockGPs();
                    }
                }
                else {
                    alert('Please enter a valid Farmer ID.');
                    $scope.clearData();
                }
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
        else if ($scope.txtAadhaarNo !== null && $scope.txtAadhaarNo !== '' && $scope.txtAadhaarNo !== undefined) {
            $http.get('https://apicol.nic.in/api/FarmerData/GetFarmerDetails?aadhaarNo=' + $scope.txtAadhaarNo).then(function success(res) {
                if (res.data.ErrorMessage == null) {
                    $scope.dataAvailable = true;
                    $scope.txtFarmerID = res.data.NICFARMERID.substr(4,);
                    $scope.txtFarmerName = res.data.VCHFARMERNAME;
                    $scope.txtFNPH = ($scope.txtFarmerName == null || $scope.txtFarmerName == '') ? "Enter Farmer Name" : '';
                    $scope.txtFarmerMobileNo = res.data.VCHMOBILENO;
                    $scope.txtFMNPH = ($scope.txtFarmerMobileNo == null || $scope.txtFarmerMobileNo == '') ? "Enter Farmer Mobile No." : '';
                    $scope.lgdVC = res.data.LGDVillageCode;
                    if ($scope.lgdVC !== null) {
                        getLocationDetails($scope.lgdVC)
                    }
                    else {
                        $scope.getBlockGPs();
                    }
                }
                else {
                    alert('No Farmer ID is found for the correcsponding Aadhaar No. Please generate a Farmer ID for the concerned farmer.');
                    $scope.clearData();
                }
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
        else {
            alert('Please enter a valid Aadhaar No. or Farmer ID');
            $scope.clearData();
        }
    };

    var getLocationDetails = function (villageCode) {
        $http.get('http://localhost:3000/aho/getLocationDetails?villageCode=' + villageCode).then(function success(response) {
            $scope.villages = [{ VillageCode: response.data[0].VillageCode, VillageName: response.data[0].VillageName }];
            $scope.ddlVillages = response.data[0].VillageCode;
            $scope.gps = [{ GPCode: response.data[0].GPCode, GPName: response.data[0].GPName }];
            $scope.ddlGPs = response.data[0].GPCode;
        }, function error(response) {
            console.log(response.status);
        }).catch(function err(error) {
            console.log('An error occurred...', error);
        });
    };

    $scope.getBlockGPs = function () {
        if ($scope.rbAreaType == 'Rural') {
            $scope.blocks = [];
            $scope.ddlBlocks = null;
            $scope.villages = [];
            $scope.ddlVillages = null;
            $scope.ddlGPs = null;
            $http.get('http://localhost:3000/aho/getGPs').then(function success(response) {
                $scope.gps = response.data;
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
        else {
            $scope.gps = [];
            $scope.ddlGPs = null;
            $scope.villages = [];
            $scope.ddlVillages = null;
            $scope.ddlBlocks = null;
            $http.get('http://localhost:3000/aho/getULBs').then(function success(response) {
                $scope.blocks = response.data;
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getVillagesByGP = function () {
        if ($scope.ddlGPs !== null && $scope.ddlGPs !== undefined && $scope.ddlGPs !== '') {
            $scope.ddlVillages = null;
            $http.get('http://localhost:3000/aho/getVillagesByGP?gpCode=' + $scope.ddlGPs).then(function success(response) {
                $scope.villages = response.data;
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.clearData = function () {
        $scope.dataAvailable = false;
        $scope.txtFarmerID = null;
        $scope.txtAadhaarNo = null;
        $scope.txtANPH = 'Enter Aadhaar No.'
        $scope.txtFarmerName = null;
        $scope.txtFNPH = '';
        $scope.txtFarmerMobileNo = null;
        $scope.txtFMNPH = '';
        $scope.ddlVillages = null;
        $scope.villages = [];
        $scope.ddlGPs = null;
        $scope.gps = [];
        $scope.ddlBlocks = null;
        $scope.blocks = [];
        $scope.rbAreaType = 'Rural';
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

    $scope.getItemsByCategory = function (categoryID) {
        if (categoryID != undefined) {
            $http.get('http://localhost:3000/aho/getItemsByCategory?categoryID=' + categoryID).then(function success(response) {
                $scope.items = response.data;
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getUnitByItem = function () {
        if ($scope.ddlItems !== undefined && $scope.ddlItems !== null) {
            $scope.unit = $filter('filter')($scope.items, { ItemID: $scope.ddlItems }, true)[0].Unit;
        }
        else {
            $scope.unit = '';
        }
    };

    $scope.itemsArray = [];
    $scope.addItem = function () {
        var availableDate = document.getElementById("availabilityRange").value;
        if ($scope.ddlItems !== '' && $scope.ddlItems !== null && $scope.ddlItems !== undefined && $scope.txtQuantity !== '' && $scope.txtQuantity !== null && $scope.txtQuantity !== undefined && availableDate !== '' && availableDate !== null && availableDate !== undefined && $scope.txtCultivationArea !== '' && $scope.txtCultivationArea !== null && $scope.txtCultivationArea !== undefined) {
            var itemName = $filter('filter')($scope.items, { ItemID: $scope.ddlItems }, true)[0].ItemName;
            var availableFrom = availableDate.split(' - ')[0].split("-").reverse().join("-");
            var availableTill = availableDate.split(' - ')[1].split("-").reverse().join("-");
            var k = { ItemID: $scope.ddlItems, ItemName: itemName, Quantity: $scope.txtQuantity, Unit: $scope.unit, AvailableDate: availableDate, AvailableFrom: availableFrom, AvailableTill: availableTill, CultivationArea: $scope.txtCultivationArea };
            if ($scope.itemsArray.length > 0) {
                if (!$scope.itemsArray.some(j => j.ItemID == k.ItemID)) {
                    $scope.itemsArray.push(k);
                    clearDetails();
                }
                else {
                    alert('This item has already been entered.');
                }
            }
            else {
                $scope.itemsArray.push(k);
                clearDetails();
            }
        }
        else {
            alert('Please fill all the fields.');
        }
    };

    var clearDetails = function () {
        $scope.ddlItems = null;
        $scope.txtQuantity = null;
        $scope.txtCultivationArea = null;
        document.getElementById("availabilityRange").value = null;
        // $scope.items = [];
        // var cbs = document.getElementsByName('categories');
        // for (var i = 0; i < cbs.length; i++) {
        //     cbs[i].checked = false;
        // }
    };

    $scope.removeItem = function (index) {
        $scope.itemsArray.splice(index, 1);
    };

    $scope.readFile = function (e) {
        var file = e.files[0];
        if (e.files && file) {
            if (file.size <= 102400) {
                var reader = new FileReader();
                var blob = file.slice(0, 4);
                reader.readAsArrayBuffer(blob);
                reader.onload = function (event) {
                    checkMIMEType(event, file, function (obj) {
                        if (obj.fileName == null || obj.fileName == '' || obj.fileName == undefined || obj.fileType == 'Unknown / Missing Extension' || obj.binaryFileType == 'Unknown File Type') {
                            alert('Please upload a valid image file (.jpg or .png format).');
                            document.getElementById('thumbnail').innerHTML = '';
                            document.getElementById('imageFile').value = '';
                            return false;
                        }
                        else {
                            reader.readAsDataURL(file);
                            reader.onload = function (evt) {
                                document.getElementById('thumbnail').innerHTML = '<img src="' + evt.target.result + '" id="uploadedImage" style="width: 100%; height: 300px;" />';
                            }
                        }
                    });
                };
            }
            else {
                alert('Please upload an image within 100 KB in size.');
                document.getElementById('thumbnail').innerHTML = '';
                document.getElementById('imageFile').value = '';
            }
        }
    };

    var checkMIMEType = function (event, file, callback) {
        if (event.target.readyState === FileReader.DONE) {
            var uint = new Uint8Array(event.target.result);
            var bytes = [];
            uint.forEach(function (byte) {
                bytes.push(byte.toString(16));
            })
            var hex = bytes.join('').toUpperCase();
            var obj = {
                fileName: file.name,
                fileType: file.type ? file.type : 'Unknown / Missing Extension',
                binaryFileType: getMIMEType(hex)
            };
            callback(obj);
        }
    };

    var getMIMEType = function (signature) {
        switch (signature) {
            case '89504E47':
                return 'image/png'
            case '47494638':
                return 'image/gif'
            case 'FFD8FFDB':
            case 'FFD8FFE0':
            case 'FFD8FFE1':
            case 'FFD8FFE2':
            case 'FFD8FFE3':
            case 'FFD8FFE8':
                return 'image/jpeg'
            default:
                return 'Unknown File Type'
        }
    };

    $scope.submitStockIn = function (isValid) {
        if ($scope.txtFarmerMobileNo != undefined) {
            if (isValid) {
                if ($scope.itemsArray.length > 0) {
                    if (($scope.rbAreaType == 'Rural' && $scope.ddlGPs !== undefined && $scope.ddlGPs !== null && $scope.ddlGPs !== '' && $scope.ddlVillages !== undefined && $scope.ddlVillages !== null && $scope.ddlVillages !== '' && ($scope.ddlBlocks == undefined || $scope.ddlBlocks == null || $scope.ddlBlocks == '')) || ($scope.rbAreaType == 'Urban' && $scope.ddlBlocks !== undefined && $scope.ddlBlocks !== null && $scope.ddlBlocks !== '' && ($scope.ddlGPs == undefined || $scope.ddlGPs == null || $scope.ddlGPs == '') && ($scope.ddlVillages == undefined || $scope.ddlVillages == null || $scope.ddlVillages == ''))) {
                        var message = confirm('Do you really want to submit the form?');
                        if (message) {
                            var blockCode = ($scope.ddlBlocks !== undefined && $scope.ddlBlocks !== null && $scope.ddlBlocks !== '') ? $scope.ddlBlocks : null;
                            var gpCode = ($scope.ddlGPs !== undefined && $scope.ddlGPs !== null && $scope.ddlGPs !== '') ? $scope.ddlGPs : null;
                            var villageCode = ($scope.ddlVillages !== undefined && $scope.ddlVillages !== null && $scope.ddlVillages !== '') ? $scope.ddlVillages : null;
                            var imageData = (document.getElementById("uploadedImage")) ? document.getElementById("uploadedImage").src.replace('data:image/jpeg;base64,', '') : null;
                            var myData = { FarmerID: $scope.districtName + '/' + $scope.txtFarmerID, FarmerName: $scope.txtFarmerName, FarmerMobileNo: $scope.txtFarmerMobileNo, AreaType: $scope.rbAreaType, BlockCode: blockCode, GPCode: gpCode, VillageCode: villageCode, Photo: imageData };
                            $http.post('http://localhost:3000/aho/submitStockIn', { data: { obj: myData, array: $scope.itemsArray } }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
                                var result = response.data;
                                if (result == true) {
                                    alert('The Stock In details are submitted successfully.');
                                    $scope.clearData();
                                    clearDetails();
                                    document.getElementById('thumbnail').innerHTML = '';
                                    document.getElementById('imageFile').value = '';
                                    $scope.itemsArray = [];
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
                        alert('Please select GP and Village for the Rural Area Type or Block for Urban Area Type.');
                    }
                }
                else {
                    alert('Please enter atleast one item and its details and click on the "Add Item (+)" button.');
                }
            }
            else {
                alert('Please fill all the fields.');
            }
        }
        else {
            alert('Please enter a valid Mobile No.');
        }
    };

    // var compressImage = function (file, reader, fileName, callback) {
    //     var width = 500;
    //     var height = 300;
    //     reader.readAsDataURL(file);
    //     reader.onload = function (evt) {
    //         var img = new Image();
    //         img.src = evt.target.result;
    //         img.onload = function () {
    //             var elem = document.createElement('canvas');
    //             elem.width = width;
    //             elem.height = height;
    //             var ctx = elem.getContext('2d');
    //             ctx.drawImage(img, 0, 0, width, height);
    //             ctx.canvas.toBlob(function (blob) {
    //                 var compressedFile = new File([blob], fileName, {
    //                     type: 'image/jpeg',
    //                     lastModified: Date.now()
    //                 });
    //                 callback(compressedFile);
    //             }, 'image/jpeg', 1);
    //         };
    //     };
    //     reader.onerror = function (err) {
    //         console.log('Error: ', err);
    //     };
    // };

});