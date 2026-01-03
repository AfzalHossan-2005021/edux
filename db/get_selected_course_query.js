export default function get_selected_course_query(c_id){
    return(
        `SELECT c."c_id", c."title", c."student_count", c."rating", c."description", u."name", ins."expertise" AS "subject", ins."qualification", c."wall", c."field", c."seat", c."price"
        FROM "Courses" c
        LEFT JOIN "Users" u ON c."i_id" = u."u_id"
        LEFT JOIN "Instructors" ins ON c."i_id" = ins."i_id"
        WHERE c."c_id" = '${c_id}'`
    );
}
