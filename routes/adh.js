var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var balModule = require('../models/adhBALModule');
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
router.get('/', csrfProtection, permit.permission('ADH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('adh/layout', { title: 'Layout', csrfToken: req.csrfToken() });
});

router.get('/dashboard', csrfProtection, permit.permission('ADH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('adh/dashboard', { title: 'Dashboard', csrfToken: req.csrfToken() });
});

router.get('/ahoDetails', csrfProtection, permit.permission('ADH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('adh/ahodetails', { title: 'AHO Details', csrfToken: req.csrfToken() });
});

router.get('/changePassword', csrfProtection, permit.permission('ADH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  req.session.RandomNo = randomNumber();
  res.get('X-Frame-Options');
  res.render('adh/changepassword', { title: 'Change Password', csrfToken: req.csrfToken(), randomNo: req.session.RandomNo });
});

router.post('/changePassword', parseForm, csrfProtection, permit.permission('ADH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
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

router.get('/getADHDetails', permit.permission('ADH'), function (req, res, next) {
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

router.get('/getBlockULBs', permit.permission('ADH'), function (req, res, next) {
  res.get('X-Frame-Options');
  var subDivisionCode = req.session.username.substr(4, 7);
  balModule.getBlockULBs(subDivisionCode).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.post('/registerAHOs', parseForm, csrfProtection, permit.permission('ADH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/registerAHOs', 'INSERT / UPDATE', 'POST', function success(response) {
  }, function error(response) {
    console.log(response.status);
  });
  var arrData = req.body.data.arrData;
  var objData = req.body.data.objData;
  objData.Status = 1;
  objData.IPAddress = req.connection.remoteAddress;
  objData.FinancialYear = getFinancialYear();
  balModule.checkMobileNo(objData.AHOMobileNo).then(function success(response) {
    if (response.length == 0 || (response[0].AHOMobileNo == objData.AHOMobileNo && response[0].AHOName.replace(/\s+/g, '').toLowerCase() == objData.AHOName.replace(/\s+/g, '').toLowerCase())) {
      balModule.registerAHO(arrData, objData, function (response1) {
        if (response1 == arrData.length) {
          var bn = []; var un = [];
          for (var i = 0; i < arrData.length; i++) {
            un.push(arrData[i].AHOUserID);
            bn.push(arrData[i].BlockName);
          }
          var blockName = bn.join(', ');
          var username = un.join(', ');
          var mobileNo = objData.AHOMobileNo;
          var sms = 'Horticulture Produce Marketing - You have been registered under the block(s) - ' + blockName + ' with User ID(s) - ' + username + ' respectively.';
          SendSMS(mobileNo, sms, function () {
            res.send('OK');
          });
        }
        else {
          res.send('An error occurred... Please contact the administrator.');
        }
      }, function error(response1) {
        console.log(response1.status);
      });
    }
    else {
      res.send('This Mobile No. is already registered against another AHO.');
    }
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getRegisteredAHOs', function (req, res, next) {
  res.get('X-Frame-Options');
  var userID = req.session.username;
  balModule.getRegisteredAHOs(userID).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.post('/removeAHO', parseForm, csrfProtection, permit.permission('ADH'), cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/removeAAO', 'DELETE / INSERT / UPDATE', 'POST', function success(response) {
  }, function error(response) {
    console.log(response.status);
  });
  var ahoUserID = req.body.data.AHOUserID;
  balModule.removeAHO(ahoUserID, function success(response1) {
    var sms = 'Horticulture Produce Marketing - You have been unregistered from the block ' + response1[0].blockName + '.';
    SendSMS(response1[0].AHOMobileNo, sms, function () {
      res.send(response1);
    });
  }, function error(response1) {
    console.log(response1.status);
  });
});

module.exports = router;
