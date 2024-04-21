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

    //CONSULTAR ELEMENTOS 
    const GET = async () => {
        const parametrosEnviados = Object.keys(req.body);
        if (parametrosEnviados.length != 0) {
            try {
                const rows = await (parametrosEnviados.length > 1 ? (async () => {
                    const whereClause = parametrosEnviados.map(param => `${param} = ?`).join(' AND ');
                    const sqlQuery = `SELECT * FROM ${tabla} WHERE ${whereClause}`;
                    const [rows, field] = await connection.execute(sqlQuery, Object.values(req.body));
                    pool.releaseConnection();
                    return rows;
                }) : (async () => {
                    const [param] = parametrosEnviados;
                    const sqlQuery = `select * from ${tabla} where ${param}=?`;
                    const [rows, field] = await connection.execute(sqlQuery, [req.body[param]]);
                    pool.releaseConnection();
                    return rows;
                }))();
                return res.status(200).json({
                    rows
                });
            } catch (err) {
                return res.status(500).json({ err });
            }
        } else {
            try {
                const sqlQuery = `select * from ${tabla}`;
                const [rows, fields] = await connection.execute(sqlQuery);
                pool.releaseConnection();
                return res.status(200).json({
                    rows
                });
            } catch (err) {
                return res.status(200).json({
                    err
                });
            }
        }
    }

    //AGREGAR ELEMENTOS
    const POST = async () => {
        try {
            const results = []
            await Promise.all(req.body.map(async info => {
                const parametrosEnviados = Object.keys(info);
                const campos = parametrosEnviados.join(',');
                const placeholders = parametrosEnviados.map(() => '?').join(',');
                const sqlQuery = `INSERT INTO ${tabla} (${campos}) VALUES (${placeholders})`;
                const [rows, fields] = await connection.execute(sqlQuery, Object.values(info));
                results.push({
                    insertedInfo: info,
                    result: [rows]
                });
                pool.releaseConnection();
            }));
            return res.status(200).json({ results });
        } catch (err) {
            return res.status(500).json({ err })
        }
    }

    //ACTUALIZACION DE ELEMENTOS
    const PATCH = async () => {
        const { set, where, limit } = req.body;
        try {
            const setQuery = Object.keys(set).map(field => `${field}=?`).join(",");
            const whereQuery = Object.keys(where).map(field => `${field}=?`).join(" and ");
            const sqlQuery = `update ${tabla} set ${setQuery} where ${whereQuery} ${limit ? (`limit ${limit}`) : (``)}`;
            const [rows, fields] = await connection.execute(sqlQuery, [...Object.values(set), ...Object.values(where)]);
            pool.releaseConnection();
            return res.status(200).json({
                rows
            });
        } catch (err) {
            return res.status(500).json({
                err: err.message
            });
        }
    }

    //DELETE DE ELEMENTOS
    const DELETE = async () => {
        const { where, limit } = req.body;
        try {
            const whereQuery = Object.keys(where).map(field => `${field}=?`).join(" and ");
            const sqlQuery = `delete from ${tabla} where ${whereQuery} ${limit ? (`limit ${limit}`) : (``)}`;
            const [rows, fields] = await connection.execute(sqlQuery, Object.values(where));
            pool.releaseConnection();
            return res.status(200).json({
                rows
            });
        } catch (err) {
            return res.status(500).json({
                err: err
            })
        }
    }

    switch (req.method) {
        case "GET":
            return GET();
        case "POST":
            return POST();
        case "PATCH":
            return PATCH();
        case "DELETE":
            return DELETE();
        default:
            return res.status(405).json({
                message: "method not allowed"
            })
    }
}
