import { describe, it, expect } from 'vitest';
import { RUBRIC_CRITERIA, RUBRIC_TOTAL_POINTS, calculateRubricSum, validateRubric } from '../data/rubric';
import { EVENT_SCHEDULE, getPhaseStatus, COLLABORATION_BANNER } from '../data/hackathonData';

describe('Official 60-Point Judging Rubric', () => {
  it('has exactly 6 criteria', () => {
    expect(RUBRIC_CRITERIA).toHaveLength(6);
  });

  it('asserts the maximum points sum to exactly 60', () => {
    const sum = calculateRubricSum();
    expect(sum).toBe(60);
    expect(sum).toBe(RUBRIC_TOTAL_POINTS);
    expect(validateRubric()).toBe(true);
  });

  it('has exact point breakdown matching specifications', () => {
    const pointsMap = Object.fromEntries(RUBRIC_CRITERIA.map(c => [c.id, c.maxPoints]));
    expect(pointsMap).toEqual({
      theme: 10,
      aws: 10,
      idea: 15,
      uiux: 5,
      business: 10,
      codebase: 10
    });
  });
});

describe('Collaboration Banner & Communities', () => {
  it('stores the exact collaboration banner', () => {
    expect(COLLABORATION_BANNER).toBe('AWS SBG IITJ × AWS SBG GSMCOE');
  });
});

describe('Pure Phase Status Function', () => {
  const phase1 = EVENT_SCHEDULE.find(p => p.phase === 1);
  const phase3 = EVENT_SCHEDULE.find(p => p.phase === 3);
  const phase4 = EVENT_SCHEDULE.find(p => p.phase === 4);
  const phase6 = EVENT_SCHEDULE.find(p => p.phase === 6);

  it('correctly marks Phase 1 completed after October 10, 2026', () => {
    const testDate = new Date('2026-10-15T12:00:00+05:30');
    expect(getPhaseStatus(phase1, testDate)).toBe('COMPLETED');
  });

  it('correctly marks both Phase 3 and Phase 4 active on October 31, 2026', () => {
    const kickoffDay = new Date('2026-10-31T12:00:00+05:30');
    expect(getPhaseStatus(phase3, kickoffDay)).toBe('ACTIVE');
    expect(getPhaseStatus(phase4, kickoffDay)).toBe('ACTIVE');
  });

  it('correctly marks Phase 4 completed after November 5, 2026', () => {
    const afterDeadline = new Date('2026-11-06T00:00:00+05:30');
    expect(getPhaseStatus(phase4, afterDeadline)).toBe('COMPLETED');
  });

  it('correctly marks Phase 6 upcoming before November 20, 2026', () => {
    const buildingTime = new Date('2026-11-02T12:00:00+05:30');
    expect(getPhaseStatus(phase6, buildingTime)).toBe('UPCOMING');
  });
});

describe('Judges Chamber Evaluation Panel', () => {
  it('contains Jatin Vishwakarma with the exact LinkedIn profile URL', async () => {
    const { EVENT_CONFIG, JUDGES } = await import('../data/hackathonData');
    expect(EVENT_CONFIG.judges).toBeDefined();
    expect(EVENT_CONFIG.judges.length).toBeGreaterThanOrEqual(1);

    const jatin = EVENT_CONFIG.judges.find(j => j.name === 'Jatin Vishwakarma');
    expect(jatin).toBeDefined();
    expect(jatin.name).toBe('Jatin Vishwakarma');
    expect(jatin.linkedinUrl).toBe('https://www.linkedin.com/in/jatin-vishwakarma-563914246/');

    expect(JUDGES).toEqual(EVENT_CONFIG.judges);
  });
});
