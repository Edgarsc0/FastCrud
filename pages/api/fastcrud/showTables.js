import mysql2 from "mysql2/promise";
import axios from "axios";

export default async function (req, res) {
    const { idConexion } = req.body;
    const credentialsInfo = await axios.post("/api/fastcrud/getCredentials", {
        idConexion
    });
    const { DBHOST, DBPORT, DBPASSWORD, DBUSER, DBNAME } = credentialsInfo.data;
    const pool = mysql2.createPool({
        host: DBHOST,
        user: DBUSER,
        database: DBNAME,
        password: DBPASSWORD,
        port: DBPORT
    });
    const connection = await pool.getConnection();
    const sqlQuery = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'";
    const [rows, fields] = await connection.execute(sqlQuery);
    const tablas = rows.map(table => table = table[`Tables_in_${DBNAME}`]);
    res.status(200).json({
        tablas,
        DBNAME
    });
}