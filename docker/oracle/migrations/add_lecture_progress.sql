/**
 * Database Migration Script
 * Creates LectureProgress table for tracking student progress
 * This table needs to be added to the EDUX database schema
 */

-- Create LectureProgress table (if not exists)
CREATE TABLE IF NOT EXISTS EDUX."LectureProgress" (
  "s_id" NUMBER NOT NULL,
  "l_id" NUMBER NOT NULL,
  "progress" NUMBER DEFAULT 0,
  "current_time" NUMBER DEFAULT 0,
  "completed" VARCHAR2(1 CHAR) DEFAULT 'N',
  "last_watched" DATE DEFAULT SYSDATE,
  CONSTRAINT pk_lecture_progress PRIMARY KEY ("s_id", "l_id"),
  CONSTRAINT fk_lp_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id") ON DELETE CASCADE,
  CONSTRAINT fk_lp_lectures FOREIGN KEY ("l_id") REFERENCES EDUX."Lectures" ("l_id") ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_lp_student ON EDUX."LectureProgress" ("s_id");
CREATE INDEX IF NOT EXISTS idx_lp_lecture ON EDUX."LectureProgress" ("l_id");
CREATE INDEX IF NOT EXISTS idx_lp_completed ON EDUX."LectureProgress" ("completed");

-- Add 'serial' column to Lectures table if it doesn't exist
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE EDUX."Lectures" ADD "serial" NUMBER DEFAULT 1';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1430 THEN
      RAISE;
    END IF;
END;
/

-- Add 'serial' column to Exams table if it doesn't exist  
BEGIN
  EXECUTE IMMEDIATE 'ALTER TABLE EDUX."Exams" ADD "serial" NUMBER DEFAULT 1';
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE != -1430 THEN
      RAISE;
    END IF;
END;
/

COMMIT;
