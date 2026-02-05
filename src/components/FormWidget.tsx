import { useState, useMemo, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import type { CreateFormRequest, CreateFormQuestionRequest, FormWithQuestions } from '../types';
import { getBrandingStyles, applyBrandingStyles } from '../utils/branding';
import { generateFormStyles, generateFormStylesheet, getFieldStyleClasses, getButtonStyleClasses, generateSplitLayoutStyles } from '../utils/formStyles';
import { REACTION_EMOJIS, getReactionByValue } from '../constants/reactions';
import { Tooltip } from './Tooltip';
import { useFormAnalytics } from '../hooks/useFormAnalytics';
import { ConditionalLogicUtil } from '../utils/conditionalLogic';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { AskUsersClient } from '../api/client';
import '../styles/tiptap.css';

interface FormWidgetProps {
  // Data source: either provide formId+apiKey OR form data directly
  formId?: string;
  apiKey?: string;
  baseUrl?: string;
  form?: CreateFormRequest;

  // Display
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  hideTitle?: boolean;
  hideDescription?: boolean;
  showPoweredBy?: boolean;

  // Callbacks
  onLoad?: () => void;
  onSubmit?: (responses: Record<string, string | number | string[]>) => Promise<void>;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: Error) => void;

  // Internal/demo props (keep from original)
  isDemo?: boolean;
  isPublic?: boolean;
  thankYouMessage?: string;
  forceSuccessState?: boolean;
  forceLoadingState?: boolean;
}

