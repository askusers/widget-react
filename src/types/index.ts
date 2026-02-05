/**
 * Type definitions for @askusers/widget-react
 * Extracted from the Ask Users platform API types
 */

import type { VisibilityLogic, SkipLogic } from '../utils/conditionalLogic';
export type { LogicOperator, LogicCombinator, LogicCondition, VisibilityLogic, SkipLogic, SkipLogicRule, QuestionLogicRules } from '../utils/conditionalLogic';

// ============================================================
// Widget display configuration
// ============================================================

export interface WidgetDisplayConfig {
  displayMode: 'inline' | 'popup' | 'modal';
  triggerStyle?: 'text' | 'link' | 'icon' | 'condition';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center-right' | 'center-left' | 'top-center' | 'bottom-center';
  width?: string;
  maxWidth?: string;
  maxHeight?: string;
  iconStyle?: {
    type: 'chat' | 'form' | 'feedback' | 'survey' | 'email' | 'phone' | 'message' | 'help' | 'support' | 'custom';
    customIcon?: string;
    backgroundColor?: string;
    iconColor?: string;
    size?: 'small' | 'medium' | 'large';
  };
  floatingButton?: {
    text?: string;
    showIcon?: boolean;
    borderRadius?: string;
  };
  linkStyle?: {
    textDecoration?: 'always' | 'hover' | 'never';
    fontSize?: string;
  };
  hideBorder?: boolean;
  transparentBackground?: boolean;
  triggerConditions?: {
    type: 'pageLoad' | 'scroll' | 'exitIntent' | 'timeOnPage' | 'pageViews';
    delay?: number;
    scrollDepth?: number;
    duration?: number;
    visitCount?: number;
  };
  frequencyControl?: {
    showFrequency: 'always' | 'oncePerSession' | 'onceEver';
    cooldownDays?: number;
  };
  animation?: 'slide' | 'fade' | 'scale' | 'none';
  backdrop?: boolean;
  closeOnSubmit?: boolean;
  closeOnBackdrop?: boolean;
  hideTitle?: boolean;
  hideDescription?: boolean;
  autoSubmit?: boolean;
  useFormLayout?: boolean;
  triggerShowClose?: boolean;
  contextId?: string;
  contextType?: string;
  prefillFields?: Array<{
    key: string;
    value: string;
    description?: string;
  }>;
  useWebComponent?: boolean;
}

// ============================================================
// Branding configuration
// ============================================================

export interface CustomBranding {
  colorScheme: string;
  customColors?: {
    primary?: string;
    primaryHover?: string;
    secondary?: string;
    background?: string;
    backgroundSecondary?: string;
    text?: string;
    textSecondary?: string;
    border?: string;
  };
  showPoweredBy?: boolean;
  customCSS?: string;
  companyName?: string;
  companyNameAlignment?: 'left' | 'center' | 'right';
  logo?: {
    url: string;
    width?: number;
    height?: number;
    position?: 'top' | 'bottom';
    alignment?: 'left' | 'center' | 'right';
  };
  successMessage?: SuccessMessageConfig;
  loadingMessage?: LoadingMessageConfig;
}

// ============================================================
// Layout configuration
// ============================================================

export interface FormLayoutConfig {
  layoutType: 'classic' | 'split' | 'card' | 'conversational' | 'fullscreen';
  displayStyle?: 'conversational' | 'freeform';
  splitLayout?: {
    mediaPosition: 'left' | 'right';
    mediaWidth: '30%' | '40%' | '50%' | '60%';
    mediaType: 'image' | 'video' | 'color' | 'gradient';
    mediaUrl?: string;
    backgroundColor?: string;
    gradient?: {
      from: string;
      to: string;
      direction: 'to-r' | 'to-l' | 'to-t' | 'to-b' | 'to-br' | 'to-bl';
    };
    minFormWidth?: string;
  };
  background?: {
    type: 'color' | 'image' | 'gradient' | 'none';
    value?: string;
    opacity?: number;
    overlay?: boolean;
    overlayOpacity?: number;
    backgroundSize?: 'cover' | 'contain' | 'auto';
  };
  questionDisplay?: {
    showProgress: boolean;
    progressStyle: 'bar' | 'dots' | 'percentage';
    progressPosition: 'top' | 'bottom';
  };
}

// ============================================================
// Appearance configuration
// ============================================================

export interface SuccessMessageConfig {
  layout?: 'stacked' | 'inline';
  emojiSize?: 'x-small' | 'small' | 'medium' | 'large';
  textSize?: 'x-small' | 'small' | 'medium' | 'large';
  customEmoji?: string;
  iconColor?: string;
}

export interface LoadingMessageConfig {
  layout?: 'stacked' | 'inline';
  spinnerSize?: 'x-small' | 'small' | 'medium' | 'large';
  textSize?: 'x-small' | 'small' | 'medium' | 'large';
}

