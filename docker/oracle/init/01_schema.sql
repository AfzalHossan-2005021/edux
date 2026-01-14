-- EDUX Database Initialization Script for Docker
-- This script creates the necessary schema, tables, and initial data
-- NOTE: The EDUX user is automatically created by the gvenzl/oracle-xe image
-- via APP_USER environment variable in docker-compose.yml

--------------------------------------------------
-- Switch to correct PDB
--------------------------------------------------
ALTER SESSION SET CONTAINER = EDUX;

--------------------------------------------------
-- Grant privileges to EDUX user
--------------------------------------------------
GRANT CONNECT, RESOURCE TO EDUX;
GRANT CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO EDUX;
GRANT CREATE PROCEDURE, CREATE TRIGGER TO EDUX;
GRANT UNLIMITED TABLESPACE TO EDUX;

--------------------------------------------------
-- Create Sequence for User IDs
--------------------------------------------------
CREATE SEQUENCE EDUX.SEQUENCE
MINVALUE 1
MAXVALUE 9999999999999999999999999999
INCREMENT BY 1
START WITH 200
CACHE 20;

--------------------------------------------------
-- USERS (Base Table)
--------------------------------------------------
CREATE TABLE EDUX."Users" (
  "u_id" NUMBER DEFAULT EDUX.SEQUENCE.NEXTVAL NOT NULL,
  "name" VARCHAR2(50 CHAR) NOT NULL,
  "email" VARCHAR2(100 CHAR) NOT NULL UNIQUE,
  "password" VARCHAR2(255 CHAR) NOT NULL,
  "role" VARCHAR2(20 CHAR) NOT NULL,
  "reg_date" DATE DEFAULT SYSDATE,
  CONSTRAINT pk_users PRIMARY KEY ("u_id"),
  CONSTRAINT chk_users_role 
    CHECK ("role" IN ('student', 'instructor', 'admin'))
);

--------------------------------------------------
-- STUDENTS TABLE
--------------------------------------------------
CREATE TABLE EDUX."Students" (
  "s_id" NUMBER NOT NULL,
  "date_of_birth" DATE,
  "gender" VARCHAR2(1 CHAR),
  "interests" VARCHAR2(255 CHAR),
  "location" VARCHAR2(100 CHAR),
  "occupation" VARCHAR2(100 CHAR),
  "website" VARCHAR2(255 CHAR),
  "bio" VARCHAR2(1000 CHAR),
  "course_count" NUMBER DEFAULT 0 NOT NULL,
  CONSTRAINT pk_students PRIMARY KEY ("s_id"),
  CONSTRAINT fk_students_users
    FOREIGN KEY ("s_id") REFERENCES EDUX."Users" ("u_id")
    ON DELETE CASCADE,
  CONSTRAINT chk_students_gender
    CHECK ("gender" IN ('M','F','O'))
);

--------------------------------------------------
-- INSTRUCTORS TABLE
--------------------------------------------------
CREATE TABLE EDUX."Instructors" (
  "i_id" NUMBER NOT NULL,
  "expertise" VARCHAR2(255 CHAR),
  "qualification" VARCHAR2(255 CHAR),
  "bio" VARCHAR2(1000 CHAR),
  "course_count" NUMBER DEFAULT 0,
  CONSTRAINT pk_instructors PRIMARY KEY ("i_id"),
  CONSTRAINT fk_instructors_users
    FOREIGN KEY ("i_id") REFERENCES EDUX."Users" ("u_id")
    ON DELETE CASCADE
);

--------------------------------------------------
-- ADMINS TABLE
--------------------------------------------------
CREATE TABLE EDUX."Admins" (
  "a_id" NUMBER NOT NULL,
  "admin_level" VARCHAR2(20 CHAR) NOT NULL,
  "department" VARCHAR2(100 CHAR),
  "notes" VARCHAR2(500 CHAR),
  CONSTRAINT pk_admins PRIMARY KEY ("a_id"),
  CONSTRAINT fk_admins_users
    FOREIGN KEY ("a_id") REFERENCES EDUX."Users" ("u_id")
    ON DELETE CASCADE
);

-- Create Courses table
CREATE TABLE EDUX."Courses" (
  "c_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "i_id" NUMBER NOT NULL,
  "title" VARCHAR2(100 CHAR),
  "description" VARCHAR2(1000 CHAR),
  "approve_status" VARCHAR2(1 CHAR) DEFAULT 'n' NOT NULL,
  "student_count" NUMBER DEFAULT 0,
  "rating" NUMBER,
  "wall" VARCHAR2(255 BYTE),
  "field" VARCHAR2(255 BYTE),
  "difficulty_level" VARCHAR2(50 BYTE),
  "seat" NUMBER,
  "price" NUMBER(10,2) DEFAULT 0,
  "lecture_weight" NUMBER DEFAULT 50 NOT NULL,
  CONSTRAINT pk_courses PRIMARY KEY ("c_id"),
  CONSTRAINT fk_courses_instructors FOREIGN KEY ("i_id") REFERENCES EDUX."Instructors" ("i_id") ON DELETE CASCADE
);

