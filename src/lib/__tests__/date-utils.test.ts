import {
  addDuration,
  combineDateAndTime,
  DURATION_PRESETS,
  formatDisplayDate,
  formatDisplayDateTime,
  formatDisplayTime,
  getDefaultStartTime,
  getTodayStart,
  isInPast,
  roundToNearest15Min,
} from '../date-utils';

describe('date-utils', () => {
  describe('formatDisplayDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2026, 0, 27); // Jan 27, 2026 (Tuesday)
      expect(formatDisplayDate(date)).toBe('Tue, Jan 27');
    });

    it('should handle different months', () => {
      const date = new Date(2026, 5, 15); // Jun 15, 2026 (Monday)
      expect(formatDisplayDate(date)).toBe('Mon, Jun 15');
    });
  });

  describe('formatDisplayTime', () => {
    it('should format AM time correctly', () => {
      const date = new Date(2026, 0, 27, 9, 30);
      expect(formatDisplayTime(date)).toBe('9:30 AM');
    });

    it('should format PM time correctly', () => {
      const date = new Date(2026, 0, 27, 14, 0);
      expect(formatDisplayTime(date)).toBe('2:00 PM');
    });

    it('should format noon correctly', () => {
      const date = new Date(2026, 0, 27, 12, 0);
      expect(formatDisplayTime(date)).toBe('12:00 PM');
    });

    it('should format midnight correctly', () => {
      const date = new Date(2026, 0, 27, 0, 0);
      expect(formatDisplayTime(date)).toBe('12:00 AM');
    });
  });

  describe('formatDisplayDateTime', () => {
    it('should format date and time together', () => {
      const date = new Date(2026, 0, 27, 14, 30); // Jan 27, 2026 (Tuesday)
      expect(formatDisplayDateTime(date)).toBe('Tue, Jan 27 at 2:30 PM');
    });
  });

  describe('addDuration', () => {
    it('should add hours to a date', () => {
      const date = new Date(2026, 0, 27, 14, 0);
      const result = addDuration(date, 2);
      expect(result.getHours()).toBe(16);
    });

    it('should handle day rollover', () => {
      const date = new Date(2026, 0, 27, 23, 0);
      const result = addDuration(date, 3);
      expect(result.getDate()).toBe(28);
      expect(result.getHours()).toBe(2);
    });
  });

  describe('roundToNearest15Min', () => {
    it('should round to nearest 15 minutes (round up when closer)', () => {
      const date = new Date(2026, 0, 27, 14, 8); // 8 min rounds up to 15
      const result = roundToNearest15Min(date);
      expect(result.getMinutes()).toBe(15);
    });

    it('should round to nearest 15 minutes (round down when closer)', () => {
      const date = new Date(2026, 0, 27, 14, 22); // 22 min rounds down to 15
      const result = roundToNearest15Min(date);
      expect(result.getMinutes()).toBe(15);
    });

    it('should keep exact 15-minute intervals', () => {
      const date = new Date(2026, 0, 27, 14, 30);
      const result = roundToNearest15Min(date);
      expect(result.getMinutes()).toBe(30);
    });

    it('should round down to 0 when closer', () => {
      const date = new Date(2026, 0, 27, 14, 7); // 7 min rounds down to 0
      const result = roundToNearest15Min(date);
      expect(result.getMinutes()).toBe(0);
    });
  });

  describe('getDefaultStartTime', () => {
    it('should return a date in the future', () => {
      const now = new Date();
      const result = getDefaultStartTime();
      expect(result.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should return a time rounded to 15 minutes', () => {
      const result = getDefaultStartTime();
      expect(result.getMinutes() % 15).toBe(0);
    });
  });

  describe('isInPast', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(2020, 0, 1);
      expect(isInPast(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date(2030, 0, 1);
      expect(isInPast(futureDate)).toBe(false);
    });
  });

  describe('getTodayStart', () => {
    it('should return today at midnight', () => {
      const result = getTodayStart();
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it('should return current date', () => {
      const today = new Date();
      const result = getTodayStart();
      expect(result.getDate()).toBe(today.getDate());
      expect(result.getMonth()).toBe(today.getMonth());
      expect(result.getFullYear()).toBe(today.getFullYear());
    });
  });

  describe('combineDateAndTime', () => {
    it('should combine date and time correctly', () => {
      const date = new Date(2026, 0, 27, 0, 0);
      const time = new Date(2026, 5, 15, 14, 30);
      const result = combineDateAndTime(date, time);

      expect(result.getFullYear()).toBe(2026);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(27);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
    });
  });

  describe('DURATION_PRESETS', () => {
    it('should have correct presets', () => {
      expect(DURATION_PRESETS).toHaveLength(4);
      expect(DURATION_PRESETS[0]).toEqual({ label: '1hr', hours: 1 });
      expect(DURATION_PRESETS[1]).toEqual({ label: '2hr', hours: 2 });
      expect(DURATION_PRESETS[2]).toEqual({ label: '3hr', hours: 3 });
      expect(DURATION_PRESETS[3]).toEqual({ label: 'Half day', hours: 5 });
    });
  });
});
