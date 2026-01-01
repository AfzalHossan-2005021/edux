const oracledb = require('oracledb');
import pool from "../../middleware/connectdb"
import { get_all_courses } from "@/db/get_all_courses_query";

export default async function handler(req, res) {
    const connection = await pool.acquire();
    try {
        const result = await connection.execute(
            get_all_courses,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    } finally {
        pool.release(connection);
    }
}