import { describe, it, expect } from 'vitest';
import {
  ConditionalLogicUtil,
  type LogicCondition,
  type VisibilityLogic,
  type SkipLogic,
} from '../src/utils/conditionalLogic';

describe('ConditionalLogicUtil', () => {
  describe('evaluateCondition', () => {
    const answers: Record<string, unknown> = {
      q1: 'hello',
      q2: 42,
      q3: ['option_a', 'option_b'],
      q4: '',
      q5: null,
      q6: 'Hello World',
    };

    it('returns false when questionId is missing', () => {
      const condition: LogicCondition = { operator: 'equals', value: 'hello' };
      expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
    });

    describe('equals operator', () => {
      it('matches string answer', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'equals', value: 'hello' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('does not match different string', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'equals', value: 'world' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('matches numeric answer', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'equals', value: 42 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('matches single-item array as equals', () => {
        const singleArrayAnswers = { q1: ['only_option'] };
        const condition: LogicCondition = { questionId: 'q1', operator: 'equals', value: 'only_option' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, singleArrayAnswers)).toBe(true);
      });

      it('does not match multi-item array as equals', () => {
        const condition: LogicCondition = { questionId: 'q3', operator: 'equals', value: 'option_a' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('not_equals operator', () => {
      it('returns true when values differ', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'not_equals', value: 'world' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false when values match', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'not_equals', value: 'hello' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('contains operator', () => {
      it('matches substring in string (case insensitive)', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'contains', value: 'ell' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('matches item in array', () => {
        const condition: LogicCondition = { questionId: 'q3', operator: 'contains', value: 'option_a' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false for missing item in array', () => {
        const condition: LogicCondition = { questionId: 'q3', operator: 'contains', value: 'option_c' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false for null answer', () => {
        const condition: LogicCondition = { questionId: 'q5', operator: 'contains', value: 'test' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false for non-string, non-array answer', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'contains', value: '4' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('not_contains operator', () => {
      it('returns true when string does not contain value', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'not_contains', value: 'xyz' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false when string contains value', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'not_contains', value: 'ell' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('greater_than operator', () => {
      it('returns true when answer is greater', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'greater_than', value: 40 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false when answer is equal', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'greater_than', value: 42 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false when answer is less', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'greater_than', value: 50 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false for non-numeric values', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'greater_than', value: 10 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('less_than operator', () => {
      it('returns true when answer is less', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'less_than', value: 50 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false when answer is equal', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'less_than', value: 42 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false when answer is greater', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'less_than', value: 30 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('greater_than_or_equal operator', () => {
      it('returns true when answer is greater', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'greater_than_or_equal', value: 41 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns true when answer is equal', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'greater_than_or_equal', value: 42 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false when answer is less', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'greater_than_or_equal', value: 43 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('less_than_or_equal operator', () => {
      it('returns true when answer is less', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'less_than_or_equal', value: 43 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns true when answer is equal', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'less_than_or_equal', value: 42 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false when answer is greater', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'less_than_or_equal', value: 41 };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('is_empty operator', () => {
      it('returns true for null answer', () => {
        const condition: LogicCondition = { questionId: 'q5', operator: 'is_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns true for empty string', () => {
        const condition: LogicCondition = { questionId: 'q4', operator: 'is_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns true for empty array', () => {
        const emptyArrayAnswers = { q1: [] };
        const condition: LogicCondition = { questionId: 'q1', operator: 'is_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, emptyArrayAnswers)).toBe(true);
      });

      it('returns true for empty object', () => {
        const emptyObjAnswers = { q1: {} };
        const condition: LogicCondition = { questionId: 'q1', operator: 'is_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, emptyObjAnswers)).toBe(true);
      });

      it('returns true for undefined (missing) answer', () => {
        const condition: LogicCondition = { questionId: 'nonexistent', operator: 'is_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false for non-empty string', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'is_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false for number', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'is_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('is_not_empty operator', () => {
      it('returns true for non-empty string', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'is_not_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false for null answer', () => {
        const condition: LogicCondition = { questionId: 'q5', operator: 'is_not_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false for empty string', () => {
        const condition: LogicCondition = { questionId: 'q4', operator: 'is_not_empty' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('starts_with operator', () => {
      it('matches when string starts with value (case insensitive)', () => {
        const condition: LogicCondition = { questionId: 'q6', operator: 'starts_with', value: 'hello' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('does not match when string does not start with value', () => {
        const condition: LogicCondition = { questionId: 'q6', operator: 'starts_with', value: 'world' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false for non-string answer', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'starts_with', value: '4' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('ends_with operator', () => {
      it('matches when string ends with value (case insensitive)', () => {
        const condition: LogicCondition = { questionId: 'q6', operator: 'ends_with', value: 'world' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('does not match when string does not end with value', () => {
        const condition: LogicCondition = { questionId: 'q6', operator: 'ends_with', value: 'hello' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false for non-string answer', () => {
        const condition: LogicCondition = { questionId: 'q2', operator: 'ends_with', value: '2' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('in_list operator', () => {
      it('matches when scalar answer is in the list', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'in_list', value: ['hello', 'world'] };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('does not match when scalar answer is not in the list', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'in_list', value: ['foo', 'bar'] };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('matches when array answer has overlap with list', () => {
        const condition: LogicCondition = { questionId: 'q3', operator: 'in_list', value: ['option_a', 'option_c'] };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('does not match when array answer has no overlap', () => {
        const condition: LogicCondition = { questionId: 'q3', operator: 'in_list', value: ['option_c', 'option_d'] };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });

      it('returns false when value is not an array', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'in_list', value: 'hello' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('not_in_list operator', () => {
      it('returns true when answer is not in the list', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'not_in_list', value: ['foo', 'bar'] };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(true);
      });

      it('returns false when answer is in the list', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'not_in_list', value: ['hello', 'world'] };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });

    describe('unknown operator', () => {
      it('returns false for unknown operator', () => {
        const condition: LogicCondition = { questionId: 'q1', operator: 'unknown_op', value: 'hello' };
        expect(ConditionalLogicUtil.evaluateCondition(condition, answers)).toBe(false);
      });
    });
  });

  describe('evaluateConditions', () => {
    const answers: Record<string, unknown> = {
      q1: 'yes',
      q2: 10,
    };

    it('returns true for empty conditions', () => {
      expect(ConditionalLogicUtil.evaluateConditions([], 'AND', answers)).toBe(true);
    });

    it('returns true for null/undefined conditions', () => {
      expect(ConditionalLogicUtil.evaluateConditions(
        null as unknown as LogicCondition[],
        'AND',
        answers,
      )).toBe(true);
    });

    it('evaluates AND combinator - all must match', () => {
      const conditions: LogicCondition[] = [
        { questionId: 'q1', operator: 'equals', value: 'yes' },
        { questionId: 'q2', operator: 'greater_than', value: 5 },
      ];
      expect(ConditionalLogicUtil.evaluateConditions(conditions, 'AND', answers)).toBe(true);
    });

    it('evaluates AND combinator - one fails', () => {
      const conditions: LogicCondition[] = [
        { questionId: 'q1', operator: 'equals', value: 'yes' },
        { questionId: 'q2', operator: 'greater_than', value: 20 },
      ];
      expect(ConditionalLogicUtil.evaluateConditions(conditions, 'AND', answers)).toBe(false);
    });

    it('evaluates OR combinator - at least one matches', () => {
      const conditions: LogicCondition[] = [
        { questionId: 'q1', operator: 'equals', value: 'no' },
        { questionId: 'q2', operator: 'greater_than', value: 5 },
      ];
      expect(ConditionalLogicUtil.evaluateConditions(conditions, 'OR', answers)).toBe(true);
    });

    it('evaluates OR combinator - none match', () => {
      const conditions: LogicCondition[] = [
        { questionId: 'q1', operator: 'equals', value: 'no' },
        { questionId: 'q2', operator: 'greater_than', value: 20 },
      ];
      expect(ConditionalLogicUtil.evaluateConditions(conditions, 'OR', answers)).toBe(false);
    });
  });

  describe('evaluateVisibility', () => {
    const answers = { q1: 'yes' };

    it('returns true when visibilityLogic is undefined', () => {
      expect(ConditionalLogicUtil.evaluateVisibility(undefined, answers)).toBe(true);
    });

    it('returns true when visibilityLogic is not enabled', () => {
      const visibility: VisibilityLogic = {
        enabled: false,
        operator: 'AND',
        conditions: [{ questionId: 'q1', operator: 'equals', value: 'no' }],
      };
      expect(ConditionalLogicUtil.evaluateVisibility(visibility, answers)).toBe(true);
    });

    it('returns true when enabled and conditions are met', () => {
      const visibility: VisibilityLogic = {
        enabled: true,
        operator: 'AND',
        conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
      };
      expect(ConditionalLogicUtil.evaluateVisibility(visibility, answers)).toBe(true);
    });

    it('returns false when enabled and conditions are not met', () => {
      const visibility: VisibilityLogic = {
        enabled: true,
        operator: 'AND',
        conditions: [{ questionId: 'q1', operator: 'equals', value: 'no' }],
      };
      expect(ConditionalLogicUtil.evaluateVisibility(visibility, answers)).toBe(false);
    });
  });

  describe('evaluateSkipLogic', () => {
    const answers = { q1: 'yes', q2: 5 };

    it('returns null when skipLogic is undefined', () => {
      expect(ConditionalLogicUtil.evaluateSkipLogic(undefined, answers)).toBeNull();
    });

    it('returns null when skipLogic is not enabled', () => {
      const skipLogic: SkipLogic = {
        enabled: false,
        rules: [
          {
            conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
            skipToQuestionId: 'q5',
          },
        ],
      };
      expect(ConditionalLogicUtil.evaluateSkipLogic(skipLogic, answers)).toBeNull();
    });

    it('returns null when there are no rules', () => {
      const skipLogic: SkipLogic = {
        enabled: true,
        rules: [],
      };
      expect(ConditionalLogicUtil.evaluateSkipLogic(skipLogic, answers)).toBeNull();
    });

    it('returns null when rules is undefined', () => {
      const skipLogic: SkipLogic = {
        enabled: true,
      };
      expect(ConditionalLogicUtil.evaluateSkipLogic(skipLogic, answers)).toBeNull();
    });

    it('returns skip target when conditions are met', () => {
      const skipLogic: SkipLogic = {
        enabled: true,
        rules: [
          {
            conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
            skipToQuestionId: 'q5',
          },
        ],
      };
      expect(ConditionalLogicUtil.evaluateSkipLogic(skipLogic, answers)).toBe('q5');
    });

    it('returns END when skip target is END', () => {
      const skipLogic: SkipLogic = {
        enabled: true,
        rules: [
          {
            conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
            skipToQuestionId: 'END',
          },
        ],
      };
      expect(ConditionalLogicUtil.evaluateSkipLogic(skipLogic, answers)).toBe('END');
    });

    it('returns null when no rule conditions match', () => {
      const skipLogic: SkipLogic = {
        enabled: true,
        rules: [
          {
            conditions: [{ questionId: 'q1', operator: 'equals', value: 'no' }],
            skipToQuestionId: 'q5',
          },
        ],
      };
      expect(ConditionalLogicUtil.evaluateSkipLogic(skipLogic, answers)).toBeNull();
    });

    it('returns first matching rule target', () => {
      const skipLogic: SkipLogic = {
        enabled: true,
        rules: [
          {
            conditions: [{ questionId: 'q1', operator: 'equals', value: 'no' }],
            skipToQuestionId: 'q3',
          },
          {
            conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
            skipToQuestionId: 'q5',
          },
          {
            conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
            skipToQuestionId: 'q7',
          },
        ],
      };
      expect(ConditionalLogicUtil.evaluateSkipLogic(skipLogic, answers)).toBe('q5');
    });
  });

  describe('filterVisibleQuestions', () => {
    it('returns all questions when none have visibility rules', () => {
      const questions = [
        { id: 'q1' },
        { id: 'q2' },
        { id: 'q3' },
      ];
      const result = ConditionalLogicUtil.filterVisibleQuestions(questions, {});
      expect(result).toHaveLength(3);
    });

    it('filters out questions with unmet visibility conditions', () => {
      const questions = [
        { id: 'q1' },
        {
          id: 'q2',
          logic_rules: {
            visibility: {
              enabled: true,
              operator: 'AND' as const,
              conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
            },
          },
        },
        { id: 'q3' },
      ];
      const result = ConditionalLogicUtil.filterVisibleQuestions(questions, { q1: 'no' });
      expect(result).toHaveLength(2);
      expect(result.map(q => q.id)).toEqual(['q1', 'q3']);
    });

    it('includes questions with met visibility conditions', () => {
      const questions = [
        { id: 'q1' },
        {
          id: 'q2',
          logic_rules: {
            visibility: {
              enabled: true,
              operator: 'AND' as const,
              conditions: [{ questionId: 'q1', operator: 'equals', value: 'yes' }],
            },
          },
        },
      ];
      const result = ConditionalLogicUtil.filterVisibleQuestions(questions, { q1: 'yes' });
      expect(result).toHaveLength(2);
    });

    it('includes questions with disabled visibility rules', () => {
      const questions = [
        {
          id: 'q1',
          logic_rules: {
            visibility: {
              enabled: false,
              operator: 'AND' as const,
              conditions: [{ questionId: 'q0', operator: 'equals', value: 'impossible' }],
            },
          },
        },
      ];
      const result = ConditionalLogicUtil.filterVisibleQuestions(questions, {});
      expect(result).toHaveLength(1);
    });
  });
});
