// Components
export { FormWidget } from './components/FormWidget';
export { SurveyWidget } from './components/SurveyWidget';
export { Tooltip } from './components/Tooltip';

// API Client
export { AskUsersClient } from './api/client';
export type { AskUsersClientConfig } from './api/client';

// Hooks
export { useFormAnalytics } from './hooks/useFormAnalytics';
export { useThemeDetection } from './hooks/useThemeDetection';

// Utilities
export { getBrandingStyles, generateBrandingCSS, applyBrandingStyles } from './utils/branding';
export type { BrandingStyles } from './utils/branding';
export {
  generateFormStyles,
  generateFormStylesheet,
  getFieldStyleClasses,
  getButtonStyleClasses,
  generateBackgroundStyles,
  generateSplitLayoutStyles,
} from './utils/formStyles';
export { ConditionalLogicUtil } from './utils/conditionalLogic';

// Constants
export { colorSchemes, getColorScheme, getDefaultColorScheme } from './constants/colorSchemes';
export type { ColorScheme, ColorPalette } from './constants/colorSchemes';
export { REACTION_EMOJIS, getReactionByValue, getReactionByEmoji } from './constants/reactions';
export type { ReactionEmoji } from './constants/reactions';

// Types
export type {
  // Widget props
  FormWidgetProps,
  SurveyWidgetProps,
  // Form types
  CreateFormRequest,
  CreateFormQuestionRequest,
  Form,
  FormQuestion,
  FormWithQuestions,
  FormSubmissionRequest,
  // Survey types
  CreateSurveyRequest,
  CreateSurveyQuestionRequest,
  Survey,
  SurveyQuestion,
  SurveyWithQuestions,
  SurveyResponseRequest,
  // Config types
  WidgetDisplayConfig,
  CustomBranding,
  FormLayoutConfig,
  FormAppearanceConfig,
  QuestionVisualConfig,
  QuestionLogicRules,
  // Analytics types
  FormEventType,
  DeviceInfo,
} from './types';

// Styles (side-effect import for consumers who want CSS)
import './styles/widget.css';
import './styles/tiptap.css';
