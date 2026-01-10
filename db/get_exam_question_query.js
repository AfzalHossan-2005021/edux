export default function get_exam_question_query(EXAM_ID){
    return(
        `SELECT q."q_id", q."q_description",
        q."option_a", q."option_b", q."option_c", q."option_d",
        q."marks", q."right_ans", q."serial"
        FROM EDUX."Topics" t
        JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
        JOIN EDUX."Questions" q ON e."e_id" = q."e_id"
        WHERE e."e_id" = '${EXAM_ID}'
        ORDER BY q."serial" ASC`
    );
}