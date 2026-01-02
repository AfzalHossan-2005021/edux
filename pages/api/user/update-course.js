import { pool } from "../../../middleware/connectdb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { c_id, i_id, title, description, field, seat } = req.body;

  // Validation
  if (!c_id || !i_id) {
    return res.status(400).json({ error: "Course ID and Instructor ID are required" });
  }

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (title.length > 100) {
    return res.status(400).json({ error: "Title must be 100 characters or less" });
  }

  if (description && description.length > 1000) {
    return res.status(400).json({ error: "Description must be 1000 characters or less" });
  }

  if (field && field.length > 255) {
    return res.status(400).json({ error: "Field must be 255 characters or less" });
  }

  if (seat && (isNaN(seat) || seat <= 0)) {
    return res.status(400).json({ error: "Seat must be a positive number" });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // Verify instructor owns this course
    const courseCheck = await connection.execute(
      `SELECT c_id, i_id FROM EDUX."Courses" WHERE c_id = :c_id AND i_id = :i_id`,
      { c_id, i_id }
    );

    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ error: "Course not found or not owned by this instructor" });
    }

    // Build update query dynamically based on provided fields
    const updateFields = [];
    const params = { c_id };

    if (title !== undefined) {
      updateFields.push(`title = :title`);
      params.title = title;
    }

    if (description !== undefined) {
      updateFields.push(`description = :description`);
      params.description = description;
    }

    if (field !== undefined) {
      updateFields.push(`field = :field`);
      params.field = field;
    }

    if (seat !== undefined) {
      updateFields.push(`seat = :seat`);
      params.seat = seat;
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    // Execute update
    await connection.execute(
      `UPDATE EDUX."Courses" SET ${updateFields.join(", ")} WHERE c_id = :c_id`,
      params,
      { autoCommit: true }
    );

    console.log(`Course ${c_id} updated successfully by instructor ${i_id}`);

    // Fetch updated course data
    const updatedCourse = await connection.execute(
      `SELECT c_id, title, description, field, seat, approval_status, enrollment_count, rating 
       FROM EDUX."Courses" WHERE c_id = :c_id`,
      { c_id }
    );

    if (updatedCourse.rows.length > 0) {
      const course = updatedCourse.rows[0];
      return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: {
          c_id: course[0],
          title: course[1],
          description: course[2],
          field: course[3],
          seat: course[4],
          approval_status: course[5],
          enrollment_count: course[6],
          rating: course[7],
        },
      });
    }

    return res.status(200).json({ success: true, message: "Course updated successfully" });
  } catch (error) {
    console.error("Update course error:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error("Error closing connection:", closeError);
      }
    }
  }
}
