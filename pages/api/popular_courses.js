const oracledb = require('oracledb');
import pool from "../../middleware/connectdb"
import { get_popular_courses } from "@/db/get_popular_courses_query";

export default async function handler(req, res) {
    let connection;
    try {
        connection = await pool.acquire();
        const result = await connection.execute(
            get_popular_courses,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Popular courses error:', error.message);
        res.status(500).json({ error: error.message || 'An error occurred' });
    } finally {
        if (connection) {
            pool.release(connection);
        }
    }
}