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
AFTER INSERT OR UPDATE OF "status" ON EDUX."Takes"
FOR EACH ROW
DECLARE
  L_COURSE_ID   NUMBER;
  L_EXAM_WEIGHT NUMBER;
BEGIN
  -- Only when status changes to 'p'
  IF :NEW."status" = 'p'
     AND NVL(:OLD."status", 'x') <> 'p' THEN

    BEGIN
      SELECT t."c_id", e."weight"
      INTO   L_COURSE_ID, L_EXAM_WEIGHT
      FROM   EDUX."Topics" t
      JOIN   EDUX."Exams"  e ON e."t_id" = t."t_id"
      WHERE  e."e_id" = :NEW."e_id";
    EXCEPTION
      WHEN NO_DATA_FOUND THEN
        -- silently ignore inconsistent data
        RETURN;
    END;

    UPDATE EDUX."Enrolls"
    SET "progress" =
        LEAST(100, NVL("progress", 0) + NVL(L_EXAM_WEIGHT, 0))
    WHERE "s_id" = :NEW."s_id"
      AND "c_id" = L_COURSE_ID;
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

-- Trigger: QUESTIONS_CHANGE - Recompute exam's question_count and marks safely using a compound trigger to avoid mutating-table errors
CREATE OR REPLACE TRIGGER EDUX.QUESTIONS_CHANGE
FOR INSERT OR DELETE OR UPDATE OF "marks", "e_id" ON EDUX."Questions"
COMPOUND TRIGGER
  -- Use nested tables to collect affected e_ids and deduplicate in AFTER STATEMENT
  TYPE t_eids IS TABLE OF NUMBER;
  g_eids t_eids := t_eids();

AFTER EACH ROW IS
BEGIN
  IF INSERTING THEN
    g_eids.EXTEND; g_eids(g_eids.COUNT) := :NEW."e_id";
  ELSIF DELETING THEN
    g_eids.EXTEND; g_eids(g_eids.COUNT) := :OLD."e_id";
  ELSIF UPDATING THEN
    g_eids.EXTEND; g_eids(g_eids.COUNT) := :NEW."e_id";
    IF :OLD."e_id" IS NOT NULL AND :OLD."e_id" != :NEW."e_id" THEN
      g_eids.EXTEND; g_eids(g_eids.COUNT) := :OLD."e_id";
    END IF;
  END IF;
END AFTER EACH ROW;

AFTER STATEMENT IS
  l_eid NUMBER;
  distinct_eids t_eids := t_eids();
  found BOOLEAN;
BEGIN
  IF g_eids.COUNT > 0 THEN
    -- deduplicate into distinct_eids
    FOR i IN 1..g_eids.COUNT LOOP
      l_eid := g_eids(i);
      found := FALSE;
      FOR j IN 1..distinct_eids.COUNT LOOP
        IF distinct_eids(j) = l_eid THEN
          found := TRUE;
          EXIT;
        END IF;
      END LOOP;
      IF NOT found THEN
        distinct_eids.EXTEND; distinct_eids(distinct_eids.COUNT) := l_eid;
      END IF;
    END LOOP;

    -- update exams for each distinct eid
    FOR i IN 1..distinct_eids.COUNT LOOP
      l_eid := distinct_eids(i);
      UPDATE EDUX."Exams"
      SET "question_count" = NVL((SELECT COUNT(*) FROM EDUX."Questions" q WHERE q."e_id" = l_eid), 0),
          "marks" = NVL((SELECT SUM(NVL(q."marks",0)) FROM EDUX."Questions" q WHERE q."e_id" = l_eid), 0)
      WHERE "e_id" = l_eid;
    END LOOP;

    -- collect affected course ids and recalculate exam weights
    DECLARE
      TYPE t_cids IS TABLE OF NUMBER INDEX BY PLS_INTEGER;
      distinct_cids t_cids;
      l_cid NUMBER;
      cid_found BOOLEAN;
      cid_idx PLS_INTEGER := 0;
    BEGIN
      FOR i IN 1..distinct_eids.COUNT LOOP
        l_eid := distinct_eids(i);
        BEGIN
          SELECT t."c_id" INTO l_cid FROM EDUX."Exams" e JOIN EDUX."Topics" t ON e."t_id" = t."t_id" WHERE e."e_id" = l_eid;
        EXCEPTION WHEN NO_DATA_FOUND THEN l_cid := NULL;
        END;
        IF l_cid IS NOT NULL THEN
          cid_found := FALSE;
          FOR j IN 1..cid_idx LOOP
            IF distinct_cids(j) = l_cid THEN
              cid_found := TRUE; EXIT;
            END IF;
          END LOOP;
          IF NOT cid_found THEN
            cid_idx := cid_idx + 1;
            distinct_cids(cid_idx) := l_cid;
          END IF;
        END IF;
      END LOOP;

      FOR j IN 1..cid_idx LOOP
        IF NOT EDUX.RECALC_CTRL.g_locked_exams THEN
          RECALC_EXAM_WEIGHTS(distinct_cids(j));
        END IF;
      END LOOP;
    END;

    -- clear collections
    g_eids.DELETE; distinct_eids.DELETE;
  END IF;
