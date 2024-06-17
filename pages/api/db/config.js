import mysql2 from "mysql2/promise";

const pool = mysql2.createPool(({
    host: "roundhouse.proxy.rlwy.net",
    user: "root",
    database: "fastCrud",
    password: "kykIbwMYTlThoCyLaQhdgoojcDIIVeqp",
    port: 46892
}));

const con = await pool.getConnection();

export default con;