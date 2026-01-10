export default function get_student_courses(){
    return(
        `SELECT "c_id", "i_id", "title", "description", "date", "progress"
        FROM "Courses" NATURAL JOIN "Enrolls" 
        WHERE "Enrolls"."s_id" = :USER_ID`
    );
}