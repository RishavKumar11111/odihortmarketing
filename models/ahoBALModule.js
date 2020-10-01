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

exports.getAHODetails = function (userID) {
    return sequelize.query('select AHOUserID, BlockName, AHOName, AHOMobileNo, AHOEmailID, Status from AHOBlockMapping a inner join LGDBlock b on a.BlockCode = b.BlockCode where a.BlockCode = substring(:user_id, 5, 4) order by AHOUserID, BlockName, AHOName, AHOMobileNo, AHOEmailID', {
        replacements: { user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getDistrictName = function (blockCode) {
    return sequelize.query('select substring(PDSDistrictName, 1, 3) DistrictName from LGDBlock a inner join LGDDistrict b on a.DistrictCode = b.DistrictCode where BlockCode = :block_code', {
        replacements: { block_code: blockCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getLocationDetails = function (villageCode) {
    return sequelize.query('select VillageCode, VillageName, a.GPCode, GPName from LGDVillage a inner join LGDGP b on a.GPCode = b.GPCode where VillageCode = :village_code', {
        replacements: { village_code: villageCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getGPs = function (blockCode) {
    return sequelize.query('select GPCode, GPName from LGDGP where BlockCode = :block_code order by GPName', {
        replacements: { block_code: blockCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getULBs = function (blockCode) {
    return sequelize.query('select ULBCode, ULBName from LGDULB where BlockCode = :block_code order by ULBName', {
        replacements: { block_code: blockCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getVillagesByGP = function (gpCode) {
    return sequelize.query('select VillageCode, VillageName from LGDVillage where GPCode = :gp_code order by VillageName', {
        replacements: { gp_code: gpCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
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

exports.submitStockIn = function (obj, array, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const tableStockIn = new sql.Table();
        tableStockIn.create = true;
        tableStockIn.columns.add('ItemID', sql.Int, { nullable: false, primary: true });
        tableStockIn.columns.add('Quantity', sql.Decimal(18, 2), { nullable: false });
        tableStockIn.columns.add('AvailableFrom', sql.VarChar(10), { nullable: false });
        tableStockIn.columns.add('AvailableTill', sql.VarChar(10), { nullable: false });
        tableStockIn.columns.add('CultivationArea', sql.Decimal(18, 2), { nullable: false });
        for (var i = 0; i < array.length; i++) {
            tableStockIn.rows.add(array[i].ItemID, array[i].Quantity, array[i].AvailableFrom, array[i].AvailableTill, array[i].CultivationArea);
        }
        const request = new sql.Request(con);
        request.input('FarmerID', obj.FarmerID);
        request.input('FarmerName', obj.FarmerName);
        request.input('FarmerMobileNo', obj.FarmerMobileNo);
        request.input('AreaType', obj.AreaType);
        request.input('BlockCode', obj.BlockCode);
        request.input('GPCode', obj.GPCode);
        request.input('VillageCode', obj.VillageCode);
        if (obj.Photo != null) {
            request.input('Photo', obj.Photo);
        }
        request.input('UserID', obj.UserID);
        request.input('IPAddress', obj.IPAddress);
        request.input('FinancialYear', obj.FinancialYear);
        request.input('Status', obj.Status);
        request.input('tableStockIn', tableStockIn);
        request.execute('spSubmitStockIn', function (err, result) {
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

exports.getStockInDetails = function (userID, categoryID, itemID, dateFrom, dateTill) {
    if (dateFrom == '' && dateTill == '') {
        return sequelize.query("select ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID where a.UserID = :user_id and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) group by ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit", {
            replacements: { user_id: userID, category_id: categoryID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID where a.UserID = :user_id and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and convert(date, a.DateTime) between convert(date, :date_from) and convert(date, :date_till) group by ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit", {
            replacements: { user_id: userID, category_id: categoryID, item_id: itemID, date_from: dateFrom, date_till: dateTill }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getStockInLocationItemDetails = function (referenceNo, farmerID, itemID, blockCode, farmerName, farmerMobileNo) {
    if (referenceNo !== 'null' && farmerID !== 'null') {
        return sequelize.query("select a.StockID, AreaType, BlockName, GPName, VillageName, case when Photo is not null then 'A' else 'NA' end PhotoAvailability, ItemID, Quantity, convert(varchar(30), convert(date, AvailableFrom), 105) AvailableFrom, convert(varchar(30), convert(date, AvailableTill), 105) AvailableTill, CultivationArea, case when (Status is null or Status = 0) and datediff(d, a.DateTime, getdate()) = 0 then 'Can be updated' else 'Cannot be updated' end UpdateStatus from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join (select BlockCode, BlockName from LGDBlock union all select ULBCode, ULBName from LGDULB) c on a.BlockCode = c.BlockCode left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode where ReferenceNo = :reference_no and FarmerID = :farmer_id and ItemID = :item_id", {
            replacements: { reference_no: referenceNo, farmer_id: farmerID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select a.StockID, AreaType, BlockName, GPName, VillageName, case when Photo is not null then 'A' else 'NA' end PhotoAvailability, ItemID, Quantity, convert(varchar(30), convert(date, AvailableFrom), 105) AvailableFrom, convert(varchar(30), convert(date, AvailableTill), 105) AvailableTill, CultivationArea, case when (Status is null or Status = 0) and datediff(d, a.DateTime, getdate()) = 0 then 'Can be updated' else 'Cannot be updated' end UpdateStatus from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join (select BlockCode, BlockName from LGDBlock union all select ULBCode, ULBName from LGDULB) c on a.BlockCode = c.BlockCode left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode where c.BlockCode = :block_code and FarmerName = :farmer_name and FarmerMobileNo = :farmer_mobile_no and ItemID = :item_id and ReferenceNo is null", {
            replacements: { block_code: blockCode, farmer_name: farmerName, farmer_mobile_no: farmerMobileNo, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
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

exports.getStockDetails = function (obj) {
    if (obj.hasOwnProperty('gpCode') && obj.hasOwnProperty('villageCode')) {
        return sequelize.query("select ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, isnull(sum(Balance), 0) Balance, Unit, cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode where a.UserID = :user_id and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and (:gp_code = 0 or a.GPCode = :gp_code) and (:village_code = 0 or a.VillageCode = :village_code) and ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and ReferenceNo is not null and FarmerID is not null and b.ItemID is not null group by ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int) having sum(Balance) > 0", {
            replacements: { user_id: obj.userID, category_id: obj.categoryID, item_id: obj.itemID, gp_code: obj.gpCode, village_code: obj.villageCode }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, isnull(sum(Balance), 0) Balance, Unit, cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join (select BlockCode, BlockName from LGDBlock union all select ULBCode, ULBName from LGDULB) d on a.BlockCode = d.BlockCode where a.UserID = :user_id and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and (:block_code = 0 or a.BlockCode = :block_code) and ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and ReferenceNo is not null and FarmerID is not null and b.ItemID is not null group by ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int) having sum(Balance) > 0", {
            replacements: { user_id: obj.userID, category_id: obj.categoryID, item_id: obj.itemID, block_code: obj.blockCode }, type: sequelize.QueryTypes.SELECT
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
        const tableStockOut = new sql.Table();
        tableStockOut.create = true;
        tableStockOut.columns.add('ReferenceNo', sql.VarChar(30), { nullable: false });
        tableStockOut.columns.add('FarmerID', sql.VarChar(30), { nullable: false });
        tableStockOut.columns.add('ItemID', sql.Int, { nullable: false });
        tableStockOut.columns.add('SaleQuantity', sql.Decimal(18, 2), { nullable: false });
        for (var i = 0; i < stockArray.length; i++) {
            tableStockOut.rows.add(stockArray[i].ReferenceNo, stockArray[i].FarmerID, stockArray[i].ItemID, stockArray[i].SaleQuantity);
        }
        const request = new sql.Request(con);
        request.input('Remarks', obj.Remarks);
        request.input('UserID', obj.UserID);
        request.input('IPAddress', obj.IPAddress);
        request.input('FinancialYear', obj.FinancialYear);
        request.input('Status', obj.Status);
        request.input('tableStockOut', tableStockOut);
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

exports.getCropDetails = function (categoryID, estimate, financialYear, userID) {
    if (estimate !== 'All') {
        return sequelize.query("select a.ItemID, ItemName, TotalArea, FruitsBearingArea, Production, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, Status, 1 FS from AreaProduction a inner join Items b on a.ItemID = b.ItemID where CategoryID = :category_id and FinancialYear = :financial_year and Estimate = :estimate and AHOUserID = :user_id order by ItemName", {
            replacements: { category_id: categoryID, estimate: estimate, financial_year: financialYear, user_id: userID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            if (data.length > 0) {
                return data;
            }
            else {
                return sequelize.query("select ItemID, ItemName, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, null Status, 0 FS from Items where CategoryID = :category_id order by ItemName", {
                    replacements: { category_id: categoryID }, type: sequelize.QueryTypes.SELECT
                }).then(function success(data1) {
                    return data1;
                }).catch(function error(err) {
                    console.log('An error occurred...', err);
                });
            }
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select a.ItemID, ItemName, sum(TotalArea) TotalArea, sum(isnull(FruitsBearingArea, 0)) FruitsBearingArea, sum(Production) Production, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, Status, 0 FS from AreaProduction a inner join Items b on a.ItemID = b.ItemID where CategoryID = :category_id and FinancialYear = :financial_year and AHOUserID = :user_id and Status is not null group by a.ItemID, ItemName, Unit, Status order by ItemName", {
            replacements: { category_id: categoryID, financial_year: financialYear, user_id: userID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data1) {
            return data1;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.submitAreaProduction = function (arr, obj, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const tableAreaProduction = new sql.Table();
        tableAreaProduction.create = true;
        tableAreaProduction.columns.add('ItemID', sql.Int, { nullable: false });
        tableAreaProduction.columns.add('TotalArea', sql.Decimal(18, 2), { nullable: false });
        tableAreaProduction.columns.add('FruitsBearingArea', sql.Decimal(18, 2), { nullable: true });
        tableAreaProduction.columns.add('Production', sql.Decimal(18, 2), { nullable: false });
        for (var i = 0; i < arr.length; i++) {
            tableAreaProduction.rows.add(arr[i].ItemID, arr[i].TotalArea, arr[i].FruitsBearingArea, arr[i].Production);
        }
        const request = new sql.Request(con);
        request.input('FinancialYear', obj.financialYear);
        request.input('Estimate', obj.estimate);
        request.input('AHOUserID', obj.UserID);
        request.input('AHOIPAddress', obj.IPAddress);
        request.input('Type', obj.type);
        request.input('tableAreaProduction', tableAreaProduction);
        request.execute('spSubmitAreaProduction', function (err, result) {
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