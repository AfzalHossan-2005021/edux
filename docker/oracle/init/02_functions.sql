-- EDUX Functions and Procedures

-- Make sure we are in the correct PDB
ALTER SESSION SET CONTAINER = EDUX;

-- Function: ADD_TO_WISHLIST
CREATE OR REPLACE FUNCTION EDUX.ADD_TO_WISHLIST (ID IN NUMBER, COURSE_ID IN NUMBER) 
RETURN SYS_REFCURSOR AS
  L_CURSOR SYS_REFCURSOR;
BEGIN
  INSERT INTO EDUX."Wishlist"("u_id", "c_id") VALUES (ID, COURSE_ID);
  COMMIT;
  OPEN L_CURSOR FOR SELECT * FROM EDUX."Wishlist" WHERE "u_id" = ID;
  RETURN L_CURSOR;
END;
/

-- Function: CHECK_ENROLLMENT
CREATE OR REPLACE FUNCTION EDUX.CHECK_ENROLLMENT (STU_ID IN NUMBER, COURSE_ID IN NUMBER) 
RETURN NUMBER AS
  L_COUNT NUMBER;
BEGIN
  SELECT COUNT(*) INTO L_COUNT FROM EDUX."Enrolls" WHERE "s_id" = STU_ID AND "c_id" = COURSE_ID;
  RETURN L_COUNT;
END;
/

-- Procedure: CHECK_ACCESS
CREATE OR REPLACE PROCEDURE EDUX.CHECK_ACCESS (STU_ID IN NUMBER, COURSE_ID IN NUMBER, TOPIC_SERIAL IN NUMBER, RES OUT NUMBER)
AS
  L_PROGRESS NUMBER;
  L_SERIAL NUMBER;
  L_WEIGHT NUMBER;
  TOTAL_WEIGHT NUMBER;
BEGIN
  SELECT "progress" INTO L_PROGRESS FROM EDUX."Enrolls" WHERE "s_id" = STU_ID AND "c_id" = COURSE_ID;

  IF TOPIC_SERIAL = 1 THEN
    RES := 1;
  ELSE
    SELECT SUM("weight") INTO TOTAL_WEIGHT FROM EDUX."Topics" WHERE "c_id" = COURSE_ID AND "serial" < TOPIC_SERIAL;
    IF L_PROGRESS >= TOTAL_WEIGHT THEN
      RES := 1;
    ELSE
      RES := 0;
    END IF;
  END IF;
END;
/

-- Procedure: CHECK_USER
-- Updated to return user data for bcrypt verification in application layer
CREATE OR REPLACE PROCEDURE EDUX.CHECK_USER (IN_EMAIL IN VARCHAR2, OUT_CURSOR OUT SYS_REFCURSOR)
AS
BEGIN
  OPEN OUT_CURSOR FOR 
    SELECT u."u_id", u."name", u."email", u."password", u."reg_date", s."s_id", i."i_id"
    FROM EDUX."Users" u
    LEFT JOIN EDUX."Students" s ON u."u_id" = s."s_id"
    LEFT JOIN EDUX."Instructors" i ON u."u_id" = i."i_id"
    WHERE u."email" = IN_EMAIL;
END;
/

-- Function: CREATE_INSTRUCTOR
-- Now accepts pre-hashed password from application
CREATE OR REPLACE FUNCTION EDUX.CREATE_INSTRUCTOR (IN_NAME IN VARCHAR2, IN_EMAIL IN VARCHAR2, IN_PASSWORD IN VARCHAR2, IN_SUBJECT IN VARCHAR2) 
RETURN NUMBER AS
  L_ID NUMBER;
BEGIN
  INSERT INTO EDUX."Users"("name", "email", "password") VALUES (IN_NAME, IN_EMAIL, IN_PASSWORD) RETURNING "u_id" INTO L_ID;
  INSERT INTO EDUX."Instructors"("i_id", "subject") VALUES (L_ID, IN_SUBJECT);
  COMMIT;
  RETURN L_ID;
END;
/

-- Function: CREATE_USER
-- Now accepts pre-hashed password from application
CREATE OR REPLACE FUNCTION EDUX.CREATE_USER (IN_NAME IN VARCHAR2, IN_EMAIL IN VARCHAR2, IN_PASSWORD IN VARCHAR2) 
RETURN NUMBER AS
  L_ID NUMBER;
