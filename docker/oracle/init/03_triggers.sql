-- EDUX Triggers

-- Make sure we are in the correct PDB
ALTER SESSION SET CONTAINER = EDUX;

--------------------------------------------------
-- ROLE VALIDATION TRIGGERS
--------------------------------------------------

-- Student Role Check
CREATE OR REPLACE TRIGGER trg_student_role
BEFORE INSERT ON EDUX."Students"
FOR EACH ROW
DECLARE
  v_dummy NUMBER;
BEGIN
  SELECT 1
  INTO v_dummy
  FROM EDUX."Users"
  WHERE "u_id" = :NEW."s_id"
    AND "role" = 'student';

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20001, 'User role must be student');
END;
/


-- Instructor Role Check
CREATE OR REPLACE TRIGGER trg_instructor_role
BEFORE INSERT ON EDUX."Instructors"
FOR EACH ROW
DECLARE
  v_dummy NUMBER;
BEGIN
  SELECT 1
  INTO v_dummy
  FROM EDUX."Users"
  WHERE "u_id" = :NEW."i_id"
    AND "role" = 'instructor';

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20002, 'User role must be instructor');
END;
/

-- Admin Role Check
CREATE OR REPLACE TRIGGER trg_admin_role
BEFORE INSERT ON EDUX."Admins"
FOR EACH ROW
DECLARE
  v_dummy NUMBER;
BEGIN
  SELECT 1
  INTO v_dummy
  FROM EDUX."Users"
  WHERE "u_id" = :NEW."a_id"
    AND "role" = 'admin';

EXCEPTION
  WHEN NO_DATA_FOUND THEN
    RAISE_APPLICATION_ERROR(-20003, 'User role must be admin');
END;
/

-- Trigger: ENROLL_CONTROL - Controls enrollment limits
CREATE OR REPLACE TRIGGER EDUX.ENROLL_CONTROL
BEFORE INSERT ON EDUX."Enrolls"
FOR EACH ROW
DECLARE
  L_SEAT NUMBER;
  L_COUNT NUMBER;
BEGIN
  SELECT "seat", "student_count" INTO L_SEAT, L_COUNT FROM EDUX."Courses" WHERE "c_id" = :NEW."c_id";
  IF L_SEAT IS NOT NULL AND L_COUNT >= L_SEAT THEN
    RAISE_APPLICATION_ERROR(-20001, 'Course is full');
  END IF;
END;
/

-- Trigger: INCREASE_ENROLL - Updates student count when enrolled
CREATE OR REPLACE TRIGGER EDUX.INCREASE_ENROLL
AFTER INSERT ON EDUX."Enrolls"
FOR EACH ROW
BEGIN
  UPDATE EDUX."Courses" SET "student_count" = "student_count" + 1 WHERE "c_id" = :NEW."c_id";
  UPDATE EDUX."Students" SET "course_count" = "course_count" + 1 WHERE "s_id" = :NEW."s_id";
END;
/

-- Trigger: CHECK_FEEDBACK - Updates course rating after feedback
-- Using compound trigger to avoid mutating table error
CREATE OR REPLACE TRIGGER EDUX.CHECK_FEEDBACK
FOR INSERT OR UPDATE ON EDUX."Feedbacks"
COMPOUND TRIGGER
  TYPE t_course_ids IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
  g_course_ids t_course_ids;
  g_index PLS_INTEGER := 0;
  
AFTER EACH ROW IS
BEGIN
  g_index := g_index + 1;
  g_course_ids(g_index) := :NEW."c_id";
END AFTER EACH ROW;

AFTER STATEMENT IS
  l_course_id NUMBER;
BEGIN
  FOR i IN 1..g_index LOOP
    l_course_id := g_course_ids(i);
    EDUX.RATING_CHANGE(l_course_id);
  END LOOP;
END AFTER STATEMENT;
END CHECK_FEEDBACK;
/

-- Trigger: EXAM_PROGRESS - Updates progress after exam completion
CREATE OR REPLACE TRIGGER EDUX.EXAM_PROGRESS
AFTER UPDATE ON EDUX."Takes"
FOR EACH ROW
DECLARE
  L_COURSE_ID NUMBER;
  L_TOPIC_WEIGHT NUMBER;
  L_EXAM_WEIGHT NUMBER;
BEGIN
  IF :NEW."status" = 'completed' AND (:OLD."status" IS NULL OR :OLD."status" != 'completed') THEN
    SELECT t."c_id", t."weight", e."weight" INTO L_COURSE_ID, L_TOPIC_WEIGHT, L_EXAM_WEIGHT
    FROM EDUX."Topics" t
    JOIN EDUX."Exams" e ON t."t_id" = e."t_id"
    WHERE e."e_id" = :NEW."e_id";
    
    UPDATE EDUX."Enrolls" 
    SET "progress" = "progress" + NVL(L_EXAM_WEIGHT, 0)
    WHERE "s_id" = :NEW."s_id" AND "c_id" = L_COURSE_ID;
  END IF;
END;
/

-- Trigger: LECTURE_PROGRESS - Updates progress after watching lecture
CREATE OR REPLACE TRIGGER EDUX.LECTURE_PROGRESS
AFTER INSERT ON EDUX."Watches"
FOR EACH ROW
DECLARE
  L_COURSE_ID NUMBER;
  L_LECTURE_WEIGHT NUMBER;
BEGIN
  SELECT t."c_id", l."weight" INTO L_COURSE_ID, L_LECTURE_WEIGHT
  FROM EDUX."Topics" t
  JOIN EDUX."Lectures" l ON t."t_id" = l."t_id"
  WHERE l."l_id" = :NEW."l_id";
  
  UPDATE EDUX."Enrolls" 
  SET "progress" = "progress" + NVL(L_LECTURE_WEIGHT, 0)
  WHERE "s_id" = :NEW."s_id" AND "c_id" = L_COURSE_ID;
END;
/

-- Trigger: QUESTIONS_CHANGE - Update exam's question_count and marks on insert/delete
CREATE OR REPLACE TRIGGER EDUX.QUESTION_INSERT
AFTER INSERT ON EDUX."Questions"
FOR EACH ROW
BEGIN
  UPDATE EDUX."Exams"
  SET "question_count" = NVL("question_count",0) + 1,
      "marks" = NVL("marks",0) + NVL(:NEW."marks",0)
  WHERE "e_id" = :NEW."e_id";
END;
/

CREATE OR REPLACE TRIGGER EDUX.QUESTION_DELETE
AFTER DELETE ON EDUX."Questions"
FOR EACH ROW
BEGIN
  UPDATE EDUX."Exams"
  SET "question_count" = GREATEST(NVL("question_count",0) - 1, 0),
      "marks" = GREATEST(NVL("marks",0) - NVL(:OLD."marks",0), 0)
  WHERE "e_id" = :OLD."e_id";
END;
/

CREATE OR REPLACE TRIGGER EDUX.QUESTION_UPDATE
AFTER UPDATE OF "marks" ON EDUX."Questions"
FOR EACH ROW
BEGIN
  UPDATE EDUX."Exams"
  SET "marks" = NVL("marks",0) - NVL(:OLD."marks",0) + NVL(:NEW."marks",0)
  WHERE "e_id" = :NEW."e_id";
END;
/

COMMIT;
