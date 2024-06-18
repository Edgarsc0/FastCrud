import sql from "mssql";
import axios from "axios";
import { ContentPasteOffSharp } from "@mui/icons-material";
import { headers } from "@/next.config";

export default async function (req, res) {
    console.log(req);
    const { idConexion, tabla } = req.query;
    const credentialsInfo = await axios.post("https://fast-crud.vercel.app/api/fastcrud/getCredentials", {
        idConexion
    });
    const { DBHOST, DBPORT, DBPASSWORD, DBUSER, DBNAME } = credentialsInfo.data;

    //CONEXION
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
    const pool = await sql.connect(sqlConfig);

    const types = {
        int: sql.Int,
        varchar: sql.VarChar,
        datetime: sql.DateTime,
        date: sql.Date
    }

    //CONSULTAR ELEMENTOS 
    const GET = async () => {
        //const parametrosEnviados = Object.keys(req.body);

        const { search } = req.body;
        if (req.body && search) {
            try {

                let whereClause = [];
                search.map(param => whereClause.push(`${param.name}=@${param.name}`));
                const sqlQuery = `select * from ${tabla} where ${whereClause.join(" and ")}`;
                const request = pool.request();
                search.map((param) => {
                    request.input(`${param.name}`, types[param.type], param.value);
                })
                const response = await request.query(sqlQuery);
                return res.status(200).json({
                    response
                })
            } catch (error) {
                //console.log(error)
                return res.status(500).json({ error })
            }
        } else {
            try {
                const sqlQuery = `select * from ${tabla}`;
                const response = await pool.request().query(sqlQuery);
                return res.status(200).json({
                    response
                });
            } catch (error) {
                console.log(error)
                return res.status(500).json({ error })
            }
        }
        /*if (parametrosEnviados.length != 0) {
            try {
                const result = await (parametrosEnviados.length > 1 ? (async () => {
                    const whereClause = parametrosEnviados.map((param, index) => `${param} = @value${index}`).join(' AND ');
                    const sqlQuery = `SELECT * FROM ${tabla} WHERE ${whereClause}`;
                    const request = pool.request();
                    parametrosEnviados.map((param, index) => {
                        request.input(`value${index}`, parametrosEnviados[param])
                    })
                    
                    const result = await request.query(sqlQuery);


                    return result;
                }) : (async () => {
                    const [param] = parametrosEnviados;
                    const sqlQuery = `select * from ${tabla} where ${param}=?`;
                    const [rows, field] = await connection.execute(sqlQuery, [req.body[param]]);
                    pool.releaseConnection();
                    return rows;
                }))();
                return res.status(200).json({
                    result
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
        }*/
    }

    //AGREGAR ELEMENTOS
    const POST = async () => {
        console.log("peticion recibida...");
        try {
            const { fields, placeholders } = req.body;
            const campos = fields.join(",");
            let fieldValues = [];
            placeholders.map((info, index) => {
                const infoValues = []
                let i = 0;
                info.map(() => {
                    infoValues.push(`@value${index}${i}`);
                    i++;
                });
                fieldValues.push(infoValues);

            })
            const sqlQuery = `insert into ${tabla}(${campos}) values${fieldValues.map(values => `(${values.join(',')})`)}`;
            const request = pool.request()
            placeholders.map((info, index) => {
                let i = 0;
                info.map((values) => {
                    request.input(`value${index}${i}`, types[values.type], values.value);
                    i++;
                })
            })
            const response = await request.query(sqlQuery);
            return res.status(200).json({ response })

        } catch (error) {
            console.log(error);
            return res.status(500).json({ error })
        }
        /*try {
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
        }*/
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
