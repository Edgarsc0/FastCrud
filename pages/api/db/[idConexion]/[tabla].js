import mysql2 from "mysql2/promise";
import axios from "axios";

export default async function (req, res) {
    const { idConexion, tabla } = req.query;
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
    switch (req.method) {
        case "GET":
            const parametrosEnviados = Object.keys(req.body);
            if (parametrosEnviados.length != 0) {
                try {
                    const rows = await (parametrosEnviados.length > 1 ? (async () => {
                        let sqlQuery = `select * from ${tabla} where `;
                        parametrosEnviados.map((param, index) => {
                            index == parametrosEnviados.length - 1 ? sqlQuery += `${param}="${req.body[param]}"` : sqlQuery += `${param}="${req.body[param]}" and `;
                        });
                        const [rows, field] = await connection.execute(sqlQuery);
                        return rows;
                    }) : (async () => {
                        const [param] = parametrosEnviados;
                        const sqlQuery = `select * from ${tabla} where ${param}=${req.body[param]}`;
                        const [rows, field] = await connection.execute(sqlQuery);
                        return rows;
                    }))();
                    res.status(200).json({
                        rows
                    });
                }catch(err){
                    res.status(500).json({err});
                }
            } else {
                try{
                    const sqlQuery = `select * from ${tabla}`;
                    console.log(DBNAME)
                    const [rows, fields] = await connection.execute(sqlQuery);
                    pool.releaseConnection();
                    res.status(200).json({
                        rows
                    });
                }catch(err){
                    res.status(200).json({
                        err
                    });
                }
            }
            break;
        case "POST":
            break;
        case "PATCH":
            break;
        case "DELETE":
            break;
    }
}