-- Create Prerequisites table
CREATE TABLE EDUX."Prerequisites" (
  "p_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "c_id" NUMBER NOT NULL,
  "description" VARCHAR2(500 CHAR) NOT NULL,
  CONSTRAINT pk_prerequisites PRIMARY KEY ("p_id"),
  CONSTRAINT fk_prerequisites_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id") ON DELETE CASCADE
);

-- Create Outcomes table
CREATE TABLE EDUX."Outcomes" (
  "o_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "c_id" NUMBER NOT NULL,
  "description" VARCHAR2(500 CHAR) NOT NULL,
  CONSTRAINT pk_outcomes PRIMARY KEY ("o_id"),
  CONSTRAINT fk_outcomes_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id") ON DELETE CASCADE
);


-- Create Topics table
CREATE TABLE EDUX."Topics" (
  "t_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "name" VARCHAR2(100 CHAR) NOT NULL,
  "c_id" NUMBER NOT NULL,
  "serial" NUMBER NOT NULL,
  "weight" NUMBER DEFAULT 0 NOT NULL,
  CONSTRAINT pk_topics PRIMARY KEY ("t_id"),
  CONSTRAINT fk_topics_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id") ON DELETE CASCADE
);

-- Create Lectures table
CREATE TABLE EDUX."Lectures" (
  "l_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "t_id" NUMBER NOT NULL,
  "description" VARCHAR2(200 CHAR),
  "video" VARCHAR2(200 CHAR),
  "weight" NUMBER DEFAULT 0 NOT NULL,
  "serial" NUMBER,
  CONSTRAINT pk_lectures PRIMARY KEY ("l_id"),
  CONSTRAINT fk_lectures_topics FOREIGN KEY ("t_id") REFERENCES EDUX."Topics" ("t_id") ON DELETE CASCADE
);

-- Create Exams table
CREATE TABLE EDUX."Exams" (
  "e_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "t_id" NUMBER NOT NULL,
  "question_count" NUMBER DEFAULT 0 NOT NULL,
  "marks" NUMBER DEFAULT 0 NOT NULL,
  "duration" NUMBER,
  "pass_pct" NUMBER DEFAULT 40 NOT NULL,
  "weight" NUMBER DEFAULT 0 NOT NULL,
  CONSTRAINT pk_exams PRIMARY KEY ("e_id"),
  CONSTRAINT fk_exams_topics FOREIGN KEY ("t_id") REFERENCES EDUX."Topics" ("t_id") ON DELETE CASCADE
);

-- Create Questions table
CREATE TABLE EDUX."Questions" (
  "q_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "e_id" NUMBER NOT NULL,
  "q_description" VARCHAR2(2048 CHAR) NOT NULL,
  "option_a" VARCHAR2(512 CHAR),
  "option_b" VARCHAR2(512 CHAR),
  "option_c" VARCHAR2(512 CHAR),
  "option_d" VARCHAR2(512 CHAR),
  "right_ans" VARCHAR2(1 CHAR) NOT NULL,
  "marks" NUMBER DEFAULT 1 NOT NULL,
  "serial" NUMBER NOT NULL,
  CONSTRAINT pk_questions PRIMARY KEY ("q_id"),
  CONSTRAINT fk_questions_exams FOREIGN KEY ("e_id") REFERENCES EDUX."Exams" ("e_id") ON DELETE CASCADE
);

-- Create Enrolls table
CREATE TABLE EDUX."Enrolls" (
  "s_id" NUMBER,
  "c_id" NUMBER,
  "date" DATE DEFAULT sysdate,
  "approve_status" VARCHAR2(1 CHAR) DEFAULT NULL,
  "progress" NUMBER DEFAULT 0 NOT NULL,
  "end_date" DATE,
  "grade" VARCHAR2(5 BYTE),
  CONSTRAINT fk_enrolls_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id") ON DELETE CASCADE,
  CONSTRAINT fk_enrolls_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id") ON DELETE CASCADE
);

-- Create Feedbacks table
CREATE TABLE EDUX."Feedbacks" (
  "s_id" NUMBER NOT NULL,
  "c_id" NUMBER NOT NULL,
  "rating" NUMBER NOT NULL,
  "review" VARCHAR2(500 CHAR),
  "date" DATE DEFAULT sysdate,
  CONSTRAINT fk_feedbacks_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id") ON DELETE CASCADE,
  CONSTRAINT fk_feedbacks_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id") ON DELETE CASCADE
);

-- Create Takes table
CREATE TABLE EDUX."Takes" (
  "s_id" NUMBER NOT NULL,
  "e_id" NUMBER NOT NULL,
  "status" VARCHAR2(10 CHAR),
  "marks" NUMBER,
  CONSTRAINT fk_takes_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id") ON DELETE CASCADE,
  CONSTRAINT fk_takes_exams FOREIGN KEY ("e_id") REFERENCES EDUX."Exams" ("e_id") ON DELETE CASCADE
);

