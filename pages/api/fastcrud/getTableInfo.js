import sql from "mssql";
import axios from "axios";

export default async function (req, res) {
    const { idConexion, tabla } = req.body;
    const credentialsInfo = await axios.post("/api/fastcrud/getCredentials", {
        idConexion
    });
    const { DBHOST, DBPORT, DBPASSWORD, DBUSER, DBNAME } = credentialsInfo.data;

    const sqlConfig = {
        user: DBUSER,
        password: DBPASSWORD,
        database: DBNAME,
        server: DBHOST,
        options: {
            encrypt: false,
            trustServerCertificate: true
        },
        port: DBPORT
    }
    await sql.connect(sqlConfig);
    const sqlQuery = `SP_HELP ${tabla}`;
    const response = await sql.query(sqlQuery);
    res.status(200).json({
        response
    });
}