const mysql = require('mysql2');

let connection

const DbConnect = () => {
    if(!connection){
        connection = mysql.createPool({
            host: 'localhost',
            user: 'root',
            password: 'Mm@12345',
            database: 'gxdashboard',
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
            idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
            queueLimit: 0
        });
    }
    return connection
}

module.exports = { DbConnect }
