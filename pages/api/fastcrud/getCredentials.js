import jwt from "jsonwebtoken";
import con from "../db/config";

export default async function (req, res) {
    const { idConexion } = req.body;
    try {
        const sqlQuery = "select token from conections where idConexion=?";
        const [rows, fields] = await con.execute(sqlQuery, [idConexion]);
        const { token } = rows[0];
        const credentials = jwt.verify(token, "ZfkSeInBKx");
        res.status(200).json(credentials);
    } catch (err) {
        res.status(500).json({
            status: "error"
        });
    }
}