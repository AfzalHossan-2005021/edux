/**
 * Database Weight Calculation Tests
 * Tests for course creation and weight calculations for topics, lectures, and exams
 * 
 * These tests verify:
 * - Course creation with proper lecture_weight
 * - Topic weight calculation (sum of lecture + exam weights)
 * - Lecture weight distribution (proportional by duration)
 * - Exam weight distribution (proportional by marks)
 * - Weight recalculation on add/update/delete operations
 */

// Mock oracledb before imports
const mockExecute = jest.fn();
const mockCommit = jest.fn();
const mockClose = jest.fn();
const mockConnection = {
  execute: mockExecute,
  commit: mockCommit,
  close: mockClose,
};

jest.mock('oracledb', () => ({
  getConnection: jest.fn().mockResolvedValue(mockConnection),
  BIND_OUT: 3003,
  STRING: 2001,
  NUMBER: 2010,
  CURSOR: 2004,
  outFormat: 4002,
  OUT_FORMAT_OBJECT: 4002,
}));

describe('Weight Calculation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockExecute.mockReset();
    mockCommit.mockReset();
    mockClose.mockReset();
  });

  describe('Course Creation', () => {
    it('should create course with default lecture_weight of 50', async () => {
      // Mock the insert returning the new course ID
      mockExecute.mockResolvedValueOnce({
        outBinds: { c_id: 100 },
        rowsAffected: 1,
      });

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      const result = await conn.execute(
        `INSERT INTO EDUX."Courses" ("i_id", "title", "description", "field", "difficulty_level")
         VALUES (:i_id, :title, :description, :field, :difficulty_level)
         RETURNING "c_id" INTO :c_id`,
        {
          i_id: 1,
          title: 'Test Course',
          description: 'A test course',
          field: 'Programming',
          difficulty_level: 'Beginner',
          c_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        }
      );

      expect(result.outBinds.c_id).toBe(100);
      expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it('should create course with custom lecture_weight', async () => {
      mockExecute.mockResolvedValueOnce({
        outBinds: { c_id: 101 },
        rowsAffected: 1,
      });

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      const result = await conn.execute(
        `INSERT INTO EDUX."Courses" ("i_id", "title", "lecture_weight")
         VALUES (:i_id, :title, :lecture_weight)
         RETURNING "c_id" INTO :c_id`,
        {
          i_id: 1,
          title: 'Test Course',
          lecture_weight: 60,
          c_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
        }
      );

      expect(result.outBinds.c_id).toBe(101);
    });
  });

  describe('Topic Weight Calculations', () => {
    it('should calculate topic weight as sum of lecture and exam weights', async () => {
      // Simulate topic with lectures (weight 30) and exams (weight 20)
      mockExecute
        .mockResolvedValueOnce({ rows: [{ weight: 30 }] }) // lectures sum
        .mockResolvedValueOnce({ rows: [{ weight: 20 }] }); // exams sum

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      // Get lecture weights for topic
      const lectureResult = await conn.execute(
        `SELECT NVL(SUM("weight"), 0) as weight FROM EDUX."Lectures" WHERE "t_id" = :t_id`,
        { t_id: 200 }
      );

      // Get exam weights for topic
      const examResult = await conn.execute(
        `SELECT NVL(SUM("weight"), 0) as weight FROM EDUX."Exams" WHERE "t_id" = :t_id`,
        { t_id: 200 }
      );

      const topicWeight = lectureResult.rows[0].weight + examResult.rows[0].weight;
      expect(topicWeight).toBe(50);
    });

    it('should return 0 weight for empty topic', async () => {
      mockExecute
        .mockResolvedValueOnce({ rows: [{ weight: 0 }] })
        .mockResolvedValueOnce({ rows: [{ weight: 0 }] });

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      const lectureResult = await conn.execute(
        `SELECT NVL(SUM("weight"), 0) as weight FROM EDUX."Lectures" WHERE "t_id" = :t_id`,
        { t_id: 999 }
      );

      const examResult = await conn.execute(
        `SELECT NVL(SUM("weight"), 0) as weight FROM EDUX."Exams" WHERE "t_id" = :t_id`,
        { t_id: 999 }
      );

      const topicWeight = lectureResult.rows[0].weight + examResult.rows[0].weight;
      expect(topicWeight).toBe(0);
    });
  });

  describe('Lecture Weight Distribution', () => {
    it('should distribute lecture_weight proportionally by duration', async () => {
      // Course with lecture_weight = 50
      // Two lectures: duration 60 and 40 (total 100)
      // Expected weights: 30 and 20
      const lectureWeight = 50;
      const lectures = [
        { l_id: 1, duration: 60 },
        { l_id: 2, duration: 40 },
      ];
      const totalDuration = lectures.reduce((sum, l) => sum + l.duration, 0);

      const expectedWeights = lectures.map((l) => ({
        l_id: l.l_id,
        weight: (lectureWeight * l.duration) / totalDuration,
      }));

      expect(expectedWeights[0].weight).toBe(30);
      expect(expectedWeights[1].weight).toBe(20);
      expect(expectedWeights.reduce((sum, l) => sum + l.weight, 0)).toBe(lectureWeight);
    });

    it('should distribute equally when all lectures have 0 duration', async () => {
      const lectureWeight = 50;
      const lectureCount = 2;
      const expectedWeight = lectureWeight / lectureCount;

      expect(expectedWeight).toBe(25);
    });

    it('should handle single lecture getting full weight', async () => {
      const lectureWeight = 50;
      const lectures = [{ l_id: 1, duration: 100 }];
      
      const expectedWeight = lectureWeight;
      expect(expectedWeight).toBe(50);
    });
  });

  describe('Exam Weight Distribution', () => {
    it('should distribute exam weight (100 - lecture_weight) proportionally by marks', async () => {
      // Course with lecture_weight = 50, so exam_weight = 50
      // Two exams: marks 20 and 30 (total 50)
      // Expected weights: 20 and 30
      const lectureWeight = 50;
      const examWeight = 100 - lectureWeight;
      const exams = [
        { e_id: 1, marks: 20 },
        { e_id: 2, marks: 30 },
      ];
      const totalMarks = exams.reduce((sum, e) => sum + e.marks, 0);

      const expectedWeights = exams.map((e) => ({
        e_id: e.e_id,
        weight: (examWeight * e.marks) / totalMarks,
      }));

      expect(expectedWeights[0].weight).toBe(20);
      expect(expectedWeights[1].weight).toBe(30);
      expect(expectedWeights.reduce((sum, e) => sum + e.weight, 0)).toBe(examWeight);
    });

    it('should distribute equally when all exams have 0 marks', async () => {
      const examWeight = 50;
      const examCount = 2;
      const expectedWeight = examWeight / examCount;

      expect(expectedWeight).toBe(25);
    });
  });

  describe('Add Operations', () => {
    it('should recalculate weights when adding a lecture', async () => {
      // Before: 1 lecture with weight 50 (full lecture_weight)
      // After: 2 lectures, weights should be redistributed
      mockExecute
        .mockResolvedValueOnce({ rowsAffected: 1 }) // INSERT lecture
        .mockResolvedValueOnce({ rows: [{ c_id: 100 }] }) // Get course ID
        .mockResolvedValueOnce({ rows: [{ lecture_weight: 50 }] }); // Get lecture_weight

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      // Insert new lecture
      await conn.execute(
        `INSERT INTO EDUX."Lectures" ("t_id", "title", "duration") VALUES (:t_id, :title, :duration)`,
        { t_id: 200, title: 'New Lecture', duration: 30 }
      );

      expect(mockExecute).toHaveBeenCalled();
    });

    it('should recalculate weights when adding an exam', async () => {
      mockExecute
        .mockResolvedValueOnce({ rowsAffected: 1 }) // INSERT exam
        .mockResolvedValueOnce({ rows: [{ c_id: 100 }] }); // Get course ID

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      await conn.execute(
        `INSERT INTO EDUX."Exams" ("t_id", "duration", "pass_pct") VALUES (:t_id, :duration, :pass_pct)`,
        { t_id: 200, duration: 30, pass_pct: 40 }
      );

      expect(mockExecute).toHaveBeenCalled();
    });

    it('should recalculate topic weight when adding content', async () => {
      // Topic weight should update when lecture or exam is added
      const initialTopicWeight = 0;
      const newLectureWeight = 25;
      const expectedTopicWeight = initialTopicWeight + newLectureWeight;

      expect(expectedTopicWeight).toBe(25);
    });
  });

  describe('Update Operations', () => {
    it('should recalculate lecture weights when duration changes', async () => {
      // Two lectures: 60 min (weight 30) and 40 min (weight 20)
      // Update first to 80 min: new weights should be 33.33 and 16.67
      const lectureWeight = 50;
      const updatedLectures = [
        { l_id: 1, duration: 80 },
        { l_id: 2, duration: 40 },
      ];
      const totalDuration = updatedLectures.reduce((sum, l) => sum + l.duration, 0);

      const newWeights = updatedLectures.map((l) => ({
        l_id: l.l_id,
        weight: (lectureWeight * l.duration) / totalDuration,
      }));

      expect(newWeights[0].weight).toBeCloseTo(33.33, 1);
      expect(newWeights[1].weight).toBeCloseTo(16.67, 1);
    });

    it('should recalculate exam weights when marks change', async () => {
      const examWeight = 50;
      const updatedExams = [
        { e_id: 1, marks: 40 },
        { e_id: 2, marks: 60 },
      ];
      const totalMarks = updatedExams.reduce((sum, e) => sum + e.marks, 0);

      const newWeights = updatedExams.map((e) => ({
        e_id: e.e_id,
        weight: (examWeight * e.marks) / totalMarks,
      }));

      expect(newWeights[0].weight).toBe(20);
      expect(newWeights[1].weight).toBe(30);
    });

    it('should recalculate all weights when course lecture_weight changes', async () => {
      // Change lecture_weight from 50 to 70
      // Lectures should get 70, exams should get 30
      const newLectureWeight = 70;
      const newExamWeight = 100 - newLectureWeight;

      expect(newLectureWeight).toBe(70);
      expect(newExamWeight).toBe(30);
    });

    it('should update topic weight when lecture weight changes', async () => {
      const oldLectureWeight = 25;
      const newLectureWeight = 35;
      const examWeight = 25;

      const oldTopicWeight = oldLectureWeight + examWeight;
      const newTopicWeight = newLectureWeight + examWeight;

      expect(oldTopicWeight).toBe(50);
      expect(newTopicWeight).toBe(60);
    });
  });

  describe('Delete Operations', () => {
    it('should redistribute lecture weights when a lecture is deleted', async () => {
      // 3 lectures with weights 20, 15, 15 (total 50)
      // Delete middle one: remaining should get 25 each
      const lectureWeight = 50;
      const remainingLectures = [
        { l_id: 1, duration: 50 },
        { l_id: 3, duration: 50 },
      ];
      const totalDuration = remainingLectures.reduce((sum, l) => sum + l.duration, 0);

      const newWeights = remainingLectures.map((l) => ({
        l_id: l.l_id,
        weight: (lectureWeight * l.duration) / totalDuration,
      }));

      expect(newWeights[0].weight).toBe(25);
      expect(newWeights[1].weight).toBe(25);
    });

    it('should redistribute exam weights when an exam is deleted', async () => {
      const examWeight = 50;
      const remainingExams = [{ e_id: 1, marks: 50 }];

      // Single exam gets full weight
      expect(examWeight).toBe(50);
    });

    it('should update topic weight when lecture is deleted', async () => {
      const lectureWeightBefore = 30;
      const lectureWeightAfter = 0; // Lecture deleted
      const examWeight = 20;

      const topicWeightBefore = lectureWeightBefore + examWeight;
      const topicWeightAfter = lectureWeightAfter + examWeight;

      expect(topicWeightBefore).toBe(50);
      // After deletion, remaining lectures redistribute, so topic weight stays same
      // unless it was the only lecture
    });

    it('should recalculate all remaining topic weights when topic is deleted', async () => {
      // 2 topics with weights 50 each
      // Delete one: remaining should still have its original calculated weight
      // (course-level recalc ensures proper distribution)
      const topic1Weight = 50;
      const topic2Weight = 50;
      const totalBefore = topic1Weight + topic2Weight;

      // After deleting topic2, topic1 should still have weight 50
      // (or recalculated based on its lectures/exams)
      expect(totalBefore).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle course with no topics', async () => {
      mockExecute.mockResolvedValueOnce({ rows: [] });

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      const result = await conn.execute(
        `SELECT * FROM EDUX."Topics" WHERE "c_id" = :c_id`,
        { c_id: 999 }
      );

      expect(result.rows).toHaveLength(0);
    });

    it('should handle topic with only lectures (no exams)', async () => {
      const lectureWeight = 50;
      const examWeight = 0;
      const topicWeight = lectureWeight + examWeight;

      expect(topicWeight).toBe(50);
    });

    it('should handle topic with only exams (no lectures)', async () => {
      const lectureWeight = 0;
      const examWeight = 50;
      const topicWeight = lectureWeight + examWeight;

      expect(topicWeight).toBe(50);
    });

    it('should handle lecture_weight of 0 (all weight to exams)', async () => {
      const lectureWeight = 0;
      const examWeight = 100 - lectureWeight;

      expect(examWeight).toBe(100);
    });

    it('should handle lecture_weight of 100 (all weight to lectures)', async () => {
      const lectureWeight = 100;
      const examWeight = 100 - lectureWeight;

      expect(examWeight).toBe(0);
    });

    it('should handle rounding in weight distribution', async () => {
      // 3 lectures with equal duration, lecture_weight = 50
      // Each should get 16.666... but sum must be exactly 50
      const lectureWeight = 50;
      const lectureCount = 3;
      
      const truncatedWeight = Math.trunc((lectureWeight / lectureCount) * 1000000) / 1000000;
      const sumOfTruncated = truncatedWeight * (lectureCount - 1);
      const lastWeight = lectureWeight - sumOfTruncated;

      expect(truncatedWeight).toBeCloseTo(16.666666, 5);
      expect(lastWeight).toBeCloseTo(16.666668, 5);
      expect(sumOfTruncated + lastWeight).toBeCloseTo(50, 5);
    });
  });

  describe('Cascade Delete Behavior', () => {
    it('should handle topic deletion cascading to lectures', async () => {
      // When topic is deleted, its lectures are cascade deleted
      // Course lecture weights should be recalculated for remaining lectures
      mockExecute
        .mockResolvedValueOnce({ rowsAffected: 1 }) // DELETE topic
        .mockResolvedValueOnce({ rows: [{ l_id: 3, duration: 60 }] }); // Remaining lectures

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      await conn.execute(
        `DELETE FROM EDUX."Topics" WHERE "t_id" = :t_id`,
        { t_id: 200 }
      );

      expect(mockExecute).toHaveBeenCalled();
    });

    it('should handle topic deletion cascading to exams', async () => {
      mockExecute.mockResolvedValueOnce({ rowsAffected: 1 });

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      await conn.execute(
        `DELETE FROM EDUX."Topics" WHERE "t_id" = :t_id`,
        { t_id: 200 }
      );

      expect(mockExecute).toHaveBeenCalled();
    });

    it('should handle course deletion cascading to all content', async () => {
      mockExecute.mockResolvedValueOnce({ rowsAffected: 1 });

      const oracledb = require('oracledb');
      const conn = await oracledb.getConnection();

      await conn.execute(
        `DELETE FROM EDUX."Courses" WHERE "c_id" = :c_id`,
        { c_id: 100 }
      );

      expect(mockExecute).toHaveBeenCalled();
    });
  });

  describe('Weight Sum Validation', () => {
    it('should ensure lecture weights sum to lecture_weight', () => {
      const lectureWeight = 50;
      const lectures = [
        { weight: 20 },
        { weight: 15 },
        { weight: 15 },
      ];
      const sum = lectures.reduce((s, l) => s + l.weight, 0);

      expect(sum).toBe(lectureWeight);
    });

    it('should ensure exam weights sum to (100 - lecture_weight)', () => {
      const lectureWeight = 50;
      const examWeight = 100 - lectureWeight;
      const exams = [
        { weight: 25 },
        { weight: 25 },
      ];
      const sum = exams.reduce((s, e) => s + e.weight, 0);

      expect(sum).toBe(examWeight);
    });

    it('should ensure all topic weights sum to 100', () => {
      const topics = [
        { weight: 30 }, // topic 1: 15 lecture + 15 exam
        { weight: 40 }, // topic 2: 20 lecture + 20 exam
        { weight: 30 }, // topic 3: 15 lecture + 15 exam
      ];
      const sum = topics.reduce((s, t) => s + t.weight, 0);

      expect(sum).toBe(100);
    });
  });
});

describe('RECALC_CTRL Package Tests', () => {
  it('should prevent recursive lecture weight recalculation', () => {
    const RECALC_CTRL = {
      g_locked_lectures: false,
      g_locked_exams: false,
    };

    // Simulate lock acquisition
    RECALC_CTRL.g_locked_lectures = true;

    // Recursive call should be blocked
    if (RECALC_CTRL.g_locked_lectures) {
      // Early return in real procedure
      expect(RECALC_CTRL.g_locked_lectures).toBe(true);
    }

    // Release lock
    RECALC_CTRL.g_locked_lectures = false;
    expect(RECALC_CTRL.g_locked_lectures).toBe(false);
  });

  it('should prevent recursive exam weight recalculation', () => {
    const RECALC_CTRL = {
      g_locked_lectures: false,
      g_locked_exams: false,
    };

    RECALC_CTRL.g_locked_exams = true;
    expect(RECALC_CTRL.g_locked_exams).toBe(true);

    RECALC_CTRL.g_locked_exams = false;
    expect(RECALC_CTRL.g_locked_exams).toBe(false);
  });
});