END AFTER STATEMENT;
END QUESTIONS_CHANGE;
/

-- Compound trigger on Exams to collect affected course(s) and run the recalculation once per statement
CREATE OR REPLACE TRIGGER EDUX.TRG_RECALC_EXAM_WEIGHTS
FOR INSERT OR UPDATE OR DELETE ON EDUX."Exams"
COMPOUND TRIGGER
  TYPE num_tab IS TABLE OF NUMBER;
  affected_cids num_tab := num_tab();

  -- helper to add unique course id
  PROCEDURE add_cid(p_cid NUMBER) IS
    v_found BOOLEAN := FALSE;
  BEGIN
    IF p_cid IS NULL THEN
      RETURN;
    END IF;
    FOR i IN 1..affected_cids.COUNT LOOP
      IF affected_cids(i) = p_cid THEN
        v_found := TRUE;
        EXIT;
      END IF;
    END LOOP;
    IF NOT v_found THEN
      affected_cids.EXTEND;
      affected_cids(affected_cids.COUNT) := p_cid;
    END IF;
  END add_cid;

  -- helper to get course id from topic (called in row-level section)
  FUNCTION get_cid_from_topic(p_tid NUMBER) RETURN NUMBER IS
    v_cid NUMBER;
  BEGIN
    IF p_tid IS NULL THEN
      RETURN NULL;
    END IF;
    SELECT "c_id" INTO v_cid FROM EDUX."Topics" WHERE "t_id" = p_tid;
    RETURN v_cid;
  EXCEPTION WHEN NO_DATA_FOUND THEN
    RETURN NULL;
  WHEN OTHERS THEN
    -- Handle mutating table error - topic is being deleted
    IF SQLCODE = -4091 THEN
      RETURN NULL;
    END IF;
    RAISE;
  END get_cid_from_topic;

  AFTER EACH ROW IS
    v_cid NUMBER;
  BEGIN
    IF INSERTING THEN
      v_cid := get_cid_from_topic(:NEW."t_id");
      add_cid(v_cid);
    ELSIF DELETING THEN
      v_cid := get_cid_from_topic(:OLD."t_id");
      add_cid(v_cid);
    ELSIF UPDATING THEN
      v_cid := get_cid_from_topic(:NEW."t_id");
      add_cid(v_cid);
      IF :OLD."t_id" IS NOT NULL AND :OLD."t_id" != :NEW."t_id" THEN
        v_cid := get_cid_from_topic(:OLD."t_id");
        add_cid(v_cid);
      END IF;
    END IF;
  END AFTER EACH ROW;

  AFTER STATEMENT IS
  BEGIN
    -- Directly call recalc for each affected course
    FOR i IN 1..affected_cids.COUNT LOOP
      BEGIN
        IF NOT EDUX.RECALC_CTRL.g_locked_exams THEN
          EDUX.RECALC_EXAM_WEIGHTS(affected_cids(i));
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;

    affected_cids := num_tab();
  END AFTER STATEMENT;
