export default function update_student_info_query() {
    return (`
        UPDATE "Students"
        SET
            "date_of_birth" = TO_DATE(:date_of_birth, 'YYYY-MM-DD'),
            "gender" = :gender,
            "interests" = :interests,
            "location" = :location,
            "occupation" = :occupation,
            "website" = :website,
            "bio" = :bio
        WHERE "s_id" = :u_id
    `);
}