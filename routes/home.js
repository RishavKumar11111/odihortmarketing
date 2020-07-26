var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var balModule = require('../models/homeBALModule');
var crypto = require('crypto');
var sha256 = require('js-sha256');
var csrf = require('csurf');
var csrfProtection = csrf();
var parseForm = bodyParser.urlencoded({ extended: false });
var os = require('os');
var cache = require('cache-headers');
var request = require('request');
var svgCaptcha = require('svg-captcha');
var moment = require('moment'); moment().format();
var nodeCache = require('node-cache');
var atob = require('atob');
const myCache = new nodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 24 * 60 * 60 * 0.3, useClones: false });
var permit = require('../models/permission');
var soap = require('soap');
var fse = require('fs-extra');

const documentsFolder = './public/documents/soil_fertility_maps';

const getAllDirFiles = function (documentsFolder, arrayOfFiles) {
  files = fse.readdirSync(documentsFolder)
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function (file) {
    if (fse.statSync(documentsFolder + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(documentsFolder + "/" + file, arrayOfFiles)
    } else {
      arrayOfFiles.push(file)
    }
  })
  return arrayOfFiles;
}

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
  var todayDate = dd + '-' + MM + '-' + yyyy + ' ' + HH + ':' + mm + ':' + ss;
  return todayDate;
  //var currentDate = new Date(todayDate);
  //return currentDate;
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

router.get('/captcha', function (req, res) {
  res.get('X-Frame-Options');
  var captcha = svgCaptcha.createMathExpr({ color: false, noise: 3, background: '#83a5b8', mathMin: 1, mathMax: 9, mathOperator: '+' });
  req.session.captcha = captcha.text;
  res.type('svg');
  res.status(200).send(captcha.data);
});

/* GET home page. */
router.get('/', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('home', { title: 'Home', csrfToken: req.csrfToken() });
});

router.get('/home', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('home', { title: 'Home', csrfToken: req.csrfToken() });
});

router.get('/history', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('history', { title: 'History', csrfToken: req.csrfToken() });
});

router.get('/secretaryDesk', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('secretarydesk', { title: 'Secretary Desk', csrfToken: req.csrfToken() });
});

router.get('/directorDesk', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('directordesk', { title: 'Director Desk', csrfToken: req.csrfToken() });
});

router.get('/RTI', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('rti', { title: 'RTI', csrfToken: req.csrfToken() });
});

router.get('/terms&Conditions', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('termsandconditions', { title: 'Terms & Conditions', csrfToken: req.csrfToken() });
});

router.get('/disclaimer', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('disclaimer', { title: 'Disclaimer', csrfToken: req.csrfToken() });
});

router.get('/privacyPolicy', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('privacypolicy', { title: 'Privacy Policy', csrfToken: req.csrfToken() });
});

router.get('/websitePolicies', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('websitepolicies', { title: 'Website Policies', csrfToken: req.csrfToken() });
});

router.get('/screenReader', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('screenreader', { title: 'Screen Reader', csrfToken: req.csrfToken() });
});

router.get('/copyrightPolicy', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('copyrightpolicy', { title: 'Copyright Policy', csrfToken: req.csrfToken() });
});

router.get('/hyperlinkPolicy', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('hyperlinkpolicy', { title: 'Hyperlink Policy', csrfToken: req.csrfToken() });
});

router.get('/aboutUs', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('aboutus', { title: 'About Us', csrfToken: req.csrfToken() });
});

router.get('/photoGallery', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('photogallery', { title: 'Photo Gallery', csrfToken: req.csrfToken() });
});

router.get('/videoGallery', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('videogallery', { title: 'Video Gallery', csrfToken: req.csrfToken() });
});

router.get('/ddhList', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('ddhlist', { title: 'DDH List', csrfToken: req.csrfToken() });
});

router.get('/tradersList', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('traderslist', { title: 'Traders List', csrfToken: req.csrfToken() });
});

router.get('/soilFertilityStatus', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('soilfertilitystatus', { title: 'Soil Fertility Status', csrfToken: req.csrfToken(), message: '' });
});

router.get('/soilProperties', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  res.render('soilproperties', { title: 'Soil Properties', csrfToken: req.csrfToken() });
});