BEGIN
  INSERT INTO EDUX."Users"("name", "email", "password") VALUES (IN_NAME, IN_EMAIL, IN_PASSWORD) RETURNING "u_id" INTO L_ID;
  INSERT INTO EDUX."Students"("s_id") VALUES (L_ID);
  COMMIT;
  RETURN L_ID;
END;
/

-- Function: ENROLL_INTO_COURSE
CREATE OR REPLACE FUNCTION EDUX.ENROLL_INTO_COURSE (STU_ID IN NUMBER, COURSE_ID IN NUMBER) 
RETURN NUMBER AS
  L_COUNT NUMBER;
  L_SEAT NUMBER;
BEGIN
  SELECT "seat" INTO L_SEAT FROM EDUX."Courses" WHERE "c_id" = COURSE_ID;
  SELECT "student_count" INTO L_COUNT FROM EDUX."Courses" WHERE "c_id" = COURSE_ID;
  
  IF L_SEAT IS NULL OR L_COUNT < L_SEAT THEN
    INSERT INTO EDUX."Enrolls"("s_id", "c_id") VALUES (STU_ID, COURSE_ID);
    COMMIT;
    RETURN 1;
  ELSE
    RETURN 0;
  END IF;
END;
/

-- Procedure: RATING_CHANGE
-- Note: No COMMIT here as it may be called from triggers
CREATE OR REPLACE PROCEDURE EDUX.RATING_CHANGE (COURSE_ID IN NUMBER)
AS
  L_AVG_RATING NUMBER;
BEGIN
  SELECT AVG("rating") INTO L_AVG_RATING FROM EDUX."Feedbacks" WHERE "c_id" = COURSE_ID;
  UPDATE EDUX."Courses" SET "rating" = L_AVG_RATING WHERE "c_id" = COURSE_ID;
  -- COMMIT removed - will be committed by the calling transaction
END;
/

-- Function: REMOVE_FROM_WISHLIST
CREATE OR REPLACE FUNCTION EDUX.REMOVE_FROM_WISHLIST (ID IN NUMBER, COURSE_ID IN NUMBER) 
RETURN SYS_REFCURSOR AS
  L_CURSOR SYS_REFCURSOR;
BEGIN
  DELETE FROM EDUX."Wishlist" WHERE "u_id" = ID AND "c_id" = COURSE_ID;
  COMMIT;
  OPEN L_CURSOR FOR SELECT * FROM EDUX."Wishlist" WHERE "u_id" = ID;
  RETURN L_CURSOR;
END;
/

-- Procedure: SECURE_EXAM
CREATE OR REPLACE PROCEDURE EDUX.SECURE_EXAM (STU_ID IN NUMBER, EXAM_ID IN NUMBER, OUT_CURSOR OUT SYS_REFCURSOR)
AS
  L_STATUS VARCHAR2(10);
BEGIN
  SELECT "status" INTO L_STATUS FROM EDUX."Takes" WHERE "s_id" = STU_ID AND "e_id" = EXAM_ID;
  IF L_STATUS = 'completed' THEN
    OPEN OUT_CURSOR FOR SELECT 'already_completed' AS status FROM DUAL;
  ELSE
    OPEN OUT_CURSOR FOR SELECT q.* FROM EDUX."Questions" q WHERE q."e_id" = EXAM_ID ORDER BY q."serial";
  END IF;
EXCEPTION
  WHEN NO_DATA_FOUND THEN
    INSERT INTO EDUX."Takes"("s_id", "e_id", "status") VALUES (STU_ID, EXAM_ID, 'started');
    COMMIT;
    OPEN OUT_CURSOR FOR SELECT q.* FROM EDUX."Questions" q WHERE q."e_id" = EXAM_ID ORDER BY q."serial";
END;
/

-- Procedure: SECURE_WATCH
CREATE OR REPLACE PROCEDURE EDUX.SECURE_WATCH (STU_ID IN NUMBER, LECTURE_ID IN NUMBER, OUT_CURSOR OUT SYS_REFCURSOR)
AS
  L_COUNT NUMBER;
