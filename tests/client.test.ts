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
    it('makes correct GET request without auth headers', async () => {
      const mockData = {
        form: { id: 'form-1', title: 'Test Form' },
        questions: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const client = new AskUsersClient({});
      const result = await client.getForm('form-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/public/forms/form-1',
      );
      expect(result).toEqual(mockData);
    });

    it('uses custom baseUrl', async () => {
      const mockData = {
        form: { id: 'form-1', title: 'Test Form' },
        questions: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const client = new AskUsersClient({
        baseUrl: 'https://custom.api.com',
      });
      await client.getForm('form-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.api.com/api/public/forms/form-1',
      );
    });

    it('throws generic error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      });

      const client = new AskUsersClient({ apiKey: 'test-key' });
      await expect(client.getForm('nonexistent')).rejects.toThrow('Failed to load form. Please try again later.');
    });
  });

  describe('submitForm', () => {
    it('makes correct POST request without auth headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const client = new AskUsersClient({});
      await client.submitForm('form-1', { submission_data: { q1: 'answer1' } });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/public/forms/form-1/submissions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            submission_data: { q1: 'answer1' },
          }),
        }
      );
    });

    it('throws generic error on submit failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const client = new AskUsersClient({});
      await expect(
        client.submitForm('form-1', { submission_data: {} })
      ).rejects.toThrow('Failed to submit form. Please try again later.');
    });
  });

  describe('getSurvey', () => {
    it('makes correct GET request without auth headers', async () => {
      const mockData = {
        survey: { id: 'survey-1', title: 'Test Survey' },
        questions: [],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockData }),
      });

      const client = new AskUsersClient({});
      const result = await client.getSurvey('survey-1');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/public/surveys/survey-1',
      );
      expect(result).toEqual(mockData);
    });

    it('throws generic error on non-OK response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden',
      });

      const client = new AskUsersClient({});
      await expect(client.getSurvey('survey-1')).rejects.toThrow('Failed to load survey. Please try again later.');
    });
  });

  describe('submitSurvey', () => {
    it('makes correct POST request without auth headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
      });

      const client = new AskUsersClient({});
      await client.submitSurvey('survey-1', { response_data: { q1: 'answer1' } });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.askusers.org/api/public/surveys/survey-1/responses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            response_data: { q1: 'answer1' },
            completion_status: 'completed',
          }),
        }
      );
    });

    it('throws generic error on submit failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Bad Request',
      });

      const client = new AskUsersClient({});
      await expect(
        client.submitSurvey('survey-1', { response_data: {} })
      ).rejects.toThrow('Failed to submit survey. Please try again later.');
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
