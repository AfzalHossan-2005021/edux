-- EDUX Functions and Procedures

-- Make sure we are in the correct PDB
ALTER SESSION SET CONTAINER = EDUX;

-- Package: RECALC_CTRL (prevents recursive trigger calls)
CREATE OR REPLACE PACKAGE EDUX.RECALC_CTRL IS
  g_locked_exams BOOLEAN := FALSE;
  g_locked_lectures BOOLEAN := FALSE;
END RECALC_CTRL;
/

CREATE OR REPLACE PACKAGE BODY EDUX.RECALC_CTRL IS
BEGIN
  g_locked_exams := FALSE;
  g_locked_lectures := FALSE;
END RECALC_CTRL;
/

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

-- Procedure to recalculate exam weights for a course
-- Ensures the sum of exam weights == (100 - lecture_weight)
CREATE OR REPLACE PROCEDURE EDUX.RECALC_EXAM_WEIGHTS(p_c_id IN NUMBER) IS
  v_total_marks     NUMBER := 0;
  v_remaining_wt    NUMBER := 0;
  v_lecture_wt      NUMBER := 0;
  v_sum_assigned    NUMBER := 0;
  v_cnt             NUMBER := 0;
  v_idx             NUMBER := 0;
  l_eid             NUMBER;
  l_marks           NUMBER;
  CURSOR c_exams IS
    SELECT e."e_id" AS e_id, NVL(e."marks",0) AS marks
      FROM EDUX."Exams" e
      JOIN EDUX."Topics" t ON e."t_id" = t."t_id"
     WHERE t."c_id" = p_c_id
     ORDER BY e."e_id";
  v_rec c_exams%ROWTYPE;
BEGIN
  -- Prevent recursive recalculation
  IF p_c_id IS NULL THEN
    RETURN;
  END IF;

  IF EDUX.RECALC_CTRL.g_locked_exams THEN
    RETURN;
  END IF;

  EDUX.RECALC_CTRL.g_locked_exams := TRUE;

  BEGIN
    BEGIN
      SELECT "lecture_weight" INTO v_lecture_wt FROM EDUX."Courses" WHERE "c_id" = p_c_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      v_lecture_wt := 0;
    END;

    v_remaining_wt := GREATEST(0, 100 - NVL(v_lecture_wt, 0));

    SELECT NVL(SUM(e."marks"),0) INTO v_total_marks
      FROM EDUX."Exams" e
      JOIN EDUX."Topics" t ON e."t_id" = t."t_id"
     WHERE t."c_id" = p_c_id;

    -- Count exams for fallbacks / equal distribution
    SELECT COUNT(*) INTO v_cnt
      FROM EDUX."Exams" e
      JOIN EDUX."Topics" t ON e."t_id" = t."t_id"
     WHERE t."c_id" = p_c_id;

    IF v_cnt = 0 THEN
      -- nothing to do
      NULL;
    ELSIF v_total_marks = 0 THEN
      -- No marks but there are exams: distribute remaining weight equally
      v_idx := 0;
      v_sum_assigned := 0;
      OPEN c_exams;
      LOOP
        FETCH c_exams INTO v_rec;
        EXIT WHEN c_exams%NOTFOUND;
        v_idx := v_idx + 1;

        IF v_idx < v_cnt THEN
          UPDATE EDUX."Exams"
             SET "weight" = TRUNC(v_remaining_wt / v_cnt, 6)
           WHERE "e_id" = v_rec.e_id
             AND NVL("weight",0) <> TRUNC(v_remaining_wt / v_cnt, 6);
          v_sum_assigned := v_sum_assigned + TRUNC(v_remaining_wt / v_cnt, 6);
        ELSE
          UPDATE EDUX."Exams"
             SET "weight" = (v_remaining_wt - v_sum_assigned)
           WHERE "e_id" = v_rec.e_id
             AND NVL("weight",0) <> (v_remaining_wt - v_sum_assigned);
        END IF;
      END LOOP;
      CLOSE c_exams;
    ELSE
      -- Distribute remaining weight proportionally by marks (truncate for all but last)
      v_idx := 0;
      v_sum_assigned := 0;
      OPEN c_exams;
      LOOP
        FETCH c_exams INTO v_rec;
        EXIT WHEN c_exams%NOTFOUND;
        v_idx := v_idx + 1;

        IF v_idx < v_cnt THEN
          -- use TRUNC to avoid overshooting total; keep 6 decimal places
          UPDATE EDUX."Exams"
             SET "weight" = TRUNC((v_remaining_wt * v_rec.marks) / v_total_marks, 6)
           WHERE "e_id" = v_rec.e_id
             AND NVL("weight",0) <> TRUNC((v_remaining_wt * v_rec.marks) / v_total_marks, 6);

          v_sum_assigned := v_sum_assigned + TRUNC((v_remaining_wt * v_rec.marks) / v_total_marks, 6);
        ELSE
          -- last exam gets the remainder to ensure exact sum
          UPDATE EDUX."Exams"
             SET "weight" = (v_remaining_wt - v_sum_assigned)
           WHERE "e_id" = v_rec.e_id
             AND NVL("weight",0) <> (v_remaining_wt - v_sum_assigned);
        END IF;
      END LOOP;
      CLOSE c_exams;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- ensure lock is released on error
    EDUX.RECALC_CTRL.g_locked_exams := FALSE;
    RAISE;
  END;

  -- release lock
  EDUX.RECALC_CTRL.g_locked_exams := FALSE;
