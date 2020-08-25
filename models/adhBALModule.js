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

exports.getCategories = function () {
    return sequelize.query('select CategoryID, CategoryName from Category order by CategoryName', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemsByCategory = function (categoryID) {
    return sequelize.query('select ItemID, ItemName, Unit from Items where CategoryID = :category_id order by ItemName', {
        replacements: { category_id: categoryID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getBlocks = function (subDivisionCode) {
    return sequelize.query('select BlockCode, BlockName from LGDBlock where SubDivisionCode = :sub_division_code order by BlockName', {
        replacements: { sub_division_code: subDivisionCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getULBs = function (subDivisionCode) {
    return sequelize.query('select ULBCode, ULBName from LGDULB where SubDivisionCode = :sub_division_code order by ULBName', {
        replacements: { sub_division_code: subDivisionCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getStockInDetails = function (subDivisionCode, blockCode, categoryID, areaType, itemID) {
    if (blockCode == 0) {
        return sequelize.query("select ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join Category d on c.CategoryID = d.CategoryId inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) e on a.BlockCode = e.BlockCode where SubDivisionCode = :sub_division_code and (:category_id = 0 or c.CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and datediff(d, a.DateTime, getdate()) = 0 and (Status is null or Status = 0) group by ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit", {
            replacements: { sub_division_code: subDivisionCode, block_code: blockCode, category_id: categoryID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join Category d on c.CategoryID = d.CategoryId inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) e on a.BlockCode = e.BlockCode where SubDivisionCode = :sub_division_code and (:area_type is null or AreaType = :area_type) and (:category_id = 0 or c.CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and datediff(d, a.DateTime, getdate()) = 0 and (Status is null or Status = 0) group by ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit", {
            replacements: { sub_division_code: subDivisionCode, block_code: blockCode, category_id: categoryID, item_id: itemID, area_type: areaType }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getLocationItemDetails = function (referenceNo, farmerID, itemID) {
    return sequelize.query("select a.StockID, AreaType, BlockName, GPName, VillageName, case when Photo is not null then 'A' else 'NA' end PhotoAvailability, ItemID, Quantity, convert(varchar(30), convert(date, AvailableFrom), 105) AvailableFrom, convert(varchar(30), convert(date, AvailableTill), 105) AvailableTill, CultivationArea, case when (Status is null or Status = 0) and datediff(d, b.DateTime, getdate()) = 0 then 'Can be updated' else 'Cannot be updated' end UpdateStatus from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join (select BlockCode, BlockName from LGDBlock union all select ULBCode, ULBName from LGDULB) c on a.BlockCode = c.BlockCode left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode where ReferenceNo = :reference_no and FarmerID = :farmer_id and ItemID = :item_id", {
        replacements: { reference_no: referenceNo, farmer_id: farmerID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.updateStockInDetails = function (obj, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.input('StockID', obj.StockID);
        request.input('ItemID', obj.ItemID);
        request.input('Quantity', obj.Quantity);
        request.input('CultivationArea', obj.CultivationArea);
        request.input('UserID', obj.UserID);
        request.input('IPAddress', obj.IPAddress);
        request.input('FinancialYear', obj.FinancialYear);
        request.input('Status', obj.Status);
        request.execute('spUpdateStockInDetails', function (err, result) {
            if (err) {
                console.log('An error occurred...', err);
            }
            else {
                callback(result.recordsets);
            }
            con.close();
        });
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.finalizeStockIn = function (array, obj, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const tableFinalStockIn = new sql.Table();
        tableFinalStockIn.create = true;
        tableFinalStockIn.columns.add('ReferenceNo', sql.VarChar(30), { nullable: false });
        tableFinalStockIn.columns.add('FarmerID', sql.VarChar(30), { nullable: false });
        tableFinalStockIn.columns.add('ItemID', sql.Int, { nullable: false });
        for (var i = 0; i < array.length; i++) {
            tableFinalStockIn.rows.add(array[i].ReferenceNo, array[i].FarmerID, array[i].ItemID);
        }
        const request = new sql.Request(con);
        request.input('Remarks', obj.Remarks);
        request.input('Status', obj.Status);
        request.input('UserID', obj.UserID);
        request.input('tableFinalStockIn', tableFinalStockIn);
        request.execute('spFinalizeStockIn', function (err, result) {
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