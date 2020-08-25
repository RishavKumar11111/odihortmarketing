app.controller('myDDHStockInCtrl', function ($scope, $http, $filter) {

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
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
    };

    $scope.getUnitByItem = function () {
        $scope.unit = $filter('filter')($scope.items, { ItemID: $scope.ddlItems }, true)[0].Unit;
    };

    $scope.getBlocks = function () {
        if ($scope.rbAreaType == 'Rural') {
            $http.get('http://localhost:3000/ddh/getBlocks').then(function success(response) {
                $scope.blocks = response.data;
                $scope.gps = [];
                $scope.villages = [];
                $scope.ddlGPs = null;
                $scope.ddlVillages = null;
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
            }, function error(response) {
                console.log(response.status);
            }).catch(function err(error) {
                console.log('An error occurred...', error);
            });
        }
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

    // $scope.submitStockIn = function (isValid) {
    //     if ($scope.txtFarmerMobileNo != undefined) {
    //         if (isValid) {
    //             if (($scope.rbAreaType == 'Rural' && $scope.ddlGPs !== undefined && $scope.ddlGPs !== null && $scope.ddlGPs !== '' && $scope.ddlVillages !== undefined && $scope.ddlVillages !== null && $scope.ddlVillages !== '') || ($scope.rbAreaType == 'Urban' && ($scope.ddlGPs == undefined || $scope.ddlGPs == null || $scope.ddlGPs == '') && ($scope.ddlVillages == undefined || $scope.ddlVillages == null || $scope.ddlVillages == ''))) {
    //                 var availableDate = document.getElementById("availabilityRange").value;
    //                 if (availableDate !== undefined && availableDate !== null && availableDate !== '') {
    //                     var message = confirm('Do you really want to submit the form?');
    //                     if (message) {
    //                         var imageData = (document.getElementById("uploadedImage")) ? document.getElementById("uploadedImage").src.replace('data:image/jpeg;base64,', '') : null;;
    //                         var availableFrom = availableDate.split(' - ')[0].split("-").reverse().join("-");
    //                         var availableTill = availableDate.split(' - ')[1].split("-").reverse().join("-");
    //                         var myData = { BlockCode: $scope.ddlBlocks, GPCode: $scope.ddlGPs, VillageCode: $scope.ddlVillages, AreaType: $scope.rbAreaType, ItemID: $scope.ddlItems, FarmerName: $scope.txtFarmerName, FarmerMobileNo: $scope.txtFarmerMobileNo, Quantity: $scope.txtQuantity, Photo: imageData, AvailableFrom: availableFrom, AvailableTill: availableTill };
    //                         $http.post('http://localhost:3000/ddh/submitStockIn', { data: myData }, { credentials: 'same-origin', headers: { 'CSRF-Token': token } }).then(function success(response) {
    //                             var result = response.data;
    //                             if (result == true) {
    //                                 alert('The Stock In details are submitted successfully.');
    //                                 $scope.ddlBlocks = null; $scope.gps = []; $scope.villages = []; $scope.ddlGPs = null; $scope.ddlVillages = null; $scope.ddlItems = null; $scope.items = []; $scope.txtFarmerName = null; $scope.txtFarmerMobileNo = null; $scope.txtQuantity = null; document.getElementById('thumbnail').innerHTML = ''; document.getElementById('imageFile').value = '';
    //                                 var cbs = document.getElementsByName('categories');
    //                                 for (var i = 0; i < cbs.length; i++)
    //                                     cbs[i].checked = false;
    //                             }
    //                             else {
    //                                 alert('An error occurred... Please contact the administrator.');
    //                             }
    //                         }).catch(function error(err) {
    //                             console.log('An error occurred...', err);
    //                         });
    //                     }
    //                 }
    //                 else {
    //                     alert('Please select the Availability Date Range.');
    //                 }
    //             }
    //             else {
    //                 alert('Please select GP and Village for the Rural Area Type.');
    //             }
    //         }
    //         else {
    //             alert('Please fill all the fields.');
    //         }
    //     }
    //     else {
    //         alert('Please enter a valid Mobile No.');
    //     }
    // };

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