router.get('/login', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  req.session.RandomNo = randomNumber();
  res.get('X-Frame-Options');
  res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: '' });
});

router.post('/plogin', parseForm, csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  if (req.body.captcha !== req.session.captcha) {
    res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Invalid Captcha' });
  }
  else {
    balModule.getUserDetails(req.body.userName).then(function success(response) {
      if (response.length === 0) {
        res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Invalid Username or Password' });
      }
      // else if (response[0].Status !== true) {
      //   balModule.addActivityLog(req.connection.remoteAddress, response[0].UserID, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/login', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
      //   res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Invalid Username' });
      // }
      else {
        var pwdHash = response[0].PasswordHash;
        var pwdRNo = sha256(pwdHash + req.session.RandomNo);
        if (pwdRNo === req.body.password) {
          if (response[0].AccessFailedCount < 5) {
            //   balModule.getLastLoginStatus(req.body.userName).then(function success(response1) {
            //     var s = '00:00:00';
            //     if (response1.length > 0) {
            //       var ms = moment(getCurrentDateTime(), "DD-MM-YYYY HH:mm:ss").diff(moment(response1[0].LastLoginDateTime, "DD-MM-YYYY HH:mm:ss"));
            //       var d = moment.duration(ms);
            //       s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
            //     }
            //     if ((response[0].IsLoggedIn === true && (s.substring(0, 1) == 0 && s.substring(2, 4) >= 10) || (s.substring(0, 1) > 0)) || (response[0].IsLoggedIn !== true)) {
            req.session.username = req.body.userName;
            req.session.role = response[0].RoleName;
            req.session.cookie.expires = 1800000;
            let tempSession = req.session;
            req.session.regenerate(function (err) {
              Object.assign(req.session, tempSession);
            });
            balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/login', 'LOGIN', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
            if (req.session.role != 'ADMIN') {
              balModule.updateFailedCount(0, response[0].UserID, function success(response) { }, function error(response) { console.log(response.status); });
            }
            // balModule.updateIsLoggedIn(0, response[0].UserID, function success(response) { }, function error(response) { console.log(response.status); });
            balModule.checkCPStatus(req.session.username).then(function success(response) {
              if (response.length > 0) {
                req.session.save(function (err) {
                  switch (req.session.role) {
                    case 'DDH':
                      res.redirect('ddh');
                      break;
                    case 'ADMIN':
                      res.redirect('admin');
                      break;
                    case 'SUPERADMIN':
                      res.redirect('superAdmin');
                      break;
                    case 'AHO':
                      res.redirect('aho');
                      break;
                    case 'ADH':
                      res.redirect('adh');
                      break;
                  }
                });
              }
              else {
                req.session.save(function (err) {
                  res.redirect('changePassword');
                });
              }
            }, function error(response) {
              console.log(response.status);
            }).catch(function err(error) {
              console.log('An error occurred...', error);
            });
            //     }
            //     else {
            //       res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Already Logged In' });
            //     }
            //   }, function error(response) {
            //     console.log(response.status);
            //   }).catch(function err(error) {
            //     console.log('An error occurred...', error);
            //   });
          }
          else {
            balModule.addActivityLog(req.connection.remoteAddress, response[0].UserID, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/login', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
            res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Account is locked due to multiple invalid attempts. Reset your password using the forgot password option.' });
          }
        }
        else {
          balModule.addActivityLog(req.connection.remoteAddress, response[0].UserID, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/login', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
          if (response[0].AccessFailedCount < 5) {
            if (response[0].RoleName != 'ADMIN') {
              var failedCount = response[0].AccessFailedCount + 1;
              balModule.updateFailedCount(failedCount, response[0].UserID, function success(response) { }, function error(response) { console.log(response.status); });
            }
            res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Invalid Username or Password' });
          }
          else {
            res.render('login', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Login', error: 'Account is locked due to multiple invalid attempts. Reset your password using the forgot password option.' });
          }
        }
      }
    }, function error(response) {
      console.log(response.status);
    }).catch(function err(error) {
      console.log('An error occurred...', error);
    });
  }
});

router.get('/forgotPassword', csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  req.session.RandomNo = randomNumber();
  res.get('X-Frame-Options');
  res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: '', mobileNo: '', error: '' });
});

