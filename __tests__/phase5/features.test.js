/**
 * Phase 5 Feature Tests
 * Tests for Certificate, Discussion, Payment, Gamification, and Versioning
 */

import { calculatePrice, formatPrice, PaymentStatus, PricingTiers } from '../../lib/payments';
import {
  getUserLevel,
  calculateStreak,
  checkBadgeEligibility,
  formatXP,
  getRankTitle,
  BadgeTypes,
  XPLevels,
} from '../../lib/gamification';
import {
  createVersionEntry,
  calculateDiff,
  formatVersion,
  VersionActions,
  ContentTypes,
} from '../../lib/versioning';

describe('Payment Library', () => {
  describe('calculatePrice', () => {
    it('should return original price with no discounts', () => {
      const result = calculatePrice(100);
      expect(result.finalPrice).toBe(100);
      expect(result.totalDiscount).toBe(0);
      expect(result.appliedDiscounts).toHaveLength(0);
    });

    it('should apply student discount', () => {
      const result = calculatePrice(100, { isStudent: true });
      expect(result.finalPrice).toBe(90);
      expect(result.totalDiscount).toBe(10);
      expect(result.appliedDiscounts).toHaveLength(1);
      expect(result.appliedDiscounts[0].type).toBe('student');
    });

    it('should apply coupon discount', () => {
      const result = calculatePrice(100, { couponCode: 'WELCOME10' });
      expect(result.finalPrice).toBe(90);
      expect(result.appliedDiscounts[0].type).toBe('coupon');
      expect(result.appliedDiscounts[0].percentage).toBe(10);
    });

    it('should apply bulk discount for 5+ courses', () => {
      const result = calculatePrice(100, { bulkCount: 5 });
      expect(result.finalPrice).toBe(85);
      expect(result.appliedDiscounts[0].percentage).toBe(15);
    });

    it('should stack multiple discounts', () => {
      const result = calculatePrice(100, { isStudent: true, couponCode: 'EDUX20' });
      expect(result.finalPrice).toBe(70);
      expect(result.appliedDiscounts).toHaveLength(2);
    });

    it('should not go below 0', () => {
      const result = calculatePrice(10, { couponCode: 'FLASH50', isStudent: true, bulkCount: 5 });
      expect(result.finalPrice).toBeGreaterThanOrEqual(0);
    });
  });

  describe('formatPrice', () => {
    it('should format USD correctly', () => {
      expect(formatPrice(99.99, 'usd')).toBe('$99.99');
    });

    it('should format EUR correctly', () => {
      expect(formatPrice(99.99, 'eur')).toContain('99.99');
    });
  });

  describe('PricingTiers', () => {
    it('should have correct tier prices', () => {
      expect(PricingTiers.FREE.price).toBe(0);
      expect(PricingTiers.BASIC.price).toBe(9.99);
      expect(PricingTiers.PREMIUM.price).toBe(19.99);
      expect(PricingTiers.PRO.price).toBe(49.99);
    });
  });
});

describe('Gamification Library', () => {
  describe('getUserLevel', () => {
    it('should return level 1 for 0 XP', () => {
      const level = getUserLevel(0);
      expect(level.level).toBe(1);
      expect(level.title).toBe('Beginner');
    });

    it('should return correct level for 500 XP', () => {
      const level = getUserLevel(500);
      expect(level.level).toBe(3);
      expect(level.title).toBe('Student');
    });

    it('should calculate progress correctly', () => {
      const level = getUserLevel(150);
      expect(level.level).toBe(2);
      expect(level.progress).toBeGreaterThan(0);
      expect(level.progress).toBeLessThan(100);
    });

    it('should handle max level', () => {
      const level = getUserLevel(15000);
      expect(level.level).toBe(10);
      expect(level.isMaxLevel).toBe(true);
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 for empty array', () => {
      expect(calculateStreak([])).toBe(0);
    });

    it('should return 0 for no recent activity', () => {
      const oldDates = [
        new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
      ];
      expect(calculateStreak(oldDates)).toBe(0);
    });

    it('should count consecutive days', () => {
      const today = new Date();
      const dates = [
        today.toISOString(),
        new Date(today.getTime() - 86400000).toISOString(), // Yesterday
        new Date(today.getTime() - 2 * 86400000).toISOString(), // 2 days ago
      ];
      expect(calculateStreak(dates)).toBe(3);
    });

    it('should break on gaps', () => {
      const today = new Date();
      const dates = [
        today.toISOString(),
        new Date(today.getTime() - 86400000).toISOString(),
        new Date(today.getTime() - 3 * 86400000).toISOString(), // Gap!
      ];
      expect(calculateStreak(dates)).toBe(2);
    });
  });

  describe('checkBadgeEligibility', () => {
    it('should award first_course badge', () => {
      const badges = checkBadgeEligibility({
        completedCourses: 1,
        streak: 0,
        earnedBadges: [],
      });
      expect(badges.some(b => b.id === 'first_course')).toBe(true);
    });

    it('should award streak badges', () => {
      const badges = checkBadgeEligibility({
        completedCourses: 0,
        streak: 7,
        earnedBadges: [],
      });
      expect(badges.some(b => b.id === 'streak_7')).toBe(true);
    });

    it('should not award already earned badges', () => {
      const badges = checkBadgeEligibility({
        completedCourses: 5,
        streak: 0,
        earnedBadges: ['first_course', 'course_complete', 'five_courses'],
      });
      expect(badges.some(b => b.id === 'first_course')).toBe(false);
      expect(badges.some(b => b.id === 'five_courses')).toBe(false);
    });
  });

  describe('formatXP', () => {
    it('should format small numbers', () => {
      expect(formatXP(500)).toBe('500');
    });

    it('should format thousands', () => {
      expect(formatXP(1500)).toBe('1.5K');
    });

    it('should format millions', () => {
      expect(formatXP(1500000)).toBe('1.5M');
    });
  });

  describe('getRankTitle', () => {
    it('should return Champion for rank 1', () => {
      expect(getRankTitle(1)).toContain('Champion');
    });

    it('should return Top 10 for ranks 4-10', () => {
      expect(getRankTitle(7)).toContain('Top 10');
    });

    it('should return Participant for high ranks', () => {
      expect(getRankTitle(500)).toBe('Participant');
    });
  });
});