BEGIN
  SELECT COUNT(*) INTO L_COUNT FROM EDUX."Watches" WHERE "s_id" = STU_ID AND "l_id" = LECTURE_ID;
  IF L_COUNT = 0 THEN
    INSERT INTO EDUX."Watches"("s_id", "l_id", "w_date") VALUES (STU_ID, LECTURE_ID, SYSDATE);
    COMMIT;
  END IF;
  OPEN OUT_CURSOR FOR SELECT l.* FROM EDUX."Lectures" l WHERE l."l_id" = LECTURE_ID;
END;
/

-- Function: TOPIC_PROGRESS
CREATE OR REPLACE FUNCTION EDUX.TOPIC_PROGRESS (STU_ID IN NUMBER, TOPIC_ID IN NUMBER) 
RETURN NUMBER AS
  L_TOTAL_WEIGHT NUMBER := 0;
  L_COMPLETED_WEIGHT NUMBER := 0;
  L_COUNT NUMBER;
BEGIN
  -- Calculate total weight from lectures
  SELECT NVL(SUM("weight"), 0) INTO L_TOTAL_WEIGHT FROM EDUX."Lectures" WHERE "t_id" = TOPIC_ID;
  
  -- Calculate total weight from exams
  SELECT NVL(SUM("weight"), 0) + L_TOTAL_WEIGHT INTO L_TOTAL_WEIGHT FROM EDUX."Exams" WHERE "t_id" = TOPIC_ID;
  
  -- Calculate completed weight from watched lectures
  SELECT NVL(SUM(l."weight"), 0) INTO L_COMPLETED_WEIGHT 
  FROM EDUX."Lectures" l
  JOIN EDUX."Watches" w ON l."l_id" = w."l_id"
  WHERE l."t_id" = TOPIC_ID AND w."s_id" = STU_ID;
  
  -- Calculate completed weight from taken exams
  SELECT NVL(SUM(e."weight"), 0) + L_COMPLETED_WEIGHT INTO L_COMPLETED_WEIGHT 
  FROM EDUX."Exams" e
  JOIN EDUX."Takes" t ON e."e_id" = t."e_id"
  WHERE e."t_id" = TOPIC_ID AND t."s_id" = STU_ID AND t."status" = 'completed';
  
  IF L_TOTAL_WEIGHT = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((L_COMPLETED_WEIGHT / L_TOTAL_WEIGHT) * 100);
END;
/

-- Procedure: USER_COURSES
CREATE OR REPLACE PROCEDURE EDUX.USER_COURSES (STU_ID IN NUMBER, OUT_CURSOR OUT SYS_REFCURSOR)
AS
BEGIN
  OPEN OUT_CURSOR FOR 
    SELECT c.*, e."progress", e."grade", u."name" AS instructor_name
    FROM EDUX."Courses" c
    JOIN EDUX."Enrolls" e ON c."c_id" = e."c_id"
    JOIN EDUX."Instructors" i ON c."i_id" = i."i_id"
    JOIN EDUX."Users" u ON i."i_id" = u."u_id"
    WHERE e."s_id" = STU_ID
    ORDER BY e."date" DESC;
END;
/

-- Procedure: USER_COURSE_CONTENT
CREATE OR REPLACE PROCEDURE EDUX.USER_COURSE_CONTENT (STU_ID IN NUMBER, COURSE_ID IN NUMBER, OUT_CURSOR OUT SYS_REFCURSOR)
AS
BEGIN
  OPEN OUT_CURSOR FOR 
    SELECT t."t_id", t."name" AS topic_name, t."serial" AS topic_serial, t."weight" AS topic_weight,
           l."l_id", l."description" AS lecture_description, l."video", l."weight" AS lecture_weight, l."serial" AS lecture_serial,
           e."e_id", e."question_count", e."marks", e."duration", e."weight" AS exam_weight,
           CASE WHEN w."s_id" IS NOT NULL THEN 1 ELSE 0 END AS lecture_watched,
           tk."status" AS exam_status, tk."marks" AS exam_marks
    FROM EDUX."Topics" t
    LEFT JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
    LEFT JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
    LEFT JOIN EDUX."Watches" w ON l."l_id" = w."l_id" AND w."s_id" = STU_ID
    LEFT JOIN EDUX."Takes" tk ON e."e_id" = tk."e_id" AND tk."s_id" = STU_ID
    WHERE t."c_id" = COURSE_ID
    ORDER BY t."serial", l."serial";
END;
/

COMMIT;