router.post('/pforgotPassword', parseForm, csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  if (req.body.captcha !== req.session.captcha) {
    res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: '', mobileNo: '', error: 'Invalid Captcha' });
  }
  else {
    balModule.getUserContactDetails(req.body.userName).then(function success(response) {
      if (response.length === 0) {
        res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: '', mobileNo: '', error: 'Invalid Username' });
      }
      // else if (response[0].Status !== true) {
      //   balModule.addActivityLog(req.connection.remoteAddress, response[0].UserID, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/getUserDetails', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
      //   res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: '', mobileNo: '', error: 'Invalid Username' });
      // }
      else if (response[0].MobileNo == null || response[0].MobileNo == 0) {
        balModule.addActivityLog(req.connection.remoteAddress, response[0].UserID, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/getUserDetails', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
        res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: '', mobileNo: '', error: 'Your mobile number is not registered. Please contact the concerned authority.' });
      }
      else {
        var otp = generateOTP();
        req.session.cookie.expires = 900000;
        req.session.OTP = sha256(otp.toString());
        req.session.MobileNo = response[0].MobileNo;
        req.session.username = req.body.userName;
        req.session.role = response[0].RoleName;
        var mobileNo = response[0].MobileNo;
        SendOTP(mobileNo, otp, function (response1) {
          res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: response1, mobileNo: req.session.MobileNo.toString().substr(6, 4), error: '' });
        });
      }
    }, function error(response) {
      console.log(response.status);
    }).catch(function err(error) {
      console.log('An error occurred...', error);
    });
  }
});

function generateOTP() {
  var k = Math.floor((Math.random() * 1000000) + 1);
  return k;
};

function SendOTP(mobileNo, OTP, callback) {
  var sms = 'Horticulture Produce Marketing - OTP for Password Reset is ' + OTP;
  var encodeSMS = encodeURI(sms);
  console.log(sms, encodeSMS, mobileNo);
  request('http://www.apicol.nic.in/Registration/EPestSMS?mobileNo=' + mobileNo + '&sms=' + encodeSMS, { json: true }, (err, res, body) => {
    if (err) {
      console.log(err);
    }
    else {
      callback(body);
    }
  });
};

router.get('/sendOTP', function (req, res, next) {
  res.get('X-Frame-Options');
  var otp = generateOTP();
  req.session.cookie.expires = 900000;
  req.session.OTP = sha256(otp.toString());
  var mobileNo = req.session.MobileNo;
  SendOTP(mobileNo, otp, function (response) {
    res.send(response);
  });
});

router.post('/verifyOTP', parseForm, csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  if (req.session.OTP == sha256(req.body.otp.toString())) {
    res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: 'Correct OTP', mobileNo: '', error: '' });
  }
  else {
    res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: 'Wrong OTP', mobileNo: '', error: 'Invalid OTP' });
  }
});

router.post('/updatePassword', parseForm, csrfProtection, cache.overrideCacheHeaders(overrideConfig), function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.getPasswordHistory(req.session.username).then(function success(response) {
    if (response.length > 0) {
      var found = response.some(function (i) {
        return i.OldPassword === req.body.npassword;
      });
    }
    if (!found || response.length == 0) {
      balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/updatePassword', 'UPDATE / INSERT', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
      var objP = {};
      objP.NewPassword = req.body.npassword;
      objP.UserID = req.session.username;
      objP.Status = null;
      objP.IPAddress = req.connection.remoteAddress;
      objP.FinancialYear = getFinancialYear();
      if (req.session.role != 'ADMIN') {
        balModule.updateFailedCount(0, req.session.username, function success(response) { }, function error(response) { console.log(response.status); });
      }
      balModule.changePasssword(objP, function (response1) {
        if (response1 > 0) {
          res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: 'Password updated successfully.', mobileNo: '', error: '' });
        }
        else {
          res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: '', mobileNo: '', error: 'Oops! An error has occurred. Please try after sometime.' });
        }
      }, function error(response1) {
        console.log(response1.status);
      });
    }
    else {
      balModule.addActivityLog(req.connection.remoteAddress, req.session.username, getURL(req), req.device.type.toUpperCase(), os.platform(), req.headers['user-agent'], '/updatePassword', 'FAILED', 'POST', function success(response) { }, function error(response) { console.log(response.status); });
      res.render('forgotpassword', { randomNo: req.session.RandomNo, csrfToken: req.csrfToken(), title: 'Forgot Password', message: 'Password already used', mobileNo: '', error: 'This password is already used. Please try a new one.' });
    }
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getItemDetails', function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.getItemDetails().then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getItemDetailsDistrictWise', function (req, res, next) {
  res.get('X-Frame-Options');
  var itemID = req.query.itemID;
  balModule.getItemDetailsDistrictWise(itemID).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getItemDetailsBGVWise', function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.query.districtCode;
  var itemID = req.query.itemID;
  balModule.getItemDetailsBGVWise(districtCode, itemID, function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  });
});

