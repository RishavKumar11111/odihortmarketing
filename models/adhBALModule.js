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

exports.getADHDetails = function (userID) {
    return sequelize.query('select ADHUserID, SubDivisionName, ADHName, ADHMobileNo, ADHEmailID, Status from ADHSubDivisionMapping a inner join LGDSubDivision b on a.SubDivisionCode = b.SubDivisionCode where a.SubDivisionCode = substring(:user_id, 5, 7) order by ADHUserID, SubDivisionName, ADHName, ADHMobileNo, ADHEmailID', {
        replacements: { user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getBlockULBs = function (subDivisionCode) {
    return sequelize.query('select a.BlockCode, BlockName, ULBCode, ULBName from LGDBlock a left join LGDULB b on a.BlockCode = b.BlockCode where a.SubDivisionCode = :sub_division_code and a.BlockCode not in (select BlockCode from AHOBlockMapping where Status = 1) order by BlockName, ULBName', {
        replacements: { sub_division_code: subDivisionCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.checkMobileNo = function (mobileNo) {
    return sequelize.query('select distinct AHOMobileNo, AHOName from AHOBlockMapping where AHOMobileNo = :mobile_no', {
        replacements: { mobile_no: mobileNo }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.registerAHO = function (arrData, objData, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const tableAHOBlock = new sql.Table();
        tableAHOBlock.create = true;
        tableAHOBlock.columns.add('AHOUserID', sql.VarChar(10), { nullable: false, primary: true });
        for (var i = 0; i < arrData.length; i++) {
            tableAHOBlock.rows.add(arrData[i].AHOUserID);
        }
        const request = new sql.Request(con);
        request.input('tableAHOBlock', tableAHOBlock);
        request.input('AHOName', objData.AHOName);
        request.input('AHOMobileNo', objData.AHOMobileNo);
        request.input('AHOEmailID', objData.AHOEmailID);
        request.input('Status', objData.Status);
        request.input('IPAddress', objData.IPAddress);
        request.input('FinancialYear', objData.FinancialYear);
        request.execute('spRegisterAHOs', function (err, result) {
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

exports.getRegisteredAHOs = function (userID) {
    return sequelize.query('select AHOUserID, BlockName, ULBName, AHOName, AHOMobileNo, AHOEmailID, Status from AHOBlockMapping a inner join LGDBlock b on a.BlockCode = b.BlockCode left join LGDULB c on b.BlockCode = c.BlockCode where b.SubDivisionCode = substring(:user_id, 5, 7) and Status = 1 order by AHOUserID, BlockName, ULBName, AHOName, AHOMobileNo, AHOEmailID', {
        replacements: { user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.removeAHO = function (ahoUserID, callback) {
    return sequelize.query('select AHOMobileNo, BlockName from AHOBlockMapping a inner join LGDBlock b on a.BlockCode = b.BlockCode where AHOUserID = :aho_user_id insert into AHOBlockMappingLog(AHOUserID, AHOName, AHOMobileNo, AHOEmailID, AHOAadhaarNo, Status, DeactivateDateTime, DateTime, IPAddress, FinancialYear) select AHOUserID, AHOName, AHOMobileNo, AHOEmailID, AHOAadhaarNo, 0, getdate(), ActivateDateTime, IPAddress, FinancialYear from AHOBlockMapping where AHOUserID = :aho_user_id update AHOBlockMapping set AHOName = null, AHOMobileNo = null, AHOEmailID = null, Status = null, ActivateDateTime = null, DateTime = null, IPAddress = null, FinancialYear = null where AHOUserID = :aho_user_id', {
        replacements: { aho_user_id: ahoUserID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        callback(data);
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};