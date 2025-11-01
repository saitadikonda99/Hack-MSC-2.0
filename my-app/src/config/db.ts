import mysql2 from 'mysql2';

export const pool = mysql2.createPool( {
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
    multipleStatements: true,
}).promise();

pool.getConnection()
    .then( connection => {
        console.log(`Connected to MySQL database ${ process.env.DB_NAME } on thread ${ connection.threadId }`)
        connection.release();
    })
    .catch( error => {
        console.log(`Error connecting to MySQL database error: ${ error.message }`)
    });