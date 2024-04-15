import CryptoJS from "crypto-js";
import mysql2 from "mysql2/promise";
import con from "../db/config";
import jwt from "jsonwebtoken";

export default async function (req, res) {
    const { DBHOST,
        DBPORT,
        DBPASSWORD,
        DBUSER,
        DBNAME
    } = req.body;
    try {
        const pool = mysql2.createPool({
            host: DBHOST,
            user: DBUSER,
            database: DBNAME,
            password: DBPASSWORD,
            port: DBPORT
        });
        await pool.getConnection();
        pool.releaseConnection();
        const token = jwt.sign({
            DBHOST,
            DBPORT,
            DBPASSWORD,
            DBUSER,
            DBNAME
        }, "ZfkSeInBKx");
        const cadena = `${DBHOST}-${DBUSER}-${DBNAME}-${DBPASSWORD}-${DBPORT}`;
        const idConexion = CryptoJS.SHA1(cadena).toString();
        const sqlQuery = "insert into conections values(?,?)";
        await con.execute(sqlQuery, [idConexion, token]);
        res.status(200).json({
            status: "success",
            idConexion,
        });
    } catch (err) {
        console.log(err);
        res.status(401).json({
            status: "Invalid Credentials",
            error: err
        });
    }
}