describe('Versioning Library', () => {
  describe('createVersionEntry', () => {
    it('should create valid version entry', () => {
      const entry = createVersionEntry({
        contentType: ContentTypes.COURSE,
        contentId: '123',
        action: VersionActions.UPDATE,
        userId: 1,
        previousData: { name: 'Old' },
        newData: { name: 'New' },
      });

      expect(entry.versionId).toMatch(/^VER-/);
      expect(entry.contentType).toBe('course');
      expect(entry.action).toBe('update');
      expect(entry.previousData).toContain('Old');
      expect(entry.newData).toContain('New');
    });

    it('should handle null data', () => {
      const entry = createVersionEntry({
        contentType: ContentTypes.TOPIC,
        contentId: '456',
        action: VersionActions.CREATE,
        userId: 1,
      });

      expect(entry.previousData).toBeNull();
      expect(entry.newData).toBeNull();
    });
  });

  describe('calculateDiff', () => {
    it('should return null for null inputs', () => {
      expect(calculateDiff(null, null)).toBeNull();
    });

    it('should detect field changes', () => {
      const diff = calculateDiff(
        { name: 'Old', price: 10 },
        { name: 'New', price: 10 }
      );

      expect(diff.hasChanges).toBe(true);
      expect(diff.changeCount).toBe(1);
      expect(diff.changes[0].field).toBe('name');
      expect(diff.changes[0].type).toBe('modified');
    });

    it('should detect added fields', () => {
      const diff = calculateDiff(
        { name: 'Test' },
        { name: 'Test', description: 'New field' }
      );

      expect(diff.hasChanges).toBe(true);
      expect(diff.changes.find(c => c.field === 'description').type).toBe('added');
    });

    it('should detect removed fields', () => {
      const diff = calculateDiff(
        { name: 'Test', extra: 'value' },
        { name: 'Test' }
      );

      expect(diff.changes.find(c => c.field === 'extra').type).toBe('removed');
    });

    it('should return no changes for identical objects', () => {
      const diff = calculateDiff(
        { name: 'Same', price: 10 },
        { name: 'Same', price: 10 }
      );

      expect(diff.hasChanges).toBe(false);
      expect(diff.changeCount).toBe(0);
    });
  });

  describe('formatVersion', () => {
    it('should format version with action label', () => {
      const version = {
        versionId: 'VER-123',
        action: 'update',
        createdAt: new Date().toISOString(),
        previousData: JSON.stringify({ name: 'Old' }),
        newData: JSON.stringify({ name: 'New' }),
      };

      const formatted = formatVersion(version);
      expect(formatted.actionLabel).toContain('Updated');
      expect(formatted.diff).not.toBeNull();
    });
  });
});

describe('Badge Types', () => {
  it('should have all required badge properties', () => {
    Object.values(BadgeTypes).forEach(badge => {
      expect(badge).toHaveProperty('id');
      expect(badge).toHaveProperty('name');
      expect(badge).toHaveProperty('description');
      expect(badge).toHaveProperty('icon');
      expect(badge).toHaveProperty('xp');
      expect(badge).toHaveProperty('category');
    });
  });
});

describe('XP Levels', () => {
  it('should be sorted by minXP', () => {
    for (let i = 1; i < XPLevels.length; i++) {
      expect(XPLevels[i].minXP).toBeGreaterThan(XPLevels[i - 1].minXP);
    }
  });

  it('should have 10 levels', () => {
    expect(XPLevels).toHaveLength(10);
  });
});
