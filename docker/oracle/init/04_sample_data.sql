-- EDUX Sample Data (Comprehensive and schema-consistent)

-- Make sure we are in the correct PDB
ALTER SESSION SET CONTAINER = EDUX;

-- Clear any previous sample rows (useful when re-running in dev only)
-- WARNING: for production do NOT run these TRUNCATE statements
BEGIN
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Refresh_Tokens"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Audit_Logs"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."User_Sessions"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Notifications"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Wishlist"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Watches"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Takes"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Feedbacks"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Enrolls"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Questions"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Exams"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Lectures"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Topics"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Courses"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Admins"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Instructors"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Students"';
  EXECUTE IMMEDIATE 'TRUNCATE TABLE EDUX."Users"';
EXCEPTION
  WHEN OTHERS THEN NULL; -- ignore errors in dev environment
END;
/

-- Insert Users (mix of instructors, students, and admins)
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (1, 'John Smith', 'john.smith@edux.com', 'password123', 'instructor', SYSDATE - 90);
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (2, 'Jane Doe', 'jane.doe@edux.com', 'password123', 'instructor', SYSDATE - 60);
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (3, 'Bob Wilson', 'bob.wilson@edux.com', 'password123', 'instructor', SYSDATE - 45);

INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (10, 'Alice Johnson', 'alice@student.com', 'password123', 'student', SYSDATE - 30);
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (11, 'Charlie Brown', 'charlie@student.com', 'password123', 'student', SYSDATE - 20);
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (12, 'Diana Ross', 'diana@student.com', 'password123', 'student', SYSDATE - 10);
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (13, 'Eve Adams', 'eve@student.com', 'password123', 'student', SYSDATE - 5);

INSERT INTO EDUX."Users" ("u_id", "name", "email", "password", "role", "reg_date") VALUES (100, 'Super Admin', 'admin@edux.com', 'adminpass', 'admin', SYSDATE - 365);

-- Insert Students (matching schema fields)
INSERT INTO EDUX."Students" ("s_id", "date_of_birth", "gender", "interests") VALUES (10, TO_DATE('1995-01-15','YYYY-MM-DD'), 'F', 'Web Development,JavaScript,React');
INSERT INTO EDUX."Students" ("s_id", "date_of_birth", "gender", "interests") VALUES (11, TO_DATE('1992-07-09','YYYY-MM-DD'), 'M', 'Backend,Node.js,Databases');
INSERT INTO EDUX."Students" ("s_id", "date_of_birth", "gender", "interests") VALUES (12, TO_DATE('1998-03-22','YYYY-MM-DD'), 'F', 'Data Science,Python,Pandas');
INSERT INTO EDUX."Students" ("s_id", "date_of_birth", "gender", "interests") VALUES (13, TO_DATE('2000-10-30','YYYY-MM-DD'), 'O', 'Mobile,Flutter,Dart');

-- Insert Instructors (matching schema fields)
INSERT INTO EDUX."Instructors" ("i_id", "expertise", "qualification", "bio") VALUES (1, 'Web Development, React', 'MSc Computer Science', '10+ years building web applications and teaching React.');
INSERT INTO EDUX."Instructors" ("i_id", "expertise", "qualification", "bio") VALUES (2, 'Data Science, Machine Learning', 'PhD Data Science', 'Specializes in applied ML and data engineering.');
INSERT INTO EDUX."Instructors" ("i_id", "expertise", "qualification", "bio") VALUES (3, 'Mobile Development, Flutter', 'MSc Software Engineering', 'Focuses on cross-platform mobile development.');

-- Insert Admins
INSERT INTO EDUX."Admins" ("a_id", "admin_level", "department", "notes") VALUES (100, 'super', 'Platform', 'Full platform administrator');

-- Insert Courses (some with prices for testing payment flow)
INSERT ALL
 INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat", "price") VALUES (100, 1, 'Complete React Course', 'Learn React from basics to advanced patterns, hooks, and testing.', 'y', 3, 4.7, '/images/react.jpg', 'Web Development', 50, 29.99)
 INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat", "price") VALUES (101, 1, 'Node.js Masterclass', 'Backend development with Node.js, Express and REST APIs.', 'y', 2, 4.3, '/images/nodejs.jpg', 'Web Development', 30, 0)
 INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat", "price") VALUES (102, 2, 'Python for Data Science', 'Data analysis, visualization and intro to machine learning with Python.', 'y', 2, 4.9, '/images/python.jpg', 'Data Science', 40, 49.99)
 INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat", "price") VALUES (103, 3, 'Flutter Development', 'Build cross-platform mobile apps with Flutter and Dart.', 'n', 0, NULL, '/images/flutter.jpg', 'Mobile Development', 25, 19.99)
SELECT * FROM DUAL; 

-- Insert Topics (one or more per course)
INSERT ALL
 INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1000, 'Introduction and Setup', 100, 1, 10)
 INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1001, 'Components and Props', 100, 2, 15)
 INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1002, 'State, Lifecycle and Hooks', 100, 3, 25)
 INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1010, 'Node.js Basics', 101, 1, 20)
 INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1011, 'Express and APIs', 101, 2, 25)
 INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1020, 'Python Fundamentals', 102, 1, 15)
 INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1021, 'Pandas and DataFrames', 102, 2, 30)
SELECT * FROM DUAL; 