-- Create Watches table
CREATE TABLE EDUX."Watches" (
  "s_id" NUMBER NOT NULL,
  "l_id" NUMBER NOT NULL,
  "w_date" DATE,
  CONSTRAINT fk_watches_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id") ON DELETE CASCADE,
  CONSTRAINT fk_watches_lectures FOREIGN KEY ("l_id") REFERENCES EDUX."Lectures" ("l_id") ON DELETE CASCADE
);

-- Create Wishlist table
CREATE TABLE EDUX."Wishlist" (
  "u_id" NUMBER NOT NULL,
  "c_id" NUMBER NOT NULL,
  CONSTRAINT fk_wishlist_users FOREIGN KEY ("u_id") REFERENCES EDUX."Users" ("u_id") ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id") ON DELETE CASCADE
);

-- Create Notifications table
CREATE TABLE EDUX."Notifications" (
  "n_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "u_id" NUMBER NOT NULL,
  "date" DATE NOT NULL,
  "about" VARCHAR2(200 CHAR) NOT NULL,
  "seen_status" VARCHAR2(1 CHAR) DEFAULT 'n' NOT NULL,
  CONSTRAINT pk_notifications PRIMARY KEY ("n_id"),
  CONSTRAINT fk_notifications_users FOREIGN KEY ("u_id") REFERENCES EDUX."Users" ("u_id") ON DELETE CASCADE
);

--------------------------------------------------
-- USER SESSIONS TABLE (for session management & token rotation)
--------------------------------------------------
CREATE TABLE EDUX."User_Sessions" (
  "session_id" VARCHAR2(64 CHAR) NOT NULL,
  "u_id" NUMBER NOT NULL,
  "token_family" VARCHAR2(32 CHAR) NOT NULL,
  "user_agent" VARCHAR2(500 CHAR),
  "ip_address" VARCHAR2(45 CHAR),
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "last_used_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "is_valid" NUMBER(1) DEFAULT 1 NOT NULL,
  "refresh_token_version" NUMBER DEFAULT 1 NOT NULL,
  CONSTRAINT pk_user_sessions PRIMARY KEY ("session_id"),
  CONSTRAINT fk_sessions_users FOREIGN KEY ("u_id") REFERENCES EDUX."Users" ("u_id") ON DELETE CASCADE
);

-- Index for faster user session lookups
CREATE INDEX EDUX.idx_sessions_user ON EDUX."User_Sessions" ("u_id", "is_valid");
CREATE INDEX EDUX.idx_sessions_expires ON EDUX."User_Sessions" ("expires_at");

--------------------------------------------------
-- AUDIT LOGS TABLE (for security monitoring)
--------------------------------------------------
CREATE TABLE EDUX."Audit_Logs" (
  "log_id" VARCHAR2(50 CHAR) NOT NULL,
  "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "event_type" VARCHAR2(50 CHAR) NOT NULL,
  "level" VARCHAR2(10 CHAR) DEFAULT 'INFO' NOT NULL,
  "u_id" NUMBER,
  "email" VARCHAR2(100 CHAR),
  "ip_address" VARCHAR2(45 CHAR),
  "user_agent" VARCHAR2(500 CHAR),
  "message" VARCHAR2(1000 CHAR),
  "metadata" CLOB,
  CONSTRAINT pk_audit_logs PRIMARY KEY ("log_id"),
  CONSTRAINT chk_audit_level CHECK ("level" IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL'))
);

-- Indexes for audit log queries
CREATE INDEX EDUX.idx_audit_timestamp ON EDUX."Audit_Logs" ("timestamp");
CREATE INDEX EDUX.idx_audit_user ON EDUX."Audit_Logs" ("u_id");
CREATE INDEX EDUX.idx_audit_event ON EDUX."Audit_Logs" ("event_type");
CREATE INDEX EDUX.idx_audit_level ON EDUX."Audit_Logs" ("level");

--------------------------------------------------
-- REFRESH TOKENS TABLE (for token blacklisting)
--------------------------------------------------
CREATE TABLE EDUX."Refresh_Tokens" (
  "token_id" VARCHAR2(64 CHAR) NOT NULL,
  "u_id" NUMBER NOT NULL,
  "session_id" VARCHAR2(64 CHAR),
  "token_hash" VARCHAR2(128 CHAR) NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  "expires_at" TIMESTAMP NOT NULL,
  "revoked_at" TIMESTAMP,
  "is_revoked" NUMBER(1) DEFAULT 0 NOT NULL,
  CONSTRAINT pk_refresh_tokens PRIMARY KEY ("token_id"),
  CONSTRAINT fk_refresh_users FOREIGN KEY ("u_id") REFERENCES EDUX."Users" ("u_id") ON DELETE CASCADE,
  CONSTRAINT fk_refresh_session FOREIGN KEY ("session_id") REFERENCES EDUX."User_Sessions" ("session_id") ON DELETE SET NULL
);

CREATE INDEX EDUX.idx_refresh_user ON EDUX."Refresh_Tokens" ("u_id", "is_revoked");
CREATE INDEX EDUX.idx_refresh_expires ON EDUX."Refresh_Tokens" ("expires_at");

COMMIT;
