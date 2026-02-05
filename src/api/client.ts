import type {
  FormWithQuestions,
  FormSubmissionRequest,
  SurveyWithQuestions,
  SurveyResponseRequest,
  FormEventType,
  DeviceInfo,
} from '../types';

export interface AskUsersClientConfig {
  apiKey: string;
  baseUrl?: string;
}

interface AnalyticsEvent {
  user_id?: string;
  action_type: FormEventType;
  context_id: string;
  context_type: 'form' | 'survey';
  session_id: string;
  action_details: {
    field_id?: string;
    field_order?: number;
    display_mode?: string;
    source?: string;
    context_type?: string;
    context_id?: string;
  } & DeviceInfo;
  success: boolean;
}

const DEFAULT_BASE_URL = 'https://api.askusers.org';

/** Validate that a URL is a valid HTTPS base URL. */
function validateBaseUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error('baseUrl must use https:// or http:// protocol');
    }
    // Remove trailing slash for consistent concatenation
    return parsed.origin + parsed.pathname.replace(/\/+$/, '');
  } catch {
    throw new Error('Invalid baseUrl provided to AskUsersClient');
  }
}

/** Validate that an ID is safe for URL path interpolation. */
function validateId(id: string, label: string): string {
  if (!id || typeof id !== 'string') {
    throw new Error(`${label} is required`);
  }
  // Only allow alphanumeric, hyphens, and underscores (UUID-safe)
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(`Invalid ${label} format`);
  }
  return id;
}

/** Basic validation that API response has the expected shape. */
function validateFormResponse(data: unknown): FormWithQuestions {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response from server');
  }
  const obj = data as Record<string, unknown>;
  if (!obj.form || typeof obj.form !== 'object') {
    throw new Error('Invalid response from server');
  }
  const form = obj.form as Record<string, unknown>;
  if (typeof form.title !== 'string') {
    throw new Error('Invalid response from server');
  }
  if (!Array.isArray(obj.questions)) {
    throw new Error('Invalid response from server');
  }
  return data as FormWithQuestions;
}

function validateSurveyResponse(data: unknown): SurveyWithQuestions {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response from server');
  }
  const obj = data as Record<string, unknown>;
  if (!obj.survey || typeof obj.survey !== 'object') {
    throw new Error('Invalid response from server');
  }
  const survey = obj.survey as Record<string, unknown>;
  if (typeof survey.title !== 'string') {
    throw new Error('Invalid response from server');
  }
  if (!Array.isArray(obj.questions)) {
    throw new Error('Invalid response from server');
  }
  return data as SurveyWithQuestions;
}

export class AskUsersClient {
  private apiKey: string;
  private baseUrl: string;
  private analyticsQueue: AnalyticsEvent[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private unloadHandlersSet = false;
  private isUnloading = false;

  constructor(config: AskUsersClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl
      ? validateBaseUrl(config.baseUrl)
      : DEFAULT_BASE_URL;
  }

  // ============================================================
  // Form API
  // ============================================================

  async getForm(formId: string): Promise<FormWithQuestions> {
    const safeId = validateId(formId, 'formId');
    const response = await fetch(`${this.baseUrl}/api/forms/${safeId}/public`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load form. Please try again later.');
    }

    const json = await response.json();
    return validateFormResponse(json.data);
  }

  async submitForm(formId: string, data: Omit<FormSubmissionRequest, 'form_id'>): Promise<void> {
    const safeId = validateId(formId, 'formId');
    const response = await fetch(`${this.baseUrl}/api/forms/${safeId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        form_id: safeId,
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit form. Please try again later.');
    }
  }

  // ============================================================
  // Survey API
  // ============================================================

  async getSurvey(surveyId: string): Promise<SurveyWithQuestions> {
    const safeId = validateId(surveyId, 'surveyId');
    const response = await fetch(`${this.baseUrl}/api/surveys/${safeId}/public`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to load survey. Please try again later.');
    }

    const json = await response.json();
    return validateSurveyResponse(json.data);
  }

  async submitSurvey(surveyId: string, data: Omit<SurveyResponseRequest, 'survey_id'>): Promise<void> {
    const safeId = validateId(surveyId, 'surveyId');
    const response = await fetch(`${this.baseUrl}/api/surveys/${safeId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        survey_id: safeId,
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit survey. Please try again later.');
    }
  }

  // ============================================================
  // Analytics (batched, non-blocking)
  // ============================================================

  trackEvent(event: AnalyticsEvent): void {
    this.analyticsQueue.push(event);

    if (!this.batchTimer) {
      this.startBatchTimer();
    }

    if (!this.unloadHandlersSet) {
      this.setupUnloadHandlers();
    }
  }

  private startBatchTimer(): void {
    if (this.batchTimer) return;

    this.batchTimer = setTimeout(() => {
      this.flushAnalyticsQueue();
      this.batchTimer = null;

      if (this.analyticsQueue.length > 0) {
        this.startBatchTimer();
      }
    }, 15000);
  }

  private flushAnalyticsQueue(): void {
    if (this.analyticsQueue.length === 0) return;

    try {
      const eventsToSend = [...this.analyticsQueue];
      this.analyticsQueue = [];

      const requestBody = JSON.stringify({ events: eventsToSend });

      // Always use fetch with keepalive to ensure API key is included in headers.
      // sendBeacon does not support custom headers, which would skip authentication.
      fetch(`${this.baseUrl}/api/analytics/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        },
        body: requestBody,
        keepalive: true,
      }).catch(() => {
        // Re-queue events on failure (unless unloading)
        if (!this.isUnloading) {
          this.analyticsQueue.push(...eventsToSend);
        }
      });
    } catch {
      // Silently fail - analytics should never break the widget
    }
  }

  private setupUnloadHandlers(): void {
    if (typeof window === 'undefined' || this.unloadHandlersSet) return;
    this.unloadHandlersSet = true;

    const flushOnUnload = () => {
      this.isUnloading = true;
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
      this.flushAnalyticsQueue();
    };

    window.addEventListener('beforeunload', flushOnUnload);
    window.addEventListener('pagehide', flushOnUnload);

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          flushOnUnload();
        }
      });
    }
  }
}
