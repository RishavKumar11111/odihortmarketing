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

exports.getCategories = function () {
    return sequelize.query('select CategoryID, CategoryName from Category', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemsByCategory = function (categoryID) {
    return sequelize.query('select * from Items where CategoryID = :category_id', {
        replacements: { category_id: categoryID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getBlocks = function (districtCode) {
    return sequelize.query('select BlockCode, BlockName from LGDBlock where DistrictCode = :district_code', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getGPsByBlock = function (blockCode) {
    return sequelize.query('select GPCode, GPName from LGDGP where BlockCode = :block_code', {
        replacements: { block_code: blockCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getVillagesByGP = function (gpCode) {
    return sequelize.query('select VillageCode, VillageName from LGDVillage where GPCode = :gp_code', {
        replacements: { gp_code: gpCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getULBs = function (districtCode) {
    return sequelize.query('select ULBCode, ULBName from LGDULB where DistrictCode = :district_code', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.submitStockIn = function (obj) {
    return sequelize.query('insert into StockIn (BlockCode, GPCode, VillageCode, AreaType, ItemID, FarmerName, FarmerMobileNo, Quantity, Photo, AvailableFrom, AvailableTill, UserID, DateTime, IPAddress, FinancialYear, Status) values (:block_code, :gp_code, :village_code, :area_type, :item_id, :farmer_name, :farmer_mobile_no, :quantity, :photo, :available_from, :available_till, :user_id, getdate(), :ip_address, :financial_year, :status) select @@rowcount', {
        replacements: { block_code: obj.BlockCode, gp_code: obj.GPCode, village_code: obj.VillageCode, area_type: obj.AreaType, item_id: obj.ItemID, farmer_name: obj.FarmerName, farmer_mobile_no: obj.FarmerMobileNo, quantity: obj.Quantity, photo: obj.Photo, available_from: obj.AvailableFrom, available_till: obj.AvailableTill, user_id: obj.UserID, ip_address: obj.IPAddress, financial_year: obj.FinancialYear, status: obj.Status }, type: sequelize.QueryTypes.INSERT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getStockDetails = function (obj) {
    if (obj.hasOwnProperty('gpCode') && obj.hasOwnProperty('villageCode')) {
        return sequelize.query('select a.StockID, BlockName, GPName, VillageName, FarmerName, FarmerMobileNo, c.ItemName, Quantity - isnull((sum(SaleQuantity)), 0) Quantity, Unit from StockIn a inner join Items c on a.ItemID = c.ItemId and a.ItemID = :item_id left join StockOut b on a.StockID = b.StockID inner join LGDBlock d on a.BlockCode = d.BlockCode inner join LGDGP e on a.GPCode = e.GPCode inner join LGDVillage f on a.VillageCode = f.VillageCode where (:district_code = 0 or substring(a.UserID, 5, 3) = :district_code) and (:block_code = 0 or a.BlockCode = :block_code) and (:gp_code = 0 or a.GPCode = :gp_code) and (:village_code = 0 or a.VillageCode = :village_code) group by a.StockID, BlockName, GPName, VillageName, FarmerName, FarmerMobileNo, c.ItemName, Quantity, Unit having Quantity - isnull((sum(SaleQuantity)), 0) > 0 order by BlockName, GPName, VillageName', {
            replacements: { item_id: obj.itemID, district_code: obj.districtCode, block_code: obj.blockCode, gp_code: obj.gpCode, village_code: obj.villageCode }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query('select a.StockID, ULBName as BlockName, FarmerName, FarmerMobileNo, c.ItemName, Quantity - isnull((sum(SaleQuantity)), 0) Quantity, Unit from StockIn a inner join Items c on a.ItemID = c.ItemId and a.ItemID = :item_id left join StockOut b on a.StockID = b.StockID inner join LGDULB d on a.BlockCode = d.ULBCode where (:district_code = 0 or substring(a.UserID, 5, 3) = :district_code) and (:block_code = 0 or a.BlockCode = :block_code) group by a.StockID, ULBName, FarmerName, FarmerMobileNo, c.ItemName, Quantity, Unit having Quantity - isnull((sum(SaleQuantity)), 0) > 0 order by ULBName', {
            replacements: { item_id: obj.itemID, district_code: obj.districtCode, block_code: obj.blockCode }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.submitStockOut = function (stockArray, obj, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const tableStock = new sql.Table();
        tableStock.create = true;
        tableStock.columns.add('StockID', sql.Int, { nullable: false, primary: true });
        tableStock.columns.add('SaleQuantity', sql.Decimal(18, 2), { nullable: false });
        for (var i = 0; i < stockArray.length; i++) {
            tableStock.rows.add(stockArray[i].StockID, stockArray[i].SaleQuantity);
        }
        const request = new sql.Request(con);
        request.input('Remarks', obj.Remarks);
        request.input('UserID', obj.UserID);
        request.input('IPAddress', obj.IPAddress);
        request.input('FinancialYear', obj.FinancialYear);
        request.input('Status', obj.Status);
        request.input('tableStock', tableStock);
        request.execute('spSubmitStockOut', function (err, result) {
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