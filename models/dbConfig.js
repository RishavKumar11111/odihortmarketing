// const Sequelize = require('sequelize');
// const sequelize = new Sequelize('e-pest', 'sa', 'sa@123#', {
//     host: 'localhost',
//     dialect: 'mssql',
//     operatorsAliases: false,
//     logging: false,
//     dialectOptions: {
//         encrypt: false
//     }
// });

// const sql = require('mssql');
// const locConfig = {
//     user: 'sa',
//     password: 'sa@123#',
//     server: 'localhost',
//     database: 'e-pest'
// };

const Sequelize = require('sequelize');
const sequelize = new Sequelize('e-pest', 'epest', 'E@Pest#456', {
    host: '164.100.140.101',
    dialect: 'mssql'
});

const sql = require('mssql');
const locConfig = {
    user: 'epest',
    password: 'E@Pest#456',
    server: '164.100.140.101',
    database: 'e-pest',
    requestTimeout: 3600000
};

sequelize
    .authenticate()
    .then(function success() {

    }).catch(function error(err) {
        console.log('Unable to connect to the database: ' + err);
    });

exports.sequelize = sequelize;
exports.sql = sql;
exports.locConfig = locConfig;