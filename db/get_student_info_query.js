export default function get_student_info_query() {
    return (`
        SELECT
            u."name",
            u."email",
            TO_CHAR(u."reg_date", 'YYYY-MM-DD') AS "reg_date",
            TO_CHAR(s."date_of_birth", 'YYYY-MM-DD') AS "date_of_birth",
            s."gender",
            s."interests",
            s."location",
            s."occupation",
            s."website",
            s."bio",
            s."course_count"
        FROM "Users" u
        JOIN "Students" s ON u."u_id" = s."s_id"
        WHERE u."u_id" = :USER_ID
    `);
}
