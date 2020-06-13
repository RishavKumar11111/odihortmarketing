var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var csrf = require('csurf');
var moment = require('moment'); moment().format();
var nodeCache = require('node-cache');
const myCache = new nodeCache({ stdTTL: 24 * 60 * 60, checkperiod: 24 * 60 * 60 * 0.3, useClones: false });
var soap = require('soap');
var balModule = require('../models/superAdminBALModule');
var crypto = require('crypto');
var sha256 = require('js-sha256');
var csrfProtection = csrf();
var parseForm = bodyParser.urlencoded({ extended: false });
var os = require('os');
var cache = require('cache-headers');
var permit = require('../models/permission');
var atob = require('atob');
var request = require('request');
var svgCaptcha = require('svg-captcha');
var fse = require('fs-extra');

router.get('/getGraph', function (req, res) {
  var getValue = myCache.get('graphData');
  if (getValue != undefined) {
    res.send(getValue);
  }
  else {
    var url = 'http://epestodisha.nic.in/DistData.asmx?wsdl';
    soap.createClient(url, function (err, client) {
      if (client != undefined) {
        client.Graph_dist_Data(function (err, result) {
          if (result.Graph_dist_DataResult != undefined) {
            var apiResult = result.Graph_dist_DataResult.diffgram.NewDataSet.Table;
            var isSet = myCache.set('graphData', apiResult);
            if (isSet) {
              var getValue = myCache.get('graphData');
              if (getValue != undefined) {
                res.send(getValue);
              }
            }
          }
          else {
            res.send();
          }
        });
      }
    });
  }
});

module.exports = router;
