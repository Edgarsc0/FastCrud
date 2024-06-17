import sql from "mssql";

export default async function (req, res) {
    const sqlConfig = {
        user: "sa",
        password: "Hal02012()",
        database: "PRUEBA",
        server: process.env.server,
        options: {
            encrypt: false,
            trustServerCertificate: true
        },
        port: 1433
    }
    try {
        
        await sql.connect(sqlConfig);
        const result = await sql.query("SP_HELP aerolinea")
        res.status(200).json({
            result
        })
    } catch (err) {
        console.log(err);
        res.status(200).json({
            err
        })
    }
}