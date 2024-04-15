import mysql2 from "mysql2/promise";
import axios from "axios";

export default async function (req, res) {
    const { idConexion, tabla } = req.body;
    const credentialsInfo = await axios.post("http://localhost:3000/api/fastcrud/getCredentials", {
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
    const sqlQuery = `desc ${tabla}`;
    const [rows, fields] = await connection.execute(sqlQuery);
    res.status(200).json({
        rows
    });
}