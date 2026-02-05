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

export class AskUsersClient {
  private apiKey: string;
  private baseUrl: string;
  private analyticsQueue: AnalyticsEvent[] = [];
  private batchTimer: ReturnType<typeof setTimeout> | null = null;
  private unloadHandlersSet = false;
  private isUnloading = false;

  constructor(config: AskUsersClientConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
  }

  // ============================================================
  // Form API
  // ============================================================

  async getForm(formId: string): Promise<FormWithQuestions> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}/public`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load form: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }

  async submitForm(formId: string, data: Omit<FormSubmissionRequest, 'form_id'>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        form_id: formId,
        ...data,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.error || `Failed to submit form: ${response.statusText}`);
    }
  }

  // ============================================================
  // Survey API
  // ============================================================

  async getSurvey(surveyId: string): Promise<SurveyWithQuestions> {
    const response = await fetch(`${this.baseUrl}/api/surveys/${surveyId}/public`, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to load survey: ${response.statusText}`);
    }

    const json = await response.json();
    return json.data;
  }

  async submitSurvey(surveyId: string, data: Omit<SurveyResponseRequest, 'survey_id'>): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/surveys/${surveyId}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        survey_id: surveyId,
        ...data,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(errorBody?.error || `Failed to submit survey: ${response.statusText}`);
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

      if (this.isUnloading && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([requestBody], { type: 'application/json' });
        navigator.sendBeacon(`${this.baseUrl}/api/analytics/batch`, blob);
      } else {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
        };

        fetch(`${this.baseUrl}/api/analytics/batch`, {
          method: 'POST',
          headers,
          body: requestBody,
          keepalive: true,
        }).catch(() => {
          // Re-queue events on failure (unless unloading)
          if (!this.isUnloading) {
            this.analyticsQueue.push(...eventsToSend);
          }
        });
      }
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
