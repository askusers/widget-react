import { useState, useMemo, useEffect, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { CreateSurveyRequest, CreateSurveyQuestionRequest } from '../types';
import { getBrandingStyles, applyBrandingStyles } from '../utils/branding';
import { generateFormStyles, generateFormStylesheet, getFieldStyleClasses, getButtonStyleClasses, generateSplitLayoutStyles } from '../utils/formStyles';
import { REACTION_EMOJIS, getReactionByValue } from '../constants/reactions';
import { Tooltip } from './Tooltip';
import { useFormAnalytics } from '../hooks/useFormAnalytics';
import { ConditionalLogicUtil } from '../utils/conditionalLogic';
import { useThemeDetection } from '../hooks/useThemeDetection';
import { AskUsersClient } from '../api/client';
import '../styles/tiptap.css';

interface SurveyWidgetProps {
  // Data source: either provide surveyId+apiKey OR survey data directly
  surveyId?: string;
  apiKey?: string;
  baseUrl?: string;
  survey?: CreateSurveyRequest;

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

  // Background
  transparentBackground?: boolean;

  // Internal/demo props (keep from original)
  isPreview?: boolean;
  isDemo?: boolean;
  thankYouMessage?: string;
  forceSuccessState?: boolean;
  forceLoadingState?: boolean;
}

export function SurveyWidget({
  surveyId,
  apiKey,
  baseUrl,
  survey: surveyProp,
  className = '',
  theme: themeProp,
  hideTitle = false,
  hideDescription = false,
  showPoweredBy,
  onLoad,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
  transparentBackground = false,
  isPreview = false,
  isDemo = false,
  thankYouMessage,
  forceSuccessState = false,
  forceLoadingState = false,
}: SurveyWidgetProps) {
  const [fetchedSurvey, setFetchedSurvey] = useState<CreateSurveyRequest | null>(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, string | number | string[]>>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [draggedRankingIndex, setDraggedRankingIndex] = useState<number | null>(null);

  // Use the theme detection hook
  const detectedTheme = useThemeDetection(themeProp);

  // Create API client for fetching/submitting if surveyId is provided
  const client = useMemo(() => {
    if (!surveyId) return null;
    return new AskUsersClient({ apiKey, baseUrl });
  }, [surveyId, apiKey, baseUrl]);

  // Fetch survey data if surveyId + apiKey are provided
  useEffect(() => {
    if (surveyProp || !surveyId || !client) return;

    let cancelled = false;
    setFetchLoading(true);
    setFetchError(null);

    client.getSurvey(surveyId)
      .then((data) => {
        if (cancelled) return;
        const surveyData: CreateSurveyRequest = {
          title: data.survey.title,
          description: data.survey.description,
          require_all_questions: data.survey.require_all_questions,
          allow_multiple_responses: data.survey.allow_multiple_responses,
          show_progress: data.survey.show_progress,
          thank_you_message: data.survey.thank_you_message,
          hosted_enabled: data.survey.hosted_enabled,
          hosted_slug: data.survey.hosted_slug,
          single_use_enabled: data.survey.single_use_enabled,
          custom_branding: data.survey.custom_branding,
          layout_config: data.survey.layout_config,
          appearance_config: data.survey.appearance_config,
          widget_display_config: data.survey.widget_display_config,
          questions: data.questions.map(q => ({
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
            likert_scale_labels: q.likert_scale_labels,
            visual_config: q.visual_config,
            logic_rules: q.logic_rules,
          })),
        };
        setFetchedSurvey(surveyData);
        if (onLoad) onLoad();
      })
      .catch((err) => {
        if (cancelled) return;
        setFetchError(err instanceof Error ? err.message : 'Failed to load survey');
      })
      .finally(() => {
        if (!cancelled) setFetchLoading(false);
      });

    return () => { cancelled = true; };
  }, [surveyId, client, surveyProp, onLoad]);

  // Resolve which survey data to use
  const survey = surveyProp || fetchedSurvey;

  // Initialize survey analytics tracking
  const { trackView, trackFieldFocus, trackFieldBlur, trackSubmitAttempt, trackSubmitSuccess } = useFormAnalytics(
    undefined,
    surveyId,
    {
      apiKey,
      baseUrl,
      source: 'widget',
      displayMode: 'inline',
    }
  );

  // Create stable tracking handlers
  const handleFieldFocusEvent = useCallback((questionId: string, questionIndex: number) => {
    if (surveyId && !isDemo && !isPreview && questionId) {
      trackFieldFocus(questionId, questionIndex);
    }
  }, [surveyId, isDemo, isPreview, trackFieldFocus]);

  const handleFieldBlurEvent = useCallback((questionId: string, questionIndex: number) => {
    if (surveyId && !isDemo && !isPreview && questionId) {
      trackFieldBlur(questionId, questionIndex);
    }
  }, [surveyId, isDemo, isPreview, trackFieldBlur]);

  // Track survey view on mount (only if surveyId is provided)
  useEffect(() => {
    if (surveyId && !isDemo && !isPreview && survey) {
      trackView();
    }
  }, [surveyId, isDemo, isPreview, trackView, survey]);

  // Reset current page when displayStyle changes
  useEffect(() => {
    if (!survey) return;
    setCurrentPage(0);
  }, [survey?.layout_config?.displayStyle]);

  // Show fetch loading state
  if (fetchLoading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="h-12 w-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#6366f1 transparent #6366f1 #6366f1' }} />
        <p className="text-gray-500">Loading survey...</p>
      </div>
    );
  }

  // Show fetch error
  if (fetchError) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-red-500 mb-4">{fetchError}</p>
        <button
          type="button"
          className="text-white px-6 py-2 rounded-lg font-medium transition-colors bg-blue-600"
          onClick={() => {
            setFetchError(null);
            setFetchLoading(true);
            if (client && surveyId) {
              client.getSurvey(surveyId)
                .then((data) => {
                  const surveyData: CreateSurveyRequest = {
                    title: data.survey.title,
                    description: data.survey.description,
                    require_all_questions: data.survey.require_all_questions,
                    allow_multiple_responses: data.survey.allow_multiple_responses,
                    show_progress: data.survey.show_progress,
                    thank_you_message: data.survey.thank_you_message,
                    hosted_enabled: data.survey.hosted_enabled,
                    hosted_slug: data.survey.hosted_slug,
                    single_use_enabled: data.survey.single_use_enabled,
                    custom_branding: data.survey.custom_branding,
                    layout_config: data.survey.layout_config,
                    appearance_config: data.survey.appearance_config,
                    widget_display_config: data.survey.widget_display_config,
                    questions: data.questions.map(q => ({
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
                      likert_scale_labels: q.likert_scale_labels,
                      visual_config: q.visual_config,
                      logic_rules: q.logic_rules,
                    })),
                  };
                  setFetchedSurvey(surveyData);
                  if (onLoad) onLoad();
                })
                .catch((err) => {
                  setFetchError(err instanceof Error ? err.message : 'Failed to load survey');
                })
                .finally(() => setFetchLoading(false));
            }
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // No survey data yet
  if (!survey) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No survey data available.</p>
      </div>
    );
  }

  // From this point forward, survey is guaranteed to be defined.
  return (
    <SurveyWidgetInner
      survey={survey}
      surveyId={surveyId}
      apiKey={apiKey}
      baseUrl={baseUrl}
      client={client}
      className={className}
      theme={detectedTheme}
      hideTitle={hideTitle}
      hideDescription={hideDescription}
      showPoweredBy={showPoweredBy}
      onSubmit={onSubmit}
      onSubmitSuccess={onSubmitSuccess}
      onSubmitError={onSubmitError}
      isPreview={isPreview}
      isDemo={isDemo}
      thankYouMessage={thankYouMessage}
      transparentBackground={transparentBackground}
      forceSuccessState={forceSuccessState}
      forceLoadingState={forceLoadingState}
      responses={responses}
      setResponses={setResponses}
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      submitting={submitting}
      setSubmitting={setSubmitting}
      submitted={submitted}
      setSubmitted={setSubmitted}
      error={error}
      setError={setError}
      validationError={validationError}
      setValidationError={setValidationError}
      draggedRankingIndex={draggedRankingIndex}
      setDraggedRankingIndex={setDraggedRankingIndex}
      handleFieldFocusEvent={handleFieldFocusEvent}
      handleFieldBlurEvent={handleFieldBlurEvent}
      trackSubmitAttempt={trackSubmitAttempt}
      trackSubmitSuccess={trackSubmitSuccess}
    />
  );
}

// ============================================================
// Inner component: handles rendering once survey data is available
// ============================================================

interface SurveyWidgetInnerProps {
  survey: CreateSurveyRequest;
  surveyId?: string;
  apiKey?: string;
  baseUrl?: string;
  client: AskUsersClient | null;
  className: string;
  theme: 'light' | 'dark';
  hideTitle: boolean;
  hideDescription: boolean;
  showPoweredBy?: boolean;
  onSubmit?: (responses: Record<string, string | number | string[]>) => Promise<void>;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: Error) => void;
  transparentBackground: boolean;
  isPreview: boolean;
  isDemo: boolean;
  thankYouMessage?: string;
  forceSuccessState: boolean;
  forceLoadingState: boolean;
  responses: Record<string, string | number | string[]>;
  setResponses: React.Dispatch<React.SetStateAction<Record<string, string | number | string[]>>>;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  submitting: boolean;
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  submitted: boolean;
  setSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  validationError: string | null;
  setValidationError: React.Dispatch<React.SetStateAction<string | null>>;
  draggedRankingIndex: number | null;
  setDraggedRankingIndex: React.Dispatch<React.SetStateAction<number | null>>;
  handleFieldFocusEvent: (questionId: string, questionIndex: number) => void;
  handleFieldBlurEvent: (questionId: string, questionIndex: number) => void;
  trackSubmitAttempt: () => void;
  trackSubmitSuccess: () => void;
}

