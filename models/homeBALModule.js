var dbConfig = require('./dbConfig');
var sequelize = dbConfig.sequelize;
var sql = dbConfig.sql;
var locConfig = dbConfig.locConfig;

exports.addActivityLog = function (ipAddress, userID, url, deviceType, os, browser, action, attack, mode) {
    sequelize.query('insert into ActivityLog (IPAddress, UserID, URL, DeviceType, OS, Browser, DateTime, Action, Attack, Mode) values (:ip_address, :user_id, :url, :device_type, :os, :browser, getdate(), :action, :attack, :mode)', {
        replacements: { ip_address: ipAddress, user_id: userID, url: url, device_type: deviceType, os: os, browser: browser, action: action, attack: attack, mode: mode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getUserDetails = function (userName) {
    return sequelize.query('select ul.UserID, ul.PasswordHash, ul.RoleID, ul.AccessFailedCount, ul.IsLoggedIn, ul.Status, ur.RoleName from UserLogin ul inner join UserRole ur on ul.RoleID = ur.RoleID where UserID = :user_name', {
        replacements: { user_name: userName }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getUserContactDetails = function (userName) {
    return sequelize.query('select a.UserID, MobileNo, EmailID, RoleName from UserLogin a inner join UserRole b on a.RoleID = b.RoleID inner join (select DDHUserID UserID, DDHMobileNo MobileNo, DDHEmailID EmailID from DDHDistrictMapping union all select ADMINUserID UserID, ADMINMobileNo MobileNo, ADMINEmailID EmailID from ADMINDetails) c on a.UserID = c.UserID where a.UserID = :user_name', {
        replacements: { user_name: userName }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.checkCPStatus = function (userName) {
    return sequelize.query('select UserID from ChangePasswordStatus where UserID = :user_name', {
        replacements: { user_name: userName }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.updateFailedCount = function (failedCount, userID) {
    sequelize.query('update UserLogin set AccessFailedCount = :failed_count where UserID = :user_id', {
        replacements: { failed_count: failedCount, user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.updateIsLoggedIn = function (isLoggedIn, userID) {
    sequelize.query('update UserLogin set IsLoggedIn = :is_logged_in where UserID = :user_id', {
        replacements: { is_logged_in: isLoggedIn, user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getLastLoginStatus = function (userName) {
    return sequelize.query("select top 1 convert(varchar(10), DateTime, 105) + ' ' + convert(varchar(8), DateTime, 108) LastLoginDateTime from ActivityLog where UserID = :user_name order by DateTime desc", {
        replacements: { user_name: userName }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getPasswordHistory = function (userName) {
    return sequelize.query('select OldPassword from PasswordLog where UserID = :user_name', {
        replacements: { user_name: userName }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.changePasssword = function (obj, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.input('UserID', obj.UserID);
        request.input('NewPassword', obj.NewPassword);
        request.input('Status', obj.Status);
        request.input('IPAddress', obj.IPAddress);
        request.input('FinancialYear', obj.FinancialYear);
        request.execute('spChangePassword', function (err, result) {
            if (err) {
                console.log('An error occurred...', err);
            }
            else {
                callback(result.returnValue);
            }
            con.close();
        });
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemDetails = function () {
    return sequelize.query('select a.ItemID, ItemName, CategoryName, isnull(sum(Balance), 0) Balance, Unit from StockInItems a inner join Items b on a.ItemID = b.ItemID inner join Category c on b.CategoryID = c.CategoryId inner join StockIn d on a.StockID = d.StockID where ((datediff(d, d.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, d.DateTime, getdate()) = 0 and Status = 1)) group by a.ItemID, ItemName, CategoryName, Unit having sum(Balance) > 0 order by ItemName', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemDetailsDistrictWise = function (itemID) {
    return sequelize.query('select d.DistrictCode, DistrictName, DDHName, DDHMobileNo, a.ItemID, ItemName, isnull(sum(Balance), 0) Balance, Unit from StockInItems a inner join StockIn b on a.StockID = b.StockID inner join Items c on a.ItemID = c.ItemID inner join LGDBlock d on substring(b.UserID, 5, 4) = d.BlockCode inner join LGDDistrict e on d.DistrictCode = e.DistrictCode inner join DDHDistrictMapping f on e.DistrictCode = f.DistrictCode where ((datediff(d, b.DateTime, getdate()) >= 1 and (a.Status is null or a.Status = 0 or a.Status = 1)) or (datediff(d, b.DateTime, getdate()) = 0 and a.Status = 1)) and a.ItemID = :item_id group by d.DistrictCode, DistrictName, DDHName, DDHMobileNo, a.ItemID, ItemName, Unit having sum(Balance) > 0 order by DistrictName, DDHName', {
        replacements: { item_id: itemID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemDetailsBGVWise = function (districtCode, itemID, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.input('DistrictCode', districtCode);
        request.input('ItemID', itemID);
        request.input('RoleName', '');
        request.execute('spGetItemDetailsBGVWise', function (err, result) {
            if (err) {
                console.log('An error occurred...', err);
            }
            else {
                callback(result.recordset);
            }
            con.close();
        });
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getDDHDetails = function () {
    return sequelize.query('select DistrictName, DDHName, DDHMobileNo from DDHDistrictMapping a inner join LGDDistrict b on a.DistrictCode = b.DistrictCode order by DistrictName, DDHName', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getSoilTypes = function () {
    return sequelize.query('select SoilTypeID, SoilTypeName from SoilType', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getSoilNutrients = function (soilNutrientName) {
    return sequelize.query('select SoilNutrientID, SoilNutrientName from SoilNutrient where SoilNutrientName in (:soil_nutrient_name)', {
        replacements: { soil_nutrient_name: soilNutrientName }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getDistrictsByDistrictCodes = function (districtCodes) {
    return sequelize.query('select DistrictCode, DistrictName from LGDDistrict where DistrictCode in (:district_codes)', {
        replacements: { district_codes: districtCodes }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getDistricts = function () {
    return sequelize.query('select DistrictCode, DistrictName from LGDDistrict order by DistrictName', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getTradersList = function (districtCode) {
    return sequelize.query('select ID, DistrictName, TraderName, Commodity from TraderDetails a inner join LGDDistrict b on a.DistrictCode = b.DistrictCode where (a.DistrictCode = :district_code or :district_code = 0) order by ID, DistrictName, TraderName, Commodity', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};