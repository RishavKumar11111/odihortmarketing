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
    return sequelize.query('select ul.UserID, ul.PasswordHash, ul.RoleID, ul.ContactNo, ul.AccessFailedCount, ul.Status, ur.RoleName from UserLogin ul inner join UserRole ur on ul.RoleID = ur.RoleID where UserID = :user_name', {
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

exports.updateIsLoggedIn = function (isLoggedIn, userID) {
    sequelize.query('update UserLogin set IsLoggedIn = :is_logged_in where UserID = :user_id', {
        replacements: { is_logged_in: isLoggedIn, user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemDetails = function () {
    return sequelize.query('select a.ItemID, ItemName, CategoryName, sum(Quantity) - isnull((sum(SaleQuantity)), 0) Quantity, Unit from StockIn a inner join Items c on a.ItemId = c.ItemId left join StockOut b on a.StockId = b.StockId inner join Category d on c.CategoryID = d.CategoryID group by a.ItemID, ItemName, CategoryName, Unit having sum(Quantity) - isnull((sum(SaleQuantity)) ,0) > 0 order by ItemName', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemDetailsDistrictWise = function (itemID) {
    return sequelize.query('select d.DistrictCode, DistrictName, DDHName, DDHMobileNo, a.ItemID, ItemName, sum(Quantity) - isnull((sum(SaleQuantity)), 0) Quantity, Unit from StockIn a inner join Items c on a.ItemID = c.ItemID and a.ItemId = :item_id inner join LGDDistrict d on d.DistrictCode = substring(a.UserID, 5, 3) inner join DDHDistrictMapping e on substring(e.DDHUserID, 5, 3) = d.DistrictCode left join StockOut b on a.StockID = b.StockID group by d.DistrictCode, DistrictName, DDHName, DDHMobileNo, a.ItemID, ItemName, Unit having sum(Quantity) - isnull((sum(SaleQuantity)), 0) > 0 order by DistrictName, DDHName, ItemName', {
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