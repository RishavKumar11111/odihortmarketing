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

exports.getTradersList = function () {
    return sequelize.query('select ID, DistrictName, TraderName, TraderContactNo, Commodity from TraderDetails a inner join LGDDistrict b on a.DistrictCode = b.DistrictCode order by ID, DistrictName, TraderName, Commodity', {
        type: sequelize.QueryTypes.SELECT
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

exports.getDistricts = function () {
    return sequelize.query('select DistrictCode, DistrictName from LGDDistrict order by DistrictName', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getStockInDetails = function (districtCode, categoryID, itemID, dateFrom, dateTill) {
    if (dateFrom == '' && dateTill == '') {
        return sequelize.query("select d.DistrictCode, DistrictName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join LGDBlock d on substring(a.UserID, 5, 4) = d.BlockCode inner join LGDDistrict e on d.DistrictCode = e.DistrictCode where ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and (:district_code = 0 or d.DistrictCode = :district_code) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) group by d.DistrictCode, DistrictName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, category_id: categoryID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select d.DistrictCode, DistrictName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, sum(Quantity) Quantity, Unit, sum(CultivationArea) CultivationArea, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join LGDBlock d on substring(a.UserID, 5, 4) = d.BlockCode inner join LGDDistrict e on d.DistrictCode = e.DistrictCode where ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and (:district_code = 0 or d.DistrictCode = :district_code) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) and convert(date, a.DateTime) between convert(date, :date_from) and convert(date, :date_till) group by d.DistrictCode, DistrictName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, category_id: categoryID, item_id: itemID, date_from: dateFrom, date_till: dateTill }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getStockInLocationItemDetails = function (referenceNo, farmerID, itemID, districtCode, farmerName, farmerMobileNo) {
    if (referenceNo !== 'null' && farmerID !== 'null') {
        return sequelize.query("select SubDivisionName, AreaType, BlockName, GPName, VillageName, case when Photo is not null then 'A' else 'NA' end PhotoAvailability, ItemID, sum(Quantity) Quantity, convert(varchar(30), convert(date, AvailableFrom), 106) AvailableDate, sum(CultivationArea) CultivationArea from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) c on a.BlockCode = c.BlockCode left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode inner join LGDSubDivision f on c.SubDivisionCode = f.SubDivisionCode where ReferenceNo = :reference_no and FarmerID = :farmer_id and ItemID = :item_id and ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) group by SubDivisionName, AreaType, BlockName, GPName, VillageName, Photo, ItemID, convert(varchar(30), convert(date, AvailableFrom), 106) order by SubDivisionName, AreaType, BlockName, GPName, VillageName", {
            replacements: { reference_no: referenceNo, farmer_id: farmerID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select SubDivisionName, AreaType, BlockName, GPName, VillageName, case when Photo is not null then 'A' else 'NA' end PhotoAvailability, sum(Quantity) Quantity, convert(varchar(30), convert(date, AvailableFrom), 106) AvailableDate, sum(CultivationArea) CultivationArea from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join (select BlockCode, BlockName, SubDivisionCode, DistrictCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode, DistrictCode from LGDULB) c on a.BlockCode = c.BlockCode left join LGDGP d on a.GPCode = d.GPCode left join LGDVillage e on a.VillageCode = e.VillageCode inner join LGDSubDivision f on c.SubDivisionCode = f.SubDivisionCode where c.DistrictCode = :district_code and FarmerName = :farmer_name and FarmerMobileNo = :farmer_mobile_no and ItemID = :item_id and ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and ReferenceNo is null group by SubDivisionName, AreaType, BlockName, GPName, VillageName, Photo, convert(varchar(30), convert(date, AvailableFrom), 106) order by SubDivisionName, AreaType, BlockName, GPName, VillageName", {
            replacements: { district_code: districtCode, farmer_name: farmerName, farmer_mobile_no: farmerMobileNo, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getStockOutDetails = function (districtCode, categoryID, itemID, dateFrom, dateTill) {
    if (dateFrom == '' && dateTill == '') {
        return sequelize.query("select e.DistrictCode, DistrictName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, isnull(sum(SaleQuantity), 0) SaleQuantity, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0) Count from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join Items c on a.ItemID = c.ItemID inner join StockIn d on a.StockID = d.StockID inner join LGDBlock e on substring(d.UserID, 5, 4) = e.BlockCode inner join LGDDistrict f on e.DistrictCode = f.DistrictCode where (:district_code = 0 or e.DistrictCode = :district_code) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or a.ItemID = :item_id) group by e.DistrictCode, DistrictName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, category_id: categoryID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select e.DistrictCode, DistrictName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, isnull(sum(SaleQuantity), 0) SaleQuantity, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0) Count from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join Items c on a.ItemID = c.ItemID inner join StockIn d on a.StockID = d.StockID inner join LGDBlock e on substring(d.UserID, 5, 4) = e.BlockCode inner join LGDDistrict f on e.DistrictCode = f.DistrictCode where (:district_code = 0 or e.DistrictCode = :district_code) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or a.ItemID = :item_id) and convert(date, a.DateTime) between convert(date, :date_from) and convert(date, :date_till) group by e.DistrictCode, DistrictName, a.ReferenceNo, a.FarmerID, FarmerName, FarmerMobileNo, a.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(a.ReferenceNo), charindex('/', reverse(a.ReferenceNo)) - 1)) as int), 0)", {
            replacements: { district_code: districtCode, category_id: categoryID, item_id: itemID, date_from: dateFrom, date_till: dateTill }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getStockOutLocationItemDetails = function (referenceNo, farmerID, itemID, districtCode, farmerName, farmerMobileNo) {
    if (referenceNo !== 'null' && farmerID !== 'null') {
        return sequelize.query("select SubDivisionName, AreaType, BlockName, GPName, VillageName, isnull(sum(SaleQuantity), 0) SaleQuantity, convert(varchar(30), convert(date, a.DateTime), 106) Date from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join StockIn c on b.StockID = c.StockID inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) d on c.BlockCode = d.BlockCode left join LGDGP e on c.GPCode = e.GPCode left join LGDVillage f on c.VillageCode = f.VillageCode inner join LGDSubDivision g on d.SubDivisionCode = g.SubDivisionCode where a.ReferenceNo = :reference_no and a.FarmerID = :farmer_id and a.ItemID = :item_id group by SubDivisionName, AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, a.DateTime), 106) order by SubDivisionName, AreaType, BlockName, GPName, VillageName", {
            replacements: { reference_no: referenceNo, farmer_id: farmerID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select SubDivisionName, AreaType, BlockName, GPName, VillageName, isnull(sum(SaleQuantity), 0) SaleQuantity, convert(varchar(30), convert(date, a.DateTime), 106) Date from StockOut a inner join StockInItems b on a.StockID = b.StockID and a.ItemID = b.ItemID inner join StockIn c on b.StockID = c.StockID inner join (select BlockCode, BlockName, SubDivisionCode, DistrictCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode, DistrictCode from LGDULB) d on c.BlockCode = d.BlockCode left join LGDGP e on c.GPCode = e.GPCode left join LGDVillage f on c.VillageCode = f.VillageCode inner join LGDSubDivision g on d.SubDivisionCode = g.SubDivisionCode where d.DistrictCode = :district_code and FarmerName = :farmer_name and FarmerMobileNo = :farmer_mobile_no and a.ItemID = :item_id and a.ReferenceNo is null group by SubDivisionName, AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, a.DateTime), 106) order by SubDivisionName, AreaType, BlockName, GPName, VillageName", {
            replacements: { district_code: districtCode, farmer_name: farmerName, farmer_mobile_no: farmerMobileNo, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getAvailabilityDetails = function (districtCode, categoryID, itemID) {
    return sequelize.query("select DistrictName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, isnull(sum(Balance), 0) Balance, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0) Count, SubDivisionName, AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, AvailableFrom), 106) AvailableDate from StockIn a inner join StockInItems b on a.StockID = b.StockID inner join Items c on b.ItemID = c.ItemID inner join (select BlockCode, BlockName, SubDivisionCode from LGDBlock union all select ULBCode, ULBName, SubDivisionCode from LGDULB) d on a.BlockCode = d.BlockCode inner join LGDSubDivision e on d.SubDivisionCode = e.SubDivisionCode inner join LGDDistrict f on e.DistrictCode = f.DistrictCode left join LGDGP g on a.GPCode = g.GPCode left join LGDVillage h on a.VillageCode = h.VillageCode where ((datediff(d, a.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, a.DateTime, getdate()) = 0 and Status = 1)) and (:district_code = 0 or e.DistrictCode = :district_code) and (:category_id = 0 or CategoryID = :category_id) and (:item_id = 0 or b.ItemID = :item_id) group by DistrictName, ReferenceNo, FarmerID, FarmerName, FarmerMobileNo, b.ItemID, ItemName, Unit, isnull(cast(reverse(left(reverse(ReferenceNo), charindex('/', reverse(ReferenceNo)) - 1)) as int), 0), SubDivisionName, AreaType, BlockName, GPName, VillageName, convert(varchar(30), convert(date, AvailableFrom), 106) having isnull(sum(Balance), 0) > 0", {
        replacements: { district_code: districtCode, category_id: categoryID, item_id: itemID }, type: sequelize.QueryTypes.SELECT
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

exports.getDashboardNoDetails = function (callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.execute('spGetDashboardNoDetails', function (err, result) {
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

exports.getStockInOutAvailableDistrictBlockWise = function (districtCode, itemID, categoryID, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.input('DistrictCode', districtCode);
        request.input('ItemID', itemID);
        request.input('CategoryID', categoryID);
        request.execute('spGetStockInOutAvailableDistrictBlockWise', function (err, result) {
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

exports.getFarmersCount = function () {
    return sequelize.query('select count(distinct(FarmerMobileNo)) FarmerCount from StockIn select a.DistrictCode, DistrictName, isnull(FarmerCount, 0) FarmerCount from LGDDistrict a left join (select DistrictCode, count(distinct(FarmerMobileNo)) FarmerCount from StockIn a inner join LGDBlock b on substring(UserID, 5, 4) = b.BlockCode group by DistrictCode) b on a.DistrictCode = b.DistrictCode order by DistrictName', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getFarmerDetailsDistrictWise = function (districtCode) {
    return sequelize.query('select FarmerName, FarmerMobileNo from StockIn a inner join LGDBlock b on substring(UserID, 5, 4) = b.BlockCode where DistrictCode = :district_code group by FarmerName, FarmerMobileNo order by FarmerName', {
        replacements: { district_code: districtCode }, type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getUnavailableItems = function () {
    return sequelize.query("select ItemName, isnull(sum(Quantity), 0) StockInQuantity, isnull(sum(SaleQuantity), 0) StockOutQuantity, isnull(sum(Balance), 0) AvailableQuantity, case when Unit = 'Q' then 'Qtls.' else 'Lakh Nos.' end Unit from StockInItems a inner join Items b on a.ItemID = b.ItemID inner join StockIn c on a.StockID = c.StockID left join (select StockID, ItemID, isnull(sum(SaleQuantity), 0) SaleQuantity from StockOut group by StockID, ItemID) d on a.StockID = d.StockID and a.ItemID = d.ItemID where ((datediff(d, c.DateTime, getdate()) >= 1 and (Status is null or Status = 0 or Status = 1)) or (datediff(d, c.DateTime, getdate()) = 0 and Status = 1)) group by ItemName, Unit having isnull(sum(Balance), 0) = 0 order by ItemName", {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.getDDHDetails = function () {
    return sequelize.query('select DDHUserID, DistrictName, DDHName, DDHMobileNo, DDHEmailID, Status from DDHDistrictMapping a inner join LGDDistrict b on a.DistrictCode = b.DistrictCode order by DDHUserID, DistrictName, DDHName, DDHMobileNo, DDHEmailID', {
        type: sequelize.QueryTypes.SELECT
    }).then(function success(data) {
        return data;
    }).catch(function error(err) {
        console.log('An error occurred...', err);
    });
};

exports.submitDDHDetails = function (obj, callback) {
    var con = new sql.ConnectionPool(locConfig);
    con.connect().then(function success() {
        const request = new sql.Request(con);
        request.input('DDHName', obj.DDHName);
        request.input('DDHMobileNo', obj.DDHMobileNo);
        request.input('DDHEmailID', obj.DDHEmailID);
        request.input('DDHUserID', obj.DDHUserID);
        request.input('IPAddress', obj.IPAddress);
        request.input('FinancialYear', obj.FinancialYear);
        request.execute('spSubmitDDHDetails', function (err, result) {
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

exports.getCropDetails = function (categoryID, estimate, financialYear, districtCode) {
    if (estimate !== 'All') {
        return sequelize.query("select a.ItemID, ItemName, sum(TotalArea) TotalArea, sum(isnull(FruitsBearingArea, 0)) FruitsBearingArea, sum(Production) Production, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, Status from AreaProduction a inner join Items b on a.ItemID = b.ItemID inner join LGDBlock c on substring(a.AHOUserID, 5, 4) = c.BlockCode where CategoryID = :category_id and FinancialYear = :financial_year and Estimate = :estimate and DistrictCode = :district_code and Status = 1 group by a.ItemID, ItemName, Unit, Status order by ItemName", {
            replacements: { category_id: categoryID, estimate: estimate, financial_year: financialYear, district_code: districtCode }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select a.ItemID, ItemName, sum(TotalArea) TotalArea, sum(isnull(FruitsBearingArea, 0)) FruitsBearingArea, sum(Production) Production, case when Unit = 'Q' then 'MT.' else 'Lakh Nos.' end Unit, Status from AreaProduction a inner join Items b on a.ItemID = b.ItemID inner join LGDBlock c on substring(a.AHOUserID, 5, 4) = c.BlockCode where CategoryID = :category_id and FinancialYear = :financial_year and DistrictCode = :district_code and Status = 1 group by a.ItemID, ItemName, Unit, Status order by ItemName", {
            replacements: { category_id: categoryID, financial_year: financialYear, district_code: districtCode }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data1) {
            return data1;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};

exports.getReport = function (categoryID, estimate, financialYear, districtCode, itemID) {
    if (districtCode == 0) {
        return sequelize.query("select DistrictName, sum(isnull(TotalArea, 0)) TotalArea, sum(isnull(FruitsBearingArea, 0)) FruitsBearingArea, sum(isnull(Production, 0)) Production from LGDDistrict a inner join LGDBlock b on a.DistrictCode = b.DistrictCode left join (select TotalArea, FruitsBearingArea, Production, substring(AHOUserID, 5, 4) BlockCode from AreaProduction where ItemID = :item_id and FinancialYear = :financial_year and (:estimate = 'All' or Estimate = :estimate) and Status = 1) c on b.BlockCode = c.BlockCode group by DistrictName order by DistrictName", {
            replacements: { category_id: categoryID, estimate: estimate, financial_year: financialYear, district_code: districtCode, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
    else {
        return sequelize.query("select BlockName, sum(isnull(TotalArea, 0)) TotalArea, sum(isnull(FruitsBearingArea, 0)) FruitsBearingArea, sum(isnull(Production, 0)) Production from LGDBlock a left join (select TotalArea, FruitsBearingArea, Production, substring(AHOUserID, 5, 4) BlockCode from AreaProduction where ItemID = :item_id and FinancialYear = :financial_year and (:estimate = 'All' or Estimate = :estimate) and Status = 1) b on a.BlockCode = b.BlockCode where DistrictCode = :district_code group by BlockName order by BlockName", {
            replacements: { category_id: categoryID, estimate: estimate, financial_year: financialYear, district_code: districtCode, item_id: itemID }, type: sequelize.QueryTypes.SELECT
        }).then(function success(data) {
            return data;
        }).catch(function error(err) {
            console.log('An error occurred...', err);
        });
    }
};