END TRG_RECALC_EXAM_WEIGHTS;
/

-- Trigger on Courses to recalculate exam/lecture weights when lecture_weight changes
-- Uses compound trigger to avoid mutating table error
CREATE OR REPLACE TRIGGER EDUX.TRG_RECALC_ON_COURSE_LECTURE_WEIGHT
FOR UPDATE OF "lecture_weight" ON EDUX."Courses"
COMPOUND TRIGGER
  TYPE num_tab IS TABLE OF NUMBER;
  affected_cids num_tab := num_tab();

  PROCEDURE add_cid(p_cid NUMBER) IS
    v_found BOOLEAN := FALSE;
  BEGIN
    IF p_cid IS NULL THEN
      RETURN;
    END IF;
    FOR i IN 1..affected_cids.COUNT LOOP
      IF affected_cids(i) = p_cid THEN
        v_found := TRUE; EXIT;
      END IF;
    END LOOP;
    IF NOT v_found THEN
      affected_cids.EXTEND; affected_cids(affected_cids.COUNT) := p_cid;
    END IF;
  END add_cid;

  AFTER EACH ROW IS
  BEGIN
    add_cid(:NEW."c_id");
  END AFTER EACH ROW;

  AFTER STATEMENT IS
  BEGIN
    FOR i IN 1..affected_cids.COUNT LOOP
      BEGIN
        IF NOT EDUX.RECALC_CTRL.g_locked_exams THEN
          EDUX.RECALC_EXAM_WEIGHTS(affected_cids(i));
        END IF;
        IF NOT EDUX.RECALC_CTRL.g_locked_lectures THEN
          EDUX.RECALC_LECTURE_WEIGHTS(affected_cids(i));
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;
    affected_cids := num_tab();
  END AFTER STATEMENT;
END TRG_RECALC_ON_COURSE_LECTURE_WEIGHT;
/

-- Compound trigger on Lectures to collect affected course(s) and run the recalculation once per statement
CREATE OR REPLACE TRIGGER EDUX.TRG_RECALC_LECTURE_WEIGHTS
FOR INSERT OR UPDATE OR DELETE ON EDUX."Lectures"
COMPOUND TRIGGER
  TYPE num_tab IS TABLE OF NUMBER;
  affected_cids num_tab := num_tab();

  -- helper to add unique course id
  PROCEDURE add_cid(p_cid NUMBER) IS
    v_found BOOLEAN := FALSE;
  BEGIN
    IF p_cid IS NULL THEN
      RETURN;
    END IF;
    FOR i IN 1..affected_cids.COUNT LOOP
      IF affected_cids(i) = p_cid THEN
        v_found := TRUE;
        EXIT;
      END IF;
    END LOOP;
    IF NOT v_found THEN
      affected_cids.EXTEND;
      affected_cids(affected_cids.COUNT) := p_cid;
    END IF;
  END add_cid;

  -- helper to get course id from topic (called in row-level section)
  FUNCTION get_cid_from_topic(p_tid NUMBER) RETURN NUMBER IS
    v_cid NUMBER;
  BEGIN
    IF p_tid IS NULL THEN
      RETURN NULL;
    END IF;
    SELECT "c_id" INTO v_cid FROM EDUX."Topics" WHERE "t_id" = p_tid;
    RETURN v_cid;
  EXCEPTION WHEN NO_DATA_FOUND THEN
    RETURN NULL;
  WHEN OTHERS THEN
    -- Handle mutating table error - topic is being deleted
    IF SQLCODE = -4091 THEN
      RETURN NULL;
    END IF;
    RAISE;
  END get_cid_from_topic;

  AFTER EACH ROW IS
    v_cid NUMBER;
  BEGIN
    IF INSERTING THEN
      v_cid := get_cid_from_topic(:NEW."t_id");
      add_cid(v_cid);
    ELSIF DELETING THEN
      v_cid := get_cid_from_topic(:OLD."t_id");
      add_cid(v_cid);
    ELSIF UPDATING THEN
      v_cid := get_cid_from_topic(:NEW."t_id");
      add_cid(v_cid);
      IF :OLD."t_id" IS NOT NULL AND :OLD."t_id" != :NEW."t_id" THEN
        v_cid := get_cid_from_topic(:OLD."t_id");
        add_cid(v_cid);
      END IF;
    END IF;
  END AFTER EACH ROW;

  AFTER STATEMENT IS
  BEGIN
    -- Directly call recalc for each affected course
    FOR i IN 1..affected_cids.COUNT LOOP
      BEGIN
        IF NOT EDUX.RECALC_CTRL.g_locked_lectures THEN
          EDUX.RECALC_LECTURE_WEIGHTS(affected_cids(i));
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;

    affected_cids := num_tab();
  END AFTER STATEMENT;
