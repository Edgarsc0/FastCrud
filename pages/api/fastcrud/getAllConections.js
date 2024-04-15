import con from "../db/config";

export default async function (req, res) {
    try {
        const sqlQuery = "select idConexion from conections";
        const infoQuery = await con.execute(sqlQuery);
        res.status(200).json({
            idConections: infoQuery[0]
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            err
        });
    }
}