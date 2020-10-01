var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var balModule = require('../models/ddhBALModule');
var crypto = require('crypto');
var sha256 = require('js-sha256');
var csrf = require('csurf');
var csrfProtection = csrf();
var parseForm = bodyParser.urlencoded({ extended: false });
var os = require('os');
var cache = require('cache-headers');
var permit = require('../models/permission');
var moment = require('moment'); moment().format();
var nodeCache = require('node-cache');
var atob = require('atob');
const myCache = new nodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 24 * 60 * 60 * 0.3, useClones: false });
var request = require('request');
var soap = require('soap');
var svgCaptcha = require('svg-captcha');
var fse = require('fs-extra');

var overrideConfig = {
  'maxAge': 2000,
  'setPrivate': true
};

function randomNumber() {
  const buf = crypto.randomBytes(16);
  return buf.toString('hex');
};

var getCurrentDateTime = function () {
  var today = new Date();
  var dd = today.getDate();
  var MM = today.getMonth() + 1;
  var yyyy = today.getFullYear();
  var HH = today.getHours();
  var mm = today.getMinutes();
  var ss = today.getSeconds();
  if (dd < 10) {
    dd = '0' + dd;
  }
  if (MM < 10) {
    MM = '0' + MM;
  }
  if (HH < 10) {
    HH = '0' + HH;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  if (ss < 10) {
    ss = '0' + ss;
  }
  var todayDate = yyyy + '-' + MM + '-' + dd + ' ' + HH + ':' + mm + ':' + ss;
  var currentDate = new Date(todayDate);
  return currentDate;
};

var getDateTime = function () {
  var dateTime = require('node-datetime');
  var dt = dateTime.create().format('Y-m-d H:M:S.N');
  var date = new Date(dt);
  var userTimezone = date.getTimezoneOffset() * 60000;
  var currentDate = new Date(date.getTime() - userTimezone);
  return currentDate;
};

var getFinancialYear = function () {
  var fiscalYear = "";
  var today = new Date();
  if ((today.getMonth() + 1) <= 3) {
    fiscalYear = (today.getFullYear() - 1) + "-" + today.getFullYear().toString().substr(2, 3);
  }
  else {
    fiscalYear = today.getFullYear() + "-" + (today.getFullYear() + 1).toString().substr(2, 3);
  }
  return fiscalYear;
};

var getURL = function (req) {
  var fullURL = req.protocol + '://' + req.get('host') + req.originalUrl;
  return fullURL;
};

function SendSMS(mobileNo, sms, callback) {
  var encodeSMS = encodeURI(sms);
  request('http://www.apicol.nic.in/Registration/EPestSMS?mobileNo=' + mobileNo + '&sms=' + encodeSMS, { json: true }, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    else {
      callback();
    }
  });
};

/* GET home page. */
router.get('/', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/layout', { title: 'Layout', csrfToken: req.csrfToken() });
});

router.get('/dashboard', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/dashboard', { title: 'Dashboard', csrfToken: req.csrfToken() });
});

// router.get('/stockIn', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
//   res.get('X-Frame-Options');
//   res.render('ddh/stockin', { title: 'Stock In', csrfToken: req.csrfToken() });
// });

// router.get('/stockOut', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
//   res.get('X-Frame-Options');
//   res.render('ddh/stockout', { title: 'Stock Out', csrfToken: req.csrfToken() });
// });

router.get('/areaProduction', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/areaProduction', { title: 'Area & Production of Crops', csrfToken: req.csrfToken() });
});

router.get('/availableItemsList', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/availableitemslist', { title: 'Available Items List', csrfToken: req.csrfToken() });
});

router.get('/itemsAvailableBlockWise', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/itemsavailableblockwise', { title: 'List of Items Available Block-wise', csrfToken: req.csrfToken() });
});

router.get('/stockInList', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/stockinlist', { title: 'Stock In List', csrfToken: req.csrfToken() });
});

router.get('/stockOutList', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/stockoutlist', { title: 'Stock Out List', csrfToken: req.csrfToken() });
});

router.get('/tradersList', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/traderslist', { title: 'Traders List', csrfToken: req.csrfToken() });
});

router.get('/adhDetails', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddh/adhdetails', { title: 'ADH Details', csrfToken: req.csrfToken() });
});

router.get('/changePassword', csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  req.session.RandomNo = randomNumber();
  res.get('X-Frame-Options');
  res.render('ddh/changepassword', { title: 'Change Password', csrfToken: req.csrfToken(), randomNo: req.session.RandomNo });
});