END TRG_RECALC_LECTURE_WEIGHTS;
/

-- Compound trigger to update Topics.weight after Lectures changes
CREATE OR REPLACE TRIGGER EDUX.TRG_RECALC_TOPIC_WEIGHT_ON_LECTURES
FOR INSERT OR UPDATE OR DELETE ON EDUX."Lectures"
COMPOUND TRIGGER
  TYPE num_tab IS TABLE OF NUMBER;
  affected_tids num_tab := num_tab();

  PROCEDURE add_tid(p_tid NUMBER) IS
    v_found BOOLEAN := FALSE;
  BEGIN
    IF p_tid IS NULL THEN
      RETURN;
    END IF;
    FOR i IN 1..affected_tids.COUNT LOOP
      IF affected_tids(i) = p_tid THEN
        v_found := TRUE; EXIT;
      END IF;
    END LOOP;
    IF NOT v_found THEN
      affected_tids.EXTEND; affected_tids(affected_tids.COUNT) := p_tid;
    END IF;
  END add_tid;

  -- Check if topic exists (not being deleted)
  FUNCTION topic_exists(p_tid NUMBER) RETURN BOOLEAN IS
    v_cnt NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_cnt FROM EDUX."Topics" WHERE "t_id" = p_tid;
    RETURN v_cnt > 0;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END topic_exists;

  AFTER EACH ROW IS
  BEGIN
    IF INSERTING THEN
      add_tid(:NEW."t_id");
    ELSIF DELETING THEN
      add_tid(:OLD."t_id");
    ELSIF UPDATING THEN
      add_tid(:NEW."t_id");
      IF :OLD."t_id" IS NOT NULL AND :OLD."t_id" != :NEW."t_id" THEN
        add_tid(:OLD."t_id");
      END IF;
    END IF;
  END AFTER EACH ROW;

  AFTER STATEMENT IS
  BEGIN
    FOR i IN 1..affected_tids.COUNT LOOP
      BEGIN
        -- Only recalc if topic still exists (not cascade deleted)
        IF topic_exists(affected_tids(i)) THEN
          EDUX.RECALC_TOPIC_WEIGHT(affected_tids(i));
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;

    affected_tids := num_tab();
  END AFTER STATEMENT;
END TRG_RECALC_TOPIC_WEIGHT_ON_LECTURES;
/

