/*
 Navicat Premium Data Transfer

 Source Server         : EDUX
 Source Server Type    : Oracle
 Source Server Version : 190000 (Oracle Database 19c Enterprise Edition Release 19.0.0.0.0 - Production)
 Source Host           : Afzal:1521
 Source Schema         : EDUX

 Target Server Type    : Oracle
 Target Server Version : 190000 (Oracle Database 19c Enterprise Edition Release 19.0.0.0.0 - Production)
 File Encoding         : 65001

 Date: 17/11/2023 16:48:42
*/


-- ----------------------------
-- Table structure for Courses
-- ----------------------------
DROP TABLE "EDUX"."Courses";
CREATE TABLE "EDUX"."Courses" (
  "c_id" NUMBER VISIBLE DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "i_id" NUMBER VISIBLE NOT NULL,
  "title" VARCHAR2(100 CHAR) VISIBLE,
  "description" VARCHAR2(1000 CHAR) VISIBLE,
  "approve_status" VARCHAR2(1 CHAR) VISIBLE DEFAULT 'n' NOT NULL,
  "student_count" NUMBER VISIBLE DEFAULT 0,
  "rating" NUMBER VISIBLE,
  "wall" VARCHAR2(255 BYTE) VISIBLE,
  "field" VARCHAR2(255 BYTE) VISIBLE,
  "seat" NUMBER VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Courses
-- ----------------------------
INSERT INTO "EDUX"."Courses" VALUES ('1', '15', 'Strategic Digital Marketing Mastery', 'In this comprehensive course on Strategic Digital Marketing Mastery, you''ll delve into the dynamic world of marketing in the digital age. From social media strategies to search engine optimization, email marketing, and data analytics, this course equips you with the tools and knowledge needed to excel in the ever-evolving marketing landscape.

Learn to harness the power of data-driven decision-making, dissect consumer behavior, and craft compelling digital marketing campaigns that resonate with your target audience. Explore the nuances of content marketing, influencer partnerships, and brand management, all while staying up-to-date with the latest industry trends and best practices.', 'y', '26', '4', 'course_wall-1', 'Marketing', '50');
INSERT INTO "EDUX"."Courses" VALUES ('2', '3', 'Legal Department Management', 'In the complex world of law and corporate governance, effective legal department management is essential. Our course on Advanced Legal Department Management is designed to equip legal professionals with the skills and knowledge needed to excel in this crucial field.

This course covers a wide array of topics, including legal operations, risk management, compliance, and the integration of technology in legal practice. You''ll explore best practices in legal project management, budgeting, and resource allocation to maximize the efficiency and effectiveness of your legal team.

Learn how to navigate the ever-evolving regulatory landscape, address ethical dilemmas, and foster a culture of compliance within your organization. Dive into the intricacies of contract management, litigation support, and intellectual property protection.', 'y', '29', '0', 'course_wall-2', 'Legal Department', '50');
INSERT INTO "EDUX"."Courses" VALUES ('3', '9', 'Innovative R&D Strategies and Leadership', 'Welcome to the world of Innovative R&D Strategies and Leadership! This course is designed for professionals seeking to excel in the realm of Research and Development by embracing cutting-edge approaches and effective leadership principles.

Throughout this course, you''ll delve into the dynamic field of research and development, learning how to drive innovation within your organization. Discover the latest trends in technology, market analysis, and industry-specific R&D practices.

Explore strategies for identifying opportunities, managing risk, and optimizing resource allocation to fuel your R&D projects. Dive deep into the world of intellectual property protection, patent strategies, and technology transfer.

In addition to technical aspects, you''ll develop essential leadership skills to inspire and guide your R&D teams. Topics include project management, cross-functional collaboration, and fostering a culture of innovation.', 'y', '27', '0', 'course_wall-3', 'Research & Development', '50');
INSERT INTO "EDUX"."Courses" VALUES ('4', '5', 'Purchasing Excellence and Strategic Procurement', 'Throughout this course, you''ll explore the strategic aspects of purchasing, procurement, and supply chain management. Learn how to optimize sourcing strategies, negotiate effectively with suppliers, and streamline procurement processes to drive cost savings and operational efficiency.

Delve into the intricacies of supplier relationship management, risk mitigation, and ethical procurement practices. Discover innovative technologies and digital tools that can revolutionize your purchasing processes, such as e-procurement systems and data analytics.

Gain insights into sustainable procurement, responsible sourcing, and compliance with international standards. Develop your skills in demand forecasting, inventory management, and procurement analytics to make informed decisions.', 'y', '16', '0', 'course_wall-2', 'Purchasing', '50');
INSERT INTO "EDUX"."Courses" VALUES ('5', '20', 'Public Relations and Reputation Management', 'Discover the power of digital PR and social media in shaping public perception. Explore the nuances of influencer partnerships, content creation, and data-driven PR campaigns that drive results and enhance brand equity.

Dive into crisis communication strategies, ethical considerations, and the art of damage control in the digital age. You''ll also gain insights into corporate social responsibility and sustainability communications.

Develop essential PR leadership skills, including team management, budgeting, and measuring the impact of PR efforts. By the end of this course, you''ll be equipped to lead and execute strategic PR campaigns that strengthen your organization''s reputation and drive its success.', 'y', '16', '0', 'course_wall-1', 'Public Relations', '50');
INSERT INTO "EDUX"."Courses" VALUES ('6', '8', 'Administrative and Management Strategies', 'Dive into the world of project management, financial acumen, and strategic planning to effectively manage resources and achieve organizational goals.

By the end of this course, you''ll be equipped with the knowledge and skills to excel in administrative and management roles, whether you are an experienced manager looking to enhance your leadership abilities or an aspiring professional seeking to step into a management position. Join us on this journey to become a proficient administrative and management strategist, ready to tackle the challenges of today''s dynamic business environment.', 'y', '23', '0', 'course_wall-2', 'Administrative & Management', '50');
INSERT INTO "EDUX"."Courses" VALUES ('7', '6', 'Excellence in Product Quality Assurance', 'Explore the art and science of ensuring exceptional product quality with our course, "Quality Assurance and Product Excellence."

In this comprehensive program, you''ll dive deep into the principles, methodologies, and best practices that underpin product quality across industries.By the end of this course, you''ll possess the knowledge and skills to champion quality assurance initiatives, implement quality improvement strategies, and drive product excellence within your organization. Join us in this journey towards becoming a quality assurance expert and elevating your organization''s reputation for delivering top-tier products.', 'y', '32', '0', 'course_wall-2', 'Product Quality', '50');
INSERT INTO "EDUX"."Courses" VALUES ('8', '19', 'Elevating Product Quality: Strategies for Success', 'This transformative program is designed to equip professionals with the insights and tools necessary to excel in the realm of product quality management.Explore how innovation can be a driving force behind product quality enhancement.

Upon completing this course, you''ll emerge as a product quality champion, equipped to lead quality improvement initiatives, optimize production processes, and uphold the reputation of your organization for delivering products that meet and exceed customer expectations. Join us on this journey to elevate product quality to new heights and drive business success.', 'y', '27', '0', 'course_wall-3', 'Product Quality', '50');
INSERT INTO "EDUX"."Courses" VALUES ('9', '1', 'Strategic Legal Department Management and Compliance', 'Unlock the keys to effective Legal Department Management and Compliance with our comprehensive course designed to empower legal professionals in today''s complex business landscape. By the end of this course, you''ll be prepared to lead your legal department with confidence, navigate legal complexities, and ensure that your organization operates within the bounds of the law. Join us on this journey to become a strategic legal department manager and compliance expert.', 'y', '23', '0', 'course_wall-3', 'Legal Department', '50');
INSERT INTO "EDUX"."Courses" VALUES ('17', '2', 'Human Resources: Your Guide To Professional Success', 'Human Resource: The Backbone of Organizational Success Introduction: Human resource management plays a pivotal role in the success of any organization. Often referred to as the backbone of an organization, the human resource department is responsible for managing the most valuable asset within the company – its workforce. This essay will explore the significance of human resource management and highlight its various functions and responsibilities. Recruitment and Selection: The human resource department is responsible for attracting and selecting the most suitable candidates for job positions within the organization.', 'y', '28', '0', 'course_wall-1', 'Human resource', '50');
INSERT INTO "EDUX"."Courses" VALUES ('10', '17', 'Mastering Export Strategies: Expanding Global Reach', 'Learn to identify lucrative export markets, assess demand, and analyze market entry strategies. Navigate the intricacies of export documentation, customs requirements, and compliance with international trade regulations. Discover strategies for optimizing export logistics, including shipping, warehousing, and distribution. Explore financing options and government incentives to support your export initiatives.Develop a robust risk management strategy to address currency fluctuations, political instability, and other export-related risks. Gain insights into export laws, trade agreements, and compliance measures to ensure smooth international transactions. Learn how to bridge cultural gaps, negotiate effectively, and build strong relationships with international partners and customers.', 'y', '21', '0', 'course_wall-1', 'Export', '50');
INSERT INTO "EDUX"."Courses" VALUES ('11', '14', 'Financial Mastery: Accounting and Finance Excellence', 'Build a strong foundation in accounting principles, financial statements, and financial analysis. Learn to make informed financial decisions, optimize capital structure, and enhance shareholder value. Develop proficiency in budget preparation, variance analysis, and long-term financial planning. Explore strategies for identifying, assessing, and mitigating financial risks in an ever-changing business landscape. Master the art of investment evaluation, portfolio management, and capital budgeting. Understand corporate finance essentials, including mergers and acquisitions, capital raising, and dividend policy. Navigate the ethical challenges in finance, ensuring your financial practices align with ethical standards and regulations.', 'y', '23', '0', 'course_wall-2', 'Accounting & Finance', '50');
INSERT INTO "EDUX"."Courses" VALUES ('12', '16', 'Legal Department Excellence: Leadership and Compliance Mastery', 'Elevate your legal department''s performance and ensure uncompromising compliance with our comprehensive course, "Legal Department Excellence: Leadership and Compliance Mastery." This program is designed to empower legal professionals and leaders to excel in managing today''s multifaceted legal departments. Explore strategies to enhance operational efficiency, streamline workflows, and allocate resources effectively. Navigate complex legal and regulatory landscapes, ensuring your organization''s steadfast commitment to compliance standards. Cultivate ethical leadership skills tailored to the legal profession, fostering a culture of integrity and accountability. Gain deep insights into litigation strategy, case management, and courtroom representation to protect your organization''s interests.', 'y', '24', '0', 'course_wall-3', 'Legal Department', '50');
INSERT INTO "EDUX"."Courses" VALUES ('13', '12', 'Money Matters: A Guide To Financial Management', 'Accounting & Finance Accounting and finance are two closely related disciplines that are crucial for the proper management and functioning of any organization. While accounting focuses on recording, summarizing, and analyzing financial transactions, finance deals with managing and allocating financial resources to achieve the organization''s goals. In this essay, we will explore the significance of accounting and finance in the business world, highlighting their roles, similarities, and differences. Firstly, accounting serves as the foundation for financial decision-making. It provides accurate and reliable information regarding an organization''s financial health, allowing managers to make informed choices and evaluate the performance of various departments. Through the preparation of financial statements, such as balance sheets, income statements, and cash flow statements, accounting enables monitoring of revenue, expenses, assets, liabilities, and equity', 'y', '27', '0', 'course_wall-1', 'Accounting & Finance', '50');
INSERT INTO "EDUX"."Courses" VALUES ('14', '10', 'Quality Beyond Standards Certification Course', 'ccounting & Finance Accounting and finance are two closely related disciplines that are crucial for the proper management and functioning of any organization. While accounting focuses on recording, summarizing, and analyzing financial transactions, finance deals with managing and allocating financial resources to achieve the organization''s goals. In this essay, we will explore the significance of accounting and finance in the business world, highlighting their roles, similarities, and differences. Firstly, accounting serves as the foundation for financial decision-making. It provides accurate and reliable information regarding an organization''s financial health, allowing managers to make informed choices and evaluate the performance of various departments. Through the preparation of financial statements, such as balance sheets, income statements, and cash flow statements, accounting enables monitoring of revenue, expenses, assets, liabilities, and equity.', 'y', '25', '0', 'course_wall-1', 'Product Quality', '50');
INSERT INTO "EDUX"."Courses" VALUES ('15', '7', 'Learn Research & Development Techniques', 'Research & Development (R&D) plays a vital role in advancing innovation, fostering economic growth, and shaping the future of industries and societies. It encompasses a systematic and organized approach to studying, exploring, and creating new knowledge, technologies, and products. With its emphasis on innovation and discovery, R&D has become a cornerstone of progress and competitiveness in today''s fast-paced and ever-evolving world. One of the primary objectives of R&D is to enhance existing knowledge and develop new solutions to address complex challenges. Through rigorous experimentation, analysis, and problem-solving, researchers strive to push boundaries and unlock new possibilities.', 'y', '28', '0', 'course_wall-1', 'Research & Development', '50');
INSERT INTO "EDUX"."Courses" VALUES ('16', '13', 'Engineering With Artificial Intelligence', 'Engineering: Shaping the World through Innovation and Ingenuity Engineering, the art of applying scientific and mathematical principles to design and construct practical solutions, is an indispensable field that has played a pivotal role in shaping the modern world. From towering skyscrapers to intricate electronic devices, engineering is the driving force behind the technological advancements that have revolutionized our lives. In this essay, we will delve into the significance of engineering, its diverse disciplines, and the impact it has on society', 'y', '31', '0', 'course_wall-1', 'Engineering', '50');
INSERT INTO "EDUX"."Courses" VALUES ('19', '11', 'Engineering With Artificial Intelligence', 'One of the key aspects that make engineering so compelling is its ability to transform ideas into reality. Engineers are the masterminds behind the innovative designs that enhance our quality of life. They possess the skills and knowledge to create groundbreaking solutions that address societal needs, whether it be developing sustainable energy sources, designing efficient transportation systems, or constructing environmentally-friendly buildings. Through their expertise, engineers tackle complex challenges and provide practical solutions that shape the world we live in. The field of engineering encompasses a multitude of disciplines, each with its own set of specialized knowledge and applications. Civil engineering focuses on the design and construction of infrastructure, such as bridges, roads, and buildings, that form the backbone of societies.', 'y', '26', '4.75', 'course_wall-1', 'Engineering', '50');
INSERT INTO "EDUX"."Courses" VALUES ('18', '4', 'The Art Of Bookkeeping Essentials', 'Accounting and finance play a vital role in the functioning of modern businesses and organizations. These two disciplines are closely intertwined, yet distinct in their objectives and focus. Accounting involves recording, analyzing, and interpreting financial data, while finance focuses on managing funds and making strategic financial decisions. Together, they provide crucial insights and facilitate informed decision-making. Accounting serves as the language of business, providing a systematic way to record and communicate financial information. It involves the preparation and analysis of financial statements, such as income statements, balance sheets, and cash flow statements. ', 'y', '27', '0', 'course_wall-3', 'Accounting & Finance', '50');
INSERT INTO "EDUX"."Courses" VALUES ('20', '18', 'The Fundamentals Of Accounting & Finance', 'One key aspect of accounting is the adherence to established principles and standards, such as the Generally Accepted Accounting Principles (GAAP) or International Financial Reporting Standards (IFRS). These guidelines ensure consistency, comparability, and transparency in financial reporting, enabling investors, creditors, and other stakeholders to make informed decisions. Furthermore, accounting plays a crucial role in taxation. Accurate and timely tax accounting ensures compliance with legal requirements, helps in determining tax liabilities, and supports the preparation of tax returns. Effective tax planning and optimization strategies can help businesses minimize their tax burden and maximize their profitability. On the other hand, finance focuses on managing the monetary resources of an organization', 'y', '22', '0', 'course_wall-1', 'Accounting & Finance', '50');

-- ----------------------------
-- Table structure for Enrolls
-- ----------------------------
DROP TABLE "EDUX"."Enrolls";
CREATE TABLE "EDUX"."Enrolls" (
  "s_id" NUMBER VISIBLE,
  "c_id" NUMBER VISIBLE,
  "date" DATE VISIBLE DEFAULT sysdate,
  "approve_status" VARCHAR2(1 CHAR) VISIBLE DEFAULT NULL,
  "progress" NUMBER VISIBLE DEFAULT 0,
  "end_date" DATE VISIBLE,
  "grade" VARCHAR2(5 BYTE) VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Enrolls
-- ----------------------------
INSERT INTO "EDUX"."Enrolls" VALUES ('82', '19', TO_DATE('2016-02-05 21:47:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '44', TO_DATE('2022-12-05 09:31:11', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '1', TO_DATE('2018-01-01 01:26:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2022-10-20 14:07:08', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('29', '10', TO_DATE('2018-04-17 17:03:00', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2023-04-12 02:08:35', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '7', TO_DATE('2019-08-29 17:28:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2023-05-01 22:12:49', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('43', '14', TO_DATE('2018-11-02 20:07:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2020-12-14 09:34:10', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '18', TO_DATE('2015-10-28 00:28:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '44', TO_DATE('2020-03-18 16:55:56', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '12', TO_DATE('2015-11-01 21:18:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '5', TO_DATE('2022-05-04 22:10:02', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('39', '18', TO_DATE('2017-08-13 17:52:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '27', TO_DATE('2020-12-26 10:13:05', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '6', TO_DATE('2016-04-29 16:09:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '76', TO_DATE('2021-05-14 02:40:23', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '16', TO_DATE('2019-11-12 17:24:13', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '100', TO_DATE('2022-07-21 02:55:29', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '6', TO_DATE('2016-04-06 20:46:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '14', TO_DATE('2021-02-03 02:18:09', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '9', TO_DATE('2015-08-24 05:31:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '100', TO_DATE('2022-01-07 06:00:35', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('42', '14', TO_DATE('2018-09-21 16:02:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '97', TO_DATE('2023-04-05 00:39:07', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('74', '12', TO_DATE('2017-06-03 05:00:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '98', TO_DATE('2023-02-13 05:07:24', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '2', TO_DATE('2016-07-15 22:52:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '30', TO_DATE('2021-09-27 00:59:21', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('39', '15', TO_DATE('2015-08-03 05:50:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '43', TO_DATE('2020-02-14 22:40:19', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('43', '6', TO_DATE('2015-05-29 23:23:18', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2021-02-08 08:55:57', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('78', '12', TO_DATE('2017-08-31 23:22:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '4', TO_DATE('2022-10-18 00:23:54', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '7', TO_DATE('2015-07-19 19:58:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '27', TO_DATE('2023-05-06 11:54:09', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '13', TO_DATE('2015-03-14 18:55:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '18', TO_DATE('2020-06-08 09:47:03', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('79', '7', TO_DATE('2016-05-20 09:45:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '14', TO_DATE('2022-06-22 22:08:04', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '19', TO_DATE('2017-09-06 18:53:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2023-05-26 17:04:29', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '6', TO_DATE('2017-05-15 08:27:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '15', TO_DATE('2020-07-15 01:31:24', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('37', '7', TO_DATE('2016-03-13 12:29:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '93', TO_DATE('2023-08-05 01:37:18', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '18', TO_DATE('2018-03-25 08:06:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '1', TO_DATE('2022-10-08 04:28:05', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('21', '7', TO_DATE('2017-07-10 06:57:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '80', TO_DATE('2022-09-04 00:09:14', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '3', TO_DATE('2015-10-07 05:49:27', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '100', TO_DATE('2020-01-25 00:38:25', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '17', TO_DATE('2017-12-27 17:26:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '31', TO_DATE('2021-08-12 22:19:16', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '1', TO_DATE('2017-03-01 11:28:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '19', TO_DATE('2023-01-20 06:57:37', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '19', TO_DATE('2019-04-10 01:27:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '27', TO_DATE('2021-12-11 15:46:54', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '15', TO_DATE('2015-09-07 19:42:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '63', TO_DATE('2023-08-21 22:03:49', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '19', TO_DATE('2018-08-01 02:34:52', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '85', TO_DATE('2023-01-24 16:10:56', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '6', TO_DATE('2015-09-02 14:38:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '86', TO_DATE('2020-07-02 13:46:08', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '2', TO_DATE('2019-11-22 12:42:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '95', TO_DATE('2020-07-29 20:05:40', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '17', TO_DATE('2018-11-12 09:12:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '48', TO_DATE('2021-07-11 16:56:57', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '4', TO_DATE('2015-07-09 01:26:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '2', TO_DATE('2021-03-08 06:14:01', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '17', TO_DATE('2015-05-26 00:54:14', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '24', TO_DATE('2021-09-05 14:22:14', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '7', TO_DATE('2017-11-18 04:41:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '58', TO_DATE('2022-07-26 06:13:31', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('97', '19', TO_DATE('2016-08-27 16:30:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '22', TO_DATE('2020-03-17 06:49:09', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('85', '14', TO_DATE('2015-08-24 09:01:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '52', TO_DATE('2021-07-08 16:09:22', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '15', TO_DATE('2015-07-12 18:29:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '82', TO_DATE('2020-02-03 01:53:45', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '12', TO_DATE('2018-03-30 03:50:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2021-05-09 06:57:03', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '17', TO_DATE('2015-10-28 06:06:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2021-10-26 12:29:25', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '13', TO_DATE('2019-08-12 15:19:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2020-08-03 01:38:12', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('56', '9', TO_DATE('2019-05-26 17:02:58', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2020-02-08 13:22:38', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '12', TO_DATE('2018-11-09 18:58:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '4', TO_DATE('2022-03-02 06:17:55', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('94', '20', TO_DATE('2016-01-21 03:39:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '69', TO_DATE('2020-05-23 03:36:44', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('82', '8', TO_DATE('2015-05-17 05:29:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '32', TO_DATE('2020-03-22 02:28:54', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('62', '17', TO_DATE('2015-10-16 16:22:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '54', TO_DATE('2022-11-05 16:18:42', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('84', '9', TO_DATE('2015-01-06 11:58:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '62', TO_DATE('2020-10-22 21:23:36', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('62', '19', TO_DATE('2018-01-13 16:25:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '26', TO_DATE('2020-12-18 00:15:49', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '14', TO_DATE('2018-11-03 11:59:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '39', TO_DATE('2021-01-04 21:59:46', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('99', '13', TO_DATE('2017-08-12 19:14:01', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '7', TO_DATE('2022-05-09 11:06:52', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '16', TO_DATE('2018-03-10 23:59:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '25', TO_DATE('2023-07-24 02:03:27', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('94', '3', TO_DATE('2016-05-18 01:28:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '7', TO_DATE('2021-06-16 20:11:03', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('80', '15', TO_DATE('2018-05-04 05:20:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '59', TO_DATE('2022-10-21 16:50:53', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('25', '12', TO_DATE('2015-01-29 12:44:58', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '97', TO_DATE('2021-04-29 20:50:44', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('75', '12', TO_DATE('2018-09-26 15:17:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2020-05-07 12:18:24', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('23', '2', TO_DATE('2016-02-12 17:17:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '25', TO_DATE('2021-06-08 08:04:27', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '8', TO_DATE('2019-04-25 08:26:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2022-12-01 03:31:04', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('48', '17', TO_DATE('2015-01-23 08:29:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '25', TO_DATE('2022-08-31 21:31:57', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('58', '5', TO_DATE('2018-11-14 19:01:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '61', TO_DATE('2020-12-18 12:57:36', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('99', '3', TO_DATE('2017-10-28 03:20:30', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '97', TO_DATE('2023-06-15 10:20:45', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('57', '16', TO_DATE('2017-12-25 23:54:58', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '13', TO_DATE('2022-01-24 16:02:47', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('36', '12', TO_DATE('2016-10-05 04:28:13', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '94', TO_DATE('2021-03-25 12:02:42', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '19', TO_DATE('2016-09-10 04:59:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2023-06-25 15:53:34', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '8', TO_DATE('2017-04-03 22:34:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2023-01-07 12:22:13', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('29', '7', TO_DATE('2016-05-11 13:16:39', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '85', TO_DATE('2020-10-11 13:22:14', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('88', '16', TO_DATE('2017-06-20 10:26:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '60', TO_DATE('2021-03-20 02:57:24', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('97', '11', TO_DATE('2019-10-01 06:05:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '85', TO_DATE('2023-06-17 23:48:55', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '1', TO_DATE('2016-04-12 13:37:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '68', TO_DATE('2022-01-18 00:05:38', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '17', TO_DATE('2016-06-22 10:02:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2020-11-26 13:04:43', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '5', TO_DATE('2018-07-12 03:11:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '25', TO_DATE('2022-04-02 00:06:36', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '14', TO_DATE('2017-05-27 08:51:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '7', TO_DATE('2022-02-01 05:14:30', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '6', TO_DATE('2015-11-12 10:49:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '88', TO_DATE('2020-11-03 17:50:18', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '10', TO_DATE('2016-12-16 19:04:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '81', TO_DATE('2021-02-01 01:22:18', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '17', TO_DATE('2016-02-22 06:24:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '97', TO_DATE('2020-05-12 11:12:56', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '11', TO_DATE('2015-01-16 23:45:18', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '49', TO_DATE('2022-07-31 17:28:16', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '3', TO_DATE('2016-11-23 09:55:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '50', TO_DATE('2020-05-01 22:49:35', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('86', '5', TO_DATE('2017-09-02 22:16:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '54', TO_DATE('2020-11-05 00:42:16', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '20', TO_DATE('2015-02-10 11:55:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2023-02-23 13:27:34', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('90', '15', TO_DATE('2017-08-06 19:27:11', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2020-02-03 15:08:29', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('84', '6', TO_DATE('2016-06-29 00:01:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '99', TO_DATE('2020-09-14 16:43:30', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('48', '9', TO_DATE('2017-06-08 13:59:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2021-08-07 00:34:43', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('60', '16', TO_DATE('2017-03-11 20:39:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2023-03-04 05:21:16', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('63', '12', TO_DATE('2015-08-13 21:59:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '26', TO_DATE('2021-09-17 07:57:36', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('65', '13', TO_DATE('2015-07-22 00:11:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '88', TO_DATE('2021-02-13 07:00:46', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('85', '14', TO_DATE('2015-06-28 12:23:15', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2022-01-29 23:30:55', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('83', '16', TO_DATE('2019-09-05 23:01:00', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '40', TO_DATE('2022-07-18 01:15:14', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '3', TO_DATE('2019-12-17 21:03:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '49', TO_DATE('2023-01-03 03:37:23', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '18', TO_DATE('2016-11-14 03:13:46', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '25', TO_DATE('2021-10-15 13:30:54', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('41', '19', TO_DATE('2019-01-27 22:27:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2022-12-09 08:55:15', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '13', TO_DATE('2019-09-23 01:58:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '4', TO_DATE('2020-06-25 08:27:41', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('79', '15', TO_DATE('2015-11-02 21:56:52', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '16', TO_DATE('2021-09-30 20:08:28', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('52', '15', TO_DATE('2018-11-24 01:43:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '93', TO_DATE('2021-08-16 09:27:54', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('68', '13', TO_DATE('2016-07-07 08:10:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2020-12-14 17:00:32', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '15', TO_DATE('2019-09-22 17:48:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2020-10-16 18:13:31', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '5', TO_DATE('2019-03-05 06:16:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '46', TO_DATE('2020-10-13 22:17:27', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '7', TO_DATE('2016-05-04 07:06:01', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '21', TO_DATE('2020-08-15 21:34:20', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('74', '7', TO_DATE('2015-05-05 23:59:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '4', TO_DATE('2020-12-30 18:07:40', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '9', TO_DATE('2017-02-06 20:05:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2022-08-18 17:21:49', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '7', TO_DATE('2015-12-10 08:24:15', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '8', TO_DATE('2022-07-04 23:04:25', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '2', TO_DATE('2017-07-31 18:31:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '48', TO_DATE('2021-12-07 07:22:23', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '8', TO_DATE('2018-09-11 02:07:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '87', TO_DATE('2023-07-03 11:44:02', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('51', '15', TO_DATE('2018-06-10 13:05:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2021-10-02 18:00:44', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '13', TO_DATE('2016-08-31 15:46:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '50', TO_DATE('2023-03-20 03:05:36', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('80', '17', TO_DATE('2016-09-08 13:01:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '84', TO_DATE('2022-09-18 18:09:20', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('56', '14', TO_DATE('2017-04-05 09:06:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2020-05-13 14:41:38', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('51', '16', TO_DATE('2018-09-10 15:23:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2022-06-07 13:39:44', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '18', TO_DATE('2018-04-25 22:06:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '73', TO_DATE('2020-01-06 01:01:32', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '5', TO_DATE('2016-11-16 11:13:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '12', TO_DATE('2022-02-26 01:45:05', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '14', TO_DATE('2015-07-19 06:33:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2022-07-15 05:48:11', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '19', TO_DATE('2017-06-20 11:28:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '15', TO_DATE('2022-07-20 03:36:34', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('65', '17', TO_DATE('2019-04-30 19:25:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '10', TO_DATE('2022-04-30 01:10:31', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('88', '13', TO_DATE('2016-12-15 23:45:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '90', TO_DATE('2021-05-01 23:51:21', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('84', '16', TO_DATE('2017-03-16 21:53:46', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '4', TO_DATE('2022-11-07 15:57:40', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('29', '6', TO_DATE('2017-07-23 02:05:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '3', TO_DATE('2022-02-17 15:55:31', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '18', TO_DATE('2016-04-06 18:19:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2023-09-01 08:11:52', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('34', '1', TO_DATE('2019-04-19 14:27:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '69', TO_DATE('2022-12-26 07:45:07', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('94', '1', TO_DATE('2018-10-21 22:07:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '34', TO_DATE('2021-05-24 12:42:11', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '7', TO_DATE('2017-02-26 09:29:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '22', TO_DATE('2021-09-03 23:56:04', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('51', '15', TO_DATE('2017-06-17 05:06:18', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '81', TO_DATE('2022-01-17 03:36:25', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('39', '5', TO_DATE('2019-08-30 00:01:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '48', TO_DATE('2022-11-10 07:11:22', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('51', '17', TO_DATE('2017-01-03 08:32:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '43', TO_DATE('2022-05-12 16:00:51', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '19', TO_DATE('2016-04-30 15:53:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '41', TO_DATE('2020-05-15 16:51:06', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('75', '13', TO_DATE('2016-07-20 14:40:18', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2020-08-14 19:13:47', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '8', TO_DATE('2016-04-17 17:41:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '51', TO_DATE('2022-08-22 17:52:10', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '2', TO_DATE('2019-12-08 18:13:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '77', TO_DATE('2020-03-20 04:15:12', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '14', TO_DATE('2018-06-04 11:21:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '100', TO_DATE('2020-03-01 12:15:29', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('82', '5', TO_DATE('2019-01-22 14:28:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2021-03-18 07:30:03', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('69', '2', TO_DATE('2019-02-13 21:18:01', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '82', TO_DATE('2022-04-13 01:05:35', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '4', TO_DATE('2015-10-10 18:57:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '27', TO_DATE('2022-11-13 06:44:21', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('93', '9', TO_DATE('2019-03-04 03:06:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '40', TO_DATE('2020-05-26 18:55:27', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '2', TO_DATE('2017-08-19 10:24:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '27', TO_DATE('2022-12-15 03:03:57', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('93', '4', TO_DATE('2018-12-30 02:03:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2021-09-22 10:23:37', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '8', TO_DATE('2019-09-12 10:53:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2022-12-05 01:48:31', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('39', '2', TO_DATE('2019-02-13 22:12:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '41', TO_DATE('2023-06-09 20:06:16', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '15', TO_DATE('2018-12-03 05:17:08', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2022-10-22 22:16:17', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('40', '6', TO_DATE('2015-06-09 13:59:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '94', TO_DATE('2021-09-01 08:30:03', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '1', TO_DATE('2018-07-04 19:11:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '28', TO_DATE('2022-12-25 10:23:51', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('51', '7', TO_DATE('2017-04-20 22:52:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2022-06-09 09:47:16', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('46', '9', TO_DATE('2019-10-10 01:23:19', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '79', TO_DATE('2023-04-21 05:20:50', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '1', TO_DATE('2016-03-29 15:07:11', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '61', TO_DATE('2023-09-04 01:44:02', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('61', '7', TO_DATE('2019-11-19 03:13:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2020-02-07 12:33:27', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('92', '19', TO_DATE('2019-08-01 06:55:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '92', TO_DATE('2021-03-03 02:40:38', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('77', '18', TO_DATE('2017-01-14 21:30:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '35', TO_DATE('2022-12-31 14:26:57', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '2', TO_DATE('2018-01-12 19:50:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '14', TO_DATE('2020-08-01 21:53:00', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '15', TO_DATE('2015-04-16 06:42:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2021-04-22 01:26:10', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('41', '8', TO_DATE('2019-05-27 11:25:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '32', TO_DATE('2021-05-21 13:02:09', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '18', TO_DATE('2015-04-22 01:34:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2021-07-30 18:35:10', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('77', '14', TO_DATE('2018-12-31 22:27:13', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '96', TO_DATE('2021-08-12 05:14:18', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('68', '20', TO_DATE('2018-01-04 15:10:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '87', TO_DATE('2023-08-29 12:19:01', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('81', '18', TO_DATE('2017-12-06 15:38:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '50', TO_DATE('2022-07-06 22:54:58', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('46', '20', TO_DATE('2016-04-23 20:18:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '99', TO_DATE('2021-07-01 17:50:32', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '16', TO_DATE('2019-01-05 03:32:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '43', TO_DATE('2020-11-02 22:35:08', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '12', TO_DATE('2015-10-20 22:19:30', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '3', TO_DATE('2020-06-05 23:08:19', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('85', '16', TO_DATE('2016-10-15 05:40:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '30', TO_DATE('2022-08-30 20:05:01', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '1', TO_DATE('2016-11-11 21:44:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '10', TO_DATE('2020-08-29 10:39:32', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '19', TO_DATE('2018-02-19 03:41:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2023-07-28 15:20:59', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('56', '6', TO_DATE('2016-02-26 04:43:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '17', TO_DATE('2020-04-16 00:04:03', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('41', '8', TO_DATE('2018-10-11 07:39:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '79', TO_DATE('2022-09-30 21:30:52', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('99', '20', TO_DATE('2018-12-16 22:56:01', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '89', TO_DATE('2023-08-19 13:24:58', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('90', '16', TO_DATE('2016-04-01 20:54:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '43', TO_DATE('2021-02-06 07:26:01', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '9', TO_DATE('2018-06-19 19:01:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '18', TO_DATE('2022-03-13 05:21:57', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('88', '8', TO_DATE('2016-06-22 14:58:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '87', TO_DATE('2021-12-24 03:15:12', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('57', '12', TO_DATE('2015-01-02 08:05:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '56', TO_DATE('2022-03-05 14:47:13', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('63', '6', TO_DATE('2016-02-10 05:50:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '86', TO_DATE('2021-09-11 00:22:09', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('78', '17', TO_DATE('2016-05-25 19:24:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '16', TO_DATE('2022-10-23 12:12:31', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('79', '16', TO_DATE('2015-03-21 14:23:52', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '20', TO_DATE('2023-01-29 22:16:44', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('93', '7', TO_DATE('2015-06-12 00:05:13', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '84', TO_DATE('2021-02-18 15:22:01', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '8', TO_DATE('2017-04-24 09:01:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2022-10-15 00:35:40', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '13', TO_DATE('2016-12-09 23:49:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2021-12-13 22:50:03', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '9', TO_DATE('2017-12-14 11:41:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '21', TO_DATE('2022-01-03 02:52:59', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '3', TO_DATE('2015-04-25 02:07:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2021-06-25 11:09:57', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '9', TO_DATE('2017-10-02 19:59:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2022-03-08 04:59:07', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '12', TO_DATE('2019-06-25 22:41:35', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2022-12-06 15:47:13', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('52', '2', TO_DATE('2019-11-28 01:42:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '31', TO_DATE('2022-11-28 12:25:51', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '3', TO_DATE('2018-02-24 00:54:52', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '24', TO_DATE('2022-07-02 00:25:51', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '14', TO_DATE('2015-01-18 03:12:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '1', TO_DATE('2021-07-31 04:17:54', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('58', '8', TO_DATE('2015-03-05 16:19:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '10', TO_DATE('2023-03-04 20:47:29', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '3', TO_DATE('2015-07-13 12:21:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '50', TO_DATE('2023-08-01 00:13:43', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('38', '3', TO_DATE('2019-09-13 08:36:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '25', TO_DATE('2021-10-08 14:17:35', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '2', TO_DATE('2016-06-18 08:21:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '72', TO_DATE('2022-12-22 04:43:50', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '5', TO_DATE('2019-01-14 15:57:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '10', TO_DATE('2022-04-27 05:09:05', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '7', TO_DATE('2016-04-16 09:44:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '39', TO_DATE('2020-12-07 09:40:22', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '13', TO_DATE('2016-09-30 00:43:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2023-03-18 05:10:30', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '11', TO_DATE('2019-11-11 09:02:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2023-07-21 17:22:55', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '2', TO_DATE('2017-06-25 00:19:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '15', TO_DATE('2021-12-15 21:15:41', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '8', TO_DATE('2015-01-13 21:06:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '74', TO_DATE('2020-03-02 06:50:00', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '7', TO_DATE('2015-05-27 17:02:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '55', TO_DATE('2020-11-22 02:11:31', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('71', '3', TO_DATE('2018-03-29 17:23:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2020-12-05 02:37:18', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '2', TO_DATE('2018-07-26 00:31:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2021-09-11 18:00:18', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '2', TO_DATE('2018-05-03 22:17:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '16', TO_DATE('2022-12-20 06:14:32', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('68', '2', TO_DATE('2018-03-08 04:48:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2023-04-12 06:04:09', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '3', TO_DATE('2019-10-14 02:35:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2020-03-09 14:45:52', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('41', '16', TO_DATE('2015-06-10 18:58:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2022-09-21 05:02:18', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '20', TO_DATE('2018-09-13 12:32:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '88', TO_DATE('2022-08-17 13:37:11', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('84', '10', TO_DATE('2017-08-04 19:41:39', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '81', TO_DATE('2022-06-06 05:23:06', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '17', TO_DATE('2017-02-15 20:02:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '35', TO_DATE('2022-09-22 03:46:47', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('37', '17', TO_DATE('2018-01-16 02:47:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2021-10-20 01:16:04', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('74', '19', TO_DATE('2015-09-28 11:44:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '31', TO_DATE('2021-05-15 04:27:17', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('66', '19', TO_DATE('2018-10-20 03:41:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '30', TO_DATE('2022-04-29 06:49:02', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '9', TO_DATE('2019-12-15 09:32:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '10', TO_DATE('2023-03-07 23:22:43', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '12', TO_DATE('2015-12-12 23:31:08', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '60', TO_DATE('2022-06-01 06:28:56', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('36', '18', TO_DATE('2017-09-26 18:17:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '93', TO_DATE('2021-09-08 02:13:49', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('66', '8', TO_DATE('2018-08-27 10:46:58', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '39', TO_DATE('2021-10-18 04:10:11', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('21', '17', TO_DATE('2017-03-10 10:17:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '80', TO_DATE('2023-07-18 07:35:43', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('75', '11', TO_DATE('2016-09-18 09:29:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '7', TO_DATE('2021-03-08 17:48:36', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('70', '6', TO_DATE('2017-08-24 07:13:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '51', TO_DATE('2022-03-18 08:49:22', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('42', '10', TO_DATE('2019-11-29 21:05:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '9', TO_DATE('2020-02-22 14:20:01', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('93', '13', TO_DATE('2017-07-09 20:48:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '8', TO_DATE('2020-02-11 16:04:50', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('38', '20', TO_DATE('2015-02-26 10:31:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '55', TO_DATE('2020-04-05 15:55:47', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('52', '11', TO_DATE('2018-06-28 00:46:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '83', TO_DATE('2020-08-11 04:25:57', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '1', TO_DATE('2015-04-05 20:55:44', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '31', TO_DATE('2022-10-12 20:11:07', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('21', '1', TO_DATE('2023-11-15 20:34:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '10', TO_DATE('2023-11-15 21:40:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '4', TO_DATE('2023-11-15 23:01:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '1', TO_DATE('2023-11-15 23:03:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '4', TO_DATE('2023-11-15 23:04:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '4', TO_DATE('2023-11-15 23:06:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '1', TO_DATE('2023-11-15 23:32:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('103', '4', TO_DATE('2023-11-16 10:48:14', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('104', '19', TO_DATE('2023-11-16 20:23:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '17', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('25', '12', TO_DATE('2017-09-07 15:15:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2023-06-08 08:49:40', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '19', TO_DATE('2018-08-14 07:55:13', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '80', TO_DATE('2020-09-07 21:29:26', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('74', '13', TO_DATE('2015-01-14 14:23:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '13', TO_DATE('2022-03-25 12:51:15', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('71', '19', TO_DATE('2018-05-29 05:35:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2023-09-02 02:31:10', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('48', '4', TO_DATE('2015-07-30 19:27:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '48', TO_DATE('2023-02-03 01:54:22', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('84', '13', TO_DATE('2017-05-12 10:34:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '54', TO_DATE('2021-02-17 11:03:03', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('48', '3', TO_DATE('2015-06-29 05:38:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '95', TO_DATE('2020-08-17 20:47:01', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '13', TO_DATE('2018-03-09 17:49:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '79', TO_DATE('2022-12-20 09:05:03', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('39', '18', TO_DATE('2016-06-08 08:23:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '99', TO_DATE('2020-01-16 19:17:24', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '9', TO_DATE('2017-12-03 09:03:30', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2022-10-22 08:58:10', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '2', TO_DATE('2018-10-28 21:29:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2022-08-02 18:18:12', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('86', '14', TO_DATE('2018-11-04 15:30:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '96', TO_DATE('2021-09-26 00:30:24', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '13', TO_DATE('2019-06-14 19:45:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '68', TO_DATE('2022-03-21 23:38:25', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '16', TO_DATE('2015-05-19 21:44:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2023-03-01 10:52:44', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('43', '11', TO_DATE('2015-09-17 18:02:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '46', TO_DATE('2020-02-29 13:59:39', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '18', TO_DATE('2018-12-02 08:50:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2022-07-25 17:38:07', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '7', TO_DATE('2017-06-10 01:35:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '9', TO_DATE('2022-12-17 12:58:51', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '2', TO_DATE('2018-07-10 22:12:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '81', TO_DATE('2020-04-09 07:02:52', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('38', '6', TO_DATE('2017-04-01 14:52:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '86', TO_DATE('2022-09-22 19:30:34', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '4', TO_DATE('2016-03-09 23:47:46', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '61', TO_DATE('2021-05-28 15:02:17', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '16', TO_DATE('2018-01-27 21:21:58', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '37', TO_DATE('2020-11-16 07:36:01', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '18', TO_DATE('2016-12-11 16:24:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2022-12-10 18:42:18', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('29', '17', TO_DATE('2015-05-10 17:53:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '81', TO_DATE('2023-06-29 01:26:45', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('68', '14', TO_DATE('2016-10-30 09:56:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2023-03-31 11:57:03', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('83', '7', TO_DATE('2016-09-18 02:41:58', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '93', TO_DATE('2021-09-06 09:45:53', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '18', TO_DATE('2017-08-16 13:25:14', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '56', TO_DATE('2020-11-21 08:58:19', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('83', '15', TO_DATE('2018-12-16 20:58:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '16', TO_DATE('2021-03-19 03:20:19', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('54', '12', TO_DATE('2015-09-06 09:13:19', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2020-03-13 05:43:40', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '13', TO_DATE('2019-05-14 01:45:44', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2020-07-05 07:58:27', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('68', '13', TO_DATE('2016-12-03 09:10:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '87', TO_DATE('2023-08-01 23:57:05', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('25', '14', TO_DATE('2019-06-16 19:48:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2021-11-23 21:15:46', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '5', TO_DATE('2019-11-07 18:24:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '85', TO_DATE('2021-12-18 01:54:01', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('66', '17', TO_DATE('2019-04-06 00:52:14', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '83', TO_DATE('2020-11-05 02:59:03', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('36', '18', TO_DATE('2015-11-06 10:34:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '5', TO_DATE('2022-10-31 03:53:43', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('40', '18', TO_DATE('2016-02-22 05:47:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '63', TO_DATE('2020-01-07 18:03:53', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '9', TO_DATE('2018-12-23 22:50:50', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '79', TO_DATE('2020-09-20 18:02:50', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('54', '20', TO_DATE('2019-05-20 17:11:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '49', TO_DATE('2020-01-09 18:43:38', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '9', TO_DATE('2016-09-05 10:58:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '100', TO_DATE('2023-05-07 03:24:51', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '20', TO_DATE('2015-06-03 01:11:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '77', TO_DATE('2020-03-28 01:18:25', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('23', '11', TO_DATE('2017-12-12 09:29:08', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '17', TO_DATE('2021-07-14 08:40:22', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('82', '1', TO_DATE('2018-11-29 14:04:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '58', TO_DATE('2023-04-07 10:37:06', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('40', '17', TO_DATE('2016-08-12 21:02:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '14', TO_DATE('2023-05-22 10:18:57', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '6', TO_DATE('2016-01-10 14:34:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '34', TO_DATE('2023-03-16 13:58:12', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '16', TO_DATE('2015-08-11 22:19:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '32', TO_DATE('2021-09-14 07:15:45', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '16', TO_DATE('2018-10-20 13:25:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '36', TO_DATE('2020-04-19 16:41:52', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '8', TO_DATE('2019-03-05 20:23:30', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2022-11-05 18:05:46', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '2', TO_DATE('2015-09-10 20:54:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '95', TO_DATE('2020-08-12 23:44:54', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '18', TO_DATE('2016-01-05 12:30:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '7', TO_DATE('2020-09-05 09:05:28', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '19', TO_DATE('2015-12-28 16:48:11', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2023-05-20 01:20:02', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '11', TO_DATE('2015-05-11 10:32:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '8', TO_DATE('2020-07-17 20:39:03', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('87', '14', TO_DATE('2017-08-09 03:26:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '93', TO_DATE('2021-04-09 20:07:44', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '9', TO_DATE('2017-12-09 03:18:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '73', TO_DATE('2022-01-19 11:54:31', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '15', TO_DATE('2018-07-19 20:17:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2021-11-29 10:13:54', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('92', '2', TO_DATE('2019-10-12 17:17:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '91', TO_DATE('2020-06-11 10:55:09', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('38', '17', TO_DATE('2019-08-19 03:41:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '63', TO_DATE('2023-03-05 11:50:33', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('42', '18', TO_DATE('2015-04-27 10:42:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '91', TO_DATE('2023-03-29 23:40:43', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('61', '10', TO_DATE('2016-04-22 16:50:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '85', TO_DATE('2022-03-29 00:09:52', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '4', TO_DATE('2018-11-01 07:51:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '52', TO_DATE('2020-10-13 14:32:40', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('21', '19', TO_DATE('2019-04-23 04:05:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '80', TO_DATE('2022-01-21 17:41:33', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('40', '7', TO_DATE('2018-04-02 07:39:28', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '77', TO_DATE('2020-03-17 23:13:18', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '19', TO_DATE('2019-12-09 07:30:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '16', TO_DATE('2020-05-07 22:33:11', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '1', TO_DATE('2015-05-13 19:23:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2022-03-01 10:34:53', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('59', '11', TO_DATE('2016-10-26 13:35:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2021-09-16 08:22:57', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('23', '10', TO_DATE('2018-09-25 11:46:27', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '51', TO_DATE('2020-01-21 17:16:21', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '14', TO_DATE('2017-10-11 17:19:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2023-05-10 19:10:42', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('75', '15', TO_DATE('2018-07-11 06:26:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '77', TO_DATE('2022-08-08 00:41:45', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '18', TO_DATE('2018-06-28 17:31:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '12', TO_DATE('2020-12-16 14:34:44', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('91', '15', TO_DATE('2015-01-01 01:17:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '35', TO_DATE('2021-06-01 10:59:56', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '14', TO_DATE('2015-04-02 14:34:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '48', TO_DATE('2021-09-26 22:23:53', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('65', '20', TO_DATE('2015-02-25 21:37:12', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '12', TO_DATE('2021-05-03 16:44:39', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '9', TO_DATE('2018-09-09 01:23:35', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '74', TO_DATE('2021-08-10 13:55:25', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '14', TO_DATE('2018-03-18 08:38:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2020-11-28 19:27:47', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '12', TO_DATE('2018-04-09 13:13:39', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '8', TO_DATE('2021-01-23 09:34:05', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '12', TO_DATE('2023-11-15 21:51:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '1', TO_DATE('2023-11-15 21:52:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('104', '1', TO_DATE('2023-11-16 16:21:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '4', TO_DATE('2023-11-15 23:00:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('103', '1', TO_DATE('2023-11-16 10:45:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('104', '4', TO_DATE('2023-11-16 19:20:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '0', NULL, NULL);
INSERT INTO "EDUX"."Enrolls" VALUES ('83', '10', TO_DATE('2017-09-18 22:37:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '77', TO_DATE('2021-12-08 23:41:31', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('91', '1', TO_DATE('2016-02-13 18:24:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '79', TO_DATE('2022-02-27 16:20:09', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '11', TO_DATE('2016-09-26 13:23:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2020-04-02 16:23:00', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('66', '1', TO_DATE('2018-07-29 11:48:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '83', TO_DATE('2021-08-24 18:26:16', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('92', '15', TO_DATE('2019-11-08 06:53:28', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '46', TO_DATE('2021-09-20 09:20:32', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '10', TO_DATE('2015-12-21 12:34:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2021-11-14 03:49:21', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '13', TO_DATE('2015-03-09 07:21:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '68', TO_DATE('2022-09-23 21:12:55', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('34', '15', TO_DATE('2015-12-04 20:14:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2023-04-04 05:56:39', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '1', TO_DATE('2016-05-05 17:38:46', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '62', TO_DATE('2021-07-24 23:24:08', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '11', TO_DATE('2018-01-02 04:04:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '96', TO_DATE('2022-10-30 08:42:49', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '5', TO_DATE('2016-02-14 17:04:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '34', TO_DATE('2022-04-15 22:22:38', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '2', TO_DATE('2015-01-21 01:52:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '27', TO_DATE('2022-06-03 07:14:35', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '20', TO_DATE('2017-03-14 10:43:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '10', TO_DATE('2022-06-20 23:02:45', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('48', '3', TO_DATE('2019-05-28 10:49:52', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '82', TO_DATE('2021-01-16 06:13:57', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '3', TO_DATE('2019-01-09 15:41:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '82', TO_DATE('2023-04-06 14:37:08', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '15', TO_DATE('2019-08-11 12:17:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '52', TO_DATE('2022-05-02 16:20:16', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '6', TO_DATE('2016-05-01 19:01:30', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '94', TO_DATE('2023-07-07 20:16:07', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('65', '15', TO_DATE('2017-06-24 16:35:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '99', TO_DATE('2022-08-08 06:26:15', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('42', '8', TO_DATE('2019-03-26 12:04:14', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '33', TO_DATE('2021-01-02 18:28:55', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('29', '11', TO_DATE('2018-03-16 09:10:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2022-02-13 15:29:31', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('78', '16', TO_DATE('2015-04-23 17:48:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2021-03-27 08:30:06', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('81', '1', TO_DATE('2015-12-02 18:10:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '53', TO_DATE('2023-03-24 02:20:54', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('94', '18', TO_DATE('2015-10-10 05:20:19', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '49', TO_DATE('2021-12-02 13:22:04', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('91', '19', TO_DATE('2015-03-12 15:45:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '7', TO_DATE('2023-01-11 00:39:59', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('39', '18', TO_DATE('2018-03-04 23:48:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '36', TO_DATE('2022-12-24 17:32:45', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '6', TO_DATE('2015-10-23 02:23:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '42', TO_DATE('2023-09-04 13:37:54', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '16', TO_DATE('2018-12-15 15:09:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '41', TO_DATE('2020-06-30 19:45:13', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '9', TO_DATE('2019-08-19 18:30:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '15', TO_DATE('2022-06-01 02:01:16', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('94', '10', TO_DATE('2017-11-26 02:18:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '100', TO_DATE('2023-07-15 20:10:52', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '19', TO_DATE('2017-03-05 14:36:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '3', TO_DATE('2020-04-27 07:44:10', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('46', '6', TO_DATE('2015-03-31 06:40:12', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '37', TO_DATE('2021-08-31 02:09:23', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '20', TO_DATE('2016-06-26 21:57:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '37', TO_DATE('2022-10-15 02:55:31', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('42', '3', TO_DATE('2015-10-17 03:19:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '96', TO_DATE('2022-04-12 00:23:46', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '4', TO_DATE('2019-03-25 11:44:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '76', TO_DATE('2022-09-01 18:39:54', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('84', '1', TO_DATE('2017-10-03 20:48:19', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '55', TO_DATE('2021-09-14 20:23:39', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('23', '7', TO_DATE('2019-09-20 14:40:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '58', TO_DATE('2020-06-24 09:34:58', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '1', TO_DATE('2017-08-25 08:36:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2022-06-27 23:59:53', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('91', '16', TO_DATE('2019-11-10 03:31:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '26', TO_DATE('2021-03-07 04:20:41', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('97', '15', TO_DATE('2017-04-19 04:19:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '86', TO_DATE('2023-08-06 10:27:14', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('88', '5', TO_DATE('2015-07-06 12:56:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '44', TO_DATE('2023-02-04 09:43:12', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('58', '8', TO_DATE('2017-07-07 17:44:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '33', TO_DATE('2022-04-19 18:21:08', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('50', '16', TO_DATE('2015-10-06 09:48:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '23', TO_DATE('2022-11-30 22:07:35', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '16', TO_DATE('2019-01-28 00:02:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '39', TO_DATE('2020-09-12 08:05:51', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('93', '8', TO_DATE('2017-02-27 03:44:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '55', TO_DATE('2021-03-19 15:06:44', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '4', TO_DATE('2017-04-20 12:33:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '60', TO_DATE('2021-07-12 20:30:55', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('66', '18', TO_DATE('2019-02-22 04:15:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '97', TO_DATE('2022-03-14 18:59:40', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('90', '16', TO_DATE('2018-04-30 16:10:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '41', TO_DATE('2021-11-09 12:36:26', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('80', '17', TO_DATE('2016-05-06 05:56:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '60', TO_DATE('2022-09-01 11:15:16', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('75', '10', TO_DATE('2018-09-21 00:30:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2020-12-15 22:16:54', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '14', TO_DATE('2019-11-01 05:06:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2022-11-14 19:30:45', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('83', '14', TO_DATE('2016-01-14 11:52:13', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '38', TO_DATE('2020-12-29 19:51:59', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '1', TO_DATE('2017-05-31 19:59:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2021-03-22 15:06:36', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '18', TO_DATE('2019-04-15 12:35:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '75', TO_DATE('2022-06-08 06:55:54', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('21', '16', TO_DATE('2017-07-27 10:43:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '80', TO_DATE('2020-07-15 13:22:39', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('29', '8', TO_DATE('2016-06-14 17:16:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '90', TO_DATE('2020-03-14 15:19:11', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('83', '1', TO_DATE('2015-05-28 03:38:52', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '13', TO_DATE('2020-03-01 17:50:27', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('93', '11', TO_DATE('2017-06-06 16:49:01', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '23', TO_DATE('2020-06-19 03:15:54', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '11', TO_DATE('2018-02-13 07:04:27', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2023-04-14 19:47:54', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '13', TO_DATE('2016-12-16 15:15:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2022-09-06 04:06:40', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '10', TO_DATE('2016-04-10 09:27:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '56', TO_DATE('2020-07-12 08:15:38', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('78', '16', TO_DATE('2016-04-24 18:25:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '61', TO_DATE('2023-09-06 14:24:14', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('92', '8', TO_DATE('2015-01-28 06:48:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '50', TO_DATE('2020-06-08 21:26:11', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '10', TO_DATE('2017-02-15 15:56:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2021-08-11 19:13:56', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '7', TO_DATE('2017-10-06 16:43:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '75', TO_DATE('2022-02-19 08:12:02', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('34', '3', TO_DATE('2018-08-03 02:03:15', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '1', TO_DATE('2023-01-05 22:20:36', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '20', TO_DATE('2019-06-18 05:26:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '75', TO_DATE('2023-04-14 03:47:36', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '8', TO_DATE('2015-02-03 05:03:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2021-02-01 03:47:23', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '7', TO_DATE('2017-12-05 08:41:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '96', TO_DATE('2022-06-19 02:12:08', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '8', TO_DATE('2017-05-18 07:32:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '61', TO_DATE('2022-10-29 00:19:43', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '16', TO_DATE('2019-12-18 03:14:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '26', TO_DATE('2023-05-18 01:54:59', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('71', '15', TO_DATE('2018-01-12 13:58:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '30', TO_DATE('2021-04-25 06:20:05', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('82', '2', TO_DATE('2018-02-06 02:46:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '91', TO_DATE('2020-04-02 19:28:00', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '17', TO_DATE('2015-06-21 15:02:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '81', TO_DATE('2023-02-10 11:23:50', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '3', TO_DATE('2016-02-15 06:08:46', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '34', TO_DATE('2023-07-24 15:14:51', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('87', '5', TO_DATE('2015-07-17 01:32:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '7', TO_DATE('2023-04-22 11:32:57', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '17', TO_DATE('2017-07-31 01:17:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '70', TO_DATE('2021-12-06 01:38:27', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '1', TO_DATE('2016-07-03 12:23:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '49', TO_DATE('2021-02-25 12:40:58', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '20', TO_DATE('2015-09-03 06:31:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '50', TO_DATE('2022-04-03 08:24:37', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('92', '13', TO_DATE('2018-02-10 00:43:46', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '30', TO_DATE('2023-01-17 21:26:10', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('48', '5', TO_DATE('2019-09-19 19:20:50', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '32', TO_DATE('2021-12-23 01:50:33', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '10', TO_DATE('2018-06-27 23:37:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '86', TO_DATE('2022-08-05 02:05:03', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '19', TO_DATE('2015-04-27 15:29:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '93', TO_DATE('2023-02-16 13:42:15', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('91', '6', TO_DATE('2018-02-03 21:40:19', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '96', TO_DATE('2021-07-28 14:09:49', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('46', '3', TO_DATE('2019-06-19 06:49:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '70', TO_DATE('2023-01-28 23:52:42', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('34', '20', TO_DATE('2017-01-11 03:49:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2022-01-12 22:38:10', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '10', TO_DATE('2017-10-07 05:06:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '52', TO_DATE('2020-02-25 09:14:12', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('91', '11', TO_DATE('2019-06-03 22:14:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2023-02-12 14:40:29', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '11', TO_DATE('2018-11-20 06:14:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '66', TO_DATE('2023-04-18 07:51:52', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '17', TO_DATE('2015-05-30 03:53:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '72', TO_DATE('2020-04-15 11:08:07', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('40', '9', TO_DATE('2019-01-31 05:02:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '47', TO_DATE('2021-03-13 18:37:21', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '13', TO_DATE('2019-11-12 18:49:28', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2020-04-17 04:00:00', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '11', TO_DATE('2018-06-04 14:57:11', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '18', TO_DATE('2023-05-10 19:27:15', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('60', '16', TO_DATE('2016-12-25 09:20:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '60', TO_DATE('2023-01-18 19:05:40', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '16', TO_DATE('2016-04-04 00:46:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '17', TO_DATE('2021-08-12 08:18:21', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('26', '14', TO_DATE('2018-11-25 08:52:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '35', TO_DATE('2021-02-25 14:03:03', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('32', '12', TO_DATE('2015-12-15 15:51:23', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '96', TO_DATE('2020-11-06 20:18:10', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('46', '13', TO_DATE('2016-03-16 00:22:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2023-04-11 17:32:34', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '15', TO_DATE('2018-01-21 04:44:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '21', TO_DATE('2023-01-24 03:13:25', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('67', '1', TO_DATE('2018-09-23 14:05:57', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '59', TO_DATE('2022-04-29 06:58:37', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('90', '11', TO_DATE('2016-05-15 16:42:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '51', TO_DATE('2022-11-09 15:16:46', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '20', TO_DATE('2015-06-14 05:15:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2023-03-12 22:21:07', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('40', '15', TO_DATE('2017-10-14 18:23:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '12', TO_DATE('2023-07-14 03:08:50', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('82', '4', TO_DATE('2018-11-23 01:04:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '80', TO_DATE('2020-09-24 12:28:21', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('34', '13', TO_DATE('2019-02-17 15:16:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '75', TO_DATE('2021-08-08 03:17:15', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('34', '18', TO_DATE('2015-01-01 10:20:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '74', TO_DATE('2020-11-07 22:33:07', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '18', TO_DATE('2016-08-13 23:48:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '52', TO_DATE('2021-03-13 03:11:19', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '7', TO_DATE('2019-12-04 22:40:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '40', TO_DATE('2022-11-10 06:54:04', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('60', '8', TO_DATE('2017-02-01 09:24:45', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '68', TO_DATE('2021-04-28 10:15:31', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('73', '10', TO_DATE('2017-06-13 03:07:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2021-08-24 01:24:40', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('51', '20', TO_DATE('2017-11-16 21:06:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '37', TO_DATE('2021-11-18 22:02:36', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('94', '18', TO_DATE('2016-08-15 02:46:01', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '28', TO_DATE('2023-02-08 22:38:55', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '4', TO_DATE('2016-03-27 02:01:06', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '26', TO_DATE('2020-08-12 20:31:52', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '19', TO_DATE('2018-02-01 13:16:11', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '87', TO_DATE('2022-04-25 23:55:18', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('86', '2', TO_DATE('2016-04-21 14:52:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '56', TO_DATE('2021-07-27 18:01:48', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('43', '2', TO_DATE('2016-04-25 21:22:25', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '29', TO_DATE('2022-06-25 18:48:14', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('49', '11', TO_DATE('2016-08-06 07:43:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '68', TO_DATE('2022-07-25 17:23:34', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('38', '17', TO_DATE('2019-10-06 15:28:35', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '41', TO_DATE('2022-09-06 10:21:21', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '4', TO_DATE('2015-08-09 16:20:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '79', TO_DATE('2022-10-25 04:54:27', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('63', '17', TO_DATE('2019-09-29 00:31:29', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2022-05-19 06:48:22', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('62', '17', TO_DATE('2017-07-30 05:40:02', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '95', TO_DATE('2020-09-15 11:29:05', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('63', '4', TO_DATE('2015-06-19 17:19:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '88', TO_DATE('2020-08-13 20:18:31', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('54', '15', TO_DATE('2018-08-31 08:26:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '26', TO_DATE('2022-07-09 11:43:58', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('48', '3', TO_DATE('2015-11-29 01:03:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '23', TO_DATE('2020-09-25 21:28:08', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('100', '7', TO_DATE('2017-04-02 09:57:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '31', TO_DATE('2020-07-16 13:29:32', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('47', '12', TO_DATE('2017-03-04 16:31:20', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '2', TO_DATE('2023-03-29 04:27:43', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('56', '8', TO_DATE('2015-03-18 19:34:48', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '18', TO_DATE('2021-08-24 22:15:37', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('36', '20', TO_DATE('2016-10-19 10:46:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '13', TO_DATE('2023-07-06 13:53:29', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('56', '15', TO_DATE('2015-03-16 12:15:39', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '80', TO_DATE('2022-06-21 12:43:21', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '10', TO_DATE('2019-11-04 22:14:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '21', TO_DATE('2021-12-25 09:49:12', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '12', TO_DATE('2016-01-25 03:49:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '58', TO_DATE('2022-11-04 17:07:05', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('56', '9', TO_DATE('2017-07-02 12:48:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '11', TO_DATE('2022-04-26 12:59:39', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('66', '2', TO_DATE('2016-11-08 09:21:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '71', TO_DATE('2022-02-21 23:21:30', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '8', TO_DATE('2016-10-30 12:50:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '15', TO_DATE('2022-03-17 04:55:48', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '7', TO_DATE('2017-03-23 13:08:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '93', TO_DATE('2021-11-02 02:52:32', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '10', TO_DATE('2015-09-26 08:29:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '28', TO_DATE('2022-02-17 07:36:24', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('92', '3', TO_DATE('2018-11-05 20:00:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '32', TO_DATE('2023-05-29 00:10:17', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('39', '16', TO_DATE('2019-11-13 04:48:55', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '33', TO_DATE('2021-08-14 05:18:36', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '12', TO_DATE('2019-09-30 02:07:54', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '26', TO_DATE('2021-11-20 13:15:20', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '3', TO_DATE('2015-11-10 15:34:15', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '1', TO_DATE('2021-10-12 05:12:10', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '20', TO_DATE('2015-01-07 11:02:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '16', TO_DATE('2020-10-06 17:02:42', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('52', '14', TO_DATE('2016-08-02 04:22:44', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '70', TO_DATE('2021-06-29 22:42:09', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('78', '12', TO_DATE('2018-07-04 03:22:05', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '13', TO_DATE('2021-04-22 03:00:46', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('58', '17', TO_DATE('2015-08-11 16:21:08', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '1', TO_DATE('2022-05-12 23:03:43', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('58', '7', TO_DATE('2017-04-21 13:58:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '35', TO_DATE('2023-04-09 23:08:07', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('65', '1', TO_DATE('2019-10-06 11:59:30', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '94', TO_DATE('2023-01-08 06:54:14', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('70', '4', TO_DATE('2018-01-03 21:51:13', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '30', TO_DATE('2023-02-05 17:29:57', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '5', TO_DATE('2017-02-27 15:35:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '63', TO_DATE('2021-08-17 01:19:19', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('95', '4', TO_DATE('2015-03-12 22:43:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '19', TO_DATE('2022-11-19 05:41:06', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '5', TO_DATE('2017-08-05 11:15:18', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2020-09-04 14:27:32', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('88', '2', TO_DATE('2017-06-14 03:52:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '55', TO_DATE('2021-01-01 09:29:58', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('58', '12', TO_DATE('2015-09-01 19:38:31', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '58', TO_DATE('2022-12-06 02:27:56', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('36', '10', TO_DATE('2019-08-14 11:00:03', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '61', TO_DATE('2021-08-11 12:32:12', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('38', '20', TO_DATE('2018-05-24 00:59:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '19', TO_DATE('2022-07-10 17:18:19', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('76', '7', TO_DATE('2015-06-10 22:20:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '83', TO_DATE('2021-10-13 20:47:16', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '11', TO_DATE('2015-03-05 01:55:11', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '60', TO_DATE('2022-03-05 13:57:10', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '6', TO_DATE('2015-11-19 17:45:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '70', TO_DATE('2022-02-26 07:39:25', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('57', '3', TO_DATE('2018-06-28 21:08:22', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '28', TO_DATE('2020-02-17 21:33:37', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '3', TO_DATE('2017-12-28 03:58:09', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '39', TO_DATE('2020-12-11 17:43:45', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('23', '4', TO_DATE('2018-12-23 22:28:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '34', TO_DATE('2021-12-30 21:15:46', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '9', TO_DATE('2018-08-22 18:40:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2023-07-24 11:59:27', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '13', TO_DATE('2015-07-01 17:39:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '35', TO_DATE('2021-04-17 10:49:05', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('33', '16', TO_DATE('2015-06-09 08:19:44', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '25', TO_DATE('2021-02-20 11:32:33', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('63', '7', TO_DATE('2015-08-21 19:36:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '90', TO_DATE('2021-10-30 03:31:36', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('25', '6', TO_DATE('2018-01-09 01:04:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '74', TO_DATE('2020-04-21 06:28:41', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '19', TO_DATE('2017-07-15 07:11:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '63', TO_DATE('2023-08-16 15:59:52', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '11', TO_DATE('2019-02-21 21:40:49', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '73', TO_DATE('2020-08-08 04:53:37', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('27', '13', TO_DATE('2015-01-25 14:01:30', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '48', TO_DATE('2021-01-10 06:52:15', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '19', TO_DATE('2019-03-02 17:34:56', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2021-03-31 07:50:18', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('77', '7', TO_DATE('2015-01-23 03:47:17', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '14', TO_DATE('2020-05-21 23:01:25', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '8', TO_DATE('2017-05-12 02:09:15', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '46', TO_DATE('2020-12-28 02:53:06', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('80', '7', TO_DATE('2015-01-22 01:48:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '2', TO_DATE('2020-06-07 11:04:42', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('96', '3', TO_DATE('2016-05-20 12:09:59', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '1', TO_DATE('2022-01-28 19:06:45', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('55', '14', TO_DATE('2015-09-25 19:03:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '4', TO_DATE('2020-05-14 01:33:15', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '3', TO_DATE('2016-10-26 07:27:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2021-04-22 21:42:13', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '1', TO_DATE('2017-10-27 04:29:39', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2023-08-25 16:10:21', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('94', '5', TO_DATE('2016-11-11 14:10:37', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '90', TO_DATE('2021-08-25 00:18:29', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('83', '2', TO_DATE('2018-02-16 23:07:26', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '48', TO_DATE('2020-04-09 22:00:13', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '17', TO_DATE('2015-03-14 07:27:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '16', TO_DATE('2022-06-02 22:10:01', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('98', '15', TO_DATE('2016-01-10 05:03:40', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '65', TO_DATE('2021-09-05 05:11:11', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('54', '3', TO_DATE('2015-02-21 17:24:46', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '24', TO_DATE('2023-05-06 01:14:53', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('56', '11', TO_DATE('2018-08-18 06:34:11', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '61', TO_DATE('2023-06-19 22:36:37', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('84', '20', TO_DATE('2016-01-21 10:19:16', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '54', TO_DATE('2023-07-10 18:34:11', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('34', '8', TO_DATE('2018-06-26 21:48:52', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '47', TO_DATE('2023-05-06 06:15:11', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('92', '6', TO_DATE('2018-08-29 09:26:44', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '90', TO_DATE('2021-04-26 01:04:22', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '9', TO_DATE('2015-09-23 06:43:00', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2020-03-23 05:01:44', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('37', '15', TO_DATE('2019-03-27 01:25:44', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '37', TO_DATE('2022-07-25 10:36:30', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('44', '9', TO_DATE('2017-10-23 06:07:15', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '44', TO_DATE('2022-01-11 20:51:28', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('58', '2', TO_DATE('2015-11-29 12:42:51', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '72', TO_DATE('2020-11-30 11:07:33', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '6', TO_DATE('2016-11-30 22:30:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '87', TO_DATE('2021-02-07 03:32:03', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '10', TO_DATE('2015-07-08 14:00:12', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '83', TO_DATE('2020-09-18 02:01:57', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('72', '14', TO_DATE('2019-03-11 01:23:19', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '73', TO_DATE('2020-02-17 22:26:50', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('64', '1', TO_DATE('2019-03-02 02:10:24', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '38', TO_DATE('2020-07-07 18:23:03', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('35', '8', TO_DATE('2019-05-11 14:43:04', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '74', TO_DATE('2022-06-04 22:18:27', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '18', TO_DATE('2017-09-11 02:50:53', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '41', TO_DATE('2022-12-11 06:26:03', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('31', '2', TO_DATE('2018-07-15 01:04:33', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '92', TO_DATE('2021-07-17 09:58:19', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('40', '19', TO_DATE('2015-05-29 18:50:21', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '70', TO_DATE('2022-05-15 10:18:38', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('89', '3', TO_DATE('2015-12-25 01:47:42', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2021-03-23 22:12:29', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('28', '7', TO_DATE('2019-04-10 03:13:36', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '14', TO_DATE('2021-09-07 18:31:18', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('42', '13', TO_DATE('2019-01-17 15:33:32', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '3', TO_DATE('2020-07-09 07:10:41', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('93', '12', TO_DATE('2015-02-17 14:40:41', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '38', TO_DATE('2021-06-29 12:31:38', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('46', '9', TO_DATE('2019-09-14 05:52:10', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '86', TO_DATE('2022-12-23 05:40:53', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('30', '4', TO_DATE('2018-06-14 11:32:12', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '6', TO_DATE('2022-07-02 14:00:06', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('77', '6', TO_DATE('2016-11-28 00:56:28', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '89', TO_DATE('2020-09-24 08:10:48', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('24', '2', TO_DATE('2017-08-24 03:53:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '67', TO_DATE('2021-07-27 15:30:45', 'SYYYY-MM-DD HH24:MI:SS'), 'D');
INSERT INTO "EDUX"."Enrolls" VALUES ('77', '12', TO_DATE('2018-10-16 08:02:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '78', TO_DATE('2020-08-13 18:09:35', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('91', '14', TO_DATE('2018-02-04 00:20:28', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '18', TO_DATE('2021-03-26 10:31:44', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('54', '16', TO_DATE('2018-04-28 13:56:47', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '2', TO_DATE('2020-05-14 18:58:49', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('22', '10', TO_DATE('2016-08-08 18:20:38', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '64', TO_DATE('2022-09-24 00:07:30', 'SYYYY-MM-DD HH24:MI:SS'), 'A');
INSERT INTO "EDUX"."Enrolls" VALUES ('81', '7', TO_DATE('2019-09-12 23:47:08', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '14', TO_DATE('2023-06-20 05:03:53', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('23', '11', TO_DATE('2018-01-24 06:06:43', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '99', TO_DATE('2020-07-03 05:42:55', 'SYYYY-MM-DD HH24:MI:SS'), 'B');
INSERT INTO "EDUX"."Enrolls" VALUES ('45', '10', TO_DATE('2018-02-15 05:42:19', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '57', TO_DATE('2020-03-18 14:44:38', 'SYYYY-MM-DD HH24:MI:SS'), 'C');
INSERT INTO "EDUX"."Enrolls" VALUES ('53', '20', TO_DATE('2015-02-18 17:03:34', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '13', TO_DATE('2023-02-04 15:47:40', 'SYYYY-MM-DD HH24:MI:SS'), 'E');
INSERT INTO "EDUX"."Enrolls" VALUES ('86', '1', TO_DATE('2019-03-31 05:27:07', 'SYYYY-MM-DD HH24:MI:SS'), 'y', '17', TO_DATE('2021-04-09 04:57:02', 'SYYYY-MM-DD HH24:MI:SS'), 'E');

-- ----------------------------
-- Table structure for Exams
-- ----------------------------
DROP TABLE "EDUX"."Exams";
CREATE TABLE "EDUX"."Exams" (
  "e_id" NUMBER VISIBLE NOT NULL,
  "duration" NUMBER VISIBLE,
  "question_count" NUMBER VISIBLE NOT NULL,
  "marks" NUMBER VISIBLE NOT NULL,
  "t_id" NUMBER VISIBLE NOT NULL,
  "weight" NUMBER VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Exams
-- ----------------------------
INSERT INTO "EDUX"."Exams" VALUES ('1', '5', '5', '5', '1', '5');
INSERT INTO "EDUX"."Exams" VALUES ('2', '5', '5', '5', '2', '5');
INSERT INTO "EDUX"."Exams" VALUES ('3', '5', '5', '5', '3', '5');
INSERT INTO "EDUX"."Exams" VALUES ('4', '5', '5', '5', '4', '5');

-- ----------------------------
-- Table structure for Feedbacks
-- ----------------------------
DROP TABLE "EDUX"."Feedbacks";
CREATE TABLE "EDUX"."Feedbacks" (
  "s_id" NUMBER VISIBLE NOT NULL,
  "c_id" NUMBER VISIBLE NOT NULL,
  "rating" NUMBER VISIBLE NOT NULL,
  "review" VARCHAR2(1000 CHAR) VISIBLE,
  "date" DATE VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Feedbacks
-- ----------------------------
INSERT INTO "EDUX"."Feedbacks" VALUES ('26', '19', '5', 'Very Good', TO_DATE('2023-09-10 21:00:49', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Feedbacks" VALUES ('27', '19', '4.5', 'Best for begineers.', TO_DATE('2023-09-10 20:57:54', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Feedbacks" VALUES ('28', '19', '4', 'Well Organized', TO_DATE('2023-09-10 21:02:23', 'SYYYY-MM-DD HH24:MI:SS'));

-- ----------------------------
-- Table structure for Instructors
-- ----------------------------
DROP TABLE "EDUX"."Instructors";
CREATE TABLE "EDUX"."Instructors" (
  "i_id" NUMBER VISIBLE NOT NULL,
  "subject" VARCHAR2(50 CHAR) VISIBLE,
  "course_count" NUMBER VISIBLE DEFAULT 0
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Instructors
-- ----------------------------
INSERT INTO "EDUX"."Instructors" VALUES ('101', 'math', '0');
INSERT INTO "EDUX"."Instructors" VALUES ('1', 'Human resource', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('2', 'Information Technology Support', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('3', 'Custom Service Support', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('4', 'Sales', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('5', 'Accounting & Finance', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('6', 'Sales', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('7', 'Marketing', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('8', 'Research & Development', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('9', 'Information Technology Support', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('10', 'Engineering', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('11', 'Sales', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('12', 'Export', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('13', 'Production', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('14', 'Purchasing', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('15', 'Human resource', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('16', 'Engineering', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('17', 'Human resource', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('18', 'Sales', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('19', 'Information Technology Support', '1');
INSERT INTO "EDUX"."Instructors" VALUES ('20', 'Administrative & Management', '1');

-- ----------------------------
-- Table structure for Lectures
-- ----------------------------
DROP TABLE "EDUX"."Lectures";
CREATE TABLE "EDUX"."Lectures" (
  "l_id" NUMBER VISIBLE NOT NULL,
  "description" VARCHAR2(1000 CHAR) VISIBLE,
  "video_link" VARCHAR2(1000 CHAR) VISIBLE,
  "t_id" NUMBER VISIBLE NOT NULL,
  "weight" NUMBER VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Lectures
-- ----------------------------
INSERT INTO "EDUX"."Lectures" VALUES ('1', 'Welcome to machine learning', 'https://www.youtube.com/watch?v=jGwO_UgTS7I&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=1&t=113s', '1', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('2', 'Application on machine learning', 'https://www.youtube.com/watch?v=4b4MUYve_U8&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=2', '1', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('3', 'What is machine learning', 'https://www.youtube.com/watch?v=het9HFqo1TQ&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=3', '2', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('4', 'Supervised learning part 1', 'https://www.youtube.com/watch?v=iZTeva0WSTQ&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=4', '2', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('5', 'Supervised learning part 2', 'https://www.youtube.com/watch?v=nt63k3bfXS0&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=5', '2', '5');
INSERT INTO "EDUX"."Lectures" VALUES ('6', 'Unsupervised learning part 1', 'https://www.youtube.com/watch?v=lDwow4aOrtg&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=6', '2', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('7', 'Unsupervised learning part 2', 'https://www.youtube.com/watch?v=8NYoQiRANpg&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=7', '2', '5');
INSERT INTO "EDUX"."Lectures" VALUES ('8', 'Linear regression model part 1', 'https://www.youtube.com/watch?v=rjbkWSTjHzM&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=8', '3', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('9', 'Linear regression model part 1', 'https://www.youtube.com/watch?v=iVOxMcumR4A&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=9', '3', '5');
INSERT INTO "EDUX"."Lectures" VALUES ('10', 'Cost function formula', 'https://www.youtube.com/watch?v=wr9gUr-eWdA&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=10', '3', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('11', 'Cost function intuition', 'https://www.youtube.com/watch?v=MfIjxPh6Pys&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=11', '3', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('12', 'Visualizing the cost function', 'https://www.youtube.com/watch?v=zUazLXZZA2U&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=12', '3', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('13', 'Visualization examples', 'https://www.youtube.com/watch?v=ORrStCArmP4&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=13', '3', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('14', 'Gradient descent', 'https://www.youtube.com/watch?v=rVfZHWTwXSA&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=14', '4', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('15', 'Implementing gradient descent', 'https://www.youtube.com/watch?v=tw6cmL5STuY&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=15', '4', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('16', 'Gradient descent intuition', 'https://www.youtube.com/watch?v=YQA9lLdLig8&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=16', '4', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('17', 'Learning rate', 'https://www.youtube.com/watch?v=d5gaWTo6kDM&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=17', '4', '4');
INSERT INTO "EDUX"."Lectures" VALUES ('18', 'Gradient descent for linear regression', 'https://www.youtube.com/watch?v=QFu5nuc-S0s&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=18', '4', '5');
INSERT INTO "EDUX"."Lectures" VALUES ('19', 'Running gradient descent', 'https://www.youtube.com/watch?v=0rt2CsEQv6U&list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU&index=19', '4', '4');

-- ----------------------------
-- Table structure for Notifications
-- ----------------------------
DROP TABLE "EDUX"."Notifications";
CREATE TABLE "EDUX"."Notifications" (
  "n_id" NUMBER VISIBLE DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "u_id" NUMBER VISIBLE NOT NULL,
  "date" DATE VISIBLE NOT NULL,
  "about" VARCHAR2(100 CHAR) VISIBLE NOT NULL,
  "seen_status" VARCHAR2(1 CHAR) VISIBLE DEFAULT 'u' NOT NULL
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Notifications
-- ----------------------------

-- ----------------------------
-- Table structure for Questions
-- ----------------------------
DROP TABLE "EDUX"."Questions";
CREATE TABLE "EDUX"."Questions" (
  "q_id" NUMBER VISIBLE DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "e_id" NUMBER VISIBLE NOT NULL,
  "q_description" VARCHAR2(1000 CHAR) VISIBLE NOT NULL,
  "option_a" VARCHAR2(100 CHAR) VISIBLE,
  "option_b" VARCHAR2(100 CHAR) VISIBLE,
  "option_c" VARCHAR2(100 CHAR) VISIBLE,
  "option_d" VARCHAR2(100 CHAR) VISIBLE,
  "right_ans" VARCHAR2(1 CHAR) VISIBLE NOT NULL,
  "marks" NUMBER VISIBLE NOT NULL,
  "serial" NUMBER VISIBLE NOT NULL
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Questions
-- ----------------------------
INSERT INTO "EDUX"."Questions" VALUES ('20', '4', 'Which variant of gradient descent computes the gradient using the entire training dataset in each iteration?', 'Stochastic Gradient Descent (SGD)', 'Mini-batch Gradient Descent', 'Batch Gradient Descent', 'Momentum Gradient Descent', '3', '1', '5');
INSERT INTO "EDUX"."Questions" VALUES ('1', '1', 'What is machine learning?', 'A computer program that can make decisions', 'A field of artificial intelligence that focuses on developing algorithms', 'A type of robotics technology', 'A human''s ability to learn from textbooks', '2', '1', '1');
INSERT INTO "EDUX"."Questions" VALUES ('2', '1', 'What is supervised learning in machine learning?', 'A type of learning where the model learns from labeled data and makes predictions without guidance', 'A type of learning where the model learns from unlabeled data and tries to identify patterns', 'A type of learning where the model learns from feedback provided by a human teacher', 'A type of learning where the model learns from data and makes predictions based on predefined rules', '1', '1', '2');
INSERT INTO "EDUX"."Questions" VALUES ('3', '1', 'Which of the following is NOT a machine learning algorithm?', ' Decision Trees', 'Linear Regression', 'Excel Spreadsheets', 'Support Vector Machines', '3', '1', '3');
INSERT INTO "EDUX"."Questions" VALUES ('4', '1', 'What is the primary goal of unsupervised learning in machine learning?', ' To classify data into predefined categories', 'To learn from labeled data and make predictions', 'To discover hidden patterns or structure in data without labeled outputs', 'To optimize the performance of a model', '3', '1', '4');
INSERT INTO "EDUX"."Questions" VALUES ('5', '1', 'Which of the following is a common evaluation metric used in machine learning for classification tasks?', 'Mean Absolute Error (MAE)', 'R-squared (R2)', 'Mean Squared Error (MSE)', 'Accuracy', '4', '1', '5');
INSERT INTO "EDUX"."Questions" VALUES ('6', '2', 'What is the primary difference between Supervised and Unsupervised Machine Learning?', 'Supervised learning uses labeled data for training, while unsupervised learning uses unlabeled data.', 'Supervised learning is faster than unsupervised learning.', 'Unsupervised learning requires human intervention, while supervised learning does not.', 'Supervised learning can only handle binary classification tasks.', '1', '1', '1');
INSERT INTO "EDUX"."Questions" VALUES ('7', '2', 'Which of the following is an example of a supervised learning algorithm?', 'K-Means Clustering', 'Principal Component Analysis (PCA)', 'Linear Regression', 'Hierarchical Clustering', '3', '1', '2');
INSERT INTO "EDUX"."Questions" VALUES ('8', '2', 'In unsupervised learning, what is the primary goal of the algorithm?', 'To predict a target variable.', 'To group similar data points together.', 'To perform dimensionality reduction.', 'To classify data into predefined categories.', '2', '1', '3');
INSERT INTO "EDUX"."Questions" VALUES ('9', '2', 'Which type of machine learning is commonly used for image recognition and natural language processing tasks?', 'Supervised Learning', 'Reinforcement Learning', 'Semi-supervised Learning', 'Unsupervised Learning', '1', '1', '4');
INSERT INTO "EDUX"."Questions" VALUES ('10', '2', 'Which of the following is an advantage of supervised learning over unsupervised learning?', 'It can discover hidden patterns in data.', 'It requires less computational resources.', 'It can make precise predictions on new, unseen data.', 'It doesn''t require a training dataset.', '3', '1', '5');
INSERT INTO "EDUX"."Questions" VALUES ('11', '3', 'What is the primary goal of a regression model?', 'Classification', 'Clustering', 'Prediction', 'Feature extraction', '3', '1', '1');
INSERT INTO "EDUX"."Questions" VALUES ('12', '3', 'Which type of regression is suitable when the dependent variable is binary (0/1)?', 'Linear Regression', 'Lasso Regression', 'Logistic Regression', 'Polynomial Regression', '3', '1', '2');
INSERT INTO "EDUX"."Questions" VALUES ('13', '3', 'Which statistical metric is commonly used to evaluate the performance of a regression model?', 'Accuracy', 'F1 Score', 'R-squared (R²)', 'Precision', '3', '1', '3');
INSERT INTO "EDUX"."Questions" VALUES ('14', '3', 'In multiple linear regression, what is the maximum number of independent variables that can be used in the model without causing multicollinearity issues?', 'There is no maximum limit.', '1', '2', '3', '1', '1', '4');
INSERT INTO "EDUX"."Questions" VALUES ('15', '3', 'Which of the following techniques can help combat overfitting in a regression model?', 'Increasing the model complexity', 'Using a smaller training dataset', 'Regularization techniques like Lasso and Ridge', 'Removing outliers from the dataset', '3', '1', '5');
INSERT INTO "EDUX"."Questions" VALUES ('16', '4', 'What is the primary objective of training a machine learning model using gradient descent?', 'Minimize the number of features', 'Maximize the training data', 'Minimize the loss function', 'Maximize the learning rate', '3', '1', '1');
INSERT INTO "EDUX"."Questions" VALUES ('17', '4', 'In gradient descent, what does the learning rate control?', 'The number of training examples', 'The speed at which the model converges', 'The size of the model''s parameters', 'The size of the dataset', '2', '1', '2');
INSERT INTO "EDUX"."Questions" VALUES ('18', '4', 'Which of the following best describes the gradient in gradient descent?', ' A vector pointing in the direction of steepest ascent of the loss function', 'A vector pointing in the direction of steepest descent of the loss function', 'A random vector', 'A vector representing the number of training examples', '2', '1', '3');
INSERT INTO "EDUX"."Questions" VALUES ('19', '4', 'What is the purpose of the gradient descent update step in training a model?', ' To increase the learning rate', 'To calculate the loss function', 'To update model parameters to minimize the loss', ' To calculate the number of features', '3', '1', '4');

-- ----------------------------
-- Table structure for Students
-- ----------------------------
DROP TABLE "EDUX"."Students";
CREATE TABLE "EDUX"."Students" (
  "s_id" NUMBER VISIBLE NOT NULL,
  "course_count" NUMBER VISIBLE DEFAULT 0 NOT NULL,
  "date_of_birth" DATE VISIBLE,
  "gender" CHAR(1 BYTE) VISIBLE,
  "field" VARCHAR2(100 BYTE) VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Students
-- ----------------------------
INSERT INTO "EDUX"."Students" VALUES ('104', '0', TO_DATE('2023-11-08 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'), 'M', NULL);
INSERT INTO "EDUX"."Students" VALUES ('21', '5', TO_DATE('2001-08-24 08:34:18', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('22', '10', TO_DATE('2004-08-01 22:15:08', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('23', '6', TO_DATE('2005-08-14 21:49:58', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('24', '8', TO_DATE('2005-01-06 20:47:42', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('25', '4', TO_DATE('2000-09-19 21:57:56', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('26', '8', TO_DATE('2001-08-22 20:59:54', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('27', '8', TO_DATE('2002-04-09 21:43:04', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('28', '9', TO_DATE('2001-02-14 15:34:37', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Product Quality');
INSERT INTO "EDUX"."Students" VALUES ('29', '6', TO_DATE('2005-07-31 23:46:21', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('30', '8', TO_DATE('2005-08-03 05:15:42', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('31', '12', TO_DATE('2001-06-14 10:51:58', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('32', '8', TO_DATE('2002-11-16 01:28:39', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Administrative & Management');
INSERT INTO "EDUX"."Students" VALUES ('33', '9', TO_DATE('2002-12-01 15:44:25', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('34', '7', TO_DATE('2000-02-01 05:43:12', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('35', '9', TO_DATE('2002-02-28 14:07:20', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Administrative & Management');
INSERT INTO "EDUX"."Students" VALUES ('36', '5', TO_DATE('2001-04-01 00:00:43', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('37', '3', TO_DATE('2003-05-19 19:27:48', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('38', '6', TO_DATE('2002-10-21 01:08:36', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('39', '7', TO_DATE('2003-03-26 18:29:57', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('40', '7', TO_DATE('2005-10-06 17:33:29', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Product Quality');
INSERT INTO "EDUX"."Students" VALUES ('41', '4', TO_DATE('2005-10-24 12:35:46', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Administrative & Management');
INSERT INTO "EDUX"."Students" VALUES ('42', '6', TO_DATE('2002-05-03 16:51:40', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('43', '4', TO_DATE('2003-04-07 03:31:15', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('44', '9', TO_DATE('2002-11-05 22:45:27', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('45', '10', TO_DATE('2003-06-26 06:44:52', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Product Quality');
INSERT INTO "EDUX"."Students" VALUES ('46', '6', TO_DATE('2003-12-05 01:08:36', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Administrative & Management');
INSERT INTO "EDUX"."Students" VALUES ('47', '9', TO_DATE('2005-02-14 22:29:11', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('48', '7', TO_DATE('2004-06-02 09:44:14', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('49', '10', TO_DATE('2001-05-08 05:19:46', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Purchasing');
INSERT INTO "EDUX"."Students" VALUES ('50', '8', TO_DATE('2002-10-01 01:11:02', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('51', '6', TO_DATE('2000-07-25 07:13:36', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('52', '4', TO_DATE('2001-01-06 21:59:04', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('53', '11', TO_DATE('2004-03-28 11:54:40', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('54', '5', TO_DATE('2003-09-06 23:00:13', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('55', '10', TO_DATE('2002-07-28 12:22:10', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('56', '7', TO_DATE('2000-08-08 18:28:18', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('57', '3', TO_DATE('2002-12-26 05:09:47', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('58', '7', TO_DATE('2006-05-02 19:20:45', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('59', '8', TO_DATE('2004-12-22 20:59:05', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Research & Development');
INSERT INTO "EDUX"."Students" VALUES ('60', '3', TO_DATE('2000-01-21 10:23:57', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('61', '2', TO_DATE('2001-07-13 17:40:45', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('62', '3', TO_DATE('2001-09-14 17:25:13', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Research & Development');
INSERT INTO "EDUX"."Students" VALUES ('63', '5', TO_DATE('2005-03-31 20:48:31', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('64', '8', TO_DATE('2001-03-14 15:22:44', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Research & Development');
INSERT INTO "EDUX"."Students" VALUES ('65', '5', TO_DATE('2000-05-04 00:08:04', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('66', '6', TO_DATE('2006-02-11 16:23:14', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('67', '9', TO_DATE('2000-10-15 01:02:26', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Purchasing');
INSERT INTO "EDUX"."Students" VALUES ('68', '5', TO_DATE('2002-06-30 06:45:37', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('69', '1', TO_DATE('2002-07-12 12:48:44', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('70', '2', TO_DATE('2005-07-03 21:48:58', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('71', '3', TO_DATE('2000-02-17 13:32:53', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Research & Development');
INSERT INTO "EDUX"."Students" VALUES ('72', '8', TO_DATE('2004-02-24 06:20:42', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('73', '9', TO_DATE('2003-12-30 12:52:27', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('74', '4', TO_DATE('2001-03-19 06:23:55', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('75', '5', TO_DATE('2001-03-17 17:52:58', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('76', '9', TO_DATE('2003-06-08 14:11:16', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Research & Development');
INSERT INTO "EDUX"."Students" VALUES ('77', '5', TO_DATE('2005-12-12 08:39:03', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Purchasing');
INSERT INTO "EDUX"."Students" VALUES ('78', '5', TO_DATE('2001-08-04 23:59:34', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Research & Development');
INSERT INTO "EDUX"."Students" VALUES ('79', '3', TO_DATE('2005-11-05 21:35:31', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('80', '4', TO_DATE('2000-06-19 20:21:53', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('81', '3', TO_DATE('2003-10-15 10:20:33', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('82', '6', TO_DATE('2003-06-14 07:53:05', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Research & Development');
INSERT INTO "EDUX"."Students" VALUES ('83', '7', TO_DATE('2004-08-05 01:24:21', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Purchasing');
INSERT INTO "EDUX"."Students" VALUES ('84', '7', TO_DATE('2006-04-22 19:02:51', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('85', '3', TO_DATE('2005-08-14 19:18:31', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('86', '4', TO_DATE('2001-06-08 07:46:53', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Legal Department');
INSERT INTO "EDUX"."Students" VALUES ('87', '2', TO_DATE('2004-09-18 19:39:12', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('88', '5', TO_DATE('2005-08-17 03:29:32', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('89', '9', TO_DATE('2000-01-25 12:25:37', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('90', '4', TO_DATE('2004-12-15 00:55:31', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Purchasing');
INSERT INTO "EDUX"."Students" VALUES ('91', '7', TO_DATE('2004-04-03 18:43:48', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('92', '7', TO_DATE('2002-11-05 04:25:01', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Public Relations');
INSERT INTO "EDUX"."Students" VALUES ('93', '7', TO_DATE('2003-08-08 06:59:47', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Engineering');
INSERT INTO "EDUX"."Students" VALUES ('94', '7', TO_DATE('2003-07-05 06:37:06', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('95', '9', TO_DATE('2005-02-07 18:07:21', 'SYYYY-MM-DD HH24:MI:SS'), 'F', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('96', '8', TO_DATE('2001-01-20 21:39:08', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('97', '3', TO_DATE('2005-01-02 11:32:40', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Purchasing');
INSERT INTO "EDUX"."Students" VALUES ('98', '9', TO_DATE('2006-06-15 00:47:51', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Marketing');
INSERT INTO "EDUX"."Students" VALUES ('99', '3', TO_DATE('2004-07-17 16:20:19', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('100', '8', TO_DATE('2002-10-25 17:39:58', 'SYYYY-MM-DD HH24:MI:SS'), 'M', 'Accounting & Finance');
INSERT INTO "EDUX"."Students" VALUES ('102', '0', TO_DATE('2001-09-10 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'), 'M', NULL);
INSERT INTO "EDUX"."Students" VALUES ('103', '0', TO_DATE('2023-11-14 00:00:00', 'SYYYY-MM-DD HH24:MI:SS'), 'M', NULL);

-- ----------------------------
-- Table structure for Takes
-- ----------------------------
DROP TABLE "EDUX"."Takes";
CREATE TABLE "EDUX"."Takes" (
  "s_id" NUMBER VISIBLE NOT NULL,
  "e_id" NUMBER VISIBLE NOT NULL,
  "status" VARCHAR2(10 CHAR) VISIBLE,
  "marks" NUMBER VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Takes
-- ----------------------------
INSERT INTO "EDUX"."Takes" VALUES ('104', '3', 'f', '2');
INSERT INTO "EDUX"."Takes" VALUES ('24', '1', 'p', '5');
INSERT INTO "EDUX"."Takes" VALUES ('27', '1', 'f', '5');
INSERT INTO "EDUX"."Takes" VALUES ('26', '3', 'p', '5');
INSERT INTO "EDUX"."Takes" VALUES ('26', '4', 'p', '3');
INSERT INTO "EDUX"."Takes" VALUES ('26', '1', 'p', '5');
INSERT INTO "EDUX"."Takes" VALUES ('21', '1', 'p', '4');
INSERT INTO "EDUX"."Takes" VALUES ('26', '2', 'f', '4');
INSERT INTO "EDUX"."Takes" VALUES ('104', '1', 'f', '4');
INSERT INTO "EDUX"."Takes" VALUES ('104', '2', 'p', '3');

-- ----------------------------
-- Table structure for Topics
-- ----------------------------
DROP TABLE "EDUX"."Topics";
CREATE TABLE "EDUX"."Topics" (
  "t_id" NUMBER VISIBLE DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "name" VARCHAR2(100 CHAR) VISIBLE NOT NULL,
  "c_id" NUMBER VISIBLE NOT NULL,
  "serial" NUMBER VISIBLE NOT NULL,
  "weight" NUMBER VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Topics
-- ----------------------------
INSERT INTO "EDUX"."Topics" VALUES ('1', 'Overview of Machine Learning', '19', '1', '13');
INSERT INTO "EDUX"."Topics" VALUES ('2', 'Supervised vs Unsupervised Machine Learning', '19', '2', '27');
INSERT INTO "EDUX"."Topics" VALUES ('3', 'Regression Model', '19', '3', '30');
INSERT INTO "EDUX"."Topics" VALUES ('4', 'Train the model with gradient descent', '19', '4', '30');

-- ----------------------------
-- Table structure for Users
-- ----------------------------
DROP TABLE "EDUX"."Users";
CREATE TABLE "EDUX"."Users" (
  "u_id" NUMBER VISIBLE DEFAULT EDUX.SEQUENCE.nextval NOT NULL,
  "name" VARCHAR2(50 CHAR) VISIBLE NOT NULL,
  "email" VARCHAR2(100 CHAR) VISIBLE NOT NULL,
  "password" VARCHAR2(100 CHAR) VISIBLE NOT NULL,
  "reg_date" DATE VISIBLE DEFAULT sysdate
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Users
-- ----------------------------
INSERT INTO "EDUX"."Users" VALUES ('104', 'abc', 'a@x', '1', TO_DATE('2023-11-16 16:21:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('101', 'afzal', 'afzal1213', '1213', TO_DATE('2023-09-11 14:58:56', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('102', 'afzal', 'afzal12345@gmail.com', '12345', TO_DATE('2023-11-15 15:23:01', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('103', 'tanvir', 'afafa@gmail.com', '123', TO_DATE('2023-11-16 10:23:43', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('1', 'Albert Patterson', 'alpat1982@yahoo.com', 'vtJA1wKATL', TO_DATE('2000-05-31 14:56:05', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('2', 'Brandon Medina', 'bmedina701@gmail.com', 'NdEjpGcX3W', TO_DATE('2017-09-13 10:58:25', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('3', 'Roger Griffin', 'roggriffin@gmail.com', 'c4dz792ipC', TO_DATE('2018-01-27 03:13:45', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('4', 'Clifford Peterson', 'petersonclifford6@outlook.com', 'wT4OXV2ZCD', TO_DATE('2006-09-27 18:16:21', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('5', 'Jacqueline Lewis', 'jacquelinelew6@gmail.com', '72k8HoKqUR', TO_DATE('2001-12-19 04:24:18', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('6', 'Gregory Boyd', 'greb@hotmail.com', 'Jr04gPq9Py', TO_DATE('2018-02-26 19:57:47', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('7', 'Frances Reed', 'reed9@hotmail.com', 'xPCwrBczDi', TO_DATE('2015-07-27 09:18:53', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('8', 'Heather Gonzales', 'heatgonzales9@gmail.com', 'na9S2h4a1U', TO_DATE('2015-12-17 08:10:36', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('9', 'Rebecca Sanchez', 'sanchezrebec@gmail.com', 'D9q9CwcoUz', TO_DATE('2009-07-24 09:20:50', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('10', 'Gladys Ortiz', 'ortizg@yahoo.com', 'xL5nzSTiDg', TO_DATE('2018-10-24 08:47:23', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('11', 'Frederick Rose', 'frederickrose01@hotmail.com', 'RQtfZhrYma', TO_DATE('2022-06-04 14:53:42', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('12', 'Deborah Spencer', 'spencerd15@outlook.com', 'LjT6NzEL5A', TO_DATE('2021-04-13 13:14:41', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('13', 'Cynthia Gutierrez', 'gutierrez1014@gmail.com', 'LoKcjvnwre', TO_DATE('2004-12-09 23:33:34', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('14', 'Danielle Hill', 'danielle19@outlook.com', 'TnF7eFBfeI', TO_DATE('2023-02-19 11:10:13', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('15', 'David Jimenez', 'djimenez2017@outlook.com', 'KFQ43GhXIS', TO_DATE('2020-08-06 14:17:53', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('16', 'Gary Green', 'greengary321@gmail.com', 'zEb22QRrhJ', TO_DATE('2006-03-04 18:57:28', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('17', 'Gary Adams', 'adamsg07@outlook.com', 'spAONjE4tP', TO_DATE('2002-09-28 14:44:30', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('18', 'Herbert Mendoza', 'hmendo87@gmail.com', 'dMcC88PFus', TO_DATE('2006-10-07 12:33:17', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('19', 'Debra Butler', 'debrabutler@outlook.com', 'pAuT7dRpze', TO_DATE('2010-02-08 14:41:22', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('20', 'Irene Stewart', 'sir@outlook.com', 'RFLx5OjErW', TO_DATE('2011-06-23 03:52:24', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('21', 'Carrie Alvarez', 'alvacarrie@outlook.com', 'I0xMOwMbta', TO_DATE('2017-11-26 04:07:27', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('22', 'Jack Henry', 'henryjac@outlook.com', 'vKxnZsGjED', TO_DATE('2014-11-10 17:31:30', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('23', 'Edith Mason', 'masonedit1116@gmail.com', 'UezwU6xYAL', TO_DATE('2011-04-23 06:48:22', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('24', 'Russell Meyer', 'mrusse1102@yahoo.com', 'week8Iqxif', TO_DATE('2020-07-19 23:43:16', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('25', 'Laura Alvarez', 'alvarezl@hotmail.com', 'AJ4mhQXhSy', TO_DATE('2000-04-13 18:01:10', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('26', 'Steve Reynolds', 'steve116@yahoo.com', 'DAniRMvaLc', TO_DATE('2006-09-06 21:44:20', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('27', 'Eva Roberts', 'eva1@outlook.com', 'Md1vCiEgcO', TO_DATE('2006-01-26 00:14:03', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('28', 'Ryan Cox', 'ryan82@gmail.com', 'qlo3UTvJ9I', TO_DATE('2005-05-04 22:22:59', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('29', 'Manuel Gutierrez', 'manuelgu409@gmail.com', 'icso5ebxgr', TO_DATE('2006-11-08 21:58:52', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('30', 'Larry Brooks', 'larry1989@hotmail.com', '3QnWdCtZGh', TO_DATE('2015-05-24 16:21:03', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('31', 'Virginia Martin', 'martinvirginia90@hotmail.com', 'yNHlFYRn2c', TO_DATE('2016-03-30 14:10:36', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('32', 'Keith Green', 'green66@outlook.com', 'sWhw3J7PZd', TO_DATE('2023-03-20 10:25:24', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('33', 'Janice Munoz', 'janmunoz14@outlook.com', 'SlU3q8ixv1', TO_DATE('2023-02-22 03:57:35', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('34', 'Nathan Moore', 'moore1107@gmail.com', '6zXem0do4m', TO_DATE('2008-03-08 09:02:03', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('35', 'Carrie Cox', 'carriecox@yahoo.com', 'HZqGHExGbD', TO_DATE('2007-09-27 15:14:46', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('36', 'Juan Torres', 'juantorres@gmail.com', 'U3nVevDUF8', TO_DATE('2002-11-29 14:56:48', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('37', 'Nicholas Bennett', 'bennnich02@outlook.com', 'KKWGOTtFze', TO_DATE('2016-12-01 21:33:46', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('38', 'Bryan Wilson', 'wilsonbryan10@gmail.com', 'JAd38VEvBM', TO_DATE('2000-01-24 13:24:23', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('39', 'Anna Ramos', 'anna8@yahoo.com', 'T6kIbnJ3IR', TO_DATE('2009-02-16 14:51:22', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('40', 'Gregory Sanchez', 'grsan@gmail.com', 'VzZO3tAdsy', TO_DATE('2007-05-30 23:43:28', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('41', 'Joyce Lee', 'joycelee6@gmail.com', '3E6IqCmkq5', TO_DATE('2022-01-31 08:56:26', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('42', 'Kyle Mendez', 'kylemendez10@gmail.com', '3l8vObBQ5l', TO_DATE('2020-10-05 19:36:54', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('43', 'Carl Gutierrez', 'gucar@yahoo.com', 'OK352u8Iud', TO_DATE('2021-04-01 11:03:50', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('44', 'Rosa Snyder', 'snyderros@outlook.com', '2S1BrsHcls', TO_DATE('2016-07-26 20:10:51', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('45', 'Randall Wagner', 'randaw2@yahoo.com', 'ddXeGo9KiW', TO_DATE('2009-04-30 19:58:25', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('46', 'Phillip Young', 'youphi609@outlook.com', 'xLFSfOf8f6', TO_DATE('2014-01-31 09:16:45', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('47', 'Esther Dunn', 'dunnesth10@gmail.com', 'RRXtlbmKVh', TO_DATE('2014-03-15 16:10:15', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('48', 'Shirley Moore', 'shirley72@outlook.com', 'sxqelxIMgp', TO_DATE('2013-03-21 08:23:19', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('49', 'Dawn Moore', 'dawmoo313@gmail.com', 'mONntq7Zxc', TO_DATE('2003-04-23 06:04:43', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('50', 'Chad Herrera', 'chh@outlook.com', 'qvu0n9t8vZ', TO_DATE('2009-08-13 21:21:01', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('51', 'Diane Mills', 'dmills@gmail.com', 'Nyk1Xyct9Q', TO_DATE('2008-12-23 13:59:30', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('52', 'Aaron Simmons', 'aas913@outlook.com', 'LJ3Cs4Yuqs', TO_DATE('2019-01-07 12:36:57', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('53', 'Sarah Hernandez', 'hersarah@gmail.com', 'BKCFLz245n', TO_DATE('2019-01-15 05:47:39', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('54', 'Monica Vasquez', 'vasquezm@gmail.com', 'jZAQjdpjtW', TO_DATE('2003-08-29 18:14:30', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('55', 'Sylvia Hunter', 'sylvia00@gmail.com', 'mRiwU39tHV', TO_DATE('2022-12-28 23:16:40', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('56', 'Samuel Garcia', 'garciasamu@outlook.com', 'mrUzkTrd2I', TO_DATE('2009-07-29 20:57:24', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('57', 'Vincent Mitchell', 'mitvince1@gmail.com', 'aWYjeGSSnm', TO_DATE('2002-07-21 15:19:44', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('58', 'Stephen Jordan', 'stej94@hotmail.com', 'uuJGrHLvnO', TO_DATE('2007-03-01 13:17:36', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('59', 'Marcus Guzman', 'gumarcus@gmail.com', 'LLqzBPRHhx', TO_DATE('2010-08-26 19:47:21', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('60', 'Amanda Perry', 'perramanda72@outlook.com', 'sLKR8NnYUA', TO_DATE('2001-07-08 12:12:22', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('61', 'Douglas Green', 'gdougl@gmail.com', '1Sm2VaRPiG', TO_DATE('2010-05-19 12:36:01', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('62', 'Adam Stephens', 'stephensadam@outlook.com', '8F09SQjDHU', TO_DATE('2013-01-22 04:18:28', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('63', 'Sarah Green', 'sarahg@outlook.com', 'Yy39rUPfgl', TO_DATE('2001-05-30 14:14:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('64', 'Jesus Boyd', 'jesus4@gmail.com', 'cCRCrUSwPJ', TO_DATE('2019-10-04 17:19:50', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('65', 'Joel Sanchez', 'josanc5@outlook.com', 'jwaYXmR1pL', TO_DATE('2004-09-20 13:19:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('66', 'Vincent Mills', 'vincem@hotmail.com', 'VstGp4uy51', TO_DATE('2012-08-19 10:43:48', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('67', 'Aaron Ellis', 'ellisaar@hotmail.com', 'W0QzMv4wog', TO_DATE('2020-10-19 05:26:06', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('68', 'Christina Hunter', 'chunter@gmail.com', 'hifR1J6VTP', TO_DATE('2020-04-01 06:54:57', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('69', 'Brian Freeman', 'bfreeman@outlook.com', 'wUt7NRqBzU', TO_DATE('2001-09-13 20:17:01', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('70', 'Linda Marshall', 'marshalllinda@outlook.com', 'npEUtTn8vO', TO_DATE('2015-05-22 10:03:01', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('71', 'Kimberly Murray', 'mk48@outlook.com', 'KmjdPF2hx4', TO_DATE('2007-06-05 06:28:26', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('72', 'Edwin Jones', 'edwinjones@gmail.com', 'GgITswW8qa', TO_DATE('2000-06-17 16:25:31', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('73', 'Richard West', 'rwes@gmail.com', 'HPkllam8O9', TO_DATE('2010-06-02 04:23:15', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('74', 'Daniel Gibson', 'daniel1@yahoo.com', 'ch1b5i9IZu', TO_DATE('2001-03-24 17:21:36', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('75', 'Judith Ramos', 'ramoj63@outlook.com', 'BtXn1ZrKzw', TO_DATE('2005-06-15 02:15:17', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('76', 'Steve Olson', 'olsonste@gmail.com', 'vUUtvvhsRM', TO_DATE('2021-12-30 23:53:17', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('77', 'Gerald Shaw', 'gerashaw@yahoo.com', 'Cg8CNu6G6H', TO_DATE('2003-05-13 22:09:27', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('78', 'Ruth Collins', 'rcoll@gmail.com', 'FUEJf6W8Ew', TO_DATE('2008-01-16 16:24:29', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('79', 'Josephine Diaz', 'dijosephine@yahoo.com', 'flhSiyGDAE', TO_DATE('2015-06-08 22:11:51', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('80', 'Eddie Thomas', 'edthomas@outlook.com', 'Xkwp4vunAA', TO_DATE('2023-03-02 16:05:55', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('81', 'Joanne Weaver', 'wjoann8@yahoo.com', '5c73Jr92Dn', TO_DATE('2011-10-18 00:53:12', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('82', 'Donna Grant', 'donnagrant@gmail.com', '45lsWWiK7N', TO_DATE('2022-04-29 11:03:17', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('83', 'Denise Kelly', 'kelly1@hotmail.com', 'jQCgKNfYoP', TO_DATE('2014-04-28 19:13:49', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('84', 'Jacqueline Spencer', 'spencerjac1969@gmail.com', 'EtPGEK9Etb', TO_DATE('2001-01-15 09:32:14', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('85', 'Eugene Ortiz', 'oeugene@gmail.com', 'SQr2uKTIgm', TO_DATE('2008-10-11 14:19:15', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('86', 'Ray Cooper', 'rcooper@gmail.com', 'GgSAnlMPH0', TO_DATE('2010-09-21 09:03:22', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('87', 'Betty Harris', 'bettyh@hotmail.com', '2fcdSlbFzJ', TO_DATE('2017-05-05 22:16:02', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('88', 'Alfred Green', 'green702@outlook.com', 'OOj2tC3FCC', TO_DATE('2023-06-26 00:57:31', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('89', 'Russell Watson', 'rw8@outlook.com', 'vyVcVnFwt1', TO_DATE('2007-01-24 01:02:52', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('90', 'Joseph Peterson', 'joseph215@gmail.com', 'LMCE7L8QCX', TO_DATE('2011-08-19 23:46:27', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('91', 'Ryan Mendez', 'ryanmendez5@hotmail.com', 'dNjDYG1Liw', TO_DATE('2013-07-19 04:52:39', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('92', 'Eric Evans', 'evans3@gmail.com', 'NaEsMv6Jx8', TO_DATE('2003-01-14 11:01:00', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('93', 'Bruce Chen', 'chenbruce@outlook.com', 'LWKFt6xKtN', TO_DATE('2006-01-06 07:31:20', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('94', 'Betty Porter', 'pb6@gmail.com', 'w1eBEFNRqA', TO_DATE('2003-06-14 13:44:54', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('95', 'Craig Patel', 'craigp@gmail.com', 'TIa9MItDkJ', TO_DATE('2008-12-04 11:26:35', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('96', 'Shirley Wells', 'shirw221@outlook.com', 'yXB6YfRS3o', TO_DATE('2022-05-13 04:09:41', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('97', 'Susan Ross', 'susanr10@gmail.com', 'u7YOzJ1QmA', TO_DATE('2008-03-24 21:55:42', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('98', 'Raymond Castro', 'castrray4@gmail.com', '3ySzqZVuiN', TO_DATE('2018-09-23 03:06:56', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('99', 'Randall Butler', 'randbutler@gmail.com', 'FxkK926oJl', TO_DATE('2011-06-10 14:20:43', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Users" VALUES ('100', 'Tony Murphy', 'tonymur@yahoo.com', 'HYWpPMyYGF', TO_DATE('2000-04-05 15:51:14', 'SYYYY-MM-DD HH24:MI:SS'));

-- ----------------------------
-- Table structure for Watches
-- ----------------------------
DROP TABLE "EDUX"."Watches";
CREATE TABLE "EDUX"."Watches" (
  "s_id" NUMBER VISIBLE NOT NULL,
  "l_id" NUMBER VISIBLE NOT NULL,
  "w_date" DATE VISIBLE
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Watches
-- ----------------------------
INSERT INTO "EDUX"."Watches" VALUES ('21', '2', TO_DATE('2023-09-11 01:17:32', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '16', TO_DATE('2023-09-11 09:12:06', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '14', TO_DATE('2023-09-11 15:30:41', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('104', '2', TO_DATE('2023-11-16 21:00:19', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('104', '3', TO_DATE('2023-11-16 22:18:10', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '5', TO_DATE('2023-09-11 09:04:41', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '17', TO_DATE('2023-09-11 11:58:30', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('104', '1', TO_DATE('2023-11-16 22:07:33', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '1', TO_DATE('2023-09-16 19:18:06', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '2', TO_DATE('2023-09-11 09:07:09', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('21', '1', TO_DATE('2023-09-03 15:57:37', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('22', '1', TO_DATE('2023-09-04 15:57:58', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '3', TO_DATE('2023-09-11 11:57:58', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('22', '2', TO_DATE('2023-09-11 08:23:18', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('24', '2', TO_DATE('2023-09-11 08:24:15', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('28', '1', TO_DATE('2023-09-11 08:59:19', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '4', TO_DATE('2023-09-11 09:02:21', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '6', TO_DATE('2023-09-11 09:09:50', 'SYYYY-MM-DD HH24:MI:SS'));
INSERT INTO "EDUX"."Watches" VALUES ('26', '8', TO_DATE('2023-09-11 12:06:33', 'SYYYY-MM-DD HH24:MI:SS'));

-- ----------------------------
-- Table structure for Wishlist
-- ----------------------------
DROP TABLE "EDUX"."Wishlist";
CREATE TABLE "EDUX"."Wishlist" (
  "u_id" NUMBER VISIBLE NOT NULL,
  "c_id" NUMBER VISIBLE NOT NULL
)
LOGGING
NOCOMPRESS
PCTFREE 10
INITRANS 1
STORAGE (
  INITIAL 65536 
  NEXT 1048576 
  MINEXTENTS 1
  MAXEXTENTS 2147483645
  BUFFER_POOL DEFAULT
)
PARALLEL 1
NOCACHE
DISABLE ROW MOVEMENT
;

-- ----------------------------
-- Records of Wishlist
-- ----------------------------
INSERT INTO "EDUX"."Wishlist" VALUES ('26', '15');
INSERT INTO "EDUX"."Wishlist" VALUES ('26', '2');
INSERT INTO "EDUX"."Wishlist" VALUES ('103', '2');
INSERT INTO "EDUX"."Wishlist" VALUES ('103', '4');
INSERT INTO "EDUX"."Wishlist" VALUES ('104', '3');

-- ----------------------------
-- Function structure for ADD_TO_WISHLIST
-- ----------------------------
CREATE OR REPLACE
FUNCTION "EDUX"."ADD_TO_WISHLIST" AS
BEGIN
	INSERT INTO 
		"Wishlist" ( "u_id", "c_id" )
	VALUES
		( USER_ID, COURSE_ID);
	RETURN 1;
END;
/

-- ----------------------------
-- Function structure for CHECK_ACCESS
-- ----------------------------
CREATE OR REPLACE
PROCEDURE "EDUX"."CHECK_ACCESS" AS
BEGIN
 SELECT COUNT("s_id") INTO SAME_USER FROM "Enrolls" WHERE "c_id" = course_id AND "s_id"=user_id;
 
 IF SAME_USER>0 THEN
 user_access:=-1;
 ELSE
 user_access:=1;
 
 INSERT INTO "Enrolls" ("s_id","c_id","date","approve_status","progress","end_date","grade")
 VALUES(user_id, course_id, SYSDATE, 'y', 0, SYSDATE+365, 'A');
 END IF;
 COMMIT;
END;
/

-- ----------------------------
-- Function structure for CHECK_ENROLLMENT
-- ----------------------------
CREATE OR REPLACE
FUNCTION "EDUX"."CHECK_ENROLLMENT" AS
BEGIN
	SELECT COUNT(*) INTO USER_COUNT
	FROM "Enrolls"
	WHERE "s_id" = USER_ID AND "c_id" = COURSE_ID;

	IF USER_COUNT > 0 THEN
		RETURN 1;
	ELSE
		RETURN 0;
	END IF;
END;
/

-- ----------------------------
-- Function structure for CHECK_USER
-- ----------------------------
CREATE OR REPLACE
PROCEDURE "EDUX"."CHECK_USER" AS
BEGIN
	SELECT COUNT("u_id") INTO SAME_USER FROM "Users" WHERE "email" = user_email;
	IF SAME_USER > 0 THEN
		SELECT COUNT("u_id") INTO USER_COUNT FROM "Users" WHERE "email" = user_email AND "password" = user_password;
		IF USER_COUNT > 0 THEN
			SELECT "u_id", "name" INTO USER_ID, user_name FROM "Users" WHERE "email" = user_email AND "password" = user_password;
		ELSE
			user_id := -1;
		END IF;
	ELSE
		user_id := -2;
	END IF;
END;
/

-- ----------------------------
-- Function structure for CREATE_INSTRUCTOR
-- ----------------------------
CREATE OR REPLACE
FUNCTION "EDUX"."CREATE_INSTRUCTOR" AS
BEGIN
 SELECT COUNT("u_id") INTO SAME_USER FROM "Users" WHERE "email" = u_email;
 
 IF SAME_USER = 0 THEN
  SELECT COUNT("u_id") INTO USER_COUNT FROM "Users";
  
  IF USER_COUNT > 0 THEN
   SELECT MAX("u_id") INTO LAST_ID FROM "Users";
  ELSE
   LAST_ID := 0;
  END IF;
  
  
  INSERT INTO "Users" ("u_id", "name", "email", "password", "reg_date")
  VALUES((LAST_ID+1), u_name, u_email, u_password, SYSDATE);
	
  INSERT INTO "Instructors" ("i_id", "subject","course_count")
  VALUES((LAST_ID+1), i_subject, 0);
  
  USER_ID := LAST_ID+1;
  
 ELSE
  USER_ID := -1;
 END IF;
 
 RETURN USER_ID;
END;
/

-- ----------------------------
-- Function structure for CREATE_USER
-- ----------------------------
CREATE OR REPLACE
FUNCTION "EDUX"."CREATE_USER" AS
BEGIN
	SELECT COUNT("u_id") INTO SAME_USER FROM "Users" WHERE "email" = u_email;
	
	IF SAME_USER = 0 THEN
		SELECT COUNT("u_id") INTO USER_COUNT FROM "Users";
		
		IF USER_COUNT > 0 THEN
			SELECT MAX("u_id") INTO LAST_ID FROM "Users";
		ELSE
			LAST_ID := 0;
		END IF;
		
		DOB := TO_DATE(u_dob, 'YYYY-MM-DD');
		SEX := SUBSTR(u_gender, 1, 1);
		
		INSERT INTO "Users" ("u_id", "name", "email", "password", "reg_date")
		VALUES((LAST_ID+1), u_name, u_email, u_password, SYSDATE);
		
		INSERT INTO "Students" ("s_id", "course_count", "date_of_birth", "gender")
		VALUES((LAST_ID+1), 0, DOB, SEX);
		
		USER_ID := LAST_ID+1;
		
	ELSE
		USER_ID := -1;
	END IF;
	
	RETURN USER_ID;
END;
/

-- ----------------------------
-- Function structure for ENROLL_INTO_COURSE
-- ----------------------------
CREATE OR REPLACE
FUNCTION "EDUX"."ENROLL_INTO_COURSE" AS
BEGIN
	INSERT INTO "Enrolls"
		( "s_id", "c_id", "date", "approve_status", "progress" )
	VALUES
		( USER_ID, COURSE_ID, SYSDATE, 'y', 0 );
	RETURN 1;
END;
/

-- ----------------------------
-- Function structure for RATING_CHANGE
-- ----------------------------
CREATE OR REPLACE
PROCEDURE "EDUX"."RATING_CHANGE" AS
BEGIN
	INSERT INTO "Feedbacks"("s_id", "c_id", "rating", "review", "date")
  VALUES(STUDENT_ID, COURSE_ID, RATING, REVIEW, SYSDATE);

	SELECT COUNT("rating") INTO RATING_COUNT
	FROM "Feedbacks"
	WHERE "Feedbacks"."c_id" = COURSE_ID;

	IF RATING_COUNT < 1 THEN
		AVG_RATING := 0;
	ELSE
		SELECT SUM("rating") INTO TOTAL_RATING
		FROM "Feedbacks"
		WHERE "Feedbacks"."c_id" = COURSE_ID;

		AVG_RATING := TOTAL_RATING / RATING_COUNT;
	END IF;

	UPDATE "Courses"
	SET "rating" = AVG_RATING
	WHERE "Courses"."c_id" = COURSE_ID;
	
	COMMIT;
END;
/

-- ----------------------------
-- Function structure for REMOVE_FROM_WISHLIST
-- ----------------------------
CREATE OR REPLACE
FUNCTION "EDUX"."REMOVE_FROM_WISHLIST" AS
BEGIN
	DELETE FROM 
		"Wishlist"
	WHERE
		"u_id" = USER_ID AND "c_id" = COURSE_ID;
	RETURN 1;
END;
/

-- ----------------------------
-- Function structure for SECURE_EXAM
-- ----------------------------
CREATE OR REPLACE
PROCEDURE "EDUX"."SECURE_EXAM" AS
BEGIN
	SELECT COUNT(*) INTO LAST_DATE
	FROM "Takes"
	WHERE "Takes"."s_id" = STUDENT_ID
	AND "Takes"."e_id" = EXAM_ID;
	
	SELECT "Exams"."marks" INTO TOTAL_MARK
	FROM "Exams" WHERE "Exams"."e_id" = EXAM_ID;
		
	MARK_PERCENT := EXAM_MARK / TOTAL_MARK;
		
	IF MARK_PERCENT > 0.5 THEN
		EXAM_STATUS := 'p';
	ELSE
		EXAM_STATUS := 'f';
	END IF;
	
	PREV_STATUS := 'f';
	
	IF LAST_DATE < 1 THEN
		INSERT INTO "Takes"
		VALUES(STUDENT_ID, EXAM_ID, EXAM_STATUS, EXAM_MARK);
		
		COMMIT;
		
	ELSE
		SELECT "status" INTO PREV_STATUS
		FROM "Takes"
		WHERE "Takes"."s_id" = STUDENT_ID
		AND "Takes"."e_id" = EXAM_ID;
		
		IF PREV_STATUS = 'f' AND EXAM_STATUS = 'p' THEN
			UPDATE "Takes"
			SET "Takes"."status" = EXAM_STATUS, "Takes"."marks" = EXAM_MARK
			WHERE "Takes"."s_id" = STUDENT_ID
			AND "Takes"."e_id" = EXAM_ID;
		END IF;
		COMMIT;
	END IF;
	
	IF EXAM_STATUS = 'p' AND PREV_STATUS = 'f' THEN
		
			SELECT DISTINCT "Exams"."t_id" INTO TOPIC_ID
			FROM "Takes" JOIN "Exams"
			ON "Takes"."e_id" = "Exams"."e_id"
			WHERE "Takes"."s_id" = STUDENT_ID
			AND "Takes"."e_id" = EXAM_ID;
			
			SELECT DISTINCT "Topics"."c_id" INTO COURSE_ID
			FROM "Exams" JOIN "Topics"
			ON "Exams"."t_id" = "Topics"."t_id"
			WHERE "Exams"."t_id" = TOPIC_ID;

			SELECT "Enrolls"."progress" INTO COURSE_PRPGRESS
			FROM "Enrolls"
			WHERE "Enrolls"."s_id" = STUDENT_ID
			AND "Enrolls"."c_id" = COURSE_ID
			FETCH FIRST 1 ROWS ONLY;
			
			SELECT "Exams"."weight" INTO EXAM_WEIGHT
			FROM "Exams"
			WHERE "Exams"."e_id" = EXAM_ID;
			
			UPDATE "Enrolls"
			SET "progress" = COURSE_PRPGRESS + EXAM_WEIGHT
			WHERE "Enrolls"."s_id" = STUDENT_ID
			AND "Enrolls"."c_id" = COURSE_ID;
		END IF;
	
END;
/

-- ----------------------------
-- Function structure for SECURE_WATCH
-- ----------------------------
CREATE OR REPLACE
PROCEDURE "EDUX"."SECURE_WATCH" AS
BEGIN
	SELECT COUNT("w_date") INTO LAST_DATE
	FROM "Watches"
	WHERE "Watches"."s_id" = STUDENT_ID
	AND "Watches"."l_id" = LECTURE_ID;
	
	IF LAST_DATE < 1 THEN
		INSERT INTO "Watches"
		VALUES(STUDENT_ID, LECTURE_ID, SYSDATE);
		
		COMMIT;
		
		SELECT DISTINCT "Lectures"."t_id" INTO TOPIC_ID
		FROM "Watches" JOIN "Lectures"
		ON "Watches"."l_id" = "Lectures"."l_id"
		WHERE "Watches"."s_id" = STUDENT_ID
		AND "Watches"."l_id" = LECTURE_ID;
		
		SELECT DISTINCT "Topics"."c_id" INTO COURSE_ID
		FROM "Lectures" JOIN "Topics"
		ON "Lectures"."t_id" = "Topics"."t_id"
		WHERE "Lectures"."t_id" = TOPIC_ID;

		SELECT "Enrolls"."progress" INTO COURSE_PRPGRESS
		FROM "Enrolls"
		WHERE "Enrolls"."s_id" = STUDENT_ID
		AND "Enrolls"."c_id" = COURSE_ID
		FETCH FIRST 1 ROWS ONLY;
		
		SELECT "Lectures"."weight" INTO LECTURE_WEIGHT
		FROM "Lectures"
		WHERE "Lectures"."l_id" = LECTURE_ID;
		
		UPDATE "Enrolls"
		SET "progress" = COURSE_PRPGRESS + LECTURE_WEIGHT
		WHERE "Enrolls"."s_id" = STUDENT_ID
		AND "Enrolls"."c_id" = COURSE_ID;
	ELSE
		UPDATE "Watches"
		SET "Watches"."w_date" = SYSDATE
		WHERE "Watches"."s_id" = STUDENT_ID
		AND "Watches"."l_id" = LECTURE_ID;
		COMMIT;
	END IF;
END;
/

-- ----------------------------
-- Function structure for TOPIC_PROGRESS
-- ----------------------------
CREATE OR REPLACE
FUNCTION "EDUX"."TOPIC_PROGRESS" AS
BEGIN
	SELECT SUM(weight_sum) INTO COMPLETED_WEIGHT
	FROM
			((SELECT SUM("Lectures"."weight") weight_sum
			FROM "Topics"
				JOIN("Lectures" JOIN "Watches"
					ON "Watches"."l_id" = "Lectures"."l_id")
				ON "Lectures"."t_id" = "Topics"."t_id"
			WHERE "Topics"."t_id" = TOPIC_ID AND "Watches"."s_id" = STUDENT_ID)
			
			UNION
			
			(SELECT SUM("Exams"."weight") weight_sum
			FROM "Topics" 
				JOIN ("Exams" JOIN "Takes"
					ON "Takes"."e_id" = "Exams"."e_id")
				ON "Exams"."t_id" = "Topics"."t_id"
			WHERE "Topics"."t_id" = TOPIC_ID AND "Takes"."s_id" = STUDENT_ID));
			
			IF COMPLETED_WEIGHT IS NULL THEN
				COMPLETED_WEIGHT := 0;
			END IF;
			
	RETURN COMPLETED_WEIGHT;
END;
/

-- ----------------------------
-- Function structure for USER_COURSES
-- ----------------------------
CREATE OR REPLACE
PROCEDURE "EDUX"."USER_COURSES" AS
BEGIN
	OPEN CURSOR_1 FOR
		SELECT "Courses"."c_id", "Courses"."title", "Enrolls"."progress"
		FROM "Enrolls" LEFT JOIN "Courses" ON "Enrolls"."c_id" = "Courses"."c_id"
		WHERE "Enrolls"."s_id" = USER_ID AND "Enrolls"."progress" < 100;

	DBMS_SQL.RETURN_RESULT(CURSOR_1);
	
	OPEN CURSOR_2 FOR
		SELECT "Courses"."c_id", "Courses"."title", TO_CHAR("Enrolls"."end_date", 'DD Month, YYYY') "completion_date", "Enrolls"."grade"
		FROM "Enrolls" LEFT JOIN "Courses" ON "Enrolls"."c_id" = "Courses"."c_id"
		WHERE "Enrolls"."s_id" = USER_ID AND "Enrolls"."progress" = 100;
		
	DBMS_SQL.RETURN_RESULT(CURSOR_2);
END;
/

-- ----------------------------
-- Function structure for USER_COURSE_CONTENT
-- ----------------------------
CREATE OR REPLACE
PROCEDURE "EDUX"."USER_COURSE_CONTENT" AS
BEGIN
	OPEN TOPIC_COUSOR FOR
		SELECT "Topics"."t_id", "Topics"."name", "Topics"."weight", TOPIC_PROGRESS(STUDENT_ID, "Topics"."t_id") completed_weight
		FROM "Courses" JOIN "Topics"
		ON "Topics"."c_id" = "Courses"."c_id"
		WHERE "Courses"."c_id" = COURSE_ID;
		
	DBMS_SQL.RETURN_RESULT(TOPIC_COUSOR);

	FOR R IN (SELECT "Topics"."t_id"
						FROM "Courses" JOIN "Topics"
						ON "Topics"."c_id" = "Courses"."c_id"
						WHERE "Courses"."c_id" = COURSE_ID)
	LOOP
		OPEN LECTURE_CURSOR FOR
			SELECT "Topics"."t_id", "Lectures"."l_id", "Lectures"."description", (SELECT COUNT(*) FROM "Watches" WHERE "Watches"."s_id" = STUDENT_ID AND "Watches"."l_id" = "Lectures"."l_id") status
			FROM "Topics" JOIN "Lectures"
			ON "Topics"."t_id" = "Lectures"."t_id"
			WHERE "Topics"."t_id" = R."t_id";
		
		DBMS_SQL.RETURN_RESULT(LECTURE_CURSOR);

	END LOOP;
	
	FOR R IN (SELECT "Topics"."t_id"
						FROM "Courses" JOIN "Topics"
						ON "Topics"."c_id" = "Courses"."c_id"
						WHERE "Courses"."c_id" = COURSE_ID)
	LOOP
		OPEN EXAM_CURSOR FOR
			SELECT "Topics"."t_id", "Exams"."e_id", "Exams"."duration", "Exams"."marks", (SELECT COUNT(*) FROM "Takes" WHERE "Takes"."s_id" = STUDENT_ID AND "Takes"."e_id" = "Exams"."e_id") status
			FROM "Topics" JOIN "Exams"
			ON "Topics"."t_id" = "Exams"."t_id"
			WHERE "Topics"."t_id" = R."t_id";
		
		DBMS_SQL.RETURN_RESULT(EXAM_CURSOR);
		
	END LOOP;

END;
/

-- ----------------------------
-- Sequence structure for SEQUENCE
-- ----------------------------
DROP SEQUENCE "EDUX"."SEQUENCE";
CREATE SEQUENCE "EDUX"."SEQUENCE" MINVALUE 1 MAXVALUE 9999999999999999999999999999 INCREMENT BY 1 CACHE 20;

-- ----------------------------
-- Primary Key structure for table Courses
-- ----------------------------
ALTER TABLE "EDUX"."Courses" ADD CONSTRAINT "SYS_C007725" PRIMARY KEY ("c_id");

-- ----------------------------
-- Checks structure for table Courses
-- ----------------------------
ALTER TABLE "EDUX"."Courses" ADD CONSTRAINT "SYS_C007721" CHECK ("c_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Courses" ADD CONSTRAINT "SYS_C007722" CHECK ("i_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Courses" ADD CONSTRAINT "SYS_C007724" CHECK ("approve_status" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Triggers structure for table Enrolls
-- ----------------------------
CREATE TRIGGER "EDUX"."ENROLL_CONTROL" BEFORE INSERT ON "EDUX"."Enrolls" REFERENCING OLD AS "OLD" NEW AS "NEW" FOR EACH ROW DISABLE 
DECLARE
    C NUMBER;
    COURSED_APPROVAL_ERROR EXCEPTION ;
    PRAGMA EXCEPTION_INIT ( COURSED_APPROVAL_ERROR, -156  );
BEGIN
    SELECT COUNT(*) INTO C FROM "Courses" C1 WHERE C1."c_id"= :NEW."c_id" AND C1."approve_status"='n';
    IF C>0 THEN
        RAISE_APPLICATION_ERROR(-156, 'Course did not approved yet');
    end if;
end;
/
CREATE TRIGGER "EDUX"."INCREASE_ENROLL" AFTER INSERT ON "EDUX"."Enrolls" REFERENCING OLD AS "OLD" NEW AS "NEW" FOR EACH ROW DISABLE 
DECLARE
	STUDENT_COUNT NUMBER;
	COURSE_COUNT NUMBER;
BEGIN
	SELECT "student_count" INTO STUDENT_COUNT 
	FROM "Courses" WHERE "c_id" = :NEW."c_id";
	
	UPDATE "Courses"
	SET "student_count" = (STUDENT_COUNT + 1)
	WHERE "c_id" = :NEW."c_id";
	
	SELECT "course_count" INTO COURSE_COUNT
	FROM "Students" WHERE "s_id" = :NEW."s_id";
	
	UPDATE "Students"
	SET "course_count" = (COURSE_COUNT + 1)
	WHERE "s_id" = :NEW."s_id";
    
end;
/

-- ----------------------------
-- Primary Key structure for table Exams
-- ----------------------------
ALTER TABLE "EDUX"."Exams" ADD CONSTRAINT "SYS_C007741" PRIMARY KEY ("e_id");

-- ----------------------------
-- Checks structure for table Exams
-- ----------------------------
ALTER TABLE "EDUX"."Exams" ADD CONSTRAINT "SYS_C007737" CHECK ("e_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Exams" ADD CONSTRAINT "SYS_C007739" CHECK ("question_count" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Exams" ADD CONSTRAINT "SYS_C007740" CHECK ("marks" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Exams" ADD CONSTRAINT "SYS_C007799" CHECK ("t_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Checks structure for table Feedbacks
-- ----------------------------
ALTER TABLE "EDUX"."Feedbacks" ADD CONSTRAINT "SYS_C007771" CHECK ("s_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Feedbacks" ADD CONSTRAINT "SYS_C007772" CHECK ("c_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Feedbacks" ADD CONSTRAINT "SYS_C007773" CHECK ("rating" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Triggers structure for table Feedbacks
-- ----------------------------
CREATE TRIGGER "EDUX"."CHECK_FEEDBACK" BEFORE INSERT ON "EDUX"."Feedbacks" REFERENCING OLD AS "OLD" NEW AS "NEW" FOR EACH ROW 
DECLARE
    C1 NUMBER;
    C2 NUMBER;
    C3 NUMBER;
BEGIN
    SELECT COUNT(*) INTO C1 
		FROM "Courses" 
		WHERE "Courses"."c_id"= :NEW."c_id" AND "Courses"."approve_status"='n';
		
    IF C1>0 THEN
        RAISE_APPLICATION_ERROR(-156, 'Course did not approved yet');
    END IF;
		
		SELECT COUNT(*) INTO C2 
		FROM "Enrolls" 
		WHERE :NEW."s_id" = "Enrolls"."s_id" AND :NEW."c_id" = "Enrolls"."c_id" AND "Enrolls"."approve_status"='n';
		
    SELECT COUNT(*) INTO C3
		FROM "Enrolls"
		WHERE :NEW."s_id" = "Enrolls"."s_id" AND :NEW."c_id" = "Enrolls"."c_id";
		
    IF C2>0 OR C3<1 THEN
        RAISE_APPLICATION_ERROR(-150, 'Student did not enrolled yet');
    END IF;
		
END;
/

-- ----------------------------
-- Primary Key structure for table Instructors
-- ----------------------------
ALTER TABLE "EDUX"."Instructors" ADD CONSTRAINT "SYS_C007719" PRIMARY KEY ("i_id");

-- ----------------------------
-- Checks structure for table Instructors
-- ----------------------------
ALTER TABLE "EDUX"."Instructors" ADD CONSTRAINT "SYS_C007718" CHECK ("i_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Primary Key structure for table Lectures
-- ----------------------------
ALTER TABLE "EDUX"."Lectures" ADD CONSTRAINT "SYS_C007735" PRIMARY KEY ("l_id");

-- ----------------------------
-- Checks structure for table Lectures
-- ----------------------------
ALTER TABLE "EDUX"."Lectures" ADD CONSTRAINT "SYS_C007733" CHECK ("l_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Lectures" ADD CONSTRAINT "SYS_C007796" CHECK ("t_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Primary Key structure for table Notifications
-- ----------------------------
ALTER TABLE "EDUX"."Notifications" ADD CONSTRAINT "SYS_C007791" PRIMARY KEY ("n_id");

-- ----------------------------
-- Checks structure for table Notifications
-- ----------------------------
ALTER TABLE "EDUX"."Notifications" ADD CONSTRAINT "SYS_C007786" CHECK ("n_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Notifications" ADD CONSTRAINT "SYS_C007787" CHECK ("u_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Notifications" ADD CONSTRAINT "SYS_C007788" CHECK ("date" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Notifications" ADD CONSTRAINT "SYS_C007789" CHECK ("about" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Notifications" ADD CONSTRAINT "SYS_C007790" CHECK ("seen_status" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Primary Key structure for table Questions
-- ----------------------------
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007749" PRIMARY KEY ("q_id");

-- ----------------------------
-- Checks structure for table Questions
-- ----------------------------
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007743" CHECK ("q_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007744" CHECK ("e_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007745" CHECK ("q_description" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007746" CHECK ("right_ans" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007747" CHECK ("marks" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007748" CHECK ("serial" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Primary Key structure for table Students
-- ----------------------------
ALTER TABLE "EDUX"."Students" ADD CONSTRAINT "SYS_C007753" PRIMARY KEY ("s_id");

-- ----------------------------
-- Checks structure for table Students
-- ----------------------------
ALTER TABLE "EDUX"."Students" ADD CONSTRAINT "SYS_C007751" CHECK ("s_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Students" ADD CONSTRAINT "SYS_C007752" CHECK ("course_count" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Checks structure for table Takes
-- ----------------------------
ALTER TABLE "EDUX"."Takes" ADD CONSTRAINT "SYS_C007766" CHECK ("s_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Takes" ADD CONSTRAINT "SYS_C007767" CHECK ("e_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Triggers structure for table Takes
-- ----------------------------
CREATE TRIGGER "EDUX"."EXAM_PROGRESS" AFTER INSERT ON "EDUX"."Takes" REFERENCING OLD AS "OLD" NEW AS "NEW" FOR EACH ROW DISABLE 
DECLARE
	TOPIC_ID NUMBER;
	COURSE_ID NUMBER;
	COURSE_PRPGRESS NUMBER;
	EXAM_WEIGHT NUMBER;
BEGIN
SELECT DISTINCT "Exams"."t_id" INTO TOPIC_ID
			FROM "Takes" JOIN "Exams"
			ON "Takes"."e_id" = "Exams"."e_id"
			WHERE "Takes"."s_id" = :NEW."s_id"
			AND "Takes"."e_id" = :NEW."e_id";
			
			SELECT DISTINCT "Topics"."c_id" INTO COURSE_ID
			FROM "Exams" JOIN "Topics"
			ON "Exams"."t_id" = "Topics"."t_id"
			WHERE "Exams"."t_id" = TOPIC_ID;

			SELECT "Enrolls"."progress" INTO COURSE_PRPGRESS
			FROM "Enrolls"
			WHERE "Enrolls"."s_id" = :NEW."s_id"
			AND "Enrolls"."c_id" = COURSE_ID
			FETCH FIRST 1 ROWS ONLY;
			
			SELECT "Exams"."weight" INTO EXAM_WEIGHT
			FROM "Exams"
			WHERE "Exams"."e_id" = :NEW."e_id";
			
			UPDATE "Enrolls"
			SET "progress" = COURSE_PRPGRESS + EXAM_WEIGHT
			WHERE "Enrolls"."s_id" = :NEW."s_id"
			AND "Enrolls"."c_id" = COURSE_ID;
END;
/

-- ----------------------------
-- Primary Key structure for table Topics
-- ----------------------------
ALTER TABLE "EDUX"."Topics" ADD CONSTRAINT "SYS_C007731" PRIMARY KEY ("t_id");

-- ----------------------------
-- Checks structure for table Topics
-- ----------------------------
ALTER TABLE "EDUX"."Topics" ADD CONSTRAINT "SYS_C007727" CHECK ("t_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Topics" ADD CONSTRAINT "SYS_C007728" CHECK ("name" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Topics" ADD CONSTRAINT "SYS_C007729" CHECK ("c_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Topics" ADD CONSTRAINT "SYS_C007730" CHECK ("serial" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Primary Key structure for table Users
-- ----------------------------
ALTER TABLE "EDUX"."Users" ADD CONSTRAINT "SYS_C007717" PRIMARY KEY ("u_id");

-- ----------------------------
-- Checks structure for table Users
-- ----------------------------
ALTER TABLE "EDUX"."Users" ADD CONSTRAINT "SYS_C007713" CHECK ("u_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Users" ADD CONSTRAINT "SYS_C007714" CHECK ("name" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Users" ADD CONSTRAINT "SYS_C007715" CHECK ("email" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Users" ADD CONSTRAINT "SYS_C007716" CHECK ("password" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Checks structure for table Watches
-- ----------------------------
ALTER TABLE "EDUX"."Watches" ADD CONSTRAINT "SYS_C007761" CHECK ("s_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Watches" ADD CONSTRAINT "SYS_C007762" CHECK ("l_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Triggers structure for table Watches
-- ----------------------------
CREATE TRIGGER "EDUX"."LECTURE_PROGRESS" AFTER INSERT ON "EDUX"."Watches" REFERENCING OLD AS "OLD" NEW AS "NEW" FOR EACH ROW DISABLE 
DECLARE
	TOPIC_ID NUMBER;
	COURSE_ID NUMBER;
	COURSE_PRPGRESS NUMBER;
	LECTURE_WEIGHT NUMBER;
BEGIN
	SELECT DISTINCT "Lectures"."t_id" INTO TOPIC_ID
	FROM "Watches" JOIN "Lectures"
	ON "Watches"."l_id" = "Lectures"."l_id"
	WHERE "Watches"."s_id" = :NEW."s_id"
	AND "Watches"."l_id" = :NEW."l_id";
	
	SELECT DISTINCT "Topics"."c_id" INTO COURSE_ID
	FROM "Lectures" JOIN "Topics"
	ON "Lectures"."t_id" = "Topics"."t_id"
	WHERE "Lectures"."t_id" = TOPIC_ID;

	SELECT "Enrolls"."progress" INTO COURSE_PRPGRESS
	FROM "Enrolls"
	WHERE "Enrolls"."s_id" = :NEW."s_id"
	AND "Enrolls"."c_id" = COURSE_ID
	FETCH FIRST 1 ROWS ONLY;
	
	SELECT "Lectures"."weight" INTO LECTURE_WEIGHT
	FROM "Lectures"
	WHERE "Lectures"."l_id" = :NEW."l_id";
	
	UPDATE "Enrolls"
	SET "progress" = COURSE_PRPGRESS + LECTURE_WEIGHT
	WHERE "Enrolls"."s_id" = :NEW."s_id"
	AND "Enrolls"."c_id" = COURSE_ID;
END;
/

-- ----------------------------
-- Checks structure for table Wishlist
-- ----------------------------
ALTER TABLE "EDUX"."Wishlist" ADD CONSTRAINT "SYS_C007801" CHECK ("u_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Wishlist" ADD CONSTRAINT "SYS_C007802" CHECK ("c_id" IS NOT NULL) NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Courses
-- ----------------------------
ALTER TABLE "EDUX"."Courses" ADD CONSTRAINT "SYS_C007726" FOREIGN KEY ("i_id") REFERENCES "EDUX"."Instructors" ("i_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Enrolls
-- ----------------------------
ALTER TABLE "EDUX"."Enrolls" ADD CONSTRAINT "SYS_C007759" FOREIGN KEY ("s_id") REFERENCES "EDUX"."Students" ("s_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY DISABLE NOVALIDATE;
ALTER TABLE "EDUX"."Enrolls" ADD CONSTRAINT "SYS_C007760" FOREIGN KEY ("c_id") REFERENCES "EDUX"."Courses" ("c_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY DISABLE NOVALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Exams
-- ----------------------------
ALTER TABLE "EDUX"."Exams" ADD CONSTRAINT "SYS_C007742" FOREIGN KEY ("t_id") REFERENCES "EDUX"."Topics" ("t_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Feedbacks
-- ----------------------------
ALTER TABLE "EDUX"."Feedbacks" ADD CONSTRAINT "SYS_C007775" FOREIGN KEY ("s_id") REFERENCES "EDUX"."Students" ("s_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Feedbacks" ADD CONSTRAINT "SYS_C007776" FOREIGN KEY ("c_id") REFERENCES "EDUX"."Courses" ("c_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Instructors
-- ----------------------------
ALTER TABLE "EDUX"."Instructors" ADD CONSTRAINT "SYS_C007720" FOREIGN KEY ("i_id") REFERENCES "EDUX"."Users" ("u_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Lectures
-- ----------------------------
ALTER TABLE "EDUX"."Lectures" ADD CONSTRAINT "SYS_C007736" FOREIGN KEY ("t_id") REFERENCES "EDUX"."Topics" ("t_id") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Notifications
-- ----------------------------
ALTER TABLE "EDUX"."Notifications" ADD CONSTRAINT "SYS_C007792" FOREIGN KEY ("u_id") REFERENCES "EDUX"."Users" ("u_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Questions
-- ----------------------------
ALTER TABLE "EDUX"."Questions" ADD CONSTRAINT "SYS_C007750" FOREIGN KEY ("e_id") REFERENCES "EDUX"."Exams" ("e_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Students
-- ----------------------------
ALTER TABLE "EDUX"."Students" ADD CONSTRAINT "SYS_C007754" FOREIGN KEY ("s_id") REFERENCES "EDUX"."Users" ("u_id") ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Takes
-- ----------------------------
ALTER TABLE "EDUX"."Takes" ADD CONSTRAINT "SYS_C007769" FOREIGN KEY ("s_id") REFERENCES "EDUX"."Students" ("s_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Takes" ADD CONSTRAINT "SYS_C007770" FOREIGN KEY ("e_id") REFERENCES "EDUX"."Exams" ("e_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Topics
-- ----------------------------
ALTER TABLE "EDUX"."Topics" ADD CONSTRAINT "SYS_C007732" FOREIGN KEY ("c_id") REFERENCES "EDUX"."Courses" ("c_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Watches
-- ----------------------------
ALTER TABLE "EDUX"."Watches" ADD CONSTRAINT "SYS_C007764" FOREIGN KEY ("s_id") REFERENCES "EDUX"."Students" ("s_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Watches" ADD CONSTRAINT "SYS_C007765" FOREIGN KEY ("l_id") REFERENCES "EDUX"."Lectures" ("l_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;

-- ----------------------------
-- Foreign Keys structure for table Wishlist
-- ----------------------------
ALTER TABLE "EDUX"."Wishlist" ADD CONSTRAINT "SYS_C007803" FOREIGN KEY ("u_id") REFERENCES "EDUX"."Users" ("u_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
ALTER TABLE "EDUX"."Wishlist" ADD CONSTRAINT "SYS_C007804" FOREIGN KEY ("c_id") REFERENCES "EDUX"."Courses" ("c_id") NOT DEFERRABLE INITIALLY IMMEDIATE NORELY VALIDATE;
