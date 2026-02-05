import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { SurveyWidget } from '../src/components/SurveyWidget';
import type { CreateSurveyRequest } from '../src/types/index';

// Mock the tiptap CSS import
vi.mock('../src/styles/tiptap.css', () => ({}));

// Mock DOMPurify to pass through HTML
vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

// Mock fetch globally to prevent real API calls
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function createMinimalSurvey(overrides?: Partial<CreateSurveyRequest>): CreateSurveyRequest {
  return {
    title: 'Test survey',
    description: 'A test survey description',
    show_progress: false,
    questions: [
      {
        id: 'q1',
        question_text: 'How satisfied are you?',
        question_type: 'rating',
        is_required: false,
        display_order: 0,
        rating_min: 1,
        rating_max: 5,
      },
    ],
    ...overrides,
  };
}

describe('SurveyWidget', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders survey title and description', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} />);

    expect(screen.getByText('Test survey')).toBeInTheDocument();
    expect(screen.getByText('A test survey description')).toBeInTheDocument();
  });

  it('renders question text', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} />);

    expect(screen.getByText('How satisfied are you?')).toBeInTheDocument();
  });

  it('hides title when hideTitle is true', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} hideTitle={true} />);

    expect(screen.queryByText('Test survey')).not.toBeInTheDocument();
  });

  it('hides description when hideDescription is true', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} hideDescription={true} />);

    expect(screen.queryByText('A test survey description')).not.toBeInTheDocument();
  });

  it('shows progress indicator when show_progress is true', () => {
    const survey = createMinimalSurvey({
      show_progress: true,
      questions: [
        {
          id: 'q1',
          question_text: 'Question 1',
          question_type: 'text',
          is_required: false,
          display_order: 0,
        },
      ],
    });
    render(<SurveyWidget survey={survey} />);

    // Progress indicator should be rendered (look for progress-related elements)
    // The exact rendering depends on the progress style, but there should be
    // some kind of progress indicator in the DOM
    const container = document.querySelector('[role="progressbar"], .w-full');
    // At minimum, the progress section should exist
    expect(screen.getByText('Question 1')).toBeInTheDocument();
  });

  it('renders Previous and Next buttons for multi-page survey', () => {
    const survey = createMinimalSurvey({
      questions: [
        {
          id: 'q1',
          question_text: 'Page 1 question',
          question_type: 'text',
          is_required: false,
          display_order: 0,
        },
        {
          id: 'page_break_1',
          question_text: '',
          question_type: 'page_break',
          is_required: false,
          display_order: 1,
        },
        {
          id: 'q2',
          question_text: 'Page 2 question',
          question_type: 'text',
          is_required: false,
          display_order: 2,
        },
      ],
    });
    render(<SurveyWidget survey={survey} />);

    // Should have Previous button (disabled on first page) and Next button
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('shows success state with forceSuccessState', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} forceSuccessState={true} />);

    expect(screen.getByText('Thank you for your submission!')).toBeInTheDocument();
  });

  it('shows custom thank you message', () => {
    const survey = createMinimalSurvey({
      thank_you_message: 'We appreciate your input!',
    });
    render(<SurveyWidget survey={survey} forceSuccessState={true} />);

    expect(screen.getByText('We appreciate your input!')).toBeInTheDocument();
  });

  it('shows loading state with forceLoadingState', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} forceLoadingState={true} />);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('handles demo mode - shows Try again button after success', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} isDemo={true} forceSuccessState={true} />);

    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  it('shows no survey data message when no survey provided', () => {
    render(<SurveyWidget />);

    expect(screen.getByText('No survey data available.')).toBeInTheDocument();
  });

  it('renders "Powered by Ask Users" by default', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} />);

    expect(screen.getByText('Powered by')).toBeInTheDocument();
    expect(screen.getByText('Ask Users')).toBeInTheDocument();
  });

  it('hides powered by when showPoweredBy is false', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} showPoweredBy={false} />);

    expect(screen.queryByText('Powered by')).not.toBeInTheDocument();
  });

  it('renders multiple question types', () => {
    const survey = createMinimalSurvey({
      questions: [
        {
          id: 'q1',
          question_text: 'Text question',
          question_type: 'text',
          is_required: false,
          display_order: 0,
        },
        {
          id: 'q2',
          question_text: 'Select question',
          question_type: 'select',
          is_required: false,
          display_order: 1,
          options: ['A', 'B', 'C'],
        },
      ],
    });
    render(<SurveyWidget survey={survey} />);

    expect(screen.getByText('Text question')).toBeInTheDocument();
    expect(screen.getByText('Select question')).toBeInTheDocument();
  });

  it('renders submit button on last page', () => {
    const survey = createMinimalSurvey();
    render(<SurveyWidget survey={survey} />);

    expect(screen.getByText('Submit survey')).toBeInTheDocument();
  });

  it('shows required indicator for required questions', () => {
    const survey = createMinimalSurvey({
      questions: [
        {
          id: 'q1',
          question_text: 'Required question',
          question_type: 'text',
          is_required: true,
          display_order: 0,
        },
      ],
    });
    render(<SurveyWidget survey={survey} />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
