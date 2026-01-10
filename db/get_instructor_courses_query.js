export default function get_instructor_courses_query() {
	return `
    	SELECT 
    	  	c."c_id",
    	  	c."title",
    	  	c."description",
    	  	c."field",
    	  	c."seat",
    	  	c."price",
    	  	c."wall",
    	  	c."difficulty_level",
    	  	c."approve_status",
    	  	c."student_count",
    	  	p.prerequisites_list,
    	  	o.outcomes_list
    	FROM "Courses" c
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
    	WHERE c."i_id" = :USER_ID
  	`;
}