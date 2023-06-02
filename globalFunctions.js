const mysql = require('mysql2');
const fs = require('fs');

const connectDB = () => {
    console.log(__dirname + 'DigiCertGlobalRootCA.crt.pem');
    return mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database,
        port: 3306,
        ssl: {
            ca: fs.readFileSync(__dirname + '/DigiCertGlobalRootCA.crt.pem')
        }
    });
};

// Verificar si la foto está en formato base64
const isBase64 = (str) => {
    if (str === '' || str.trim() === '') {
        return false;
    }
    try {
        return btoa(atob(str)) === str;
    } catch (err) {
        return false;
    }
};

module.exports = { connectDB, isBase64 };