-- Insert Lectures (multiple for topics)
INSERT ALL
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2000, 1000, 'What is React and why use it?', 'https://youtube.com/watch?v=react_intro', 3, 1)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2001, 1000, 'Tooling and Create React App / Vite', 'https://youtube.com/watch?v=react_setup', 4, 2)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2002, 1001, 'Functional Components', 'https://youtube.com/watch?v=react_components', 5, 1)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2003, 1001, 'Props and Composition', 'https://youtube.com/watch?v=react_props', 5, 2)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2004, 1002, 'useState and useEffect', 'https://youtube.com/watch?v=react_hooks', 6, 1)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2010, 1010, 'Node runtime and core modules', 'https://youtube.com/watch?v=node_intro', 5, 1)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2011, 1011, 'Express routing and middleware', 'https://youtube.com/watch?v=express_routing', 6, 1)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2020, 1020, 'Python basics: types and control flow', 'https://youtube.com/watch?v=py_basics', 5, 1)
 INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2021, 1021, 'Pandas: Series and DataFrame', 'https://youtube.com/watch?v=pandas_df', 8, 1)
SELECT * FROM DUAL; 

-- Insert Exams and Questions (covering course topics)
INSERT ALL
 INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3000, 1000, 4, 8, 20, 2)
 INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3001, 1002, 5, 10, 25, 4)
 INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3010, 1011, 5, 10, 30, 5)
 INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3020, 1021, 4, 8, 20, 4)
SELECT * FROM DUAL; 

INSERT ALL
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4000, 3000, 'What is React primarily used for?', 'Back-end services', 'UI building', 'Database management', 'OS development', 'B', 2, 1)
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4001, 3000, 'Which hook lets you add state to functional components?', 'useState', 'useEffect', 'useRef', 'useContext', 'A', 2, 2)
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4002, 3000, 'JSX compiles to which language?', 'Python', 'Java', 'JavaScript', 'C#', 'C', 2, 3)
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4003, 3000, 'Which command creates a new React app with CRA?', 'npm init react', 'npx create-react-app', 'npm create-react', 'react-new', 'B', 2, 4)
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4010, 3001, 'What does useEffect do?', 'Manages side-effects', 'Manages styles', 'Routing', 'Optimizes images', 'A', 2, 1)
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4011, 3001, 'Which is a rule of hooks?', 'Call hooks conditionally', 'Call hooks in loops', 'Call hooks at top-level', 'Call hooks anywhere', 'C', 2, 2)
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4020, 3010, 'What is Express?', 'A DB', 'A JS framework for UI', 'A Node.js web framework', 'A CSS library', 'C', 2, 1)
 INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") VALUES (4030, 3020, 'Pandas DataFrame is:', '2D labeled data structure', '3D image', 'Audio format', 'Filesystem', 'A', 2, 1)
SELECT * FROM DUAL; 

-- Insert Enrollments
INSERT ALL
 INTO EDUX."Enrolls" ("s_id", "c_id", "date", "approve_status", "progress") VALUES (10, 100, SYSDATE - 20, 'y', 40)
 INTO EDUX."Enrolls" ("s_id", "c_id", "date", "approve_status", "progress") VALUES (10, 101, SYSDATE - 10, 'y', 0)
 INTO EDUX."Enrolls" ("s_id", "c_id", "date", "approve_status", "progress") VALUES (11, 100, SYSDATE - 15, 'y', 20)
 INTO EDUX."Enrolls" ("s_id", "c_id", "date", "approve_status", "progress") VALUES (12, 102, SYSDATE - 8, 'y', 10)
 INTO EDUX."Enrolls" ("s_id", "c_id", "date", "approve_status", "progress") VALUES (13, 103, SYSDATE - 2, NULL, 0)
SELECT * FROM DUAL; -- pending approval 

-- Insert Watch history (lectures)
INSERT ALL
 INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (10, 2000, SYSDATE - 18)
 INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (10, 2001, SYSDATE - 17)
 INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (10, 2002, SYSDATE - 15)
 INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (11, 2000, SYSDATE - 13)
 INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (12, 2020, SYSDATE - 5)
SELECT * FROM DUAL; 

-- Insert Takes (exam attempts)
INSERT ALL
 INTO EDUX."Takes" ("s_id", "e_id", "status", "marks") VALUES (10, 3000, 'completed', 7)
 INTO EDUX."Takes" ("s_id", "e_id", "status", "marks") VALUES (10, 3001, 'in_prog', NULL)
 INTO EDUX."Takes" ("s_id", "e_id", "status", "marks") VALUES (11, 3000, 'completed', 6)
 INTO EDUX."Takes" ("s_id", "e_id", "status", "marks") VALUES (12, 3020, 'completed', 8)
SELECT * FROM DUAL; 

-- Insert Feedbacks
INSERT ALL
 INTO EDUX."Feedbacks" ("s_id", "c_id", "rating", "review", "date") VALUES (10, 100, 5, 'Excellent course — clear explanations and good exercises.', SYSDATE - 10)
 INTO EDUX."Feedbacks" ("s_id", "c_id", "rating", "review", "date") VALUES (11, 100, 4, 'Great content, would like more quizzes.', SYSDATE - 9)
 INTO EDUX."Feedbacks" ("s_id", "c_id", "rating", "review", "date") VALUES (12, 102, 5, 'Loved the hands-on examples with Pandas.', SYSDATE - 4)
SELECT * FROM DUAL; 

-- Insert Wishlist entries
INSERT ALL
 INTO EDUX."Wishlist" ("u_id", "c_id") VALUES (10, 102)
 INTO EDUX."Wishlist" ("u_id", "c_id") VALUES (13, 101)
SELECT * FROM DUAL; 

-- Insert Notifications
INSERT ALL
 INTO EDUX."Notifications" ("n_id", "u_id", "date", "about", "seen_status") VALUES (5000, 10, SYSDATE - 2, 'Your enrollment in Complete React Course is confirmed', 'n')
 INTO EDUX."Notifications" ("n_id", "u_id", "date", "about", "seen_status") VALUES (5001, 11, SYSDATE - 1, 'New lecture uploaded: useState and useEffect', 'n')
SELECT * FROM DUAL; 

COMMIT;
