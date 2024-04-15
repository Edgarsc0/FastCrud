import mysql2 from "mysql2/promise";

const pool = mysql2.createPool(({
    host: "localhost",
    user: "root",
    database: "fastCrud",
    password: "Hal02012()",
    port: 3306
}));

const con = await pool.getConnection();

export default con;