export interface FormAppearanceConfig {
  theme?: {
    enableDarkMode?: boolean;
    light?: {
      primary: string;
      text: string;
      fieldText: string;
      fieldBackground: string;
      formBackground: string;
    };
    dark?: {
      primary: string;
      text: string;
      fieldText: string;
      fieldBackground: string;
      formBackground: string;
    };
  };
  colors?: {
    accent?: string;
    text?: string;
  };
  typography?: {
    fontFamily: 'inter' | 'roboto' | 'open-sans' | 'lato' | 'montserrat' | 'playfair' | 'source-sans';
    questionFontSize: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    questionFontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    answerFontSize: 'xxs' | 'xs' | 'sm' | 'md' | 'lg';
    answerFontWeight: 'normal' | 'medium' | 'semibold';
    descriptionFontSize?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
  fieldStyle?: {
    style: 'default' | 'underline' | 'filled' | 'outlined';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    borderWidth: '1' | '2' | '3';
    inputSize: 'sm' | 'md' | 'lg';
    inputPadding: 'sm' | 'md' | 'lg';
  };
  buttonStyle?: {
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    size: 'sm' | 'md' | 'lg';
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    fullWidth: boolean;
  };
  spacing?: {
    questionSpacing: 'tight' | 'normal' | 'relaxed' | 'loose';
    sectionSpacing: 'tight' | 'normal' | 'relaxed' | 'loose';
  };
  cardStyle?: {
    borderWidth: '0' | '1' | '2';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    padding: 'sm' | 'md' | 'lg' | 'xl';
    backgroundColor?: string;
    borderColor?: string;
  };
  successMessage?: SuccessMessageConfig;
  loadingMessage?: LoadingMessageConfig;
}

// ============================================================
// Question types
// ============================================================

export type FormQuestionType =
  | 'text' | 'textarea' | 'radio' | 'checkbox' | 'select'
  | 'rating' | 'yes_no' | 'email' | 'phone' | 'url'
  | 'number' | 'date' | 'reaction' | 'page_break' | 'content_block';

export type SurveyQuestionType = FormQuestionType | 'likert' | 'ranking';

export interface QuestionVisualConfig {
  style?: string;
  buttonShape?: 'round' | 'square' | 'rounded';
  size?: 'small' | 'medium' | 'large';
  layout?: 'vertical' | 'horizontal' | 'grid' | 'inline';
  columns?: number;
  rows?: number;
  showBorder?: boolean;
  displayStyle?: 'emoji' | 'icon';
  textDisplay?: 'inline' | 'tooltip' | 'none';
  density?: 'compact' | 'comfortable' | 'spacious';
  orientation?: 'horizontal' | 'vertical';
}

// QuestionLogicRules is re-exported from conditionalLogic.ts above

// Local alias for use in this file
interface QuestionLogicRulesLocal {
  visibility?: VisibilityLogic;
  skip_to?: SkipLogic;
}

// ============================================================
// Form types
// ============================================================

export interface CreateFormQuestionRequest {
  id?: string;
  question_text: string;
  question_html?: string;
  question_type: FormQuestionType;
  is_required?: boolean;
  display_order: number;
  options?: string[];
  rating_min?: number;
  rating_max?: number;
  rating_labels?: Record<string, string>;
  likert_scale_labels?: Record<string, unknown>;
  min_length?: number;
  max_length?: number;
  visual_config?: QuestionVisualConfig;
  logic_rules?: QuestionLogicRulesLocal;
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  is_internal?: boolean;
  thank_you_message?: string;
  template_id?: string;
  context_id?: string;
  context_type?: string;
  context_metadata?: Record<string, unknown>;
  questions: CreateFormQuestionRequest[];
  hosted_enabled?: boolean;
  hosted_slug?: string;
  single_use_enabled?: boolean;
  receive_email_copy?: boolean;
  custom_branding?: CustomBranding;
  layout_config?: FormLayoutConfig;
  appearance_config?: FormAppearanceConfig;
  widget_display_config?: WidgetDisplayConfig;
}

export interface Form {
  id: string;
  user_id: string;
  api_key_id?: string;
  title: string;
  description?: string;
  is_active: boolean;
  is_internal: boolean;
  thank_you_message: string;
  context_id?: string;
  context_type?: string;
  context_metadata?: Record<string, unknown>;
  total_submissions: number;
  hosted_enabled: boolean;
  hosted_slug?: string;
  single_use_enabled: boolean;
  receive_email_copy: boolean;
  custom_branding?: CustomBranding;
  layout_config?: FormLayoutConfig;
  appearance_config?: FormAppearanceConfig;
  widget_display_config?: WidgetDisplayConfig;
  created_at: string;
  updated_at: string;
}

export interface FormQuestion {
  id: string;
  form_id: string;
  question_text: string;
  question_html?: string;
  question_type: FormQuestionType;
  is_required: boolean;
  display_order: number;
  options: string[];
  rating_min?: number;
  rating_max?: number;
  rating_labels?: Record<string, string>;
  min_length?: number;
  max_length?: number;
  visual_config?: QuestionVisualConfig;
  logic_rules?: QuestionLogicRulesLocal;
  created_at: string;
  updated_at: string;
}

export interface FormWithQuestions {
  form: Form;
  questions: FormQuestion[];
}

export interface FormSubmissionRequest {
  form_id: string;
  submission_data: Record<string, unknown>;
  session_id?: string;
  context_url?: string;
  context_metadata?: Record<string, unknown>;
}

// ============================================================
// Survey types
// ============================================================

export interface CreateSurveyQuestionRequest {
  id?: string;
  question_text: string;
  question_html?: string;
  question_type: SurveyQuestionType;
  is_required?: boolean;
  display_order: number;
  options?: string[];
  rating_min?: number;
  rating_max?: number;
  rating_labels?: Record<string, string>;
  min_length?: number;
  max_length?: number;
  likert_scale_labels?: string[];
  visual_config?: QuestionVisualConfig;
  logic_rules?: QuestionLogicRulesLocal;
}

export interface CreateSurveyRequest {
  title: string;
  description?: string;
  require_all_questions?: boolean;
  allow_multiple_responses?: boolean;
  show_progress?: boolean;
  thank_you_message?: string;
  template_id?: string;
  context_id?: string;
  context_type?: string;
  context_metadata?: Record<string, unknown>;
  hosted_enabled?: boolean;
  hosted_slug?: string;
  single_use_enabled?: boolean;
  custom_branding?: CustomBranding;
  layout_config?: FormLayoutConfig;
  appearance_config?: FormAppearanceConfig;
  widget_display_config?: WidgetDisplayConfig;
  questions: CreateSurveyQuestionRequest[];
}

export interface Survey {
  id: string;
  user_id: string;
  api_key_id?: string;
  title: string;
  description?: string;
  is_active: boolean;
  require_all_questions: boolean;
  allow_multiple_responses: boolean;
  show_progress: boolean;
  thank_you_message: string;
  context_id?: string;
  context_type?: string;
  context_metadata?: Record<string, unknown>;
  total_responses: number;
  hosted_enabled: boolean;
  hosted_slug?: string;
  single_use_enabled: boolean;
  custom_branding?: CustomBranding;
  layout_config?: FormLayoutConfig;
  appearance_config?: FormAppearanceConfig;
  widget_display_config?: WidgetDisplayConfig;
  created_at: string;
  updated_at: string;
}

export interface SurveyQuestion {
  id: string;
  survey_id: string;
  question_text: string;
  question_html?: string;
  question_type: SurveyQuestionType;
  is_required: boolean;
  display_order: number;
  options: string[];
  rating_min?: number;
  rating_max?: number;
  rating_labels?: Record<string, string>;
  min_length?: number;
  max_length?: number;
  likert_scale_labels?: string[];
  visual_config?: QuestionVisualConfig;
  logic_rules?: QuestionLogicRulesLocal;
  created_at: string;
  updated_at: string;
}

export interface SurveyWithQuestions {
  survey: Survey;
  questions: SurveyQuestion[];
}

export interface SurveyResponseRequest {
  survey_id: string;
  response_data: Record<string, unknown>;
  completion_status?: 'completed' | 'partial';
  session_id?: string;
  context_url?: string;
  context_metadata?: Record<string, unknown>;
}

// ============================================================
// Widget component props
// ============================================================

export interface FormWidgetProps {
  formId: string;
  apiKey: string;
  baseUrl?: string;
  displayMode?: 'inline' | 'popup' | 'modal';
  triggerText?: string;
  triggerStyle?: React.CSSProperties;
  position?: WidgetDisplayConfig['position'];
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: string;
  customColors?: CustomBranding['customColors'];
  prefillData?: Record<string, string>;
  hideTitle?: boolean;
  hideDescription?: boolean;
  showPoweredBy?: boolean;
  className?: string;
  onLoad?: () => void;
  onSubmit?: (data: Record<string, unknown>) => void;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: Error) => void;
  onClose?: () => void;
}

export interface SurveyWidgetProps {
  surveyId: string;
  apiKey: string;
  baseUrl?: string;
  displayMode?: 'inline' | 'popup' | 'modal';
  triggerText?: string;
  triggerStyle?: React.CSSProperties;
  position?: WidgetDisplayConfig['position'];
  theme?: 'light' | 'dark' | 'auto';
  colorScheme?: string;
  customColors?: CustomBranding['customColors'];
  prefillData?: Record<string, string>;
  hideTitle?: boolean;
  hideDescription?: boolean;
  showPoweredBy?: boolean;
  className?: string;
  onLoad?: () => void;
  onSubmit?: (data: Record<string, unknown>) => void;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: Error) => void;
  onClose?: () => void;
}

// ============================================================
// Analytics types
// ============================================================

export type FormEventType =
  | 'form_view'
  | 'form_field_focus'
  | 'form_field_blur'
  | 'form_submit_attempt'
  | 'form_submit_success';

export interface DeviceInfo {
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screen_width: number;
  screen_height: number;
}
