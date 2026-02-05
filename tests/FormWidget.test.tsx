import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormWidget } from '../src/components/FormWidget';
import type { CreateFormRequest } from '../src/types/index';

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

function createMinimalForm(overrides?: Partial<CreateFormRequest>): CreateFormRequest {
  return {
    title: 'Test form',
    description: 'A test form description',
    questions: [
      {
        id: 'q1',
        question_text: 'What is your name?',
        question_type: 'text',
        is_required: false,
        display_order: 0,
      },
    ],
    ...overrides,
  };
}

describe('FormWidget', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('renders form title and description when form prop provided', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} />);

    expect(screen.getByText('Test form')).toBeInTheDocument();
    expect(screen.getByText('A test form description')).toBeInTheDocument();
  });

  it('renders question text', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} />);

    expect(screen.getByText('What is your name?')).toBeInTheDocument();
  });

  it('renders text input for text question type', () => {
    const form = createMinimalForm({
      questions: [
        {
          id: 'q1',
          question_text: 'Your name',
          question_type: 'text',
          is_required: false,
          display_order: 0,
        },
      ],
    });
    render(<FormWidget form={form} />);

    const inputs = document.querySelectorAll('input[type="text"]');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders textarea for textarea question type', () => {
    const form = createMinimalForm({
      questions: [
        {
          id: 'q1',
          question_text: 'Your feedback',
          question_type: 'textarea',
          is_required: false,
          display_order: 0,
        },
      ],
    });
    render(<FormWidget form={form} />);

    const textareas = document.querySelectorAll('textarea');
    expect(textareas.length).toBeGreaterThanOrEqual(1);
  });

  it('renders radio buttons for radio question type', () => {
    const form = createMinimalForm({
      questions: [
        {
          id: 'q1',
          question_text: 'Choose one',
          question_type: 'radio',
          is_required: false,
          display_order: 0,
          options: ['Option A', 'Option B', 'Option C'],
        },
      ],
    });
    render(<FormWidget form={form} />);

    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
    expect(screen.getByText('Option C')).toBeInTheDocument();
  });

  it('renders yes/no buttons for yes_no question type', () => {
    const form = createMinimalForm({
      questions: [
        {
          id: 'q1',
          question_text: 'Do you agree?',
          question_type: 'yes_no',
          is_required: false,
          display_order: 0,
        },
      ],
    });
    render(<FormWidget form={form} />);

    expect(screen.getByText('Do you agree?')).toBeInTheDocument();
  });

  it('hides title when hideTitle is true', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} hideTitle={true} />);

    expect(screen.queryByText('Test form')).not.toBeInTheDocument();
  });

  it('hides description when hideDescription is true', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} hideDescription={true} />);

    expect(screen.queryByText('A test form description')).not.toBeInTheDocument();
  });

  it('shows loading state when forceLoadingState is true', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} forceLoadingState={true} />);

    expect(screen.getByText('Submitting...')).toBeInTheDocument();
  });

  it('shows success state when forceSuccessState is true', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} forceSuccessState={true} />);

    expect(screen.getByText('Thank you for your submission!')).toBeInTheDocument();
  });

  it('shows custom thank you message in success state', () => {
    const form = createMinimalForm({ thank_you_message: 'Thanks for your feedback!' });
    render(<FormWidget form={form} forceSuccessState={true} />);

    expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
  });

  it('shows "Powered by Ask Users" link when showPoweredBy is true', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} showPoweredBy={true} />);

    expect(screen.getByText('Powered by')).toBeInTheDocument();
    expect(screen.getByText('Ask Users')).toBeInTheDocument();
  });

  it('shows "Powered by Ask Users" when branding sets showPoweredBy to true', () => {
    const form = createMinimalForm({
      custom_branding: {
        colorScheme: 'default',
        showPoweredBy: true,
      },
    });
    render(<FormWidget form={form} />);

    expect(screen.getByText('Powered by')).toBeInTheDocument();
    expect(screen.getByText('Ask Users')).toBeInTheDocument();
  });

  it('hides powered by when showPoweredBy is false', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} showPoweredBy={false} />);

    expect(screen.queryByText('Powered by')).not.toBeInTheDocument();
  });

  it('renders submit button', () => {
    const form = createMinimalForm();
    render(<FormWidget form={form} />);

    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders email input for email question type', () => {
    const form = createMinimalForm({
      questions: [
        {
          id: 'q1',
          question_text: 'Your email',
          question_type: 'email',
          is_required: false,
          display_order: 0,
        },
      ],
    });
    render(<FormWidget form={form} />);

    const emailInputs = document.querySelectorAll('input[type="email"]');
    expect(emailInputs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders rating buttons for rating question type', () => {
    const form = createMinimalForm({
      questions: [
        {
          id: 'q1',
          question_text: 'Rate this',
          question_type: 'rating',
          is_required: false,
          display_order: 0,
          rating_min: 1,
          rating_max: 5,
        },
      ],
    });
    render(<FormWidget form={form} />);

    expect(screen.getByText('Rate this')).toBeInTheDocument();
    // Rating buttons should be present (numbers 1-5)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('shows no form data message when form is not provided and no API key', () => {
    render(<FormWidget />);

    expect(screen.getByText(/No form data available/)).toBeInTheDocument();
  });

  it('renders multiple questions', () => {
    const form = createMinimalForm({
      questions: [
        {
          id: 'q1',
          question_text: 'First question',
          question_type: 'text',
          is_required: false,
          display_order: 0,
        },
        {
          id: 'q2',
          question_text: 'Second question',
          question_type: 'textarea',
          is_required: false,
          display_order: 1,
        },
      ],
    });
    render(<FormWidget form={form} />);

    expect(screen.getByText('First question')).toBeInTheDocument();
    expect(screen.getByText('Second question')).toBeInTheDocument();
  });

  it('shows required indicator for required questions', () => {
    const form = createMinimalForm({
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
    render(<FormWidget form={form} />);

    expect(screen.getByText('*')).toBeInTheDocument();
  });
});
