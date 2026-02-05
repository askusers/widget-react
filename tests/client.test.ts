import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AskUsersClient } from '../src/api/client';

describe('AskUsersClient', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('sets apiKey from config', () => {
      const client = new AskUsersClient({ apiKey: 'test-key' });
      // We verify this indirectly by checking that requests use the key
      expect(client).toBeDefined();
    });

    it('uses default baseUrl when not provided', () => {
      const client = new AskUsersClient({ apiKey: 'test-key' });
      expect(client).toBeDefined();
      // Verified through API calls below
    });

    it('uses custom baseUrl when provided', () => {
      const client = new AskUsersClient({ apiKey: 'test-key', baseUrl: 'https://custom.api.com' });
      expect(client).toBeDefined();
    });
  });

  describe('getForm', () => {
    it('makes correct GET request with API key header', async () => {
      const mockData = {
        form: { id: 'form-1', title: 'Test Form' },
        questions: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const client = new AskUsersClient({ apiKey: 'test-api-key' });
      const result = await client.getForm('form-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/forms/form-1/public',
        {
          headers: {
            'X-API-Key': 'test-api-key',
          },
        }
      );
      expect(result).toEqual(mockData);
    });

    it('uses custom baseUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: {} }),
      });

      const client = new AskUsersClient({
        apiKey: 'key',
        baseUrl: 'https://custom.api.com',
      });
      await client.getForm('form-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.api.com/api/forms/form-1/public',
        expect.any(Object),
      );
    });

    it('throws on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const client = new AskUsersClient({ apiKey: 'test-key' });
      await expect(client.getForm('nonexistent')).rejects.toThrow('Failed to load form: Not Found');
    });
  });

  describe('submitForm', () => {
    it('makes correct POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const client = new AskUsersClient({ apiKey: 'test-api-key' });
      const data = {
        submission_data: { q1: 'answer1' },
        session_id: 'session-123',
      };
      await client.submitForm('form-1', data);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/forms/form-1/submissions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          },
          body: JSON.stringify({
            form_id: 'form-1',
            ...data,
          }),
        }
      );
    });

    it('throws on error with error body message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Validation failed: missing required fields' }),
      });

      const client = new AskUsersClient({ apiKey: 'test-key' });
      await expect(
        client.submitForm('form-1', { submission_data: {} })
      ).rejects.toThrow('Validation failed: missing required fields');
    });

    it('throws with statusText when error body parsing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
        json: async () => { throw new Error('Invalid JSON'); },
      });

      const client = new AskUsersClient({ apiKey: 'test-key' });
      await expect(
        client.submitForm('form-1', { submission_data: {} })
      ).rejects.toThrow('Failed to submit form: Internal Server Error');
    });
  });

  describe('getSurvey', () => {
    it('makes correct GET request with API key header', async () => {
      const mockData = {
        survey: { id: 'survey-1', title: 'Test Survey' },
        questions: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const client = new AskUsersClient({ apiKey: 'test-api-key' });
      const result = await client.getSurvey('survey-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/surveys/survey-1/public',
        {
          headers: {
            'X-API-Key': 'test-api-key',
          },
        }
      );
      expect(result).toEqual(mockData);
    });

    it('throws on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      });

      const client = new AskUsersClient({ apiKey: 'test-key' });
      await expect(client.getSurvey('survey-1')).rejects.toThrow('Failed to load survey: Forbidden');
    });
  });

  describe('submitSurvey', () => {
    it('makes correct POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const client = new AskUsersClient({ apiKey: 'test-api-key' });
      const data = {
        response_data: { q1: 'answer1' },
        session_id: 'session-123',
      };
      await client.submitSurvey('survey-1', data);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/surveys/survey-1/responses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'test-api-key',
          },
          body: JSON.stringify({
            survey_id: 'survey-1',
            ...data,
          }),
        }
      );
    });

    it('throws on error with error body message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Survey is closed' }),
      });

      const client = new AskUsersClient({ apiKey: 'test-key' });
      await expect(
        client.submitSurvey('survey-1', { response_data: {} })
      ).rejects.toThrow('Survey is closed');
    });
  });

  describe('trackEvent', () => {
    it('queues event without immediate fetch', () => {
      const client = new AskUsersClient({ apiKey: 'test-key' });
      client.trackEvent({
        action_type: 'form_view',
        context_id: 'form-1',
        context_type: 'form',
        session_id: 'session-1',
        action_details: {
          source: 'widget',
          device_type: 'desktop',
          browser: 'Chrome',
          os: 'macOS',
          screen_width: 1920,
          screen_height: 1080,
        },
        success: true,
      });

      // fetch should NOT be called immediately since events are batched
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });
});