router.get('/getDDHDetails', function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.getDDHDetails().then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getSoilTypes', function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.getSoilTypes().then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getSoilNutrients', function (req, res, next) {
  res.get('X-Frame-Options');
  var soilType = req.query.soilType;
  var soilNutrientName = [];
  fse.readdirSync(documentsFolder).forEach(file => {
    if (!soilNutrientName.includes(file.split(' - ')[1]) && file.split(' - ')[2] == soilType + '.pdf') {
      soilNutrientName.push(file.split(' - ')[1]);
    }
  })
  balModule.getSoilNutrients(soilNutrientName).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getDistrictsByDistrictCodes', function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCodes = [];
  var type = req.query.type;
  if (type == 'fertilityStatus') {
    fse.readdirSync(documentsFolder).forEach(file => {
      if (!districtCodes.includes(file.substr(0, 3))) {
        districtCodes.push(file.substr(0, 3));
      }
    })
  }
  else {
    fse.readdirSync('./public/documents/soil_properties').forEach(file => {
      if (districtCodes.length == 0) {
        districtCodes.push(file.substr(0, 3));
      }
      else {
        if (!districtCodes.includes(file.substr(0, 3))) {
          districtCodes.push(file.substr(0, 3));
        }
      }
    })
  }
  balModule.getDistrictsByDistrictCodes(districtCodes).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/checkSoilFertilityMaps', function (req, res, next) {
  res.get('X-Frame-Options');
  var soilNutrientName = req.query.soilNutrientName;
  var soilTypeName = req.query.soilTypeName;
  var districtCode = req.query.districtCode;
  var counter = 0, count = 0;
  fse.readdirSync(documentsFolder).forEach(file => {
    count++;
    if (file == districtCode.toString() + ' - ' + soilNutrientName + ' - ' + soilTypeName + '.pdf') {
      counter++;
    }
  })
  if (getAllDirFiles(documentsFolder).length == count && counter == 1) {
    res.send('The Soil Fertility Map is found.');
    // res.sendFile(process.cwd() + documentsFolder.replace('.', '') + '/' + districtCode.toString() + ' - ' + soilNutrientName + ' - ' + soilTypeName + '.pdf')
  }
  else {
    res.send('The Soil Fertility Map is not found.');
  }
});

router.get('/getSoilFertilityMaps', function (req, res, next) {
  res.get('X-Frame-Options');
  var soilNutrientName = req.query.soilNutrientName;
  var soilTypeName = req.query.soilTypeName;
  var districtCode = req.query.districtCode;
  res.sendFile(process.cwd() + documentsFolder.replace('.', '') + '/' + districtCode.toString() + ' - ' + soilNutrientName + ' - ' + soilTypeName + '.pdf')
});

router.get('/getSoilProperties', function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.query.districtCode;
  res.sendFile(process.cwd() + './public/documents/soil_properties'.replace('.', '') + '/' + districtCode.toString() + ' Soil Properties.pdf')
});

router.get('/getDistricts', function (req, res, next) {
  res.get('X-Frame-Options');
  balModule.getDistricts().then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

router.get('/getTradersList', function (req, res, next) {
  res.get('X-Frame-Options');
  var districtCode = req.query.districtCode;
  balModule.getTradersList(districtCode).then(function success(response) {
    res.send(response);
  }, function error(response) {
    console.log(response.status);
  }).catch(function err(error) {
    console.log('An error occurred...', error);
  });
});

module.exports = router;