router.post('/changePassword', parseForm, csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.getUserDetails(req.session.username).then(function success(response) {
    if (response.length === 0) {
      balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/changePassword', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
      res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Invalid Username or Password' });
    }
    // else if (response[0].Status !== true) {
    //   balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/changePassword', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
    //   res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Invalid Username' });
    // }
    else {
      balModule.getPasswordHistory(req.session.username).then(function success(response1) {
        var objP = req.body.data;
        if (response1.length > 0) {
          var found = response1.some(function (i) {
            return i.OldPassword === objP.NewPassword;
          });
        }
        if (!found || response1.length == 0) {
          var pwdHash = response[0].PasswordHash;
          var pwdRNo = sha256(pwdHash + req.session.RandomNo);
          if (objP.NewPassword === objP.ConfirmPassword) {
            if (pwdRNo === objP.OldPassword) {
              balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/changePassword', 'UPDATE / INSERT', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
              delete objP.OldPassword; delete objP.ConfirmPassword;
              objP.UserID = req.session.username;
              objP.Status = null;
              objP.IPAddress = req.connection.remoteAddress;
              objP.FinancialYear = getFinancialYear();
              balModule.changePasssword(objP, function (response1) {
                res.sendStatus(response1 > 0 ? 200 : 500);
              }, function error(response1) {
                console.log(response1.status);
              });
            }
            else {
              balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/changePassword', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
              res.send('The entered Old Password is incorrect.');
            }
          }
          else {
            balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/changePassword', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
            alert('The New Password and Confirm Password do not match.');
          }
        }
        else {
          balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/changePassword', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
          res.send('This password is already used. Please try a new one.');
        }
      }, function error(response) {
        console.log(response.status);
      }).catch(function err(error) {
        console.log('An error occurred...', error);
      });
    }
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/logout', function (req, res, next) {
  if (req.session.username != undefined) {
    balModule.updateIsLoggedIn(0, req.session.username, function success(response) { }, function error(response) { console.log(response.status); });
  }
  req.session.destroy();
  res.get('X-Frame-Options');
  res.redirect('../');
});

router.get('/getCategories', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.getCategories().then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getItemsByCategory', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var categoryID = req.query.categoryID;
  balModule.getItemsByCategory(categoryID).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getBlocks', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  balModule.getBlocks(districtCode).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

// router.get('/getGPsByBlock', permit.permission('DDH'), function (req, res, next) {
//   res.get('X-Frame-Options');
//   var blockCode = req.query.blockCode;
//   balModule.getGPsByBlock(blockCode).then(function success(response) {
//     res.send(response);
//   }, function error(response) {
//     console.log(response.status);
//   }).catch(function err(error) {
//     console.log('An error occurred...', error);
//   });
// });

// router.get('/getVillagesByGP', permit.permission('DDH'), function (req, res, next) {
//   res.get('X-Frame-Options');
//   var gpCode = req.query.gpCode;
//   balModule.getVillagesByGP(gpCode).then(function success(response) {
//     res.send(response);
//   }, function error(response) {
//     console.log(response.status);
//   }).catch(function err(error) {
//     console.log('An error occurred...', error);
//   });
// });

router.get('/getULBs', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  balModule.getULBs(districtCode).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

// router.post('/submitStockIn', parseForm, csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
//   res.get('X-Frame-Options');
//   balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/submitStockIn', 'INSERT', 'POST', function success(response) {
//   }, function error(response) {
//     console.log(response.status);
//   });
//   var obj = req.body.data;
//   if (obj.Photo != null) {
//     obj.Photo = Buffer.from(obj.Photo, 'base64');
//   }
//   obj.UserID = req.session.username;
//   obj.IPAddress = req.connection.remoteAddress;
//   obj.FinancialYear = getFinancialYear();
//   obj.Status = null;
//   balModule.submitStockIn(obj).then(function success(response1) {
//     for (var propName in response1[0][0]) {
//       if (response1[0][0].hasOwnProperty(propName)) {
//         res.send(response1[0][0][propName] == 1 ? true : false);
//       }
//     }
//   }, function error(response) {
//     console.log(response.status);
//   }).catch(function err(error) {
//     console.log('An error occurred...', error);
//   });
// });

// router.get('/getStockDetails', permit.permission('DDH'), function (req, res, next) {
//   res.get('X-Frame-Options');
//   var obj = {};
//   obj.itemID = req.query.itemID;
//   obj.districtCode = req.session.username.substr(4, 3);
//   obj.blockCode = req.query.blockCode;
//   if (req.query.hasOwnProperty('gpCode') && req.query.hasOwnProperty('villageCode')) {
//     obj.gpCode = req.query.gpCode;
//     obj.villageCode = req.query.villageCode;
//   }
//   balModule.getStockDetails(obj).then(function success(response) {
//     res.send(response);
//   }, function error(response) {
//     console.log(response.status);
//   }).catch(function err(error) {
//     console.log('An error occurred...', error);
//   });
// });

// router.post('/submitStockOut', parseForm, csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
//   res.get('X-Frame-Options');
//   balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/submitStockIn', 'INSERT', 'POST', function success(response) {
//   }, function error(response) {
//     console.log(response.status);
//   });
//   var stockArray = req.body.data.array;
//   var obj = req.body.data.obj;
//   obj.UserID = req.session.username;
//   obj.IPAddress = req.connection.remoteAddress;
//   obj.FinancialYear = getFinancialYear();
//   obj.Status = null;
//   balModule.submitStockOut(stockArray, obj, function success(response1) {
//     res.send((response1 == stockArray.length) ? true : false);
//   }, function error(response) {
//     console.log(response.status);
//   });
// });

router.get('/getItemDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  balModule.getItemDetails(districtCode).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getItemDetailsBGVWise', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  var itemID = req.query.itemID;
  var roleName = req.session.role;
  balModule.getItemDetailsBGVWise(districtCode, itemID, roleName, function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  });
});

router.get('/getTradersList', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  balModule.getTradersList(districtCode).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getStockInDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  var blockCode = req.query.blockCode;
  var categoryID = req.query.categoryID;
  var areaType = req.query.areaType;
  var itemID = req.query.itemID;
  var dateFrom = req.query.dateFrom;
  var dateTill = req.query.dateTill;
  balModule.getStockInDetails(districtCode, blockCode, categoryID, areaType, itemID, dateFrom, dateTill).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getStockInLocationItemDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var referenceNo = req.query.referenceNo;
  var farmerID = req.query.farmerID;
  var itemID = req.query.itemID;
  var subDivisionCode = req.query.subDivisionCode;
  var farmerName = req.query.farmerName;
  var farmerMobileNo = req.query.farmerMobileNo;
  balModule.getStockInLocationItemDetails(referenceNo, farmerID, itemID, subDivisionCode, farmerName, farmerMobileNo).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getStockOutDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  var blockCode = req.query.blockCode;
  var categoryID = req.query.categoryID;
  var areaType = req.query.areaType;
  var itemID = req.query.itemID;
  var dateFrom = req.query.dateFrom;
  var dateTill = req.query.dateTill;
  balModule.getStockOutDetails(districtCode, blockCode, categoryID, areaType, itemID, dateFrom, dateTill).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getStockOutLocationItemDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var referenceNo = req.query.referenceNo;
  var farmerID = req.query.farmerID;
  var itemID = req.query.itemID;
  var subDivisionCode = req.query.subDivisionCode;
  var farmerName = req.query.farmerName;
  var farmerMobileNo = req.query.farmerMobileNo;
  balModule.getStockOutLocationItemDetails(referenceNo, farmerID, itemID, subDivisionCode, farmerName, farmerMobileNo).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getAvailabilityDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.session.username.substr(4, 3);
  var blockCode = req.query.blockCode;
  var categoryID = req.query.categoryID;
  var areaType = req.query.areaType;
  var itemID = req.query.itemID;
  balModule.getAvailabilityDetails(districtCode, blockCode, categoryID, areaType, itemID).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getDDHDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var userID = req.session.username;
  balModule.getDDHDetails(userID).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getADHDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var userID = req.session.username;
  balModule.getADHDetails(userID).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.post('/submitADHDetails', parseForm, csrfProtection, permit.permission('DDH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/submitADHDetails', 'UPDATE', 'POST', function success(response) {
  }, function error(response) {
    console.log(response.status);
  });
  var obj = req.body.data;
  obj.Status = 1;
  obj.IPAddress = req.connection.remoteAddress;
  obj.FinancialYear = getFinancialYear();
  balModule.submitADHDetails(obj, function success(response1) {
    for (var propName in response1[0][0]) {
      if (response1[0][0].hasOwnProperty(propName)) {
        res.send(response1[0][0][propName] == 1 ? true : false);
      }
    }
  }, function error(response) {
    console.log(response.status);
  });
});

router.get('/getCropDetails', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var categoryID = req.query.categoryID;
  var estimate = req.query.estimate;
  var financialYear = req.query.financialYear;
  var blockCode = req.query.blockCode;
  var districtCode = req.session.username.substr(4, 3);
  balModule.getCropDetails(categoryID, estimate, financialYear, blockCode, districtCode).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getReport', permit.permission('DDH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var categoryID = req.query.categoryID;
  var estimate = req.query.estimate;
  var financialYear = req.query.financialYear;
  var blockCode = req.query.blockCode;
  var districtCode = req.session.username.substr(4, 3);
  var ItemID = req.query.itemID;
  balModule.getReport(categoryID, estimate, financialYear, blockCode, districtCode, ItemID).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

module.exports = router;
