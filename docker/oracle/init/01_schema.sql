-- EDUX Database Initialization Script for Docker
-- This script creates the necessary schema, tables, and initial data
-- NOTE: The EDUX user is automatically created by the gvenzl/oracle-xe image
-- via APP_USER environment variable in docker-compose.yml

-- Make sure we are in the correct PDB
ALTER SESSION SET CONTAINER = EDUX;

-- Grant required privileges to existing EDUX user
GRANT CONNECT, RESOURCE TO EDUX;
GRANT CREATE TABLE, CREATE SEQUENCE, CREATE VIEW TO EDUX;
GRANT CREATE PROCEDURE, CREATE TRIGGER TO EDUX;
GRANT UNLIMITED TABLESPACE TO EDUX;

-- Create Sequence
CREATE SEQUENCE EDUX.SEQUENCE MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 START WITH 200 CACHE 20;

-- Create Users table first (base table)
CREATE TABLE EDUX."Users" (
  "u_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "name" VARCHAR2(50 CHAR) NOT NULL,
  "email" VARCHAR2(100 CHAR) NOT NULL,
  "password" VARCHAR2(255 CHAR) NOT NULL,
  "reg_date" DATE DEFAULT sysdate,
  CONSTRAINT pk_users PRIMARY KEY ("u_id")
);

-- Create Instructors table
CREATE TABLE EDUX."Instructors" (
  "i_id" NUMBER NOT NULL,
  "subject" VARCHAR2(100 CHAR),
  "course_count" NUMBER DEFAULT 0,
  CONSTRAINT pk_instructors PRIMARY KEY ("i_id"),
  CONSTRAINT fk_instructors_users FOREIGN KEY ("i_id") REFERENCES EDUX."Users" ("u_id")
);

-- Create Students table
CREATE TABLE EDUX."Students" (
  "s_id" NUMBER NOT NULL,
  "course_count" NUMBER DEFAULT 0 NOT NULL,
  "date_of_birth" DATE,
  "gender" VARCHAR2(1 CHAR),
  "department" VARCHAR2(50 CHAR),
  CONSTRAINT pk_students PRIMARY KEY ("s_id"),
  CONSTRAINT fk_students_users FOREIGN KEY ("s_id") REFERENCES EDUX."Users" ("u_id") ON DELETE CASCADE
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
  "seat" NUMBER,
  CONSTRAINT pk_courses PRIMARY KEY ("c_id"),
  CONSTRAINT fk_courses_instructors FOREIGN KEY ("i_id") REFERENCES EDUX."Instructors" ("i_id")
);

-- Create Topics table
CREATE TABLE EDUX."Topics" (
  "t_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "name" VARCHAR2(100 CHAR) NOT NULL,
  "c_id" NUMBER NOT NULL,
  "serial" NUMBER NOT NULL,
  "weight" NUMBER,
  CONSTRAINT pk_topics PRIMARY KEY ("t_id"),
  CONSTRAINT fk_topics_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id")
);

-- Create Lectures table
CREATE TABLE EDUX."Lectures" (
  "l_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "t_id" NUMBER NOT NULL,
  "description" VARCHAR2(200 CHAR),
  "video" VARCHAR2(200 CHAR),
  "weight" NUMBER,
  "serial" NUMBER,
  CONSTRAINT pk_lectures PRIMARY KEY ("l_id"),
  CONSTRAINT fk_lectures_topics FOREIGN KEY ("t_id") REFERENCES EDUX."Topics" ("t_id") ON DELETE CASCADE
);

-- Create Exams table
CREATE TABLE EDUX."Exams" (
  "e_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "t_id" NUMBER NOT NULL,
  "question_count" NUMBER NOT NULL,
  "marks" NUMBER NOT NULL,
  "duration" NUMBER,
  "weight" NUMBER,
  CONSTRAINT pk_exams PRIMARY KEY ("e_id"),
  CONSTRAINT fk_exams_topics FOREIGN KEY ("t_id") REFERENCES EDUX."Topics" ("t_id")
);

-- Create Questions table
CREATE TABLE EDUX."Questions" (
  "q_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "e_id" NUMBER NOT NULL,
  "q_description" VARCHAR2(500 CHAR) NOT NULL,
  "option_a" VARCHAR2(200 CHAR),
  "option_b" VARCHAR2(200 CHAR),
  "option_c" VARCHAR2(200 CHAR),
  "option_d" VARCHAR2(200 CHAR),
  "right_ans" VARCHAR2(1 CHAR) NOT NULL,
  "marks" NUMBER DEFAULT 1 NOT NULL,
  "serial" NUMBER NOT NULL,
  CONSTRAINT pk_questions PRIMARY KEY ("q_id"),
  CONSTRAINT fk_questions_exams FOREIGN KEY ("e_id") REFERENCES EDUX."Exams" ("e_id")
);

-- Create Enrolls table
CREATE TABLE EDUX."Enrolls" (
  "s_id" NUMBER,
  "c_id" NUMBER,
  "date" DATE DEFAULT sysdate,
  "approve_status" VARCHAR2(1 CHAR) DEFAULT NULL,
  "progress" NUMBER DEFAULT 0,
  "end_date" DATE,
  "grade" VARCHAR2(5 BYTE)
);

-- Create Feedbacks table
CREATE TABLE EDUX."Feedbacks" (
  "s_id" NUMBER NOT NULL,
  "c_id" NUMBER NOT NULL,
  "rating" NUMBER NOT NULL,
  "review" VARCHAR2(500 CHAR),
  "date" DATE DEFAULT sysdate,
  CONSTRAINT fk_feedbacks_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id"),
  CONSTRAINT fk_feedbacks_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id")
);

-- Create Takes table
CREATE TABLE EDUX."Takes" (
  "s_id" NUMBER NOT NULL,
  "e_id" NUMBER NOT NULL,
  "status" VARCHAR2(10 CHAR),
  "marks" NUMBER,
  CONSTRAINT fk_takes_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id"),
  CONSTRAINT fk_takes_exams FOREIGN KEY ("e_id") REFERENCES EDUX."Exams" ("e_id")
);

-- Create Watches table
CREATE TABLE EDUX."Watches" (
  "s_id" NUMBER NOT NULL,
  "l_id" NUMBER NOT NULL,
  "w_date" DATE,
  CONSTRAINT fk_watches_students FOREIGN KEY ("s_id") REFERENCES EDUX."Students" ("s_id"),
  CONSTRAINT fk_watches_lectures FOREIGN KEY ("l_id") REFERENCES EDUX."Lectures" ("l_id")
);

-- Create Wishlist table
CREATE TABLE EDUX."Wishlist" (
  "u_id" NUMBER NOT NULL,
  "c_id" NUMBER NOT NULL,
  CONSTRAINT fk_wishlist_users FOREIGN KEY ("u_id") REFERENCES EDUX."Users" ("u_id"),
  CONSTRAINT fk_wishlist_courses FOREIGN KEY ("c_id") REFERENCES EDUX."Courses" ("c_id")
);

-- Create Notifications table
CREATE TABLE EDUX."Notifications" (
  "n_id" NUMBER DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "u_id" NUMBER NOT NULL,
  "date" DATE NOT NULL,
  "about" VARCHAR2(200 CHAR) NOT NULL,
  "seen_status" VARCHAR2(1 CHAR) DEFAULT 'n' NOT NULL,
  CONSTRAINT pk_notifications PRIMARY KEY ("n_id"),
  CONSTRAINT fk_notifications_users FOREIGN KEY ("u_id") REFERENCES EDUX."Users" ("u_id")
);

COMMIT;
