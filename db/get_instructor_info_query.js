export default function get_instructor_info_query(USER_ID){
    return(
        `
        SELECT DISTINCT "Users"."name", "Users"."email", TO_CHAR("Users"."reg_date", 'DD Month, YYYY') "reg_date", "Instructors"."expertise", "Instructors"."qualification", "Instructors"."bio", "Instructors"."course_count" "course_count" 
        FROM "Users" 
        JOIN "Instructors" ON "Users"."u_id" = "Instructors"."i_id"
		WHERE "u_id" = :USER_ID
        `
    );
}