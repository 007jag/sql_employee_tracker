const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    //your username
    user:"root",
    //your password
    password:"Jagmitcheema2003!",
    database: "employees",
});

connection.connect(function(err){
    if (err) throw err;
});

module.exports = connection;