function SurveyWidgetInner({
  survey,
  surveyId,
  client,
  className,
  theme,
  hideTitle,
  hideDescription,
  showPoweredBy: showPoweredByProp,
  onSubmit,
  onSubmitSuccess,
  onSubmitError,
  transparentBackground,
  isPreview,
  isDemo,
  thankYouMessage,
  forceSuccessState,
  forceLoadingState,
  responses,
  setResponses,
  currentPage,
  setCurrentPage,
  submitting,
  setSubmitting,
  submitted,
  setSubmitted,
  error,
  setError,
  validationError,
  setValidationError,
  draggedRankingIndex,
  setDraggedRankingIndex,
  handleFieldFocusEvent,
  handleFieldBlurEvent,
  trackSubmitAttempt,
  trackSubmitSuccess,
}: SurveyWidgetInnerProps) {

  // Create a stable mapping of questions to their original indices
  const questionIndexMap = useMemo(() => {
    const map = new Map<CreateSurveyQuestionRequest, number>();
    survey.questions.forEach((question, index) => {
      map.set(question, index);
    });
    return map;
  }, [survey.questions]);

  // Compute which questions should be skipped based on current responses
  const skippedQuestionIds = useMemo(() => {
    const sortedQuestions = [...survey.questions].sort((a, b) => a.display_order - b.display_order);
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
  }, [survey.questions, responses]);

  // Split questions into pages based on display style and page_break separators
  // Also apply conditional logic to filter visible questions
  const pages = useMemo(() => {
    const sortedQuestions = [...survey.questions].sort((a, b) => a.display_order - b.display_order);

    // Apply conditional logic: filter out questions that should be hidden based on current responses
    let visibleQuestions = ConditionalLogicUtil.filterVisibleQuestions(sortedQuestions, responses);

    // Also filter out questions that have been skipped by skip logic
    visibleQuestions = visibleQuestions.filter(q => !skippedQuestionIds.has(q.id || ''));

    const displayStyle = survey.layout_config?.displayStyle || 'freeform';

    // Conversational mode: One question per page (excluding content blocks and page breaks)
    if (displayStyle === 'conversational') {
      return visibleQuestions
        .filter(q => q.question_type !== 'page_break') // Remove page breaks in conversational mode
        .map(q => [q]); // Each question gets its own page
    }

    // Freeform mode: Use page breaks to split questions
    const pagesList: CreateSurveyQuestionRequest[][] = [];
    let currentPageQuestions: CreateSurveyQuestionRequest[] = [];

    visibleQuestions.forEach((question) => {
      if (question.question_type === 'page_break') {
        if (currentPageQuestions.length > 0) {
          pagesList.push(currentPageQuestions);
          currentPageQuestions = [];
        }
      } else {
        currentPageQuestions.push(question);
      }
    });

    if (currentPageQuestions.length > 0) {
      pagesList.push(currentPageQuestions);
    }

    // If no pages were created, return single page with all visible questions
    return pagesList.length > 0 ? pagesList : [visibleQuestions.filter(q => q.question_type !== 'page_break')];
  }, [survey.questions, survey.layout_config?.displayStyle, responses, skippedQuestionIds]);

  const totalPages = pages.length;
  const currentPageQuestions = pages[currentPage] || [];

  // Get branding styles based on current theme
  const brandingStyles = useMemo(() =>
    getBrandingStyles(survey.custom_branding, theme),
    [survey.custom_branding, theme]
  );
  const cssVariables = useMemo(() =>
    applyBrandingStyles(brandingStyles),
    [brandingStyles]
  );

  const elementBgColor = transparentBackground ? 'transparent' : brandingStyles.colors.background;

  // Generate appearance styles (CSS variables as string)
  const appearanceStyles = useMemo(() => {
    const styles = generateFormStyles(survey.appearance_config, survey.layout_config);
    return styles;
  }, [survey.appearance_config, survey.layout_config]);

  // Parse appearance styles into a style object
  const appearanceStylesObject = useMemo(() => {
    if (!appearanceStyles) return {};
    const styles: Record<string, string> = {};
    const declarations = appearanceStyles.split(';').filter(Boolean);
    declarations.forEach(decl => {
      const [property, value] = decl.split(':').map(s => s.trim());
      if (property && value) {
        styles[property] = value;
      }
    });
    return styles;
  }, [appearanceStyles]);

  // Generate CSS stylesheet from appearance_config
  const formStylesheet = useMemo(() =>
    generateFormStylesheet(survey.appearance_config, survey.layout_config),
    [survey.appearance_config, survey.layout_config]
  );

  useEffect(() => {
    const stylesheet = generateFormStylesheet(survey.appearance_config, survey.layout_config);
    const styleId = 'survey-dynamic-styles';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    styleTag.textContent = stylesheet;
    return () => {
      styleTag?.remove();
    };
  }, [survey.appearance_config, survey.layout_config, theme]);

  const fieldStyleClasses = useMemo(() =>
    getFieldStyleClasses(survey.appearance_config),
    [survey.appearance_config]
  );
  const buttonStyleClasses = useMemo(() =>
    getButtonStyleClasses(survey.appearance_config),
    [survey.appearance_config]
  );

  // Combined input classes with base styles
  const inputClasses = `w-full px-4 py-2 rounded-lg outline-none ${fieldStyleClasses}`;

  // Check if using split layout
  const isSplitLayout = survey.layout_config?.layoutType === 'split';
  const splitLayoutStyles = useMemo(() =>
    generateSplitLayoutStyles(survey.layout_config),
    [survey.layout_config]
  );

  // Determine showPoweredBy: prop overrides branding setting
  const resolvedShowPoweredBy = showPoweredByProp !== undefined
    ? showPoweredByProp
    : brandingStyles.showPoweredBy;

  const handleResponseChange = (questionId: string, _questionIndex: number, value: string | number | string[]) => {
    if (isPreview) return; // Don't allow changes in preview mode

    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Clear validation error when user responds
    setValidationError(null);
  };

  const isQuestionValid = (questionIndex: number) => {
    const question = survey.questions[questionIndex];

    // Skip validation for page breaks and content blocks (they don't collect responses)
    if (question?.question_type === 'page_break' || question?.question_type === 'content_block') {
      return true;
    }

    // Use the same key logic as handleResponseChange
    const questionId = question?.id || `temp-${questionIndex}`;
    const response = responses[questionId];

    // Required check
    if (question?.is_required) {
      if (response === undefined || response === null || response === '') {
        return false;
      }
      if (Array.isArray(response) && response.length === 0) {
        return false;
      }
    }

    // Format validation (only when there's a value)
    if (response && typeof response === 'string') {
      switch (question?.question_type) {
        case 'email': {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(response)) return false;
          break;
        }
        case 'phone': {
          const phoneRegex = /^[\d\s\-+()]+$/;
          const digitsOnly = response.replace(/\D/g, '');
          if (!phoneRegex.test(response) || digitsOnly.length < 10) return false;
          break;
        }
        case 'url': {
          try { new URL(response); } catch { return false; }
          break;
        }
      }

      // Length constraints
      if (question?.min_length && response.length < question.min_length) return false;
      if (question?.max_length && response.length > question.max_length) return false;
    }

    return true;
  };

  // Validate all required questions on the current page
  const validateCurrentPage = () => {
    // Validate all questions on current page
    const pageErrors: string[] = [];
    currentPageQuestions.forEach((question) => {
      const globalIndex = questionIndexMap.get(question) ?? 0;
      // Skip validation for questions that are skipped by jump logic
      if (question.id && skippedQuestionIds.has(question.id)) {
        return;
      }
      if (question.is_required && !isQuestionValid(globalIndex)) {
        pageErrors.push(question.question_text);
      }
    });

    if (pageErrors.length > 0) {
      setValidationError(`Please answer all required questions on this page to continue.`);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentPage()) {
      return;
    }

    // Clear validation error
    setValidationError(null);

    // Check skip logic for current page questions
    // Skip logic is now computed dynamically, so we just need to navigate to the next page
    // The skipped questions will automatically be filtered out when pages recompute
    for (const question of currentPageQuestions) {
      if (question.logic_rules?.skip_to) {
        const skipTo = ConditionalLogicUtil.evaluateSkipLogic(question.logic_rules.skip_to, responses);

        if (skipTo === 'END') {
          // Skip to end - submit the survey
          handleSubmit();
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
    setValidationError(null);

    // Navigate to previous page
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    // Validate all required questions before submitting (excluding skipped questions)
    const requiredQuestions = survey.questions.filter(q => {
      // Skip questions that are skipped by jump logic
      if (q.id && skippedQuestionIds.has(q.id)) {
        return false;
      }
      return q.is_required;
    });
    for (let i = 0; i < requiredQuestions.length; i++) {
      const questionIndex = questionIndexMap.get(requiredQuestions[i]) ?? 0;
      if (!isQuestionValid(questionIndex)) {
        setValidationError(`Please answer all required questions before submitting.`);
        return;
      }
    }

    // Clear validation error
    setValidationError(null);

    // Track submit attempt
    if (surveyId && !isDemo && !isPreview) {
      trackSubmitAttempt();
    }

    if (isDemo || isPreview) {
      // In demo/preview mode, just show success state without making network calls
      setSubmitting(true);
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 1500);
      return;
    }

    // If onSubmit callback is provided, use it
    if (onSubmit) {
      try {
        setSubmitting(true);
        setError(null);
        await onSubmit(responses);
        setSubmitted(true);

        // Track successful submission
        if (surveyId && !isDemo && !isPreview) {
          trackSubmitSuccess();
        }

        if (onSubmitSuccess) onSubmitSuccess();
      } catch (err) {
        const submitError = err instanceof Error ? err : new Error('Failed to submit survey');
        setError(submitError.message);
        if (onSubmitError) onSubmitError(submitError);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // If no onSubmit provided but we have client + surveyId, submit via API
    if (client && surveyId) {
      try {
        setSubmitting(true);
        setError(null);
        await client.submitSurvey(surveyId, {
          response_data: responses,
          completion_status: 'completed',
        });
        setSubmitted(true);

        // Track successful submission
        if (!isDemo && !isPreview) {
          trackSubmitSuccess();
        }

        if (onSubmitSuccess) onSubmitSuccess();
      } catch (err) {
        const submitError = err instanceof Error ? err : new Error('Failed to submit survey');
        setError(submitError.message);
        if (onSubmitError) onSubmitError(submitError);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // No submit handler and no API client - nothing to do
  };

  const renderQuestion = (question: CreateSurveyQuestionRequest, questionIndex: number) => {
    const questionId = question.id || `temp-${questionIndex}`;
    const value = responses[questionId] || '';

    switch (question.question_type) {
      case 'text': {
        const size = question.visual_config?.size || 'medium';
        const sizeClasses = {
          small: 'px-3 py-1.5 text-sm',
          medium: 'px-4 py-2 text-base',
          large: 'px-5 py-3 text-lg'
        };

        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleResponseChange(questionId, questionIndex, e.target.value)}
            className={`${inputClasses} ${sizeClasses[size as keyof typeof sizeClasses]}`}
            style={{
              border: `var(--form-field-border-width, 1px) solid var(--form-field-border-color, ${brandingStyles.colors.border})`,
              backgroundColor: `var(--form-field-bg-color, ${brandingStyles.colors.background})`,
              color: `var(--form-field-text-color, ${brandingStyles.colors.text})`,
              borderRadius: 'var(--form-field-border-radius, 0.5rem)',
              padding: 'var(--form-field-padding, 0.625rem 1rem)',
              fontSize: 'var(--form-answer-font-size, 1rem)',
              fontWeight: 'var(--form-answer-font-weight, 400)',
            }}
            onFocus={(e) => {
              if (question.id) handleFieldFocusEvent(question.id, questionIndex);
              const focusBorderColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-border-color') || brandingStyles.colors.primary;
              const focusBgColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = focusBorderColor;
              e.target.style.backgroundColor = focusBgColor;
              e.target.style.boxShadow = `0 0 0 2px ${brandingStyles.colors.primary}30`;
            }}
            onBlur={(e) => {
              if (question.id) handleFieldBlurEvent(question.id, questionIndex);
              const borderColor = getComputedStyle(e.target).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
              const bgColor = getComputedStyle(e.target).getPropertyValue('--form-field-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = borderColor;
              e.target.style.backgroundColor = bgColor;
              e.target.style.boxShadow = 'none';
            }}
            placeholder="Your answer..."
            required={question.is_required}
            disabled={isPreview}
          />
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
          <textarea
            value={value}
            onChange={(e) => handleResponseChange(questionId, questionIndex, e.target.value)}
            rows={4}
            className={`${inputClasses} resize-vertical ${sizeClasses[size as keyof typeof sizeClasses]}`}
            style={{
              border: `var(--form-field-border-width, 1px) solid var(--form-field-border-color, ${brandingStyles.colors.border})`,
              backgroundColor: `var(--form-field-bg-color, ${brandingStyles.colors.background})`,
              color: `var(--form-field-text-color, ${brandingStyles.colors.text})`,
              borderRadius: 'var(--form-field-border-radius, 0.5rem)',
              padding: 'var(--form-field-padding, 0.625rem 1rem)',
              fontSize: 'var(--form-answer-font-size, 1rem)',
              fontWeight: 'var(--form-answer-font-weight, 400)',
            }}
            onFocus={(e) => {
              if (question.id) handleFieldFocusEvent(question.id, questionIndex);
              const focusBorderColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-border-color') || brandingStyles.colors.primary;
              const focusBgColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = focusBorderColor;
              e.target.style.backgroundColor = focusBgColor;
              e.target.style.boxShadow = `0 0 0 2px ${brandingStyles.colors.primary}30`;
            }}
            onBlur={(e) => {
              if (question.id) handleFieldBlurEvent(question.id, questionIndex);
              const borderColor = getComputedStyle(e.target).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
              const bgColor = getComputedStyle(e.target).getPropertyValue('--form-field-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = borderColor;
              e.target.style.backgroundColor = bgColor;
              e.target.style.boxShadow = 'none';
            }}
            placeholder="Your answer..."
            required={question.is_required}
            disabled={isPreview}
          />
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
          <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
            {question.options?.map((option, index) => {
              // Handle both string options and object options {option_text, value}
              const optionValue = typeof option === 'string' ? option : (option as unknown as Record<string, string>).value || (option as unknown as Record<string, string>).option_text;
              const optionLabel = typeof option === 'string' ? option : (option as unknown as Record<string, string>).option_text || (option as unknown as Record<string, string>).value;
              const isSelected = value === optionValue;

              // Default style (native radio)
              if (style === 'default') {
                return (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={optionValue}
                      checked={isSelected}
                      onChange={(e) => handleResponseChange(questionId, questionIndex, e.target.value)}
                      onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                      className="mr-3"
                      style={{
                        accentColor: `var(--form-primary-color, ${brandingStyles.colors.primary})`,
                      }}
                      required={question.is_required}
                      disabled={isPreview}
                    />
                    <span style={{ color: `var(--form-text-color, ${brandingStyles.colors.text})` }}>{optionLabel}</span>
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
                    } ${isPreview ? 'cursor-not-allowed opacity-75' : ''}`}
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
                    if (!isPreview && !isSelected) {
                      const target = e.currentTarget;
                      target.style.borderColor = 'var(--form-primary-color)';
                      target.style.backgroundColor = 'var(--form-bg-secondary-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPreview && !isSelected) {
                      const target = e.currentTarget;
                      target.style.borderColor = 'var(--form-field-border-color)';
                      target.style.backgroundColor = 'var(--form-field-bg-color)';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={optionValue}
                    checked={isSelected}
                    onChange={(e) => handleResponseChange(questionId, questionIndex, e.target.value)}
                    onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                    className="sr-only"
                    required={question.is_required}
                    disabled={isPreview}
                  />
                  {optionLabel}
                </label>
              );
            })}
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
          <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
            {question.options?.map((option, index) => {
              // Handle both string options and object options {option_text, value}
              const optionValue = typeof option === 'string' ? option : (option as unknown as Record<string, string>).value || (option as unknown as Record<string, string>).option_text;
              const optionLabel = typeof option === 'string' ? option : (option as unknown as Record<string, string>).option_text || (option as unknown as Record<string, string>).value;
              const isSelected = checkboxValues.includes(optionValue);

              // Default style (native checkbox)
              if (style === 'default') {
                return (
                  <label key={index} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      value={optionValue}
                      checked={isSelected}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...checkboxValues, optionValue]
                          : checkboxValues.filter(v => v !== optionValue);
                        handleResponseChange(questionId, questionIndex, newValues);
                      }}
                      onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                      className="mr-3"
                      style={{
                        accentColor: `var(--form-primary-color, ${brandingStyles.colors.primary})`,
                      }}
                      disabled={isPreview}
                    />
                    <span style={{ color: `var(--form-text-color, ${brandingStyles.colors.text})` }}>{optionLabel}</span>
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
                    } ${isPreview ? 'cursor-not-allowed opacity-75' : ''}`}
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
                    if (!isPreview && !isSelected) {
                      const target = e.currentTarget;
                      target.style.borderColor = 'var(--form-primary-color)';
                      target.style.backgroundColor = 'var(--form-bg-secondary-color)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPreview && !isSelected) {
                      const target = e.currentTarget;
                      target.style.borderColor = 'var(--form-field-border-color)';
                      target.style.backgroundColor = 'var(--form-field-bg-color)';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    value={optionValue}
                    checked={isSelected}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkboxValues, optionValue]
                        : checkboxValues.filter(v => v !== optionValue);
                      handleResponseChange(questionId, questionIndex, newValues);
                    }}
                    onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                    className="sr-only"
                    disabled={isPreview}
                  />
                  {optionLabel}
                </label>
              );
            })}
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
          <select
            value={value}
            onChange={(e) => handleResponseChange(questionId, questionIndex, e.target.value)}
            className={`${inputClasses} ${sizeClasses[size as keyof typeof sizeClasses]}`}
            style={{
              border: `var(--form-field-border-width, 1px) solid var(--form-field-border-color, ${brandingStyles.colors.border})`,
              backgroundColor: `var(--form-field-bg-color, ${brandingStyles.colors.background})`,
              color: `var(--form-field-text-color, ${brandingStyles.colors.text})`,
              borderRadius: 'var(--form-field-border-radius, 0.5rem)',
              padding: 'var(--form-field-padding, 0.625rem 1rem)',
              fontSize: 'var(--form-answer-font-size, 1rem)',
              fontWeight: 'var(--form-answer-font-weight, 400)',
            }}
            onFocus={(e) => {
              if (question.id) handleFieldFocusEvent(question.id, questionIndex);
              const focusBorderColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-border-color') || brandingStyles.colors.primary;
              const focusBgColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = focusBorderColor;
              e.target.style.backgroundColor = focusBgColor;
              e.target.style.boxShadow = `0 0 0 2px ${brandingStyles.colors.primary}30`;
            }}
            onBlur={(e) => {
              if (question.id) handleFieldBlurEvent(question.id, questionIndex);
              const borderColor = getComputedStyle(e.target).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
              const bgColor = getComputedStyle(e.target).getPropertyValue('--form-field-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = borderColor;
              e.target.style.backgroundColor = bgColor;
              e.target.style.boxShadow = 'none';
            }}
            required={question.is_required}
            disabled={isPreview}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => {
              // Handle both string options and object options {option_text, value}
              const optionValue = typeof option === 'string' ? option : (option as unknown as Record<string, string>).value || (option as unknown as Record<string, string>).option_text;
              const optionLabel = typeof option === 'string' ? option : (option as unknown as Record<string, string>).option_text || (option as unknown as Record<string, string>).value;
              return (
                <option key={index} value={optionValue}>{optionLabel}</option>
              );
            })}
          </select>
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
                    handleResponseChange(questionId, questionIndex, parseInt(e.target.value));
                  }}
                  disabled={isPreview}
                  className={`w-full ${isPreview ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  style={{
                    accentColor: `var(--form-primary-color, ${brandingStyles.colors.primary})`
                  }}
                />

                {/* Value display */}
                <div className="text-center text-sm font-semibold" style={{ color: brandingStyles.colors.text }}>
                  {value || minRating}
                </div>
              </div>
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
                          handleResponseChange(questionId, questionIndex, rating);
                        }}
                        disabled={isPreview}
                        className={`transition-all ${isPreview ? 'cursor-not-allowed opacity-75' : 'hover:scale-110'}`}
                        aria-label={`Rate ${rating} out of ${starCount}`}
                      >
                        <svg
                          width={starSize}
                          height={starSize}
                          viewBox="0 0 24 24"
                          fill={isSelected ? `var(--form-primary-color, ${brandingStyles.colors.primary})` : 'none'}
                          stroke={isSelected ? `var(--form-primary-color, ${brandingStyles.colors.primary})` : `var(--form-field-border-color, ${brandingStyles.colors.border})`}
                          strokeWidth="2"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
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
                <div className="flex items-center justify-center space-x-2 flex-wrap">
                  {ratings.map(rating => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => {
                        if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                        handleResponseChange(questionId, questionIndex, rating);
                      }}
                      disabled={isPreview}
                      className={`${sizeClasses[size as keyof typeof sizeClasses]} ${shapeClasses[buttonShape as keyof typeof shapeClasses]} border-2 font-semibold transition-colors ${isPreview ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                      style={{
                        backgroundColor: value === rating ? `var(--form-primary-color, ${brandingStyles.colors.primary})` : elementBgColor,
                        color: value === rating ? 'white' : `var(--form-text-color, ${brandingStyles.colors.text})`,
                        borderColor: value === rating ? `var(--form-primary-color, ${brandingStyles.colors.primary})` : `var(--form-field-border-color, ${brandingStyles.colors.border})`,
                      }}
                      onMouseEnter={(e) => {
                        if (!isPreview && value !== rating) {
                          const target = e.target as HTMLButtonElement;
                          target.style.borderColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-primary-color') || brandingStyles.colors.primary;
                          target.style.backgroundColor = brandingStyles.colors.backgroundSecondary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPreview && value !== rating) {
                          const target = e.target as HTMLButtonElement;
                          target.style.borderColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
                          target.style.backgroundColor = elementBgColor;
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
            {value && (
              <div className="text-sm mt-2" style={{ color: brandingStyles.colors.textSecondary }}>
                Selected: {value}
              </div>
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
            <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
              {options.map((option) => (
                <label key={option} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${questionIndex}`}
                    value={option.toLowerCase()}
                    checked={value === option.toLowerCase()}
                    onChange={(e) => handleResponseChange(questionId, questionIndex, e.target.value)}
                    onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                    className="mr-2"
                    style={{
                      accentColor: brandingStyles.colors.primary,
                    }}
                    required={question.is_required}
                    disabled={isPreview}
                  />
                  <span style={{ color: `var(--form-text-color, ${brandingStyles.colors.text})` }}>{option}</span>
                </label>
              ))}
            </div>
          );
        } else {
          // Button or Card style
          return (
            <div className={layoutClasses[layout as keyof typeof layoutClasses]}>
              {options.map((option) => {
                const isSelected = value === option.toLowerCase();
                const baseClasses = 'relative cursor-pointer transition-all duration-200';
                const styleClasses = style === 'button'
                  ? 'rounded-md border-2 font-medium text-center'
                  : 'px-4 py-3 rounded-lg border-2 shadow-sm text-center';

                return (
                  <label
                    key={option}
                    className={`${baseClasses} ${styleClasses} ${isPreview ? 'cursor-not-allowed opacity-75' : ''}`}
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
                      if (!isPreview && !isSelected) {
                        const target = e.currentTarget;
                        target.style.borderColor = 'var(--form-primary-color)';
                        target.style.backgroundColor = 'var(--form-bg-secondary-color)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isPreview && !isSelected) {
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
                      onChange={(e) => handleResponseChange(questionId, questionIndex, e.target.value)}
                      onFocus={() => question.id && handleFieldFocusEvent(question.id, questionIndex)}
                      className="sr-only"
                      required={question.is_required}
                      disabled={isPreview}
                    />
                    {option}
                  </label>
                );
              })}
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
                      if (!isPreview) {
                        if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                        handleResponseChange(questionId, questionIndex, reaction.value);
                      }
                    }}
                    disabled={isPreview}
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
                      opacity: isPreview ? 0.6 : 1,
                      cursor: isPreview ? 'not-allowed' : 'pointer',
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
          </div>
        );
      }

      case 'email':
      case 'phone':
      case 'url':
      case 'number':
      case 'date': {
        const size = question.visual_config?.size || 'medium';
        const sizeClasses = {
          small: 'px-3 py-1.5 text-sm',
          medium: 'px-4 py-2 text-base',
          large: 'px-5 py-3 text-lg'
        };

        return (
          <input
            type={
              question.question_type === 'email' ? 'email' :
                question.question_type === 'url' ? 'url' :
                  question.question_type === 'phone' ? 'tel' :
                    question.question_type === 'number' ? 'number' :
                      question.question_type === 'date' ? 'date' :
                        'text'
            }
            value={value}
            onChange={(e) => handleResponseChange(questionId, questionIndex, question.question_type === 'number' ? Number(e.target.value) : e.target.value)}
            className={`${inputClasses} ${sizeClasses[size as keyof typeof sizeClasses]}`}
            style={{
              border: `var(--form-field-border-width, 1px) solid var(--form-field-border-color, ${brandingStyles.colors.border})`,
              backgroundColor: `var(--form-field-bg-color, ${brandingStyles.colors.background})`,
              color: `var(--form-field-text-color, ${brandingStyles.colors.text})`,
              borderRadius: 'var(--form-field-border-radius, 0.5rem)',
              padding: 'var(--form-field-padding, 0.625rem 1rem)',
              fontSize: 'var(--form-answer-font-size, 1rem)',
              fontWeight: 'var(--form-answer-font-weight, 400)',
            }}
            onFocus={(e) => {
              if (question.id) handleFieldFocusEvent(question.id, questionIndex);
              const focusBorderColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-border-color') || brandingStyles.colors.primary;
              const focusBgColor = getComputedStyle(e.target).getPropertyValue('--form-field-focus-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = focusBorderColor;
              e.target.style.backgroundColor = focusBgColor;
              e.target.style.boxShadow = `0 0 0 2px ${brandingStyles.colors.primary}30`;
            }}
            onBlur={(e) => {
              if (question.id) handleFieldBlurEvent(question.id, questionIndex);
              const borderColor = getComputedStyle(e.target).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
              const bgColor = getComputedStyle(e.target).getPropertyValue('--form-field-bg-color') || brandingStyles.colors.background;
              e.target.style.borderColor = borderColor;
              e.target.style.backgroundColor = bgColor;
              e.target.style.boxShadow = 'none';
            }}
            placeholder={
              question.question_type === 'email' ? 'your.email@example.com' :
                question.question_type === 'phone' ? '+1 (555) 000-0000' :
                  question.question_type === 'url' ? 'https://example.com' :
                    question.question_type === 'number' ? '0' :
                      'Your answer...'
            }
            required={question.is_required}
            disabled={isPreview}
          />
        );
      }

      case 'likert': {
        const scaleLabels = question.likert_scale_labels || ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
        const statements = question.options || [];
        const likertResponses = (value as unknown as Record<string, number>) || {};

        // Get visual config settings with defaults
        const buttonShape = question.visual_config?.buttonShape || 'rounded';
        const size = question.visual_config?.size || 'medium';
        const orientation = question.visual_config?.orientation || 'horizontal';

        // Shape mapping
        const shapeClasses = {
          rounded: 'rounded-md',
          square: 'rounded-none',
          pill: 'rounded-full'
        };

        // Size mapping
        const sizeClasses = {
          small: 'px-2 py-1 text-xs',
          medium: 'px-3 py-2 text-sm',
          large: 'px-4 py-3 text-base'
        };

        // Render scale buttons for a given statement index
        const renderScaleButtons = (stmtIndex: number) => (
          <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'} gap-2`}>
            {scaleLabels.map((label, scaleIndex) => (
              <button
                key={scaleIndex}
                type="button"
                onClick={() => {
                  if (question.id) handleFieldFocusEvent(question.id, questionIndex);
                  const newResponses = { ...likertResponses, [stmtIndex]: scaleIndex + 1 };
                  handleResponseChange(questionId, questionIndex, newResponses as unknown as string);
                }}
                disabled={isPreview}
                className={`${shapeClasses[buttonShape as keyof typeof shapeClasses]} ${sizeClasses[size as keyof typeof sizeClasses]} border-2 font-medium transition-colors ${isPreview ? 'cursor-not-allowed opacity-75' : ''
                  }`}
                style={{
                  backgroundColor: likertResponses[stmtIndex] === scaleIndex + 1 ? `var(--form-primary-color, ${brandingStyles.colors.primary})` : elementBgColor,
                  color: likertResponses[stmtIndex] === scaleIndex + 1 ? 'white' : `var(--form-text-color, ${brandingStyles.colors.text})`,
                  borderColor: likertResponses[stmtIndex] === scaleIndex + 1 ? `var(--form-primary-color, ${brandingStyles.colors.primary})` : `var(--form-field-border-color, ${brandingStyles.colors.border})`,
                }}
                onMouseEnter={(e) => {
                  if (!isPreview && likertResponses[stmtIndex] !== scaleIndex + 1) {
                    const target = e.target as HTMLButtonElement;
                    target.style.borderColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-primary-color') || brandingStyles.colors.primary;
                    target.style.backgroundColor = brandingStyles.colors.backgroundSecondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isPreview && likertResponses[stmtIndex] !== scaleIndex + 1) {
                    const target = e.target as HTMLButtonElement;
                    target.style.borderColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-field-border-color') || brandingStyles.colors.border;
                    target.style.backgroundColor = elementBgColor;
                  }
                }}
              >
                {label}
              </button>
            ))}
          </div>
        );

        // Single-statement likert (no options): render scale buttons directly
        if (statements.length === 0) {
          return <div>{renderScaleButtons(0)}</div>;
        }

        // Multi-statement likert: render each statement with its own scale
        return (
          <div className="space-y-4">
            {statements.map((statement, stmtIndex) => (
              <div key={stmtIndex} className="space-y-2">
                <div className="font-medium text-sm" style={{ color: brandingStyles.colors.text }}>
                  {statement}
                </div>
                {renderScaleButtons(stmtIndex)}
              </div>
            ))}
          </div>
        );
      }

      case 'ranking': {
        const items = question.options || [];
        const rankings = (value as unknown as Record<string, number>) || {};
        const density = question.visual_config?.density || 'comfortable';

        // Density classes for spacing
        const densityClasses = {
          compact: 'gap-1',
          comfortable: 'gap-3',
          spacious: 'gap-4'
        };

        const itemPaddingClasses = {
          compact: 'px-2 py-1',
          comfortable: 'px-3 py-2',
          spacious: 'px-4 py-3'
        };

        // Create array of items with their rankings, then sort by rank
        const rankedItems = items.map((item, index) => ({
          text: item,
          originalIndex: index,
          rank: rankings[index] || (index + 1),
        })).sort((a, b) => a.rank - b.rank);

        const handleMove = (originalIndex: number, isUp: boolean) => {
          if (isPreview) return;

          // Find the item in the sorted list
          const currentPos = rankedItems.findIndex(item => item.originalIndex === originalIndex);
          if (currentPos === -1) return;

          // Calculate new position
          const newPos = isUp ? currentPos - 1 : currentPos + 1;
          if (newPos < 0 || newPos >= rankedItems.length) return;

          // Swap items in the array
          const newRankedItems = [...rankedItems];
          [newRankedItems[currentPos], newRankedItems[newPos]] = [newRankedItems[newPos], newRankedItems[currentPos]];

          // Update rankings based on new positions
          const newRankings: Record<string, number> = {};
          newRankedItems.forEach((item, position) => {
            newRankings[item.originalIndex] = position + 1;
          });

          handleResponseChange(questionId, questionIndex, newRankings as unknown as string);
        };

        const handleDragStart = (e: React.DragEvent, displayPosition: number) => {
          if (isPreview) return;
          setDraggedRankingIndex(displayPosition);
          e.dataTransfer.effectAllowed = 'move';
        };

        const handleDragOver = (e: React.DragEvent, targetPosition: number) => {
          e.preventDefault();
          if (draggedRankingIndex === null || draggedRankingIndex === targetPosition || isPreview) return;
          e.dataTransfer.dropEffect = 'move';

          // Reorder items in real-time for visual feedback
          const newRankedItems = [...rankedItems];
          const [draggedItem] = newRankedItems.splice(draggedRankingIndex, 1);
          newRankedItems.splice(targetPosition, 0, draggedItem);

          // Update rankings based on new positions
          const newRankings: Record<string, number> = {};
          newRankedItems.forEach((item, position) => {
            newRankings[item.originalIndex] = position + 1;
          });

          handleResponseChange(questionId, questionIndex, newRankings as unknown as string);
          setDraggedRankingIndex(targetPosition); // Update dragged index to new position
        };

        const handleDrop = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          // Rankings already updated during dragover, just reset drag state
          setDraggedRankingIndex(null);
        };

        const handleDragEnd = () => {
          setDraggedRankingIndex(null);
        };

        return (
          <div className={densityClasses[density as keyof typeof densityClasses]}>
            <p className="text-sm" style={{ color: brandingStyles.colors.textSecondary }}>
              Drag items or use arrows to rank from most preferred (top) to least preferred (bottom)
            </p>
            {rankedItems.map((item, displayPosition) => {
              const isFirst = displayPosition === 0;
              const isLast = displayPosition === rankedItems.length - 1;
              const isDragging = draggedRankingIndex === displayPosition;

              return (
                <div
                  key={item.originalIndex}
                  className={`flex items-center gap-3 ${itemPaddingClasses[density as keyof typeof itemPaddingClasses]} rounded-md border transition-all ${isDragging ? 'opacity-50' : ''
                    } ${!isPreview ? 'cursor-move' : ''}`}
                  style={{
                    borderColor: isDragging ? brandingStyles.colors.primary : brandingStyles.colors.border,
                    backgroundColor: isDragging
                      ? brandingStyles.colors.backgroundSecondary
                      : elementBgColor,
                  }}
                  draggable={!isPreview}
                  onDragStart={(e) => handleDragStart(e, displayPosition)}
                  onDragOver={(e) => handleDragOver(e, displayPosition)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                >
                  {!isPreview && (
                    <div className="flex items-center justify-center cursor-grab active:cursor-grabbing" style={{ color: brandingStyles.colors.textSecondary }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <circle cx="4" cy="3" r="1.5" />
                        <circle cx="12" cy="3" r="1.5" />
                        <circle cx="4" cy="8" r="1.5" />
                        <circle cx="12" cy="8" r="1.5" />
                        <circle cx="4" cy="13" r="1.5" />
                        <circle cx="12" cy="13" r="1.5" />
                      </svg>
                    </div>
                  )}
                  <div
                    className="w-8 h-8 flex items-center justify-center rounded-full font-semibold text-sm flex-shrink-0"
                    style={{
                      backgroundColor: brandingStyles.colors.primary,
                      color: brandingStyles.colors.background,
                    }}
                  >
                    {displayPosition + 1}
                  </div>
                  <div
                    className="flex-1 font-medium"
                    style={{
                      color: brandingStyles.colors.text,
                    }}
                  >
                    {item.text}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(item.originalIndex, true)}
                      disabled={isFirst || isPreview}
                      className="w-8 h-7 flex items-center justify-center rounded border text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-80"
                      style={{
                        backgroundColor: brandingStyles.colors.backgroundSecondary,
                        borderColor: brandingStyles.colors.border,
                        color: brandingStyles.colors.text,
                      }}
                      aria-label="Move up"
                    >
                      {'\u25B2'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(item.originalIndex, false)}
                      disabled={isLast || isPreview}
                      className="w-8 h-7 flex items-center justify-center rounded border text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-opacity-80"
                      style={{
                        backgroundColor: brandingStyles.colors.backgroundSecondary,
                        borderColor: brandingStyles.colors.border,
                        color: brandingStyles.colors.text,
                      }}
                      aria-label="Move down"
                    >
                      {'\u25BC'}
                    </button>
                  </div>
                </div>
              );
            })}
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
                ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li', 'img', 'br', 'hr', 'blockquote', 'code', 'pre', 'span', 'div'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'width', 'height', 'title', 'target', 'rel'],
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

  // Render progress indicator based on style setting
  const renderProgressIndicator = () => {
    // Don't show progress for single-page surveys
    if (totalPages === 1) {
      return null;
    }

    const progressStyle = survey.layout_config?.questionDisplay?.progressStyle || 'bar';
    // Progress represents completed pages, not current page
    // So being on page 2 of 3 means 1 page completed = 33%
    const currentProgress = (currentPage / totalPages) * 100;
    const currentStep = currentPage + 1;
    const totalSteps = totalPages;

    if (progressStyle === 'percentage') {
      return (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full" style={{
            backgroundColor: brandingStyles.colors.backgroundSecondary,
            border: `1px solid ${brandingStyles.colors.border}`
          }}>
            <span className="text-sm font-medium" style={{ color: `var(--form-text-color, ${brandingStyles.colors.text})` }}>
              {Math.round(currentProgress)}% Complete
            </span>
            <span className="text-xs" style={{ color: brandingStyles.colors.textSecondary }}>
              ({currentStep} of {totalSteps})
            </span>
          </div>
        </div>
      );
    }

    if (progressStyle === 'dots') {
      return (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {Array.from({ length: totalSteps }, (_, i) => {
              const isCompleted = i < currentStep;
              const isCurrent = i === currentStep - 1;
              return (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: isCurrent ? '12px' : '8px',
                    height: isCurrent ? '12px' : '8px',
                    backgroundColor: isCompleted || isCurrent
                      ? `var(--form-primary-color, ${brandingStyles.colors.primary})`
                      : brandingStyles.colors.backgroundSecondary,
                    border: `2px solid ${isCurrent ? `var(--form-primary-color, ${brandingStyles.colors.primary})` : brandingStyles.colors.border}`,
                    opacity: isCompleted ? 1 : 0.5
                  }}
                />
              );
            })}
          </div>
          <span className="text-xs" style={{ color: brandingStyles.colors.textSecondary }}>
            Page {currentStep} of {totalSteps}
          </span>
        </div>
      );
    }

    // Default: bar style
    return (
      <>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm" style={{ color: brandingStyles.colors.textSecondary }}>
            Page {currentStep} of {totalSteps}
          </span>
          <span className="text-sm" style={{ color: brandingStyles.colors.textSecondary }}>
            {Math.round(currentProgress)}% Complete
          </span>
        </div>
        <div
          className="w-full rounded-full h-2"
          style={{ backgroundColor: brandingStyles.colors.backgroundSecondary }}
        >
          <div
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: `${currentProgress}%`,
              backgroundColor: `var(--form-primary-color, ${brandingStyles.colors.primary})`
            }}
          />
        </div>
      </>
    );
  };

  if (!survey.questions || survey.questions.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">No questions available.</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`max-w-2xl mx-auto ${className}`}>
        <div className="text-center py-8">
          <div className="text-red-600 dark:text-red-400 text-6xl mb-4">{'\u26A0\uFE0F'}</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Survey error</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            type="button"
            className="text-white px-6 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: brandingStyles.colors.primary,
            }}
            onMouseEnter={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = brandingStyles.colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              const target = e.target as HTMLButtonElement;
              target.style.backgroundColor = brandingStyles.colors.primary;
            }}
            onClick={() => {
              setError(null);
              setSubmitted(false);
              setSubmitting(false);
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Show loading state if forced or currently submitting
  if (forceLoadingState || (submitting && !submitted)) {
    const loadingConfig = survey.appearance_config?.loadingMessage || survey.custom_branding?.loadingMessage;
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
    if (isSplitLayout && survey.layout_config?.splitLayout) {
      const { mediaPosition } = survey.layout_config.splitLayout;
      const mediaWidth = survey.layout_config.splitLayout.mediaWidth || '50%';

      return (
        <>
          {formStylesheet && <style>{formStylesheet}</style>}
          <div className={`min-h-screen flex ${className} ${theme === 'dark' ? 'dark' : ''}`} style={appearanceStylesObject} data-form-theme data-theme={theme}>
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
                backgroundColor: transparentBackground ? 'transparent' : 'var(--form-bg-color, ' + brandingStyles.colors.background + ')',
                color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
                fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
                minHeight: '100vh',
                minWidth: survey.layout_config?.splitLayout?.minFormWidth || '400px',
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
        className={`max-w-2xl mx-auto p-8 ${className}`}
        style={{
          ...cssVariables,
          backgroundColor: elementBgColor,
          color: brandingStyles.colors.text,
        }}
      >
        {loadingContent}
      </div>
    );
  }

  // Submitted state
  if (submitted || forceSuccessState) {
    const successConfig = survey.appearance_config?.successMessage || survey.custom_branding?.successMessage;
    const layout = successConfig?.layout || 'stacked';
    const emojiSize = successConfig?.emojiSize || 'large';
    const textSize = successConfig?.textSize || 'medium';
    const customEmoji = successConfig?.customEmoji;
    const iconColor = successConfig?.iconColor || brandingStyles.colors.primary;

    const emojiSizeClasses = {
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
        return <span className={`${emojiSizeClasses[emojiSize]}`} style={{ color: iconColor }}>{customEmoji}</span>;
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
      <div>
        {layout === 'inline' ? (
          <div className="flex items-center justify-center gap-3">
            <EmojiIcon />
            <h1 className={`${textSizeClasses[textSize]}`} style={{ color: brandingStyles.colors.text }}>
              {thankYouMessage || survey.thank_you_message || 'Thank you for your submission!'}
            </h1>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <EmojiIcon />
            </div>
            <h1 className={`text-center ${textSizeClasses[textSize]}`} style={{ color: brandingStyles.colors.text }}>
              {thankYouMessage || survey.thank_you_message || 'Thank you for your submission!'}
            </h1>
          </>
        )}
        {isDemo && (
          <div className="text-center mt-6">
            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              onClick={() => {
                setSubmitted(false);
                setResponses({});
                setCurrentPage(0);
              }}
            >
              Try again
            </button>
          </div>
        )}
      </div>
    );

    // If split layout, wrap content in split layout structure
    if (isSplitLayout && survey.layout_config?.splitLayout) {
      const { mediaPosition } = survey.layout_config.splitLayout;
      const mediaWidth = survey.layout_config.splitLayout.mediaWidth || '50%';

      return (
        <>
          {formStylesheet && <style>{formStylesheet}</style>}
          <div className={`min-h-screen flex ${className} ${theme === 'dark' ? 'dark' : ''}`} style={appearanceStylesObject} data-form-theme data-theme={theme}>
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
                backgroundColor: transparentBackground ? 'transparent' : 'var(--form-bg-color, ' + brandingStyles.colors.background + ')',
                color: 'var(--form-text-color, ' + brandingStyles.colors.text + ')',
                fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
                minHeight: '100vh',
                minWidth: survey.layout_config?.splitLayout?.minFormWidth || '400px',
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
        className={`max-w-2xl mx-auto p-8 ${className}`}
        style={{
          ...cssVariables,
          backgroundColor: elementBgColor,
          color: brandingStyles.colors.text,
        }}
      >
        {successContent}
      </div>
    );
  }

  // Helper function to get alignment classes
  const getAlignmentClass = (alignment?: 'left' | 'center' | 'right') => {
    const align = alignment || 'center';
    return align === 'left' ? 'justify-start' : align === 'right' ? 'justify-end' : 'justify-center';
  };

  const getTextAlignmentClass = (alignment?: 'left' | 'center' | 'right') => {
    const align = alignment || 'center';
    return align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';
  };

  // Define survey content renderer (used by both split and classic layouts)
  const renderSurveyContent = () => (
    <>
      {/* Logo at top */}
      {survey.custom_branding?.logo && survey.custom_branding.logo.position === 'top' && (
        <div className={`mb-6 flex ${getAlignmentClass(survey.custom_branding.logo.alignment)}`}>
          <img
            src={survey.custom_branding.logo.url}
            alt="Logo"
            style={{
              width: `${survey.custom_branding.logo.width || 200}px`,
              height: `${survey.custom_branding.logo.height || 60}px`,
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Company Name */}
      {brandingStyles.companyName && (
        <div className={`mb-4 ${getTextAlignmentClass(survey.custom_branding?.companyNameAlignment)}`}>
          <p className="text-sm font-medium" style={{ color: `var(--form-text-color, ${brandingStyles.colors.text})`, opacity: 0.7 }}>
            {brandingStyles.companyName}
          </p>
        </div>
      )}

      {/* Survey Header */}
      {(!hideTitle || !hideDescription) && (
        <div className="text-center mb-8">
          {!hideTitle && (
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                color: `var(--form-text-color, ${brandingStyles.colors.text})`,
                fontSize: 'var(--form-question-font-size, 1.875rem)',
                fontWeight: 'var(--form-question-font-weight, 700)',
              }}
            >
              {survey.title}
            </h1>
          )}
          {!hideDescription && survey.description && (
            <p
              className="text-lg"
              style={{
                color: `var(--form-text-color, ${brandingStyles.colors.textSecondary})`,
                fontSize: 'var(--form-answer-font-size, 1.125rem)',
              }}
            >
              {survey.description}
            </p>
          )}
        </div>
      )}

      {/* Progress Indicator */}
      {(survey.show_progress ?? survey.layout_config?.questionDisplay?.showProgress) &&
        (!survey.layout_config?.questionDisplay?.progressPosition || survey.layout_config.questionDisplay.progressPosition === 'top') && (
          <div className="mb-8">
            {renderProgressIndicator()}
          </div>
        )}

      {/* Question Card(s) */}
      <div
        className="rounded-lg shadow-sm border p-6 mb-8"
        style={{
          backgroundColor: `var(--form-card-bg-color, ${brandingStyles.colors.background})`,
          borderColor: `var(--form-card-border-color, ${brandingStyles.colors.border})`
        }}
      >
        {/* Render all questions on current page */}
        <div className="space-y-8">
          {currentPageQuestions.map((question) => {
            const globalIndex = questionIndexMap.get(question) ?? 0;
            // Content blocks don't need a heading wrapper, they handle their own rendering
            if (question.question_type === 'content_block') {
              return (
                <div key={globalIndex}>
                  {renderQuestion(question, globalIndex)}
                </div>
              );
            }
            return (
              <div key={globalIndex} className="mb-6">
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{
                    color: `var(--form-text-color, ${brandingStyles.colors.text})`,
                    fontSize: 'var(--form-question-font-size, 1.25rem)',
                    fontWeight: 'var(--form-question-font-weight, 600)',
                  }}
                >
                  {question.question_text}
                  {question.is_required && (
                    <span className="ml-1 text-red-500">*</span>
                  )}
                </h2>
                {renderQuestion(question, globalIndex)}
              </div>
            );
          })}
        </div>

        {/* Validation Error Message */}
        {validationError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <span className="mr-2">{'\u26A0\uFE0F'}</span>
              {validationError}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="px-4 py-2 hover:opacity-80 disabled:cursor-not-allowed"
            style={{ color: brandingStyles.colors.textSecondary }}
          >
            Previous
          </button>

          {currentPage < totalPages - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={submitting}
              className={`${buttonStyleClasses} disabled:cursor-not-allowed`}
              style={{
                backgroundColor: submitting ? 'var(--form-button-bg-color-disabled, #6b7280)' : `var(--form-button-bg-color, ${brandingStyles.colors.primary})`,
                color: `var(--form-button-text-color, white)`,
                borderRadius: 'var(--form-button-border-radius, 0.5rem)',
                padding: 'var(--form-button-padding, 0.625rem 1.5rem)',
                fontWeight: 'var(--form-button-font-weight, 600)',
                opacity: submitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  const hoverBgColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-button-hover-bg-color');
                  if (hoverBgColor) {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  const bgColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-button-bg-color') || brandingStyles.colors.primary;
                  e.currentTarget.style.backgroundColor = bgColor;
                }
              }}
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`${buttonStyleClasses} disabled:cursor-not-allowed`}
              style={{
                backgroundColor: submitting ? 'var(--form-button-bg-color-disabled, #6b7280)' : `var(--form-button-bg-color, ${brandingStyles.colors.primary})`,
                color: `var(--form-button-text-color, white)`,
                borderRadius: 'var(--form-button-border-radius, 0.5rem)',
                padding: 'var(--form-button-padding, 0.625rem 1.5rem)',
                fontWeight: 'var(--form-button-font-weight, 600)',
                opacity: submitting ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  const hoverBgColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-button-hover-bg-color');
                  if (hoverBgColor) {
                    e.currentTarget.style.backgroundColor = hoverBgColor;
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  const bgColor = getComputedStyle(e.currentTarget).getPropertyValue('--form-button-bg-color') || brandingStyles.colors.primary;
                  e.currentTarget.style.backgroundColor = bgColor;
                }
              }}
            >
              {submitting ? 'Submitting...' : isPreview ? 'Submit survey (preview)' : 'Submit survey'}
            </button>
          )}
        </div>
      </div>

      {/* Progress Indicator - Bottom Position */}
      {(survey.show_progress ?? survey.layout_config?.questionDisplay?.showProgress) &&
        survey.layout_config?.questionDisplay?.progressPosition === 'bottom' && (
          <div className="mt-8">
            {renderProgressIndicator()}
          </div>
        )}

      {/* Survey Footer */}
      <div className="mt-12 py-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center items-center">
            {/* Powered by section */}
            {resolvedShowPoweredBy && (
              <div className="flex items-center gap-2">
                <span className="text-sm" style={{ color: brandingStyles.colors.textSecondary }}>
                  Powered by
                </span>
                <a
                  href="https://askusers.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium hover:opacity-80 transition-opacity"
                  style={{ color: `var(--form-primary-color, ${brandingStyles.colors.primary})` }}
                >
                  Ask Users
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logo at bottom */}
      {survey.custom_branding?.logo && survey.custom_branding.logo.position === 'bottom' && (
        <div className={`mt-6 flex ${getAlignmentClass(survey.custom_branding.logo.alignment)}`}>
          <img
            src={survey.custom_branding.logo.url}
            alt="Logo"
            style={{
              width: `${survey.custom_branding.logo.width || 200}px`,
              height: `${survey.custom_branding.logo.height || 60}px`,
              objectFit: 'contain',
            }}
          />
        </div>
      )}

      {/* Preview/Demo Note */}
      {(isPreview || isDemo) && (
        <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {isDemo ? (
              <>
                <strong>Demo mode:</strong> This is a fully interactive preview of your survey. Try filling it out! No data will be saved.
              </>
            ) : (
              <>
                <strong>Preview mode:</strong> This shows how respondents will see your survey. Navigation and inputs are disabled for demonstration.
              </>
            )}
          </p>
        </div>
      )}
    </>
  );

  // Render split layout
  if (isSplitLayout && survey.layout_config?.splitLayout) {
    const { mediaPosition } = survey.layout_config.splitLayout;
    const mediaWidth = survey.layout_config.splitLayout.mediaWidth || '50%';

    return (
      <div className={`min-h-screen flex ${className} ${theme === 'dark' ? 'dark' : ''}`} style={appearanceStylesObject} data-form-theme data-theme={theme}>
        {/* Media Panel - Left */}
        {mediaPosition === 'left' && (
          <div
            className="hidden lg:block"
            style={{
              width: mediaWidth,
              minHeight: '100vh',
              position: 'sticky' as const,
              top: 0,
              ...splitLayoutStyles,
            }}
          />
        )}

        {/* Survey Content */}
        <div
          className="flex-1 p-8 overflow-y-auto"
          style={{
            ...cssVariables,
            backgroundColor: transparentBackground ? 'transparent' : `var(--form-bg-color, ${brandingStyles.colors.background})`,
            color: `var(--form-text-color, ${brandingStyles.colors.text})`,
            fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
            minHeight: '100vh',
            minWidth: survey.layout_config?.splitLayout?.minFormWidth || '400px',
          }}
        >
          <div className="max-w-2xl mx-auto">
            {renderSurveyContent()}
          </div>
        </div>

        {/* Media Panel - Right */}
        {mediaPosition === 'right' && (
          <div
            className="hidden lg:block"
            style={{
              width: mediaWidth,
              minHeight: '100vh',
              position: 'sticky' as const,
              top: 0,
              ...splitLayoutStyles,
            }}
          />
        )}
      </div>
    );
  }

  // Classic layout wrapper
  return (
    <div
      className={`askusers-survey-widget-container mx-auto p-4 ${className}`}
      style={{
        ...cssVariables,
        ...appearanceStylesObject,
        backgroundColor: transparentBackground ? 'transparent' : `var(--form-bg-color, ${brandingStyles.colors.background})`,
        color: `var(--form-text-color, ${brandingStyles.colors.text})`,
        fontFamily: `var(--form-font-family, 'Inter, system-ui, -apple-system, sans-serif')`,
      }}
      data-form-theme
      data-theme={theme}
    >
      {renderSurveyContent()}
    </div>
  );
}

export default SurveyWidget;
