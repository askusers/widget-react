/**
 * Conditional Logic Utility for Forms and Surveys
 *
 * Client-side implementation of conditional logic evaluation.
 * This is a simplified version that mirrors the backend ConditionalLogicService.
 */

export type LogicOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'is_empty'
  | 'is_not_empty'
  | 'starts_with'
  | 'ends_with'
  | 'in_list'
  | 'not_in_list';

export type LogicCombinator = 'AND' | 'OR';

export interface LogicCondition {
  questionId?: string;
  operator: LogicOperator | string;
  value?: unknown;
}

export interface VisibilityLogic {
  enabled: boolean;
  operator: LogicCombinator;
  conditions: LogicCondition[];
}

export interface SkipLogicRule {
  conditions: LogicCondition[];
  operator?: LogicCombinator;
  skipToQuestionId: string | 'END';
}

export interface SkipLogic {
  enabled: boolean;
  unconditionalTarget?: string;
  rules?: SkipLogicRule[];
}

export interface QuestionLogicRules {
  visibility?: VisibilityLogic;
  skip_to?: SkipLogic;
}

export class ConditionalLogicUtil {
  static evaluateCondition(
    condition: LogicCondition,
    answers: Record<string, unknown>
  ): boolean {
    const { questionId, operator, value } = condition;
    if (!questionId) return false;
    const answer = answers[questionId];

    switch (operator) {
      case 'equals':
        return this.equals(answer, value);
      case 'not_equals':
        return !this.equals(answer, value);
      case 'contains':
        return this.contains(answer, value);
      case 'not_contains':
        return !this.contains(answer, value);
      case 'greater_than':
        return this.greaterThan(answer, value);
      case 'less_than':
        return this.lessThan(answer, value);
      case 'greater_than_or_equal':
        return this.greaterThanOrEqual(answer, value);
      case 'less_than_or_equal':
        return this.lessThanOrEqual(answer, value);
      case 'is_empty':
        return this.isEmpty(answer);
      case 'is_not_empty':
        return !this.isEmpty(answer);
      case 'starts_with':
        return this.startsWith(answer, value);
      case 'ends_with':
        return this.endsWith(answer, value);
      case 'in_list':
        return this.inList(answer, value);
      case 'not_in_list':
        return !this.inList(answer, value);
      default:
        console.warn(`Unknown operator: ${operator}`);
        return false;
    }
  }

  static evaluateConditions(
    conditions: LogicCondition[],
    operator: LogicCombinator,
    answers: Record<string, unknown>
  ): boolean {
    if (!conditions || conditions.length === 0) {
      return true;
    }

    if (operator === 'AND') {
      return conditions.every(condition =>
        this.evaluateCondition(condition, answers)
      );
    } else {
      return conditions.some(condition =>
        this.evaluateCondition(condition, answers)
      );
    }
  }

  static evaluateVisibility(
    visibilityLogic: VisibilityLogic | undefined,
    answers: Record<string, unknown>
  ): boolean {
    if (!visibilityLogic || !visibilityLogic.enabled) {
      return true;
    }

    return this.evaluateConditions(
      visibilityLogic.conditions,
      visibilityLogic.operator,
      answers
    );
  }

  static evaluateSkipLogic(
    skipLogic: SkipLogic | undefined,
    answers: Record<string, unknown>
  ): string | 'END' | null {
    if (!skipLogic || !skipLogic.enabled) {
      return null;
    }

    if (!skipLogic.rules || skipLogic.rules.length === 0) {
      return null;
    }

    for (const rule of skipLogic.rules) {
      const conditionsMet = this.evaluateConditions(
        rule.conditions,
        rule.operator || 'AND',
        answers
      );

      if (conditionsMet) {
        return rule.skipToQuestionId;
      }
    }

    return null;
  }

  static filterVisibleQuestions<T extends { id?: string; logic_rules?: QuestionLogicRules }>(
    questions: T[],
    answers: Record<string, unknown>
  ): T[] {
    return questions.filter(question =>
      this.evaluateVisibility(question.logic_rules?.visibility as VisibilityLogic | undefined, answers)
    );
  }

  // ===== Operator Implementations =====

  private static equals(answer: unknown, value: unknown): boolean {
    if (Array.isArray(answer)) {
      return answer.length === 1 && answer[0] === value;
    }
    return answer === value;
  }

  private static contains(answer: unknown, value: unknown): boolean {
    if (answer == null) return false;

    if (Array.isArray(answer)) {
      return answer.includes(value);
    }

    if (typeof answer === 'string' && typeof value === 'string') {
      return answer.toLowerCase().includes(value.toLowerCase());
    }

    return false;
  }

  private static greaterThan(answer: unknown, value: unknown): boolean {
    const numAnswer = Number(answer);
    const numValue = Number(value);

    if (isNaN(numAnswer) || isNaN(numValue)) {
      return false;
    }

    return numAnswer > numValue;
  }

  private static lessThan(answer: unknown, value: unknown): boolean {
    const numAnswer = Number(answer);
    const numValue = Number(value);

    if (isNaN(numAnswer) || isNaN(numValue)) {
      return false;
    }

    return numAnswer < numValue;
  }

  private static greaterThanOrEqual(answer: unknown, value: unknown): boolean {
    const numAnswer = Number(answer);
    const numValue = Number(value);

    if (isNaN(numAnswer) || isNaN(numValue)) {
      return false;
    }

    return numAnswer >= numValue;
  }

  private static lessThanOrEqual(answer: unknown, value: unknown): boolean {
    const numAnswer = Number(answer);
    const numValue = Number(value);

    if (isNaN(numAnswer) || isNaN(numValue)) {
      return false;
    }

    return numAnswer <= numValue;
  }

  private static isEmpty(answer: unknown): boolean {
    if (answer == null) return true;
    if (typeof answer === 'string') return answer.trim() === '';
    if (Array.isArray(answer)) return answer.length === 0;
    if (typeof answer === 'object') return Object.keys(answer).length === 0;
    return false;
  }

  private static startsWith(answer: unknown, value: unknown): boolean {
    if (typeof answer !== 'string' || typeof value !== 'string') {
      return false;
    }

    return answer.toLowerCase().startsWith(value.toLowerCase());
  }

  private static endsWith(answer: unknown, value: unknown): boolean {
    if (typeof answer !== 'string' || typeof value !== 'string') {
      return false;
    }

    return answer.toLowerCase().endsWith(value.toLowerCase());
  }

  private static inList(answer: unknown, value: unknown): boolean {
    if (!Array.isArray(value)) {
      console.warn('in_list operator requires value to be an array');
      return false;
    }

    if (Array.isArray(answer)) {
      return answer.some(item => value.includes(item));
    }

    return value.includes(answer);
  }
}
