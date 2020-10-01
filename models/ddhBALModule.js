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

exports.getBlocks = function (districtCode) {
    return sequelize.query('select BlockCode, BlockName from LGDBlock where DistrictCode = :district_code order by BlockName', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

// exports.getGPsByBlock = function (blockCode) {
//     return sequelize.query('select GPCode, GPName from LGDGP where BlockCode = :block_code order by GPName', {
//         replacements: { block_code: blockCode }, type: sequelize.QueryTypes.SELECT
//     }).then(function success(data) {
//         return data;
//     }).catch(function error(err) {
//         console.log('An error occurred...', err);
//     });
// };

// exports.getVillagesByGP = function (gpCode) {
//     return sequelize.query('select VillageCode, VillageName from LGDVillage where GPCode = :gp_code order by VillageName', {
//         replacements: { gp_code: gpCode }, type: sequelize.QueryTypes.SELECT
//     }).then(function success(data) {
//         return data;
//     }).catch(function error(err) {
//         console.log('An error occurred...', err);
//     });
// };

exports.getULBs = function (districtCode) {
    return sequelize.query('select ULBCode, ULBName from LGDULB where DistrictCode = :district_code order by ULBName', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

// exports.submitStockIn = function (obj) {
//     return sequelize.query('insert into StockIn (BlockCode, GPCode, VillageCode, AreaType, ItemID, FarmerName, FarmerMobileNo, Quantity, Photo, AvailableFrom, AvailableTill, UserID, DateTime, IPAddress, FinancialYear, Status) values (:block_code, :gp_code, :village_code, :area_type, :item_id, :farmer_name, :farmer_mobile_no, :quantity, :photo, :available_from, :available_till, :user_id, getdate(), :ip_address, :financial_year, :status) select @@rowcount', {
//         replacements: { block_code: obj.BlockCode, gp_code: obj.GPCode, village_code: obj.VillageCode, area_type: obj.AreaType, item_id: obj.ItemID, farmer_name: obj.FarmerName, farmer_mobile_no: obj.FarmerMobileNo, quantity: obj.Quantity, photo: obj.Photo, available_from: obj.AvailableFrom, available_till: obj.AvailableTill, user_id: obj.UserID, ip_address: obj.IPAddress, financial_year: obj.FinancialYear, status: obj.Status }, type: sequelize.QueryTypes.INSERT
//     }).then(function success(data) {
//         return data;
//     }).catch(function error(err) {
//         console.log('An error occurred...', err);
//     });
// };

// exports.getStockDetails = function (obj) {
//     if (obj.hasOwnProperty('gpCode') && obj.hasOwnProperty('villageCode')) {
//         return sequelize.query('select a.StockID, BlockName, GPName, VillageName, FarmerName, FarmerMobileNo, ItemName, sum(Quantity) - isnull(sum(SaleQuantity), 0) Quantity, Unit from StockIn a inner join Items c on a.ItemID = c.ItemId and a.ItemID = :item_id left join (select StockID, isnull(sum(SaleQuantity), 0) SaleQuantity from StockOut group by StockID) b on a.StockID = b.StockID inner join LGDBlock d on a.BlockCode = d.BlockCode inner join LGDGP e on a.GPCode = e.GPCode inner join LGDVillage f on a.VillageCode = f.VillageCode where (:district_code = 0 or substring(a.UserID, 5, 3) = :district_code) and (:block_code = 0 or a.BlockCode = :block_code) and (:gp_code = 0 or a.GPCode = :gp_code) and (:village_code = 0 or a.VillageCode = :village_code) group by a.StockID, BlockName, GPName, VillageName, FarmerName, FarmerMobileNo, ItemName, Unit having sum(Quantity) - isnull(sum(SaleQuantity), 0) > 0 order by BlockName, GPName, VillageName, FarmerName, ItemName', {
//             replacements: { item_id: obj.itemID, district_code: obj.districtCode, block_code: obj.blockCode, gp_code: obj.gpCode, village_code: obj.villageCode }, type: sequelize.QueryTypes.SELECT
//         }).then(function success(data) {
//             return data;
//         }).catch(function error(err) {
//             console.log('An error occurred...', err);
//         });
//     }
//     else {
//         return sequelize.query('select a.StockID, ULBName BlockName, FarmerName, FarmerMobileNo, ItemName, sum(Quantity) - isnull(sum(SaleQuantity), 0) Quantity, Unit from StockIn a inner join Items c on a.ItemID = c.ItemId and a.ItemID = :item_id left join (select StockID, isnull(sum(SaleQuantity), 0) SaleQuantity from StockOut group by StockID) b on a.StockID = b.StockID inner join LGDULB d on a.BlockCode = d.ULBCode where (:district_code = 0 or substring(a.UserID, 5, 3) = :district_code) and (:block_code = 0 or a.BlockCode = :block_code) group by a.StockID, ULBName, FarmerName, FarmerMobileNo, ItemName, Unit having sum(Quantity) - isnull(sum(SaleQuantity), 0) > 0 order by ULBName, FarmerName, ItemName', {
//             replacements: { item_id: obj.itemID, district_code: obj.districtCode, block_code: obj.blockCode }, type: sequelize.QueryTypes.SELECT
//         }).then(function success(data) {
//             return data;
//         }).catch(function error(err) {
//             console.log('An error occurred...', err);
//         });
//     }
// };

// exports.submitStockOut = function (stockArray, obj, callback) {
//     var con = new sql.ConnectionPool(locConfig);
//     con.connect().then(function success() {
//         const tableStock = new sql.Table();
//         tableStock.create = true;
//         tableStock.columns.add('StockID', sql.Int, { nullable: false, primary: true });
//         tableStock.columns.add('SaleQuantity', sql.Decimal(18, 2), { nullable: false });
//         for (var i = 0; i < stockArray.length; i++) {
//             tableStock.rows.add(stockArray[i].StockID, stockArray[i].SaleQuantity);
//         }
//         const request = new sql.Request(con);
//         request.input('Remarks', obj.Remarks);
//         request.input('UserID', obj.UserID);
//         request.input('IPAddress', obj.IPAddress);
//         request.input('FinancialYear', obj.FinancialYear);
//         request.input('Status', obj.Status);
//         request.input('tableStock', tableStock);
//         request.execute('spSubmitStockOut', function (err, result) {
//             if (err) {
//                 console.log('An error occurred...', err);
//             }
//             else {
//                 callback(result.returnValue);
//             }
//             con.close();
//         });
//     }).catch(function error(err) {
//         console.log('An error occurred...', err);
//     });
// };

exports.getItemDetails = function (districtCode) {
    return sequelize.query('select a.ItemID, ItemName, CategoryName, isnull(sum(Balance), 0) Balance, Unit from StockInItems a inner join Items b on a.ItemID = b.ItemID inner join Category c on b.CategoryID = c.CategoryId inner join StockIn d on a.StockID = d.StockID inner join LGDBlock e on substring(d.UserID, 5, 4) = e.BlockCode where ((datediff(d, d.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, d.DateTime, getdate()) = 0 and Status = 1)) and DistrictCode = :district_code group by a.ItemID, ItemName, CategoryName, Unit having sum(Balance) > 0 order by ItemName', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getItemDetailsBGVWise = function (districtCode, itemID, roleName, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.input('DistrictCode', districtCode);
        request.input('ItemID', itemID);
        request.input('RoleName', roleName);
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

exports.getTradersList = function (districtCode) {
    return sequelize.query('select ID, DistrictName, TraderName, TraderContactNo, Commodity from TraderDetails a inner join LGDDistrict b on a.DistrictCode = b.DistrictCode where a.DistrictCode = :district_code order by ID, DistrictName, TraderName, Commodity', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getStockInDetails = function (districtCode, blockCode, categoryID, areaType, itemID, dateFrom, dateTill) {
    if (dateFrom == '' && dateTill == '') {
        return sequelize.query("select d.SubDivisionCode, SubDivisionName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join LGDBlock d on substring(a.UserID, 5, 4) = d.BlockCode inner join LGDSubDivision e on d.SubDivisionCode = e.SubDivisionCode where ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and (:area_type is null or AreaType = :area_type) and (:block_code = 0 or a.BlockCode = :block_code) and d.DistrictCode = :district_code group by d.SubDivisionCode, SubDivisionName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, block_code: blockCode, category_id: categoryID, area_type: areaType, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select d.SubDivisionCode, SubDivisionName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join LGDBlock d on substring(a.UserID, 5, 4) = d.BlockCode inner join LGDSubDivision e on d.SubDivisionCode = e.SubDivisionCode where ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and (:area_type is null or AreaType = :area_type) and (:block_code = 0 or a.BlockCode = :block_code) and convert(date, a.DateTime) between convert(date, :date_from) and convert(date, :date_till) and d.DistrictCode = :district_code group by d.SubDivisionCode, SubDivisionName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, block_code: blockCode, category_id: categoryID, area_type: areaType, item_id: itemID, date_from: dateFrom, date_till: dateTill }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getStockInLocationItemDetails = function (referenceNo, farmerID, itemID, subDivisionCode, farmerName, farmerMobileNo) {
    if (referenceNo !== 'null' && farmerID !== 'null') {
        return sequelize.query("select AreaType, BlockName, GPName, VillageName, case when Photo is not null then 'A' else 'NA' end PhotoAvailability, ItemID, sum(Quantity) Quantity, convert(varchar(30), convert(date, AvailableFrom), 106) AvailableDate, sum(CultivationArea) CultivationArea from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join (select BlockCode, BlockName from LGDBlock union all select ULBCode, ULBName from LGDULB) c on a.BlockCode = c.BlockCode left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode where ReferenceNo = :reference_no and FarmerID = :farmer_id and ItemID = :item_id and ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) group by AreaType, BlockName, GPName, VillageName, Photo, ItemID, convert(varchar(30), convert(date, AvailableFrom), 106) order by AreaType, BlockName, GPName, VillageName", {
            replacements: { reference_no: referenceNo, farmer_id: farmerID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select AreaType, BlockName, GPName, VillageName, case when Photo is not null then 'A' else 'NA' end PhotoAvailability, ItemID, sum(Quantity) Quantity, convert(varchar(30), convert(date, AvailableFrom), 106) AvailableDate, sum(CultivationArea) CultivationArea from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) c on a.BlockCode = c.BlockCode left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode where c.SubDivisionCode = :sub_division_code and FarmerName = :farmer_name and FarmerMobileNo = :farmer_mobile_no and ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) group by AreaType, BlockName, GPName, VillageName, Photo, ItemID, convert(varchar(30), convert(date, AvailableFrom), 106) order by AreaType, BlockName, GPName, VillageName", {
            replacements: { sub_division_code: subDivisionCode, farmer_name: farmerName, farmer_mobile_no: farmerMobileNo, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getStockOutDetails = function (districtCode, blockCode, categoryID, areaType, itemID, dateFrom, dateTill) {
    if (dateFrom == '' && dateTill == '') {
        return sequelize.query("select e.SubDivisionCode, SubDivisionName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, isnull(sum(SaleQuantity), 0) SaleQuantity, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0) Count from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join Items c on a.ItemID = c.ItemID inner join StockIn d on a.StockID = d.StockID inner join LGDBlock e on substring(d.UserID, 5, 4) = e.BlockCode inner join LGDSubDivision f on e.SubDivisionCode = f.SubDivisionCode where (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or a.ItemID = :item_id) and (:area_type is null or AreaType = :area_type) and (:block_code = 0 or d.BlockCode = :block_code) and e.DistrictCode = :district_code group by e.SubDivisionCode, SubDivisionName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, block_code: blockCode, category_id: categoryID, area_type: areaType, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select e.SubDivisionCode, SubDivisionName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, isnull(sum(SaleQuantity), 0) SaleQuantity, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0) Count from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join Items c on a.ItemID = c.ItemID inner join StockIn d on a.StockID = d.StockID inner join LGDBlock e on substring(d.UserID, 5, 4) = e.BlockCode inner join LGDSubDivision f on e.SubDivisionCode = f.SubDivisionCode where (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or a.ItemID = :item_id) and (:area_type is null or AreaType = :area_type) and (:block_code = 0 or d.BlockCode = :block_code) and convert(date, a.DateTime) between convert(date, :date_from) and convert(date, :date_till) and e.DistrictCode = :district_code group by e.SubDivisionCode, SubDivisionName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, block_code: blockCode, category_id: categoryID, area_type: areaType, item_id: itemID, date_from: dateFrom, date_till: dateTill }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getStockOutLocationItemDetails = function (referenceNo, farmerID, itemID, subDivisionCode, farmerName, farmerMobileNo) {
    if (referenceNo !== 'null' && farmerID !== 'null') {
        return sequelize.query("select AreaType, BlockName, GPName, VillageName, isnull(sum(SaleQuantity), 0) SaleQuantity, convert(varchar(30), convert(date, a.DateTime), 106) Date from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join StockIn c on b.StockID = c.StockID inner join (select BlockCode, BlockName from LGDBlock union all select ULBCode, ULBName from LGDULB) d on c.BlockCode = d.BlockCode left join LGDGP e on c.GPCode = e.GPCode left join LGDVillage f on c.VillageCode = f.VillageCode where a.ReferenceNo = :reference_no and a.FarmerID = :farmer_id and a.ItemID = :item_id group by AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, a.DateTime), 106) order by AreaType, BlockName, GPName, VillageName", {
            replacements: { reference_no: referenceNo, farmer_id: farmerID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select AreaType, BlockName, GPName, VillageName, isnull(sum(SaleQuantity), 0) SaleQuantity, convert(varchar(30), convert(date, a.DateTime), 106) Date from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join StockIn c on b.StockID = c.StockID inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) d on c.BlockCode = d.BlockCode left join LGDGP e on c.GPCode = e.GPCode left join LGDVillage f on c.VillageCode = f.VillageCode where d.SubDivisionCode = :sub_division_code and FarmerName = :farmer_name and FarmerMobileNo = :farmer_mobile_no group by AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, a.DateTime), 106) order by AreaType, BlockName, GPName, VillageName", {
            replacements: { sub_division_code: subDivisionCode, farmer_name: farmerName, farmer_mobile_no: farmerMobileNo, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getAvailabilityDetails = function (districtCode, blockCode, categoryID, areaType, itemID) {
    return sequelize.query("select SubDivisionName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, isnull(sum(Balance), 0) Balance, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count, AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, AvailableFrom), 106) AvailableDate from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) d on a.BlockCode = d.BlockCode inner join LGDSubDivision e on d.SubDivisionCode = e.SubDivisionCode left join LGDGP g on a.GPCode = g.GPCode left join LGDVillage h on a.VillageCode = h.VillageCode where ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and (:area_type is null or AreaType = :area_type) and (:block_code = 0 or a.BlockCode = :block_code) and e.DistrictCode = :district_code group by SubDivisionName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0), AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, AvailableFrom), 106) having isnull(sum(Balance), 0) > 0", {
        replacements: { district_code: districtCode, block_code: blockCode, category_id: categoryID, area_type: areaType, item_id: itemID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getDDHDetails = function (userID) {
    return sequelize.query('select DDHName, DistrictName from DDHDistrictMapping a inner join LGDDistrict b on a.DistrictCode = b.DistrictCode where DDHUserID = :user_id', {
        replacements: { user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getADHDetails = function (userID) {
    return sequelize.query('select ADHUserID, SubDivisionName, ADHName, ADHMobileNo, ADHEmailID, Status from ADHSubDivisionMapping a inner join LGDSubDivision b on a.SubDivisionCode = b.SubDivisionCode where DistrictCode = substring(:user_id, 5, 3) order by ADHUserID, SubDivisionName, ADHName, ADHMobileNo, ADHEmailID', {
        replacements: { user_id: userID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.submitADHDetails = function (obj, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.input('ADHName', obj.ADHName);
        request.input('ADHMobileNo', obj.ADHMobileNo);
        request.input('ADHEmailID', obj.ADHEmailID);
        request.input('ADHUserID', obj.ADHUserID);
        request.input('IPAddress', obj.IPAddress);
        request.input('FinancialYear', obj.FinancialYear);
        request.execute('spSubmitADHDetails', function (err, result) {
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

exports.getCropDetails = function (categoryID, estimate, financialYear, blockCode, districtCode) {
    if (estimate !== 'All') {
        return sequelize.query("select a.ItemID, ItemName, TotalArea, FruitsBearingArea, Production, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, Status from AreaProduction a inner join Items b on a.ItemID = b.ItemID where CategoryID = :category_id and FinancialYear = :financial_year and Estimate = :estimate and AHOUserID = 'AHO_' + :block_code and Status = 1 order by ItemName", {
            replacements: { category_id: categoryID, estimate: estimate, financial_year: financialYear, block_code: blockCode, district_code: districtCode }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select a.ItemID, ItemName, sum(TotalArea) TotalArea, sum(isnull(FruitsBearingArea, 0)) FruitsBearingArea, sum(Production) Production, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, Status from AreaProduction a inner join Items b on a.ItemID = b.ItemID where CategoryID = :category_id and FinancialYear = :financial_year and AHOUserID = 'AHO_' + :block_code and Status = 1 group by a.ItemID, ItemName, Unit, Status order by ItemName", {
            replacements: { category_id: categoryID, financial_year: financialYear, block_code: blockCode }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data1) {
            return data1;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getReport = function (categoryID, estimate, financialYear, blockCode, districtCode, itemID) {
    return sequelize.query("select BlockName, sum(isnull(TotalArea, 0)) TotalArea, sum(isnull(FruitsBearingArea, 0)) FruitsBearingArea, sum(isnull(Production, 0)) Production, Unit from LGDBlock a left join (select TotalArea, FruitsBearingArea, Production, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, substring(AHOUserID, 5, 4) BlockCode from AreaProduction a inner join Items b on a.ItemID = b.ItemID where a.ItemID = :item_id and FinancialYear = :financial_year and (:estimate = 'All' or Estimate = :estimate) and Status = 1) b on a.BlockCode = b.BlockCode where DistrictCode = :district_code group by BlockName, Unit order by BlockName", {
        replacements: { category_id: categoryID, estimate: estimate, financial_year: financialYear, block_code: blockCode, district_code: districtCode, item_id: itemID }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};