const oracledb = require('oracledb');
import pool from "../../middleware/connectdb"

export default async function handler(req, res) {
    if (req.method == 'POST') {
        const connection = await pool.acquire();
        const { name, email, password, subject} = req.body;
        try {
            const result = await connection.execute(
                `BEGIN
                    :u_id := CREATE_INSTRUCTOR(:name, :email, :password, :subject);
                    commit;
                END;`,
                {
                    name: name,
                    email: email,
                    password: password,
                    subject: subject,
                    u_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 }
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT }
            );
            res.status(200).json(result.outBinds);
        } catch (error) {
            res.status(500).json({ message: 'An error occurred.' });
        } finally {
            pool.release(connection);
        }
    }
    else {
        res.status(400).json({ message: 'This method is not allowed.' })
    }
}