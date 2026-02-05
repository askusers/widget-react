/**
 * Form/Survey analytics tracking hook.
 * Standalone version without AuthContext dependency.
 */

import { useCallback, useMemo } from 'react';
import type { FormEventType, DeviceInfo } from '../types';

interface TrackFormEventParams {
  eventType: FormEventType;
  formId?: string;
  surveyId?: string;
  sessionId: string;
  fieldId?: string;
  fieldOrder?: number;
  apiKey?: string;
  displayMode?: string;
  source?: string;
  contextType?: string;
  contextId?: string;
}

interface AnalyticsEvent {
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
  apiKey?: string;
}

function parseUserAgent(): DeviceInfo {
  if (typeof navigator === 'undefined') {
    return { device_type: 'desktop', browser: 'Unknown', os: 'Unknown', screen_width: 0, screen_height: 0 };
  }

  const ua = navigator.userAgent;
  const uaLower = ua.toLowerCase();

  let device_type: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobile))/i.test(ua)) {
    device_type = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    device_type = 'mobile';
  }

  let browser = 'Unknown';
  if (uaLower.includes('edg/')) browser = 'Edge';
  else if (uaLower.includes('chrome')) browser = 'Chrome';
  else if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('safari') && !uaLower.includes('chrome')) browser = 'Safari';
  else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'Opera';

  let os = 'Unknown';
  if (uaLower.includes('win')) os = 'Windows';
  else if (uaLower.includes('mac')) os = 'macOS';
  else if (uaLower.includes('linux')) os = 'Linux';
  else if (uaLower.includes('android')) os = 'Android';
  else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';

  return {
    device_type,
    browser,
    os,
    screen_width: typeof window !== 'undefined' ? window.screen.width : 0,
    screen_height: typeof window !== 'undefined' ? window.screen.height : 0
  };
}

function getOrCreateSessionId(): string {
  const key = 'form_analytics_session_id';

  if (typeof window === 'undefined') {
    return crypto.randomUUID();
  }

  try {
    const existing = sessionStorage.getItem(key);
    if (existing) {
      return existing;
    }

    const newSessionId = crypto.randomUUID();
    sessionStorage.setItem(key, newSessionId);
    return newSessionId;
  } catch {
    return crypto.randomUUID();
  }
}

// Module-level batching state
let analyticsQueue: AnalyticsEvent[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let unloadHandlersSet = false;
let isUnloading = false;
let baseUrlForBatch = 'https://api.askusers.org';

function startBatchTimer() {
  if (batchTimer) return;

  batchTimer = setTimeout(() => {
    flushAnalyticsQueue();
    batchTimer = null;

    if (analyticsQueue.length > 0) {
      startBatchTimer();
    }
  }, 15000);
}

function flushAnalyticsQueue() {
  if (analyticsQueue.length === 0) return;

  try {
    const eventsToSend = [...analyticsQueue];
    analyticsQueue = [];

    const eventsByApiKey: Record<string, Omit<AnalyticsEvent, 'apiKey'>[]> = {};
    eventsToSend.forEach(event => {
      const apiKey = event.apiKey || 'default';
      if (!eventsByApiKey[apiKey]) {
        eventsByApiKey[apiKey] = [];
      }
      const { apiKey: _unused, ...eventWithoutApiKey } = event;
      void _unused;
      eventsByApiKey[apiKey].push(eventWithoutApiKey);
    });

    Object.entries(eventsByApiKey).forEach(([apiKey, events]) => {
      const requestBody = JSON.stringify({ events });

      if (isUnloading && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([requestBody], { type: 'application/json' });
        navigator.sendBeacon(`${baseUrlForBatch}/api/analytics/batch`, blob);
      } else {
        const headers: HeadersInit = {
          'Content-Type': 'application/json'
        };
        if (apiKey !== 'default') {
          headers['X-API-Key'] = apiKey;
        }

        fetch(`${baseUrlForBatch}/api/analytics/batch`, {
          method: 'POST',
          headers,
          body: requestBody,
          keepalive: true
        }).catch(() => {
          if (!isUnloading) {
            analyticsQueue.push(...events.map(event => ({
              ...event,
              apiKey
            })));
          }
        });
      }
    });
  } catch {
    // Silently fail
  }
}

function setupUnloadHandlers() {
  if (typeof window === 'undefined' || unloadHandlersSet) return;
  unloadHandlersSet = true;

  const flushOnUnload = () => {
    isUnloading = true;
    if (batchTimer) {
      clearTimeout(batchTimer);
      batchTimer = null;
    }
    flushAnalyticsQueue();
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

async function trackFormEvent(params: TrackFormEventParams): Promise<void> {
  try {
    const deviceInfo = parseUserAgent();

    const payload: AnalyticsEvent = {
      action_type: params.eventType,
      context_id: params.formId || params.surveyId || '',
      context_type: params.formId ? 'form' : 'survey',
      session_id: params.sessionId,
      action_details: {
        field_id: params.fieldId,
        field_order: params.fieldOrder,
        display_mode: params.displayMode,
        source: params.source || 'widget',
        context_type: params.contextType,
        context_id: params.contextId,
        ...deviceInfo
      },
      success: true,
      apiKey: params.apiKey
    };

    analyticsQueue.push(payload);

    if (!batchTimer) {
      startBatchTimer();
    }

    if (!unloadHandlersSet) {
      setupUnloadHandlers();
    }
  } catch {
    // Silently fail
  }
}

export function useFormAnalytics(
  formId?: string,
  surveyId?: string,
  options?: {
    apiKey?: string;
    baseUrl?: string;
    displayMode?: string;
    source?: string;
    contextType?: string;
    contextId?: string;
  }
) {
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  // Update module-level base URL if provided
  if (options?.baseUrl) {
    baseUrlForBatch = options.baseUrl;
  }

  const trackEvent = useCallback(async (
    eventType: FormEventType,
    eventOptions?: {
      fieldId?: string;
      fieldOrder?: number;
    }
  ) => {
    await trackFormEvent({
      eventType,
      formId,
      surveyId,
      sessionId,
      apiKey: options?.apiKey,
      fieldId: eventOptions?.fieldId,
      fieldOrder: eventOptions?.fieldOrder,
      displayMode: options?.displayMode,
      source: options?.source,
      contextType: options?.contextType,
      contextId: options?.contextId
    });
  }, [formId, surveyId, sessionId, options?.apiKey, options?.displayMode, options?.source, options?.contextType, options?.contextId]);

  const trackView = useCallback(() => trackEvent('form_view'), [trackEvent]);
  const trackFieldFocus = useCallback((fieldId: string, fieldOrder: number) =>
    trackEvent('form_field_focus', { fieldId, fieldOrder }), [trackEvent]);
  const trackFieldBlur = useCallback((fieldId: string, fieldOrder: number) =>
    trackEvent('form_field_blur', { fieldId, fieldOrder }), [trackEvent]);
  const trackSubmitAttempt = useCallback(() => trackEvent('form_submit_attempt'), [trackEvent]);
  const trackSubmitSuccess = useCallback(() => trackEvent('form_submit_success'), [trackEvent]);

  return {
    trackView,
    trackFieldFocus,
    trackFieldBlur,
    trackSubmitAttempt,
    trackSubmitSuccess,
    sessionId
  };
}
