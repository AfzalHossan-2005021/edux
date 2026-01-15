export default function get_selected_course_query(c_id){
    return(
        `SELECT c."c_id", c."i_id", c."title", c."student_count", c."rating", c."description", u."name", ins."expertise" AS "subject", ins."qualification", c."wall", c."field", c."seat", c."price",
        p.prerequisites_list AS PREREQUISITES_LIST,
        o.outcomes_list AS OUTCOMES_LIST
        FROM "Courses" c
        LEFT JOIN "Users" u ON c."i_id" = u."u_id"
        LEFT JOIN "Instructors" ins ON c."i_id" = ins."i_id"
        LEFT JOIN (
            SELECT "c_id",
            JSON_ARRAYAGG("description" ORDER BY "p_id") AS prerequisites_list
            FROM "Prerequisites"
            GROUP BY "c_id"
        ) p ON c."c_id" = p."c_id"
        LEFT JOIN (
            SELECT "c_id",
            JSON_ARRAYAGG("description" ORDER BY "o_id") AS outcomes_list
            FROM "Outcomes"
            GROUP BY "c_id"
        ) o ON c."c_id" = o."c_id"
        WHERE c."c_id" = '${c_id}'`
    );
}
