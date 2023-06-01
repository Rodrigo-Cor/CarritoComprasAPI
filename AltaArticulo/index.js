const mysql = require('mysql2');
const fs = require('fs')
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    //const name = (req.body && req.body.name);

    const connection = mysql.createConnection({
        host: process.env.host,
        user: process.env.user,
        password: process.env.password,
        database: process.env.database,
        port: 3306,
    });

    connection.connect((error) => {
        if (error) {
            console.error('Error de conexión:', error);
            return;
        }
        console.log('Conexión exitosa!');
    });

    const responseMessage = __dirname + "/rds-combined-ca-bundle.pem";

    /*
    const responseMessage = name
        ? "Hello, " + name + ". This HTTP triggered function executed successfully."
        : "This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.";
    */

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: responseMessage
    };
}