END RECALC_EXAM_WEIGHTS;
/

-- Procedure: RECALC_LECTURE_WEIGHTS
-- Ensures sum of lecture weights == course.lecture_weight distributed by lecture duration
CREATE OR REPLACE PROCEDURE EDUX.RECALC_LECTURE_WEIGHTS(p_c_id IN NUMBER) IS
  v_total_duration NUMBER := 0;
  v_target_wt      NUMBER := 0;
  v_cnt            NUMBER := 0;
  v_idx            NUMBER := 0;
  v_sum_assigned   NUMBER := 0;
  CURSOR c_lect IS
    SELECT l."l_id" AS l_id, NVL(l."duration",0) AS duration
      FROM EDUX."Lectures" l
      JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
     WHERE t."c_id" = p_c_id
     ORDER BY l."l_id";
  v_rec c_lect%ROWTYPE;
BEGIN
  IF p_c_id IS NULL THEN
    RETURN;
  END IF;

  IF EDUX.RECALC_CTRL.g_locked_lectures THEN
    RETURN;
  END IF;

  EDUX.RECALC_CTRL.g_locked_lectures := TRUE;

  BEGIN
    BEGIN
      SELECT "lecture_weight" INTO v_target_wt FROM EDUX."Courses" WHERE "c_id" = p_c_id;
    EXCEPTION WHEN NO_DATA_FOUND THEN
      v_target_wt := 0;
    END;

    SELECT NVL(SUM(NVL(l."duration",0)),0) INTO v_total_duration
      FROM EDUX."Lectures" l
      JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
     WHERE t."c_id" = p_c_id;

    SELECT COUNT(*) INTO v_cnt
      FROM EDUX."Lectures" l
      JOIN EDUX."Topics" t ON l."t_id" = t."t_id"
     WHERE t."c_id" = p_c_id;

    IF v_cnt = 0 THEN
      NULL; -- nothing to do
    ELSIF v_total_duration = 0 THEN
      -- Equal distribution
      v_idx := 0;
      v_sum_assigned := 0;
      OPEN c_lect;
      LOOP
        FETCH c_lect INTO v_rec;
        EXIT WHEN c_lect%NOTFOUND;
        v_idx := v_idx + 1;
        IF v_idx < v_cnt THEN
          UPDATE EDUX."Lectures"
             SET "weight" = TRUNC(v_target_wt / v_cnt, 6)
           WHERE "l_id" = v_rec.l_id
             AND NVL("weight",0) <> TRUNC(v_target_wt / v_cnt, 6);
          v_sum_assigned := v_sum_assigned + TRUNC(v_target_wt / v_cnt, 6);
        ELSE
          UPDATE EDUX."Lectures"
             SET "weight" = (v_target_wt - v_sum_assigned)
           WHERE "l_id" = v_rec.l_id
             AND NVL("weight",0) <> (v_target_wt - v_sum_assigned);
        END IF;
      END LOOP;
      CLOSE c_lect;
    ELSE
      -- Proportional distribution by duration
      v_idx := 0;
      v_sum_assigned := 0;
      OPEN c_lect;
      LOOP
        FETCH c_lect INTO v_rec;
        EXIT WHEN c_lect%NOTFOUND;
        v_idx := v_idx + 1;
        IF v_idx < v_cnt THEN
          UPDATE EDUX."Lectures"
             SET "weight" = TRUNC((v_target_wt * v_rec.duration) / v_total_duration, 6)
           WHERE "l_id" = v_rec.l_id
             AND NVL("weight",0) <> TRUNC((v_target_wt * v_rec.duration) / v_total_duration, 6);
          v_sum_assigned := v_sum_assigned + TRUNC((v_target_wt * v_rec.duration) / v_total_duration, 6);
        ELSE
          UPDATE EDUX."Lectures"
             SET "weight" = (v_target_wt - v_sum_assigned)
           WHERE "l_id" = v_rec.l_id
             AND NVL("weight",0) <> (v_target_wt - v_sum_assigned);
        END IF;
      END LOOP;
      CLOSE c_lect;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    EDUX.RECALC_CTRL.g_locked_lectures := FALSE;
    RAISE;
  END;

  EDUX.RECALC_CTRL.g_locked_lectures := FALSE;
END RECALC_LECTURE_WEIGHTS;
/

COMMIT;