function FormWidget({
  formId,
  apiKey,
  baseUrl,
  form: formProp,
  className = '',
  theme: themeProp,
  hideTitle = false,
  hideDescription = false,
  showPoweredBy,
  onLoad,
  onSubmit: onSubmitProp,
  onSubmitSuccess,
  onSubmitError,
  isDemo = false,
  isPublic: _isPublic = false,
  thankYouMessage,
  forceSuccessState = false,
  forceLoadingState = false,
}: FormWidgetProps) {
  // API client for fetching form data and submitting
  const [apiClient] = useState(() => {
    if (apiKey) {
      return new AskUsersClient({ apiKey, baseUrl });
    }
    return null;
  });

  // State for fetched form data
  const [fetchedForm, setFetchedForm] = useState<CreateFormRequest | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Resolve the form: use prop directly or fetched data
  const form = formProp || fetchedForm;

  // Fetch form data from API if formId + apiKey provided and no form prop
  useEffect(() => {
    if (formProp || !formId || !apiClient) return;

    let cancelled = false;
    setFetchLoading(true);
    setFetchError(null);

    apiClient
      .getForm(formId)
      .then((data: FormWithQuestions) => {
        if (cancelled) return;
        // Convert FormWithQuestions to CreateFormRequest shape
        const formData: CreateFormRequest = {
          title: data.form.title,
          description: data.form.description,
          thank_you_message: data.form.thank_you_message,
          custom_branding: data.form.custom_branding,
          layout_config: data.form.layout_config,
          appearance_config: data.form.appearance_config,
          widget_display_config: data.form.widget_display_config,
          context_id: data.form.context_id,
          context_type: data.form.context_type,
          context_metadata: data.form.context_metadata,
          hosted_enabled: data.form.hosted_enabled,
          hosted_slug: data.form.hosted_slug,
          single_use_enabled: data.form.single_use_enabled,
          is_internal: data.form.is_internal,
          questions: data.questions.map((q) => ({
            id: q.id,
            question_text: q.question_text,
            question_html: q.question_html,
            question_type: q.question_type,
            is_required: q.is_required,
            display_order: q.display_order,
            options: q.options,
            rating_min: q.rating_min,
            rating_max: q.rating_max,
            rating_labels: q.rating_labels,
            min_length: q.min_length,
            max_length: q.max_length,
            visual_config: q.visual_config,
            logic_rules: q.logic_rules,
          })),
        };
        setFetchedForm(formData);
        setFetchLoading(false);
        if (onLoad) onLoad();
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setFetchError(err.message);
        setFetchLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [formId, apiClient, formProp, onLoad]);

  // Call onLoad when form prop is provided directly
  useEffect(() => {
    if (formProp && onLoad) {
      onLoad();
    }
  }, [formProp, onLoad]);

  // Use the theme detection hook
  const theme = useThemeDetection(themeProp);

  // Initialize form analytics tracking
  const { trackView, trackFieldFocus, trackFieldBlur, trackSubmitAttempt, trackSubmitSuccess } = useFormAnalytics(
    formId,
    undefined,
    {
      apiKey,
      baseUrl,
      source: 'widget',
      displayMode: 'inline',
    }
  );

  // Show fetch loading state
  if (fetchLoading || (!form && formId && apiKey)) {
    return (
      <div className={`askusers-widget-container max-w-2xl mx-auto p-8 ${className}`}>
        <div className="text-center">
          <div className="mb-6 flex justify-center">
            <div
              className="h-12 w-12 border-4 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: '#6366f1 transparent #6366f1 #6366f1' }}
            />
          </div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  // Show fetch error state
  if (fetchError) {
    return (
      <div className={`askusers-widget-container max-w-2xl mx-auto p-8 ${className}`}>
        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-red-600">Failed to load form: {fetchError}</p>
        </div>
      </div>
    );
  }

  // If no form data available at all
  if (!form) {
    return (
      <div className={`askusers-widget-container max-w-2xl mx-auto p-8 ${className}`}>
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-yellow-700">No form data available. Provide either a formId + apiKey or form data directly.</p>
        </div>
      </div>
    );
  }

  return (
    <FormWidgetInner
      form={form}
      formId={formId}
      apiClient={apiClient}
      className={className}
      theme={theme}
      hideTitle={hideTitle}
      hideDescription={hideDescription}
      showPoweredBy={showPoweredBy}
      onSubmitProp={onSubmitProp}
      onSubmitSuccess={onSubmitSuccess}
      onSubmitError={onSubmitError}
      isDemo={isDemo}
      thankYouMessage={thankYouMessage}
      forceSuccessState={forceSuccessState}
      forceLoadingState={forceLoadingState}
      trackView={trackView}
      trackFieldFocus={trackFieldFocus}
      trackFieldBlur={trackFieldBlur}
      trackSubmitAttempt={trackSubmitAttempt}
      trackSubmitSuccess={trackSubmitSuccess}
    />
  );
}

// Inner component that has guaranteed form data
interface FormWidgetInnerProps {
  form: CreateFormRequest;
  formId?: string;
  apiClient: AskUsersClient | null;
  className: string;
  theme: 'light' | 'dark';
  hideTitle: boolean;
  hideDescription: boolean;
  showPoweredBy?: boolean;
  onSubmitProp?: (responses: Record<string, string | number | string[]>) => Promise<void>;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: Error) => void;
  isDemo: boolean;
  thankYouMessage?: string;
  forceSuccessState: boolean;
  forceLoadingState: boolean;
  trackView: () => void;
  trackFieldFocus: (fieldId: string, fieldOrder: number) => void;
  trackFieldBlur: (fieldId: string, fieldOrder: number) => void;
  trackSubmitAttempt: () => void;
  trackSubmitSuccess: () => void;
}

function FormWidgetInner({
  form,
  formId,
  apiClient,
  className,
  theme,
  hideTitle,
  hideDescription,
  showPoweredBy: showPoweredByProp,
  onSubmitProp,
  onSubmitSuccess,
  onSubmitError,
  isDemo,
  thankYouMessage,
  forceSuccessState,
  forceLoadingState,
  trackView,
  trackFieldFocus,
  trackFieldBlur,
  trackSubmitAttempt,
  trackSubmitSuccess,
}: FormWidgetInnerProps) {
  // Generate a unique storage key for this form
  const formStorageKey = `form_draft_${form.title.replace(/\s+/g, '_').toLowerCase()}`;

  const [responses, setResponses] = useState<Record<string, string | number | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({});
  const [showValidationError, setShowValidationError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // Resolve whether to show "Powered by" - prop overrides form branding
  const shouldShowPoweredBy = showPoweredByProp !== undefined
    ? showPoweredByProp
    : form.custom_branding?.showPoweredBy;

  // Helper function to get alignment class
  const getAlignmentClass = (alignment?: 'left' | 'center' | 'right') => {
    const align = alignment || 'center';
    return align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';
  };

  const getTextAlignmentClass = (alignment?: 'left' | 'center' | 'right') => {
    const align = alignment || 'center';
    return align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  };

  // Create stable tracking handlers
  const handleFieldFocusEvent = useCallback((questionId: string, questionIndex: number) => {
    if (formId && !isDemo && questionId) {
      trackFieldFocus(questionId, questionIndex);
    }
  }, [formId, isDemo, trackFieldFocus]);

  const handleFieldBlurEvent = useCallback((questionId: string, questionIndex: number) => {
    if (formId && !isDemo && questionId) {
      trackFieldBlur(questionId, questionIndex);
    }
  }, [formId, isDemo, trackFieldBlur]);

  // Load saved responses from localStorage on mount (only for non-demo forms)
  useEffect(() => {
    if (isDemo || typeof window === 'undefined') return;

    try {
      const savedResponses = localStorage.getItem(formStorageKey);
      if (savedResponses) {
        const parsed = JSON.parse(savedResponses);
        setResponses(parsed);
      }
    } catch (err) {
      console.error('Failed to load saved form responses:', err);
    }
  }, [formStorageKey, isDemo]);

  // Save responses to localStorage whenever they change (only for non-demo forms)
  useEffect(() => {
    if (isDemo || typeof window === 'undefined') return;

    try {
      if (Object.keys(responses).length > 0) {
        localStorage.setItem(formStorageKey, JSON.stringify(responses));
      }
    } catch (err) {
      console.error('Failed to save form responses:', err);
    }
  }, [responses, formStorageKey, isDemo]);

  // Track form view on mount (only if formId is provided)
  useEffect(() => {
    if (formId && !isDemo) {
      trackView();
    }
  }, [formId, isDemo, trackView]);

  const brandingStyles = useMemo(() =>
    getBrandingStyles(form.custom_branding, theme),
    [form.custom_branding, theme]
  );
  const cssVariables = useMemo(() =>
    applyBrandingStyles(brandingStyles),
    [brandingStyles]
  );

  // Generate appearance and layout styles
  const appearanceStyles = useMemo(() => {
    return generateFormStyles(form.appearance_config, form.layout_config);
  }, [form.appearance_config, form.layout_config]);

  // Generate stylesheet for dark mode support
  const formStylesheet = useMemo(() => {
    return generateFormStylesheet(form.appearance_config, form.layout_config);
  }, [form.appearance_config, form.layout_config, theme]);

  const fieldStyleClasses = useMemo(() =>
    getFieldStyleClasses(form.appearance_config),
    [form.appearance_config]
  );
  const buttonStyleClasses = useMemo(() =>
    getButtonStyleClasses(form.appearance_config),
    [form.appearance_config]
  );

  // Create a stable mapping of questions to their original indices
  const questionIndexMap = useMemo(() => {
    const map = new Map<CreateFormQuestionRequest, number>();
    form.questions.forEach((question, index) => {
      map.set(question, index);
    });
    return map;
  }, [form.questions]);

  // Compute which questions should be skipped based on current responses
  const skippedQuestionIds = useMemo(() => {
    const sortedQuestions = [...form.questions].sort((a, b) => a.display_order - b.display_order);
    const skipped = new Set<string>();

    // Go through questions in order and check for skip logic
    for (let i = 0; i < sortedQuestions.length; i++) {
      const question = sortedQuestions[i];

      // Only evaluate skip logic if this question has been answered
      const hasResponse = question.id && responses[question.id] !== undefined && responses[question.id] !== null && responses[question.id] !== '';

      if (hasResponse && question.logic_rules?.skip_to) {
        let skipTo: string | null = null;

        // Check for unconditional jump first (always applies if question is answered)
        if (question.logic_rules.skip_to.unconditionalTarget) {
          skipTo = question.logic_rules.skip_to.unconditionalTarget;
        } else {
          // Otherwise evaluate conditional skip logic based on responses
          skipTo = ConditionalLogicUtil.evaluateSkipLogic(question.logic_rules.skip_to, responses);
        }

        if (skipTo === 'END') {
          // Mark all remaining questions as skipped
          for (let j = i + 1; j < sortedQuestions.length; j++) {
            if (sortedQuestions[j].id) {
              skipped.add(sortedQuestions[j].id!);
            }
          }
          break;
        } else if (skipTo && typeof skipTo === 'string') {
          // Mark questions between current and target as skipped
          const targetIndex = sortedQuestions.findIndex(q => q.id === skipTo);
          if (targetIndex > i) {
            for (let j = i + 1; j < targetIndex; j++) {
              if (sortedQuestions[j].id) {
                skipped.add(sortedQuestions[j].id!);
              }
            }
          }
        }
      }
    }

    return skipped;
  }, [form.questions, responses]);

  // Split questions into pages based on display style and page_break questions
  const pages = useMemo(() => {
    const sortedQuestions = [...form.questions].sort((a, b) => a.display_order - b.display_order);

    // Apply conditional logic: filter out questions that should be hidden based on current responses
    let visibleQuestions = ConditionalLogicUtil.filterVisibleQuestions(sortedQuestions, responses);

    // Also filter out questions that have been skipped by skip logic
    visibleQuestions = visibleQuestions.filter(q => !skippedQuestionIds.has(q.id || ''));

    const displayStyle = form.layout_config?.displayStyle || 'freeform';

    // Conversational mode: One question per page (excluding content blocks and page breaks)
    if (displayStyle === 'conversational') {
      return visibleQuestions
        .filter(q => q.question_type !== 'page_break') // Remove page breaks in conversational mode
        .map(q => [q]); // Each question gets its own page
    }

    // Freeform mode: Use page breaks to split questions
    const pagesList: CreateFormQuestionRequest[][] = [];
    let currentPageQuestions: CreateFormQuestionRequest[] = [];

    visibleQuestions.forEach((question) => {
      if (question.question_type === 'page_break') {
        // End current page and start a new one
        if (currentPageQuestions.length > 0) {
          pagesList.push(currentPageQuestions);
          currentPageQuestions = [];
        }
      } else {
        currentPageQuestions.push(question);
      }
    });

    // Add the last page if it has questions
    if (currentPageQuestions.length > 0) {
      pagesList.push(currentPageQuestions);
    }

    // If no pages were created (no questions or only page breaks), return a single empty page
    return pagesList.length > 0 ? pagesList : [[]];
  }, [form.questions, form.layout_config?.displayStyle, responses, skippedQuestionIds]);

  const totalPages = pages.length;
  const currentPageQuestions = pages[currentPage] || [];

  const handleResponseChange = (questionId: string, value: string | number | string[]) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    setValidationErrors(prev => {
      const newErrors = { ...prev };
      const questionIndex = form.questions.findIndex(q => q.id === questionId);
      if (questionIndex !== -1) {
        delete newErrors[questionIndex];
      }
      return newErrors;
    });

    // Clear the validation error message when user starts fixing errors
    if (showValidationError) {
      setShowValidationError(false);
    }
  };

  const validateForm = (): { isValid: boolean; errors: Record<number, string> } => {
    const errors: Record<number, string> = {};

    form.questions.forEach((question, index) => {
      // Skip validation for page breaks and content blocks (they don't collect responses)
      if (question.question_type === 'page_break' || question.question_type === 'content_block') {
        return;
      }

      // Skip validation for questions that are skipped by jump logic
      if (question.id && skippedQuestionIds.has(question.id)) {
        return;
      }

      if (question.is_required) {
        const value = responses[question.id || index];
        if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
          errors[index] = 'This field is required';
          return;
        }
      }

      const value = responses[question.id || index];
      if (value && typeof value === 'string') {
        // Validate email
        if (question.question_type === 'email') {
          if (!value.includes('@')) {
            errors[index] = "Please include '@' in your email address";
          } else if (!value.includes('.')) {
            errors[index] = 'Email address must include a domain (e.g., example.com)';
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[index] = 'Please enter a valid email address (e.g., name@example.com)';
            }
          }
        }

        // Validate phone
        if (question.question_type === 'phone') {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          const digitsOnly = value.replace(/\D/g, '');
          if (!phoneRegex.test(value)) {
            errors[index] = 'Phone number can only contain numbers and symbols (-, +, (, ))';
          } else if (digitsOnly.length < 10) {
            errors[index] = 'Phone number must be at least 10 digits (e.g., 555-123-4567)';
          }
        }

        // Validate URL
        if (question.question_type === 'url') {
          try {
            new URL(value);
          } catch {
            if (!value.includes('://')) {
              errors[index] = 'URL must include protocol (e.g., https://example.com)';
            } else if (!value.includes('.')) {
              errors[index] = 'URL must include a domain (e.g., https://example.com)';
            } else {
              errors[index] = 'Please enter a valid URL (e.g., https://example.com)';
            }
          }
        }

        // Validate length constraints
        if (question.min_length && value.length < question.min_length) {
          errors[index] = `Minimum ${question.min_length} characters required`;
        }
        if (question.max_length && value.length > question.max_length) {
          errors[index] = `Maximum ${question.max_length} characters allowed`;
        }
      }
    });

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();

    if (!isValid) {
      setShowValidationError(true);

      // Wait a tick for the DOM to update with validation errors, then scroll
      requestAnimationFrame(() => {
        // Find the first error and scroll to it
        const errorIndices = Object.keys(errors).map(Number);
        if (errorIndices.length > 0) {
          const firstErrorIndex = Math.min(...errorIndices);
          const errorElement = document.querySelector(`[data-question-index="${firstErrorIndex}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });

      return;
    }

    setError(null);
    setShowValidationError(false);

    // Track submit attempt
    if (formId && !isDemo) {
      trackSubmitAttempt();
    }

    if (isDemo) {
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 1500);
      return;
    }

    // Determine the submit handler
    const doSubmit = async () => {
      if (onSubmitProp) {
        // Use the provided onSubmit callback
        await onSubmitProp(responses);
      } else if (formId && apiClient) {
        // Auto-submit via API client
        await apiClient.submitForm(formId, {
          submission_data: responses,
          context_url: typeof window !== 'undefined' ? window.location.href : undefined,
        });
      } else {
        // No submit handler available
        return;
      }
    };

    try {
      setSubmitting(true);
      setError(null);
      await doSubmit();
      setSubmitted(true);

      // Track successful submission
      if (formId && !isDemo) {
        trackSubmitSuccess();
      }

      // Clear saved draft from localStorage after successful submission
      if (typeof window !== 'undefined') {
        localStorage.removeItem(formStorageKey);
      }

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (submitError) {
      const err = submitError instanceof Error ? submitError : new Error('Failed to submit form');
      setError(err.message);

      // Call error callback
      if (onSubmitError) {
        onSubmitError(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Validate only the current page
  const validateCurrentPage = (): { isValid: boolean; errors: Record<number, string> } => {
    const errors: Record<number, string> = {};

    currentPageQuestions.forEach((question) => {
      // Skip validation for page breaks and content blocks (they don't collect responses)
      if (question.question_type === 'page_break' || question.question_type === 'content_block') {
        return;
      }

      // Find the global index of this question
      const globalIndex = questionIndexMap.get(question) ?? 0;

      if (question.is_required) {
        const value = responses[question.id || String(globalIndex)];
        if (!value || (Array.isArray(value) && value.length === 0) || value === '') {
          errors[globalIndex] = 'This field is required';
        }
      }

      // Only validate if there's a value
      const value = responses[question.id || String(globalIndex)];
      if (value && typeof value === 'string') {
        // Validate email
        if (question.question_type === 'email') {
          if (!value.includes('@')) {
            errors[globalIndex] = "Please include '@' in your email address";
          } else if (!value.includes('.')) {
            errors[globalIndex] = 'Email address must include a domain (e.g., example.com)';
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors[globalIndex] = 'Please enter a valid email address (e.g., name@example.com)';
            }
          }
        }

        // Validate phone
        if (question.question_type === 'phone') {
          const phoneRegex = /^[\d\s\-\+\(\)]+$/;
          const digitsOnly = value.replace(/\D/g, '');
          if (!phoneRegex.test(value)) {
            errors[globalIndex] = 'Phone number can only contain numbers and symbols (-, +, (, ))';
          } else if (digitsOnly.length < 10) {
            errors[globalIndex] = 'Phone number must be at least 10 digits (e.g., 555-123-4567)';
          }
        }

        // Validate URL
        if (question.question_type === 'url') {
          try {
            new URL(value);
          } catch {
            if (!value.includes('://')) {
              errors[globalIndex] = 'URL must include protocol (e.g., https://example.com)';
            } else if (!value.includes('.')) {
              errors[globalIndex] = 'URL must include a domain (e.g., https://example.com)';
            } else {
              errors[globalIndex] = 'Please enter a valid URL (e.g., https://example.com)';
            }
          }
        }

        // Validate length constraints
        if (question.min_length && value.length < question.min_length) {
          errors[globalIndex] = `Minimum ${question.min_length} characters required`;
        }
        if (question.max_length && value.length > question.max_length) {
          errors[globalIndex] = `Maximum ${question.max_length} characters allowed`;
        }
      }
    });

    setValidationErrors(errors);
    return { isValid: Object.keys(errors).length === 0, errors };
  };

  const handleNext = () => {
    const { isValid, errors } = validateCurrentPage();

    if (!isValid) {
      // Scroll to first error on current page
      requestAnimationFrame(() => {
        const errorIndices = Object.keys(errors).map(Number);
        if (errorIndices.length > 0) {
          const firstErrorIndex = Math.min(...errorIndices);
          const errorElement = document.querySelector(`[data-question-index="${firstErrorIndex}"]`);

          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      });
      return;
    }

    // Clear error
    setError(null);

    // Check skip logic for current page questions
    // Skip logic is now computed dynamically, so we just need to navigate to the next page
    // The skipped questions will automatically be filtered out when pages recompute
    for (const question of currentPageQuestions) {
      if (question.logic_rules?.skip_to) {
        const skipTo = ConditionalLogicUtil.evaluateSkipLogic(question.logic_rules.skip_to, responses);

        if (skipTo === 'END') {
          // Skip to end - submit the form
          handleSubmit(new Event('submit') as unknown as React.FormEvent);
          return;
        } else if (skipTo && typeof skipTo === 'string') {
          // Just navigate forward - the pages will recompute with skipped questions filtered out
          // The target question will be on the next visible page
          if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
          }
        }
      }
    }

    // No skip logic applied - navigate to next page normally
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
    setError(null);
    // Scroll to top of form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderQuestion = (question: CreateFormQuestionRequest, questionIndex: number) => {
    const value = responses[question.id || questionIndex] || '';
    const hasError = validationErrors[questionIndex];

    const inputClasses = `w-full px-4 py-2 rounded-lg outline-none ${hasError ? 'border-red-500' : ''} ${fieldStyleClasses}`;

    switch (question.question_type) {
      case 'text':
      case 'email':
      case 'phone':
      case 'url':
      case 'date':
      case 'number': {
        const size = question.visual_config?.size || 'medium';
        const sizeClasses = {
          small: 'px-3 py-1.5 text-sm',
          medium: 'px-4 py-2 text-base',
          large: 'px-5 py-3 text-lg'
        };

        return (
          <div>
            <input
              type={
                question.question_type === 'email' ? 'email' :
                  question.question_type === 'url' ? 'url' :
                    question.question_type === 'phone' ? 'tel' :
                      question.question_type === 'date' ? 'date' :
                        question.question_type === 'number' ? 'number' :
                          'text'
              }
              value={value}
              onChange={(e) => handleResponseChange(question.id || String(questionIndex), question.question_type === 'number' ? Number(e.target.value) : e.target.value)}
              className={`${inputClasses} ${sizeClasses[size as keyof typeof sizeClasses]}`}
              style={{
                border: `var(--form-field-border-width, 1px) solid ${hasError ? '#ef4444' : 'var(--form-field-border-color, ' + brandingStyles.colors.border + ')'}`,
                backgroundColor: hasError ? brandingStyles.colors.background : 'var(--form-field-bg-color, ' + brandingStyles.colors.background + ')',
                color: 'var(--form-field-text-color, ' + brandingStyles.colors.text + ')',
                borderRadius: 'var(--form-field-border-radius, 0.5rem)',
                padding: 'var(--form-field-padding, 0.625rem 1rem)',
                fontSize: 'var(--form-answer-font-size, 1rem)',
                fontWeight: 'var(--form-answer-font-weight, 400)',
              }}
              onFocus={(e) => {
                if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                if (!hasError) {
                  const focusBorderColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-border-color') || brandingStyles.colors.primary;
                  const focusBgColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-bg-color') || brandingStyles.colors.background;
                  e.target.style.borderColor = focusBorderColor;
                  e.target.style.backgroundColor = focusBgColor;
                  e.target.style.boxShadow = `0 0 0 2px ${brandingStyles.colors.primary}30`;
                }
              }}
              onBlur={(e) => {
                if (question.id) handleFieldBlurEvent(question.id, questionIndex);
                if (!hasError) {
                  const borderColor = getComputedStyle(e.target).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
                  const bgColor = getComputedStyle(e.target).getPropertyValue('--form-field-bg-color') || brandingStyles.colors.background;
                  e.target.style.borderColor = borderColor;
                  e.target.style.backgroundColor = bgColor;
                  e.target.style.boxShadow = 'none';
                }
              }}
              placeholder={
                question.question_type === 'email' ? 'your.email@example.com' :
                  question.question_type === 'phone' ? '+1 (555) 000-0000' :
                    question.question_type === 'url' ? 'https://example.com' :
                      question.question_type === 'number' ? '0' :
                        'Your answer...'
              }
              required={question.is_required}
              minLength={question.min_length}
              maxLength={question.max_length}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
            )}
          </div>
        );
      }

      case 'textarea': {
        const size = question.visual_config?.size || 'medium';
        const sizeClasses = {
          small: 'px-3 py-1.5 text-sm',
          medium: 'px-4 py-2 text-base',
          large: 'px-5 py-3 text-lg'
        };

        return (
          <div>
            <textarea
              value={value}
              onChange={(e) => handleResponseChange(question.id || String(questionIndex), e.target.value)}
              rows={4}
              className={`${inputClasses} resize-vertical ${sizeClasses[size as keyof typeof sizeClasses]}`}
              style={{
                border: `var(--form-field-border-width, 1px) solid ${hasError ? '#ef4444' : 'var(--form-field-border-color, ' + brandingStyles.colors.border + ')'}`,
                backgroundColor: hasError ? brandingStyles.colors.background : 'var(--form-field-bg-color, ' + brandingStyles.colors.background + ')',
                color: 'var(--form-field-text-color, ' + brandingStyles.colors.text + ')',
                borderRadius: 'var(--form-field-border-radius, 0.5rem)',
                padding: 'var(--form-field-padding, 0.625rem 1rem)',
                fontSize: 'var(--form-answer-font-size, 1rem)',
                fontWeight: 'var(--form-answer-font-weight, 400)',
              }}
              onFocus={(e) => {
                if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                if (!hasError) {
                  const focusBorderColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-border-color') || brandingStyles.colors.primary;
                  const focusBgColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-bg-color') || brandingStyles.colors.background;
                  e.target.style.borderColor = focusBorderColor;
                  e.target.style.backgroundColor = focusBgColor;
                  e.target.style.boxShadow = `0 0 0 2px ${brandingStyles.colors.primary}30`;
                }
              }}
              onBlur={(e) => {
                if (question.id) handleFieldBlurEvent(question.id, questionIndex);
                if (!hasError) {
                  const borderColor = getComputedStyle(e.target).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
                  const bgColor = getComputedStyle(e.target).getPropertyValue('--form-field-bg-color') || brandingStyles.colors.background;
                  e.target.style.borderColor = borderColor;
                  e.target.style.backgroundColor = bgColor;
                  e.target.style.boxShadow = 'none';
                }
              }}
              placeholder="Your answer..."
              required={question.is_required}
              minLength={question.min_length}
              maxLength={question.max_length}
            />
            {hasError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
            )}
          </div>
        );
      }

      case 'radio': {
        const layout = question.visual_config?.layout || 'vertical';
        const style = question.visual_config?.style || 'default';

        // Layout classes
        const layoutClasses = {
          'vertical': 'flex flex-col gap-2',
          'horizontal': 'flex flex-row flex-wrap gap-2',
          'grid-2': 'grid grid-cols-1 sm:grid-cols-2 gap-2',
          'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'
        };

        return (
          <div>
            <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
              {question.options?.map((option, index) => {
                const isSelected = value === option;

                // Default style (native radio)
                if (style === 'default') {
                  return (
                    <label key={index} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option}
                        checked={isSelected}
                        onChange={(e) => handleResponseChange(question.id || String(questionIndex), e.target.value)}
                        onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                        className="mr-3"
                        style={{
                          accentColor: brandingStyles.colors.primary,
                        }}
                        required={question.is_required}
                      />
                      <span style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')' }}>{option}</span>
                    </label>
                  );
                }

                // Button or Card style
                return (
                  <label
                    key={index}
                    className={`cursor-pointer transition-all ${style === 'button'
                      ? 'rounded-md border-2 font-medium text-center'
                      : 'p-4 rounded-lg border-2 text-center'
                      }`}
                    style={{
                      padding: style === 'button' ? 'var(--form-choice-button-padding, 0.5rem 1rem)' : undefined,
                      fontSize: style === 'button' ? 'var(--form-choice-button-font-size, 14px)' : undefined,
                      borderColor: isSelected
                        ? 'var(--form-primary-color)'
                        : 'var(--form-field-border-color)',
                      backgroundColor: isSelected
                        ? 'var(--form-primary-color)'
                        : 'var(--form-field-bg-color)',
                      color: isSelected ? '#FFFFFF' : 'var(--form-field-text-color)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        const target = e.currentTarget;
                        target.style.borderColor = 'var(--form-primary-color)';
                        target.style.backgroundColor = 'var(--form-bg-secondary-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        const target = e.currentTarget;
                        target.style.borderColor = 'var(--form-field-border-color)';
                        target.style.backgroundColor = 'var(--form-field-bg-color)';
                      }
                    }}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={option}
                      checked={isSelected}
                      onChange={(e) => handleResponseChange(question.id || String(questionIndex), e.target.value)}
                      onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                      className="sr-only"
                      required={question.is_required}
                    />
                    {option}
                  </label>
                );
              })}
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
            )}
          </div>
        );
      }

      case 'checkbox': {
        const checkboxValues = Array.isArray(value) ? value : [];
        const layout = question.visual_config?.layout || 'vertical';
        const style = question.visual_config?.style || 'default';

        // Layout classes
        const layoutClasses = {
          'vertical': 'flex flex-col gap-2',
          'horizontal': 'flex flex-row flex-wrap gap-2',
          'grid-2': 'grid grid-cols-1 sm:grid-cols-2 gap-2',
          'grid-3': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2'
        };

        return (
          <div>
            <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
              {question.options?.map((option, index) => {
                const isSelected = checkboxValues.includes(option);

                // Default style (native checkbox)
                if (style === 'default') {
                  return (
                    <label key={index} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value={option}
                        checked={isSelected}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...checkboxValues, option]
                            : checkboxValues.filter(v => v !== option);
                          handleResponseChange(question.id || String(questionIndex), newValues);
                        }}
                        onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                        className="mr-3"
                        style={{
                          accentColor: brandingStyles.colors.primary,
                        }}
                      />
                      <span style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')' }}>{option}</span>
                    </label>
                  );
                }

                // Button or Card style
                return (
                  <label
                    key={index}
                    className={`cursor-pointer transition-all ${style === 'button'
                      ? 'rounded-md border-2 font-medium text-center'
                      : 'p-4 rounded-lg border-2 text-center'
                      }`}
                    style={{
                      padding: style === 'button' ? 'var(--form-choice-button-padding, 0.5rem 1rem)' : undefined,
                      fontSize: style === 'button' ? 'var(--form-choice-button-font-size, 14px)' : undefined,
                      borderColor: isSelected
                        ? 'var(--form-primary-color)'
                        : 'var(--form-field-border-color)',
                      backgroundColor: isSelected
                        ? 'var(--form-primary-color)'
                        : 'var(--form-field-bg-color)',
                      color: isSelected ? '#FFFFFF' : 'var(--form-field-text-color)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        const target = e.currentTarget;
                        target.style.borderColor = 'var(--form-primary-color)';
                        target.style.backgroundColor = 'var(--form-bg-secondary-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        const target = e.currentTarget;
                        target.style.borderColor = 'var(--form-field-border-color)';
                        target.style.backgroundColor = 'var(--form-field-bg-color)';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      value={option}
                      checked={isSelected}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...checkboxValues, option]
                          : checkboxValues.filter(v => v !== option);
                        handleResponseChange(question.id || String(questionIndex), newValues);
                      }}
                      onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                      className="sr-only"
                    />
                    {option}
                  </label>
                );
              })}
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
            )}
          </div>
        );
      }

      case 'select': {
        const size = question.visual_config?.size || 'medium';
        const sizeClasses = {
          small: 'px-3 py-1.5 text-sm',
          medium: 'px-4 py-2 text-base',
          large: 'px-5 py-3 text-lg'
        };

        return (
          <div>
            <select
              value={value}
              onChange={(e) => handleResponseChange(question.id || String(questionIndex), e.target.value)}
              className={`${inputClasses} ${sizeClasses[size as keyof typeof sizeClasses]}`}
              style={{
                border: `var(--form-field-border-width, 1px) solid ${hasError ? '#ef4444' : 'var(--form-field-border-color, ' + brandingStyles.colors.border + ')'}`,
                backgroundColor: hasError ? brandingStyles.colors.background : 'var(--form-field-bg-color, ' + brandingStyles.colors.background + ')',
                color: 'var(--form-field-text-color, ' + brandingStyles.colors.text + ')',
                borderRadius: 'var(--form-field-border-radius, 0.5rem)',
                padding: 'var(--form-field-padding, 0.625rem 1rem)',
                fontSize: 'var(--form-answer-font-size, 1rem)',
                fontWeight: 'var(--form-answer-font-weight, 400)',
              }}
              onFocus={(e) => {
                if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                if (!hasError) {
                  const focusBorderColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-border-color') || brandingStyles.colors.primary;
                  const focusBgColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-bg-color') || brandingStyles.colors.background;
                  e.target.style.borderColor = focusBorderColor;
                  e.target.style.backgroundColor = focusBgColor;
                  e.target.style.boxShadow = `0 0 0 2px ${brandingStyles.colors.primary}30`;
                }
              }}
              onBlur={(e) => {
                if (question.id) handleFieldBlurEvent(question.id, questionIndex);
                if (!hasError) {
                  const borderColor = getComputedStyle(e.target).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
                  const bgColor = getComputedStyle(e.target).getPropertyValue('--form-field-bg-color') || brandingStyles.colors.background;
                  e.target.style.borderColor = borderColor;
                  e.target.style.backgroundColor = bgColor;
                  e.target.style.boxShadow = 'none';
                }
              }}
              required={question.is_required}
            >
              <option value="">Select an option...</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
            )}
          </div>
        );
      }

      case 'rating': {
        const minRating = question.rating_min ?? 1;
        const maxRating = question.rating_max ?? 5;
        const ratings = Array.from({ length: maxRating - minRating + 1 }, (_, i) => minRating + i);

        // Support both formats: { min: 'label', max: 'label' } and { '1': 'label', '5': 'label' }
        const minLabel = question.rating_labels?.min || question.rating_labels?.[String(minRating)];
        const maxLabel = question.rating_labels?.max || question.rating_labels?.[String(maxRating)];

        // Get visual config settings with defaults
        const visualStyle = question.visual_config?.style || 'buttons';
        const buttonShape = question.visual_config?.buttonShape || 'round';
        const size = question.visual_config?.size || 'medium';

        // Size mapping
        const sizeClasses = {
          small: 'w-8 h-8 text-xs',
          medium: 'w-10 h-10 text-sm',
          large: 'w-12 h-12 text-base'
        };

        // Button shape mapping
        const shapeClasses = {
          round: 'rounded-full',
          square: 'rounded-none',
          rounded: 'rounded-md'
        };

        // Render slider style
        if (visualStyle === 'slider') {
          return (
            <div>
              <div className="flex flex-col gap-3">
                {/* Labels */}
                <div className="flex justify-between text-xs sm:text-sm font-medium" style={{ color: brandingStyles.colors.textSecondary }}>
                  {minLabel && <span>{minLabel}</span>}
                  {maxLabel && <span>{maxLabel}</span>}
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min={minRating}
                  max={maxRating}
                  value={value || minRating}
                  onChange={(e) => {
                    if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                    handleResponseChange(question.id || String(questionIndex), parseInt(e.target.value));
                  }}
                  className="w-full cursor-pointer"
                  style={{
                    accentColor: brandingStyles.colors.primary
                  }}
                />

                {/* Value display */}
                <div className="text-center text-sm font-semibold" style={{ color: brandingStyles.colors.text }}>
                  {value || minRating}
                </div>
              </div>
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
              )}
            </div>
          );
        }

        // Render stars style
        if (visualStyle === 'stars') {
          const starCount = maxRating - minRating + 1;
          return (
            <div>
              <div className="flex flex-col gap-3">
                {/* Labels */}
                {(minLabel || maxLabel) && (
                  <div className="flex justify-between text-xs sm:text-sm font-medium" style={{ color: brandingStyles.colors.textSecondary }}>
                    {minLabel && <span>{minLabel}</span>}
                    {maxLabel && <span>{maxLabel}</span>}
                  </div>
                )}

                {/* Stars */}
                <div className="flex items-center justify-center gap-1">
                  {ratings.map(rating => {
                    const isSelected = value ? rating <= Number(value) : false;
                    const sizeMap = { small: 24, medium: 32, large: 40 };
                    const starSize = sizeMap[size as keyof typeof sizeMap];

                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => {
                          if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                          handleResponseChange(question.id || String(questionIndex), rating);
                        }}
                        className="transition-all hover:scale-110"
                        aria-label={`Rate ${rating} out of ${starCount}`}
                      >
                        <svg
                          width={starSize}
                          height={starSize}
                          viewBox="0 0 24 24"
                          fill={isSelected ? brandingStyles.colors.primary : 'none'}
                          stroke={isSelected ? brandingStyles.colors.primary : brandingStyles.colors.border}
                          strokeWidth="2"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
              )}
            </div>
          );
        }

        // Default: Render buttons style
        const buttonCount = ratings.length;
        const fewButtons = buttonCount <= 7;

        return (
          <div>
            <div className="flex flex-col gap-2">
              {/* Buttons wrapper with inline labels (for few buttons on large screens) */}
              <div className={`flex ${fewButtons ? 'flex-col lg:flex-row lg:items-center' : 'flex-col items-center'} gap-3`}>
                {/* Min label - inline on large screens for few buttons */}
                {minLabel && fewButtons && (
                  <span className="hidden lg:block text-xs sm:text-sm font-medium flex-shrink-0" style={{ color: brandingStyles.colors.textSecondary }}>
                    {minLabel}
                  </span>
                )}

                {/* Rating buttons */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {ratings.map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => {
                        if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                        handleResponseChange(question.id || String(questionIndex), rating);
                      }}
                      className={`${sizeClasses[size as keyof typeof sizeClasses]} ${shapeClasses[buttonShape as keyof typeof shapeClasses]} border-2 font-semibold transition-colors`}
                      style={{
                        backgroundColor: value === rating ? brandingStyles.colors.primary : brandingStyles.colors.background,
                        color: value === rating ? 'white' : 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
                        borderColor: value === rating ? brandingStyles.colors.primary : brandingStyles.colors.border,
                      }}
                      onMouseEnter={(e) => {
                        if (value !== rating) {
                          const target = e.target as HTMLButtonElement;
                          target.style.borderColor = brandingStyles.colors.primary;
                          target.style.backgroundColor = brandingStyles.colors.backgroundSecondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (value !== rating) {
                          const target = e.target as HTMLButtonElement;
                          target.style.borderColor = brandingStyles.colors.border;
                          target.style.backgroundColor = brandingStyles.colors.background;
                        }
                      }}
                    >
                      {rating}
                    </button>
                  ))}
                </div>

                {/* Max label - inline on large screens for few buttons */}
                {maxLabel && fewButtons && (
                  <span className="hidden lg:block text-xs sm:text-sm font-medium flex-shrink-0" style={{ color: brandingStyles.colors.textSecondary }}>
                    {maxLabel}
                  </span>
                )}
              </div>

              {/* Labels row below - shown on mobile or for many buttons */}
              {(minLabel || maxLabel) && (
                <div className={`flex justify-between text-xs sm:text-sm font-medium ${fewButtons ? 'lg:hidden' : ''}`} style={{ color: brandingStyles.colors.textSecondary }}>
                  <span>{minLabel || ''}</span>
                  <span>{maxLabel || ''}</span>
                </div>
              )}
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
            )}
          </div>
        );
      }

      case 'yes_no': {
        const layout = question.visual_config?.layout || 'horizontal';
        const style = question.visual_config?.style || 'default';

        const layoutClasses = {
          'horizontal': 'flex flex-row gap-2',
          'vertical': 'flex flex-col gap-2'
        };

        const options = ['Yes', 'No'];

        if (style === 'default') {
          // Default native radio style
          return (
            <div>
              <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
                {options.map((option) => (
                  <label key={option} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={option.toLowerCase()}
                      checked={value === option.toLowerCase()}
                      onChange={(e) => {
                        if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                        handleResponseChange(question.id || String(questionIndex), e.target.value);
                      }}
                      className="mr-2"
                      style={{
                        accentColor: brandingStyles.colors.primary,
                      }}
                      required={question.is_required}
                    />
                    <span style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')' }}>{option}</span>
                  </label>
                ))}
              </div>
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
              )}
            </div>
          );
        } else {
          // Button or Card style
          return (
            <div>
              <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
                {options.map((option) => {
                  const isSelected = value === option.toLowerCase();
                  const baseClasses = 'relative cursor-pointer transition-all duration-200';
                  const styleClasses = style === 'button'
                    ? 'px-4 py-2 rounded-md border-2 text-center font-medium'
                    : 'px-4 py-3 rounded-lg border-2 text-center shadow-sm';

                  return (
                    <label
                      key={option}
                      className={`${baseClasses} ${styleClasses}`}
                      style={{
                        borderColor: isSelected
                          ? 'var(--form-primary-color)'
                          : 'var(--form-field-border-color)',
                        backgroundColor: isSelected
                          ? 'var(--form-primary-color)'
                          : 'var(--form-field-bg-color)',
                        color: isSelected ? '#FFFFFF' : 'var(--form-field-text-color)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          const target = e.currentTarget;
                          target.style.borderColor = 'var(--form-primary-color)';
                          target.style.backgroundColor = 'var(--form-bg-secondary-color)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          const target = e.currentTarget;
                          target.style.borderColor = 'var(--form-field-border-color)';
                          target.style.backgroundColor = 'var(--form-field-bg-color)';
                        }
                      }}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={option.toLowerCase()}
                        checked={isSelected}
                        onChange={(e) => {
                          if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                          handleResponseChange(question.id || String(questionIndex), e.target.value);
                        }}
                        className="sr-only"
                        required={question.is_required}
                      />
                      {option}
                    </label>
                  );
                })}
              </div>
              {hasError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
              )}
            </div>
          );
        }
      }

      case 'reaction': {
        // Get reaction options from question options or use default emojis
        const reactionOptions = question.options && question.options.length > 0
          ? question.options.map(opt => {
            const reaction = getReactionByValue(opt);
            return reaction || { emoji: opt, label: opt, value: opt, icon: undefined };
          })
          : REACTION_EMOJIS.slice(0, 5); // Default to first 5 emojis

        const reactionSize = question.visual_config?.size || 'medium';
        const reactionLayout = question.visual_config?.layout || 'grid';
        const textDisplay = question.visual_config?.textDisplay || 'inline';
        const showBorder = question.visual_config?.showBorder !== false; // Default to true
        const displayStyle = question.visual_config?.displayStyle || 'emoji'; // Default to emoji

        // Size classes for emojis and icons
        const sizeClasses = {
          'xx-small': { emoji: 'text-base', icon: 'w-4 h-4', container: 'px-1.5 py-1.5 min-w-[32px]' },
          'x-small': { emoji: 'text-lg', icon: 'w-5 h-5', container: 'px-2 py-1.5 min-w-[40px]' },
          small: { emoji: 'text-2xl', icon: 'w-6 h-6', container: 'px-3 py-2 min-w-[60px]' },
          medium: { emoji: 'text-3xl', icon: 'w-8 h-8', container: 'px-4 py-3 min-w-[80px]' },
          large: { emoji: 'text-4xl', icon: 'w-10 h-10', container: 'px-5 py-4 min-w-[100px]' }
        };

        // Layout classes
        const layoutClasses = reactionLayout === 'inline' ? 'flex flex-wrap gap-3' : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3';

        return (
          <div>
            <div className={`${layoutClasses} ${reactionLayout === 'grid' ? '' : 'justify-center'}`}>
              {reactionOptions.map((reaction) => {
                const ReactionIcon = reaction.icon;
                const buttonContent = (
                  <button
                    key={reaction.value}
                    type="button"
                    onClick={() => {
                      if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                      handleResponseChange(question.id || String(questionIndex), reaction.value);
                    }}
                    className={`${sizeClasses[reactionSize].container} rounded-lg font-medium transition-all hover:scale-110 flex flex-col items-center justify-center gap-1`}
                    style={{
                      margin: 'auto',
                      backgroundColor: value === reaction.value
                        ? `var(--form-primary-color, ${brandingStyles.colors.primary})`
                        : `var(--form-field-bg-color, ${brandingStyles.colors.background})`,
                      color: value === reaction.value
                        ? 'var(--form-primary-text-color, white)'
                        : `var(--form-field-text-color, ${brandingStyles.colors.text})`,
                      border: showBorder
                        ? `2px solid ${value === reaction.value
                          ? `var(--form-primary-color, ${brandingStyles.colors.primary})`
                          : `var(--form-field-border-color, ${brandingStyles.colors.border})`}`
                        : 'none',
                      borderRadius: 'var(--form-field-border-radius, 0.5rem)',
                    }}
                  >
                    {displayStyle === 'icon' && ReactionIcon ? (
                      <ReactionIcon className={sizeClasses[reactionSize].icon} strokeWidth={2} />
                    ) : (
                      <span className={sizeClasses[reactionSize].emoji}>{reaction.emoji}</span>
                    )}
                    {textDisplay === 'inline' && <span className="text-xs hidden sm:block">{reaction.label}</span>}
                  </button>
                );

                return textDisplay === 'tooltip' ? (
                  <Tooltip key={reaction.value} content={reaction.label}>
                    {buttonContent}
                  </Tooltip>
                ) : (
                  buttonContent
                );
              })}
            </div>
            {hasError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{hasError}</p>
            )}
          </div>
        );
      }

      case 'content_block':
        // Content blocks are informational only, don't collect responses
        return (
          <div
            className="tiptap-editor prose prose-sm dark:prose-invert max-w-none"
            style={{
              color: brandingStyles.colors.text,
            }}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(question.question_html || '', {
                ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'img', 'iframe', 'br', 'hr', 'blockquote', 'code', 'pre'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'title', 'style'],
                ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
              })
            }}
          />
        );

      case 'page_break':
        // Page breaks are handled in the pagination logic, don't render anything
        return null;

      default:
        return null;
    }
  };

  // Parse appearance styles into a style object
  const appearanceStylesObject = useMemo(() => {
    if (!appearanceStyles) return {};
    const styles: Record<string, string> = {};
    appearanceStyles.split(';').forEach(style => {
      const [key, val] = style.split(':').map(s => s.trim());
      if (key && val) {
        styles[key] = val;
      }
    });
    return styles;
  }, [appearanceStyles]);

  // Check if using split layout
  const isSplitLayout = form.layout_config?.layoutType === 'split';
  const splitLayoutStyles = useMemo(() =>
    generateSplitLayoutStyles(form.layout_config),
    [form.layout_config]
  );

  // Rendered "Powered by" footer
  const renderPoweredBy = () => {
    if (isDemo || !shouldShowPoweredBy) return null;

    return (
      <div className="mt-12 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm" style={{ color: brandingStyles.colors.textSecondary }}>
              Powered by
            </span>
            <a
              href="https://askusers.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: brandingStyles.colors.primary }}
            >
              Ask Users
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Show loading state if forced or currently submitting
  if (forceLoadingState || (submitting && !submitted)) {
    const loadingConfig = form.appearance_config?.loadingMessage || form.custom_branding?.loadingMessage;
    const layout = loadingConfig?.layout || 'stacked';
    const spinnerSize = loadingConfig?.spinnerSize || 'large';
    const textSize = loadingConfig?.textSize || 'medium';

    const spinnerSizeClasses = {
      'x-small': 'h-6 w-6',
      small: 'h-8 w-8',
      medium: 'h-12 w-12',
      large: 'h-16 w-16'
    };

    const textSizeClasses = {
      'x-small': 'text-base',
      small: 'text-lg',
      medium: 'text-xl',
      large: 'text-2xl'
    };

    const loadingContent = (
      <>
        {layout === 'inline' ? (
          <div className="flex items-center justify-center gap-4">
            <div
              className={`${spinnerSizeClasses[spinnerSize]} border-4 border-t-transparent rounded-full animate-spin`}
              style={{ borderColor: `${brandingStyles.colors.primary} transparent ${brandingStyles.colors.primary} ${brandingStyles.colors.primary}` }}
            />
            <h2
              className={`${textSizeClasses[textSize]}`}
              style={{ color: brandingStyles.colors.text }}
            >
              Submitting...
            </h2>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div
                className={`${spinnerSizeClasses[spinnerSize]} border-4 border-t-transparent rounded-full animate-spin`}
                style={{ borderColor: `${brandingStyles.colors.primary} transparent ${brandingStyles.colors.primary} ${brandingStyles.colors.primary}` }}
              />
            </div>
            <h2
              className={`${textSizeClasses[textSize]}`}
              style={{ color: brandingStyles.colors.text }}
            >
              Submitting...
            </h2>
          </div>
        )}
      </>
    );

    // If split layout, wrap content in split layout structure
    if (isSplitLayout && form.layout_config?.splitLayout) {
      const { mediaPosition } = form.layout_config.splitLayout;
      const mediaWidth = form.layout_config.splitLayout.mediaWidth || '50%';

      return (
        <>
          {formStylesheet && <style>{formStylesheet}</style>}
          <div className={`askusers-widget-container min-h-screen flex ${className} ${theme === 'dark' ? 'dark' : ''}`} style={appearanceStylesObject} data-form-theme data-theme={theme}>
            {mediaPosition === 'left' && (
              <div
                className="hidden lg:block"
                style={{
                  width: mediaWidth,
                  minHeight: '100vh',
                  position: 'sticky',
                  top: 0,
                  ...splitLayoutStyles,
                }}
              />
            )}
            <div
              className="flex-1 p-8 overflow-y-auto"
              style={{
                ...cssVariables,
                backgroundColor: 'var(--form-bg-color, ' + brandingStyles.colors.background + ')',
                color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
                fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
                minHeight: '100vh',
                minWidth: form.layout_config?.splitLayout?.minFormWidth || '400px',
              }}
            >
              <div className="max-w-2xl mx-auto">
                {loadingContent}
              </div>
            </div>
            {mediaPosition === 'right' && (
              <div
                className="hidden lg:block"
                style={{
                  width: mediaWidth,
                  minHeight: '100vh',
                  position: 'sticky',
                  top: 0,
                  ...splitLayoutStyles,
                }}
              />
            )}
          </div>
        </>
      );
    }

    // Classic layout
    return (
      <div
        className={`askusers-widget-container max-w-2xl mx-auto p-8 ${className}`}
        style={{
          ...cssVariables,
          backgroundColor: brandingStyles.colors.background,
          color: brandingStyles.colors.text,
        }}
      >
        {loadingContent}
      </div>
    );
  }

  if (submitted || forceSuccessState) {
    const successConfig = form.appearance_config?.successMessage || form.custom_branding?.successMessage;
    const layout = successConfig?.layout || 'stacked';
    const emojiSize = successConfig?.emojiSize || 'large';
    const textSize = successConfig?.textSize || 'medium';
    const customEmoji = successConfig?.customEmoji;
    const iconColor = successConfig?.iconColor || brandingStyles.colors.primary;

    const emojiTextSizeClasses = {
      'x-small': 'text-2xl',
      small: 'text-3xl',
      medium: 'text-5xl',
      large: 'text-6xl'
    };

    const svgSizeClasses = {
      'x-small': 'h-6 w-6',
      small: 'h-8 w-8',
      medium: 'h-12 w-12',
      large: 'h-16 w-16'
    };

    const textSizeClasses = {
      'x-small': 'text-base',
      small: 'text-lg',
      medium: 'text-xl',
      large: 'text-2xl'
    };

    const EmojiIcon = () => {
      if (customEmoji) {
        return <span className={`${emojiTextSizeClasses[emojiSize]}`} style={{ color: iconColor }}>{customEmoji}</span>;
      }
      return (
        <svg
          className={`${layout === 'inline' ? '' : 'mx-auto'} ${svgSizeClasses[emojiSize]}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          style={{ color: iconColor }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    };

    const successContent = (
      <>
        {/* Logo at top */}
        {form.custom_branding?.logo && form.custom_branding.logo.position === 'top' && (
          <div className={`mb-6 flex ${getAlignmentClass(form.custom_branding.logo.alignment)}`}>
            <img
              src={form.custom_branding.logo.url}
              alt="Logo"
              style={{
                width: `${form.custom_branding.logo.width || 200}px`,
                height: `${form.custom_branding.logo.height || 60}px`,
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Company Name */}
        {brandingStyles.companyName && (
          <div className={`mb-4 ${getTextAlignmentClass(form.custom_branding?.companyNameAlignment)}`}>
            <p className="text-sm font-medium" style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')', opacity: 0.7 }}>
              {brandingStyles.companyName}
            </p>
          </div>
        )}

        {layout === 'inline' ? (
          <div className="flex items-center justify-center gap-3">
            <EmojiIcon />
            <h2
              className={`${textSizeClasses[textSize]}`}
              style={{ color: brandingStyles.colors.text }}
            >
              {thankYouMessage || form.thank_you_message || 'Thank you for your submission!'}
            </h2>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-6">
              <EmojiIcon />
            </div>
            <h2
              className={`${textSizeClasses[textSize]} mb-4`}
              style={{ color: brandingStyles.colors.text }}
            >
              {thankYouMessage || form.thank_you_message || 'Thank you for your submission!'}
            </h2>
          </div>
        )}

        {/* Logo at bottom */}
        {form.custom_branding?.logo && form.custom_branding.logo.position === 'bottom' && (
          <div className={`mt-6 flex ${getAlignmentClass(form.custom_branding.logo.alignment)}`}>
            <img
              src={form.custom_branding.logo.url}
              alt="Logo"
              style={{
                width: `${form.custom_branding.logo.width || 200}px`,
                height: `${form.custom_branding.logo.height || 60}px`,
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Form Footer */}
        {renderPoweredBy()}
      </>
    );

    // If split layout, wrap content in split layout structure
    if (isSplitLayout && form.layout_config?.splitLayout) {
      const { mediaPosition } = form.layout_config.splitLayout;
      const mediaWidth = form.layout_config.splitLayout.mediaWidth || '50%';

      return (
        <>
          {formStylesheet && <style>{formStylesheet}</style>}
          <div className={`askusers-widget-container min-h-screen flex ${className} ${theme === 'dark' ? 'dark' : ''}`} style={appearanceStylesObject} data-form-theme data-theme={theme}>
            {mediaPosition === 'left' && (
              <div
                className="hidden lg:block"
                style={{
                  width: mediaWidth,
                  minHeight: '100vh',
                  position: 'sticky',
                  top: 0,
                  ...splitLayoutStyles,
                }}
              />
            )}
            <div
              className="flex-1 p-8 overflow-y-auto"
              style={{
                ...cssVariables,
                backgroundColor: 'var(--form-bg-color, ' + brandingStyles.colors.background + ')',
                color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
                fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
                minHeight: '100vh',
                minWidth: form.layout_config?.splitLayout?.minFormWidth || '400px',
              }}
            >
              <div className="max-w-2xl mx-auto">
                {successContent}
              </div>
            </div>
            {mediaPosition === 'right' && (
              <div
                className="hidden lg:block"
                style={{
                  width: mediaWidth,
                  minHeight: '100vh',
                  position: 'sticky',
                  top: 0,
                  ...splitLayoutStyles,
                }}
              />
            )}
          </div>
        </>
      );
    }

    // Classic layout
    return (
      <div
        className={`askusers-widget-container max-w-2xl mx-auto p-8 ${className}`}
        style={{
          ...cssVariables,
          backgroundColor: brandingStyles.colors.background,
          color: brandingStyles.colors.text,
        }}
      >
        {successContent}
      </div>
    );
  }

  // Define form content renderer (used by both split and classic layouts)
  const renderFormContent = () => (
    <>
      <div className="mb-8">
        {!hideTitle && (
          <h1
            className="text-3xl font-bold mb-4"
            style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')' }}
          >
            {form.title}
          </h1>
        )}
        {!hideDescription && form.description && (
          <p
            className="mb-6"
            style={{
              color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
              opacity: 0.8,
              fontSize: 'var(--form-description-font-size, 1rem)'
            }}
          >
            {form.description}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Progress indicator for multi-page forms */}
        {totalPages > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium" style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')' }}>
                Page {currentPage + 1} of {totalPages}
              </span>
              <span className="text-sm" style={{ color: brandingStyles.colors.textSecondary }}>
                {Math.round((currentPage / totalPages) * 100)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentPage / totalPages) * 100}%`,
                  backgroundColor: brandingStyles.colors.primary,
                }}
              />
            </div>
          </div>
        )}

        {/* Render current page questions */}
        {currentPageQuestions.map((question) => {
          const globalIndex = questionIndexMap.get(question) ?? 0;
          if (question.question_type === 'content_block') {
            return (
              <div key={globalIndex} data-question-index={globalIndex}>
                {renderQuestion(question, globalIndex)}
              </div>
            );
          }
          return (
            <div key={globalIndex} className="space-y-3" data-question-index={globalIndex} style={{ marginBottom: 'var(--form-question-spacing, 1rem)' }}>
              <label
                className="block text-lg font-medium"
                style={{
                  color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
                  fontSize: 'var(--form-question-font-size, 1.125rem)',
                  fontWeight: 'var(--form-question-font-weight, 600)',
                }}
              >
                {question.question_text}
                {question.is_required && (
                  <span className="ml-1 text-red-500">*</span>
                )}
              </label>
              {renderQuestion(question, globalIndex)}
            </div>
          );
        })}

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-4">
          {totalPages > 1 && currentPage > 0 ? (
            <button
              type="button"
              onClick={handlePrevious}
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: brandingStyles.colors.border,
                color: brandingStyles.colors.text,
              }}
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentPage < totalPages - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 rounded-lg font-semibold transition-colors"
              style={{
                backgroundColor: brandingStyles.colors.primary,
                color: 'white',
              }}
            >
              Next
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {showValidationError && Object.keys(validationErrors).length > 0 && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Please fix the validation errors above and try again.
                </p>
              )}
              <button
                type="submit"
                disabled={submitting || isDemo}
                className={`px-8 py-3 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed ${buttonStyleClasses}`}
                style={{
                  backgroundColor: (submitting || isDemo) ? 'var(--form-button-bg-color-disabled, #6b7280)' : 'var(--form-button-bg-color, ' + brandingStyles.colors.primary + ')',
                  color: 'var(--form-button-text-color, white)',
                  borderRadius: 'var(--form-button-border-radius, 0.5rem)',
                  padding: 'var(--form-button-padding, 0.625rem 1.5rem)',
                  fontWeight: 'var(--form-button-font-weight, 600)',
                  opacity: (submitting || isDemo) ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  const hoverBgColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-button-hover-bg-color');
                  if (hoverBgColor) {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }
                }}
                onMouseLeave={(e) => {
                  const bgColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-button-bg-color') || brandingStyles.colors.primary;
                  e.currentTarget.style.backgroundColor = bgColor;
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          )}
        </div>
      </form>
    </>
  );

  // Render split layout
  if (isSplitLayout && form.layout_config?.splitLayout) {
    const { mediaPosition } = form.layout_config.splitLayout;
    const mediaWidth = form.layout_config.splitLayout.mediaWidth || '50%';

    return (
      <>
        {/* Inject dark mode stylesheet */}
        {formStylesheet && <style>{formStylesheet}</style>}

        <div className={`askusers-widget-container min-h-screen flex ${className} ${theme === 'dark' ? 'dark' : ''}`} style={appearanceStylesObject} data-form-theme data-theme={theme}>
          {/* Media Panel - Left or Right based on position */}
          {mediaPosition === 'left' && (
            <div
              className="hidden lg:block"
              style={{
                width: mediaWidth,
                minHeight: '100vh',
                position: 'sticky',
                top: 0,
                ...splitLayoutStyles,
              }}
            />
          )}

          {/* Form Content */}
          <div
            className="flex-1 p-8 overflow-y-auto"
            style={{
              ...cssVariables,
              backgroundColor: 'var(--form-bg-color, ' + brandingStyles.colors.background + ')',
              color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
              fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
              minHeight: '100vh',
              minWidth: form.layout_config?.splitLayout?.minFormWidth || '400px',
            }}
          >
            <div className="max-w-2xl mx-auto">
              {/* Logo at top */}
              {form.custom_branding?.logo && form.custom_branding.logo.position === 'top' && (
                <div className={`mb-6 flex ${getAlignmentClass(form.custom_branding.logo.alignment)}`}>
                  <img
                    src={form.custom_branding.logo.url}
                    alt="Logo"
                    style={{
                      width: `${form.custom_branding.logo.width || 200}px`,
                      height: `${form.custom_branding.logo.height || 60}px`,
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}

              {/* Company Name */}
              {brandingStyles.companyName && (
                <div className={`mb-4 ${getTextAlignmentClass(form.custom_branding?.companyNameAlignment)}`}>
                  <p className="text-sm font-medium" style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')', opacity: 0.7 }}>
                    {brandingStyles.companyName}
                  </p>
                </div>
              )}

              {renderFormContent()}

              {/* Logo at bottom */}
              {form.custom_branding?.logo && form.custom_branding.logo.position === 'bottom' && (
                <div className={`mt-6 flex ${getAlignmentClass(form.custom_branding.logo.alignment)}`}>
                  <img
                    src={form.custom_branding.logo.url}
                    alt="Logo"
                    style={{
                      width: `${form.custom_branding.logo.width || 200}px`,
                      height: `${form.custom_branding.logo.height || 60}px`,
                      objectFit: 'contain',
                    }}
                  />
                </div>
              )}

              {/* Form Footer */}
              {renderPoweredBy()}

            </div>
          </div>

          {/* Media Panel - Right */}
          {mediaPosition === 'right' && (
            <div
              className="hidden lg:block"
              style={{
                width: mediaWidth,
                minHeight: '100vh',
                position: 'sticky',
                top: 0,
                ...splitLayoutStyles,
              }}
            />
          )}
        </div>
      </>
    );
  }

  // Classic layout wrapper
  return (
    <>
      {/* Inject dark mode stylesheet */}
      {formStylesheet && <style>{formStylesheet}</style>}

      <div
        className={`askusers-widget-container p-8 ${className} ${theme === 'dark' ? 'dark' : ''}`}
        style={{
          ...cssVariables,
          ...appearanceStylesObject,
          backgroundColor: 'var(--form-bg-color, ' + brandingStyles.colors.background + ')',
          color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
          fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
        }}
        data-form-theme
        data-theme={theme}
      >
        {/* Logo at top */}
        {form.custom_branding?.logo && form.custom_branding.logo.position === 'top' && (
          <div className={`mb-6 flex ${getAlignmentClass(form.custom_branding.logo.alignment)}`}>
            <img
              src={form.custom_branding.logo.url}
              alt="Logo"
              style={{
                width: `${form.custom_branding.logo.width || 200}px`,
                height: `${form.custom_branding.logo.height || 60}px`,
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Company Name */}
        {brandingStyles.companyName && (
          <div className={`mb-4 ${getTextAlignmentClass(form.custom_branding?.companyNameAlignment)}`}>
            <p className="text-sm font-medium" style={{ color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')', opacity: 0.7 }}>
              {brandingStyles.companyName}
            </p>
          </div>
        )}

        {renderFormContent()}

        {/* Logo at bottom */}
        {form.custom_branding?.logo && form.custom_branding.logo.position === 'bottom' && (
          <div className={`mt-6 flex ${getAlignmentClass(form.custom_branding.logo.alignment)}`}>
            <img
              src={form.custom_branding.logo.url}
              alt="Logo"
              style={{
                width: `${form.custom_branding.logo.width || 200}px`,
                height: `${form.custom_branding.logo.height || 60}px`,
                objectFit: 'contain',
              }}
            />
          </div>
        )}

        {/* Form Footer */}
        {renderPoweredBy()}

      </div>
    </>
  );
}

export { FormWidget };
export default FormWidget;
