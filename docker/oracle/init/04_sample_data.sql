-- EDUX Sample Data

-- Make sure we are in the correct PDB
ALTER SESSION SET CONTAINER = EDUX;

-- Insert Users (Instructors)
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password") VALUES (1, 'John Smith', 'john.smith@edux.com', 'password123');
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password") VALUES (2, 'Jane Doe', 'jane.doe@edux.com', 'password123');
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password") VALUES (3, 'Bob Wilson', 'bob.wilson@edux.com', 'password123');

-- Insert Users (Students)
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password") VALUES (10, 'Alice Johnson', 'alice@student.com', 'password123');
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password") VALUES (11, 'Charlie Brown', 'charlie@student.com', 'password123');
INSERT INTO EDUX."Users" ("u_id", "name", "email", "password") VALUES (12, 'Diana Ross', 'diana@student.com', 'password123');

-- Insert Instructors
INSERT INTO EDUX."Instructors" ("i_id", "subject", "course_count") VALUES (1, 'Web Development', 2);
INSERT INTO EDUX."Instructors" ("i_id", "subject", "course_count") VALUES (2, 'Data Science', 1);
INSERT INTO EDUX."Instructors" ("i_id", "subject", "course_count") VALUES (3, 'Mobile Development', 1);

-- Insert Students
INSERT INTO EDUX."Students" ("s_id", "course_count", "gender", "department") VALUES (10, 2, 'F', 'Computer Science');
INSERT INTO EDUX."Students" ("s_id", "course_count", "gender", "department") VALUES (11, 1, 'M', 'Engineering');
INSERT INTO EDUX."Students" ("s_id", "course_count", "gender", "department") VALUES (12, 1, 'F', 'Computer Science');

-- Insert Courses
INSERT INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat") 
VALUES (100, 1, 'Complete React Course', 'Learn React from scratch to advanced concepts', 'y', 2, 4.5, '/images/react.jpg', 'Web Development', 50);

INSERT INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat") 
VALUES (101, 1, 'Node.js Masterclass', 'Backend development with Node.js and Express', 'y', 1, 4.2, '/images/nodejs.jpg', 'Web Development', 30);

INSERT INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat") 
VALUES (102, 2, 'Python for Data Science', 'Data analysis and machine learning with Python', 'y', 1, 4.8, '/images/python.jpg', 'Data Science', 40);

INSERT INTO EDUX."Courses" ("c_id", "i_id", "title", "description", "approve_status", "student_count", "rating", "wall", "field", "seat") 
VALUES (103, 3, 'Flutter Development', 'Build cross-platform mobile apps with Flutter', 'y', 0, NULL, '/images/flutter.jpg', 'Mobile Development', 25);

-- Insert Topics
INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1000, 'Introduction to React', 100, 1, 10);
INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1001, 'Components and Props', 100, 2, 15);
INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1002, 'State and Lifecycle', 100, 3, 20);
INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1003, 'Hooks', 100, 4, 25);

INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1010, 'Node.js Basics', 101, 1, 15);
INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1011, 'Express Framework', 101, 2, 20);

INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1020, 'Python Fundamentals', 102, 1, 10);
INSERT INTO EDUX."Topics" ("t_id", "name", "c_id", "serial", "weight") VALUES (1021, 'Data Analysis with Pandas', 102, 2, 25);

-- Insert Lectures
INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2000, 1000, 'What is React?', 'https://youtube.com/watch?v=react1', 3, 1);
INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2001, 1000, 'Setting up React Environment', 'https://youtube.com/watch?v=react2', 4, 2);
INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2002, 1001, 'Creating Components', 'https://youtube.com/watch?v=react3', 5, 1);
INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2003, 1001, 'Passing Props', 'https://youtube.com/watch?v=react4', 5, 2);

INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2010, 1010, 'Introduction to Node.js', 'https://youtube.com/watch?v=node1', 5, 1);
INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2011, 1010, 'NPM and Modules', 'https://youtube.com/watch?v=node2', 5, 2);

INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2020, 1020, 'Python Basics', 'https://youtube.com/watch?v=py1', 5, 1);
INSERT INTO EDUX."Lectures" ("l_id", "t_id", "description", "video", "weight", "serial") VALUES (2021, 1021, 'Pandas DataFrames', 'https://youtube.com/watch?v=py2', 10, 1);

-- Insert Exams
INSERT INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3000, 1000, 5, 10, 15, 3);
INSERT INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3001, 1001, 5, 10, 15, 5);
INSERT INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3010, 1010, 5, 10, 20, 5);
INSERT INTO EDUX."Exams" ("e_id", "t_id", "question_count", "marks", "duration", "weight") VALUES (3020, 1020, 5, 10, 15, 5);

-- Insert Questions
INSERT INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") 
VALUES (4000, 3000, 'What is React?', 'A database', 'A JavaScript library', 'A programming language', 'An operating system', 'B', 2, 1);

INSERT INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") 
VALUES (4001, 3000, 'Who developed React?', 'Google', 'Microsoft', 'Facebook', 'Apple', 'C', 2, 2);

INSERT INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") 
VALUES (4002, 3000, 'What is JSX?', 'A new language', 'JavaScript XML', 'Java extension', 'JSON format', 'B', 2, 3);

INSERT INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") 
VALUES (4003, 3000, 'What is Virtual DOM?', 'Real DOM', 'Lightweight copy of DOM', 'Database', 'Server', 'B', 2, 4);

INSERT INTO EDUX."Questions" ("q_id", "e_id", "q_description", "option_a", "option_b", "option_c", "option_d", "right_ans", "marks", "serial") 
VALUES (4004, 3000, 'Which command creates a React app?', 'npm create react', 'npx create-react-app', 'npm init react', 'react create', 'B', 2, 5);

-- Insert Enrollments (without triggers firing - manual update)
INSERT INTO EDUX."Enrolls" ("s_id", "c_id", "progress") VALUES (10, 100, 10);
INSERT INTO EDUX."Enrolls" ("s_id", "c_id", "progress") VALUES (10, 101, 0);
INSERT INTO EDUX."Enrolls" ("s_id", "c_id", "progress") VALUES (11, 100, 5);
INSERT INTO EDUX."Enrolls" ("s_id", "c_id", "progress") VALUES (12, 102, 0);

-- Insert Watches (lecture watch history)
INSERT INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (10, 2000, SYSDATE - 5);
INSERT INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (10, 2001, SYSDATE - 4);
INSERT INTO EDUX."Watches" ("s_id", "l_id", "w_date") VALUES (11, 2000, SYSDATE - 2);

-- Insert Takes (exam attempts)
INSERT INTO EDUX."Takes" ("s_id", "e_id", "status", "marks") VALUES (10, 3000, 'completed', 8);

-- Insert Feedbacks
INSERT INTO EDUX."Feedbacks" ("s_id", "c_id", "rating", "review") VALUES (10, 100, 5, 'Excellent course! Very comprehensive.');
INSERT INTO EDUX."Feedbacks" ("s_id", "c_id", "rating", "review") VALUES (11, 100, 4, 'Good content, could use more examples.');

-- Insert Wishlist
INSERT INTO EDUX."Wishlist" ("u_id", "c_id") VALUES (10, 102);
INSERT INTO EDUX."Wishlist" ("u_id", "c_id") VALUES (11, 103);

COMMIT;
