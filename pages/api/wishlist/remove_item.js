const oracledb = require("oracledb");
import pool from "@/middleware/connectdb";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const connection = await pool.acquire();
    const { u_id, c_id } = req.body;

    try {
      const result = await connection.execute(
        `BEGIN
           :cursor := EDUX.REMOVE_FROM_WISHLIST(:u_id, :c_id);
         END;`,
        {
          u_id: u_id,
          c_id: c_id,
          cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      
      const resultSet = result.outBinds.cursor;
      const rows = await resultSet.getRows();
      await resultSet.close();

      await connection.commit();

      res.status(200).json(rows);

    } catch (error) {
      console.error("Error enrolling:", error);
      res.status(500).json({ message: "An error occurred during enrollment." });
    } finally {
      pool.release(connection);
    }
  } else {
    res.status(400).json({ message: "This method is not allowed." });
  }
}
