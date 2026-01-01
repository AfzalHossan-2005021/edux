export default function get_lecture_content_query(STUDENT_ID, COURSE_ID, TOPIC_ID, LECTURE_ID){
    return(
        `SELECT l."description", l."video"
        FROM EDUX."Enrolls" e
        JOIN EDUX."Courses" c ON e."c_id" = c."c_id"
        JOIN EDUX."Topics" t ON t."c_id" = c."c_id"
        JOIN EDUX."Lectures" l ON l."t_id" = t."t_id"
        WHERE e."s_id" = '${STUDENT_ID}'
        AND c."c_id" = '${COURSE_ID}'
        AND t."t_id" = '${TOPIC_ID}'
        AND l."l_id" = '${LECTURE_ID}'`
    );
}