-- Compound trigger to update Topics.weight after Exams changes
CREATE OR REPLACE TRIGGER EDUX.TRG_RECALC_TOPIC_WEIGHT_ON_EXAMS
FOR INSERT OR UPDATE OR DELETE ON EDUX."Exams"
COMPOUND TRIGGER
  TYPE num_tab IS TABLE OF NUMBER;
  affected_tids num_tab := num_tab();

  PROCEDURE add_tid(p_tid NUMBER) IS
    v_found BOOLEAN := FALSE;
  BEGIN
    IF p_tid IS NULL THEN
      RETURN;
    END IF;
    FOR i IN 1..affected_tids.COUNT LOOP
      IF affected_tids(i) = p_tid THEN
        v_found := TRUE; EXIT;
      END IF;
    END LOOP;
    IF NOT v_found THEN
      affected_tids.EXTEND; affected_tids(affected_tids.COUNT) := p_tid;
    END IF;
  END add_tid;

  -- Check if topic exists (not being deleted)
  FUNCTION topic_exists(p_tid NUMBER) RETURN BOOLEAN IS
    v_cnt NUMBER;
  BEGIN
    SELECT COUNT(*) INTO v_cnt FROM EDUX."Topics" WHERE "t_id" = p_tid;
    RETURN v_cnt > 0;
  EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
  END topic_exists;

  AFTER EACH ROW IS
  BEGIN
    IF INSERTING THEN
      add_tid(:NEW."t_id");
    ELSIF DELETING THEN
      add_tid(:OLD."t_id");
    ELSIF UPDATING THEN
      add_tid(:NEW."t_id");
      IF :OLD."t_id" IS NOT NULL AND :OLD."t_id" != :NEW."t_id" THEN
        add_tid(:OLD."t_id");
      END IF;
    END IF;
  END AFTER EACH ROW;

  AFTER STATEMENT IS
  BEGIN
    FOR i IN 1..affected_tids.COUNT LOOP
      BEGIN
        -- Only recalc if topic still exists (not cascade deleted)
        IF topic_exists(affected_tids(i)) THEN
          EDUX.RECALC_TOPIC_WEIGHT(affected_tids(i));
        END IF;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;

    affected_tids := num_tab();
  END AFTER STATEMENT;
END TRG_RECALC_TOPIC_WEIGHT_ON_EXAMS;
/
-- Trigger: when a Topic is deleted, recalculate course weights directly
-- Uses compound trigger to collect course IDs and recalc after statement completes
CREATE OR REPLACE TRIGGER EDUX.TRG_TOPICS_AFTER_DELETE
FOR DELETE ON EDUX."Topics"
COMPOUND TRIGGER
  TYPE num_tab IS TABLE OF NUMBER;
  affected_cids num_tab := num_tab();

  PROCEDURE add_cid(p_cid NUMBER) IS
    v_found BOOLEAN := FALSE;
  BEGIN
    IF p_cid IS NULL THEN
      RETURN;
    END IF;
    FOR i IN 1..affected_cids.COUNT LOOP
      IF affected_cids(i) = p_cid THEN
        v_found := TRUE; EXIT;
      END IF;
    END LOOP;
    IF NOT v_found THEN
      affected_cids.EXTEND; affected_cids(affected_cids.COUNT) := p_cid;
    END IF;
  END add_cid;

  AFTER EACH ROW IS
  BEGIN
    add_cid(:OLD."c_id");
  END AFTER EACH ROW;

  AFTER STATEMENT IS
    CURSOR c_topics(p_cid NUMBER) IS
      SELECT "t_id" FROM EDUX."Topics" WHERE "c_id" = p_cid;
  BEGIN
    FOR i IN 1..affected_cids.COUNT LOOP
      BEGIN
        -- Recalculate lecture weights for the course
        IF NOT EDUX.RECALC_CTRL.g_locked_lectures THEN
          EDUX.RECALC_LECTURE_WEIGHTS(affected_cids(i));
        END IF;
        -- Recalculate exam weights for the course
        IF NOT EDUX.RECALC_CTRL.g_locked_exams THEN
          EDUX.RECALC_EXAM_WEIGHTS(affected_cids(i));
        END IF;
        -- Recalculate weight for each remaining topic in the course
        FOR t_rec IN c_topics(affected_cids(i)) LOOP
          BEGIN
            EDUX.RECALC_TOPIC_WEIGHT(t_rec."t_id");
          EXCEPTION WHEN OTHERS THEN
            NULL;
          END;
        END LOOP;
      EXCEPTION WHEN OTHERS THEN
        NULL;
      END;
    END LOOP;
    affected_cids := num_tab();
  END AFTER STATEMENT;
END TRG_TOPICS_AFTER_DELETE;
/

COMMIT;
