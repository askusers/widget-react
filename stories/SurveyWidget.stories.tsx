import type { Meta, StoryObj } from '@storybook/react-vite';
import { SurveyWidget } from '../src/components/SurveyWidget';
import type { CreateSurveyRequest } from '../src/types';
import '../src/styles/widget.css';
import '../src/styles/tiptap.css';

const meta = {
  title: 'Components/SurveyWidget',
  component: SurveyWidget,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    theme: {
      control: 'radio',
      options: ['light', 'dark', 'auto'],
    },
    hideTitle: { control: 'boolean' },
    hideDescription: { control: 'boolean' },
    isDemo: { control: 'boolean' },
    forceSuccessState: { control: 'boolean' },
    forceLoadingState: { control: 'boolean' },
  },
  args: {
    theme: 'light',
  },
} satisfies Meta<typeof SurveyWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Mock survey data
// ---------------------------------------------------------------------------

const defaultSurvey: CreateSurveyRequest = {
  title: 'Customer satisfaction survey',
  description: 'Help us understand how we are doing. This survey takes about 2 minutes.',
  show_progress: true,
  thank_you_message: 'Thank you for your honest feedback!',
  questions: [
    {
      id: 'q1',
      question_text: 'Overall, how satisfied are you with our service?',
      question_type: 'radio',
      is_required: true,
      display_order: 1,
      options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'],
    },
    {
      id: 'q2',
      question_text: 'What could we improve?',
      question_type: 'textarea',
      is_required: false,
      display_order: 2,
      max_length: 1000,
    },
  ],
};

const multiPageSurvey: CreateSurveyRequest = {
  title: 'Employee engagement survey',
  description: 'Your responses are anonymous and help us build a better workplace.',
  show_progress: true,
  thank_you_message: 'Thank you for completing the engagement survey!',
  questions: [
    {
      id: 'q1',
      question_text: 'How long have you been with the company?',
      question_type: 'select',
      is_required: true,
      display_order: 1,
      options: ['Less than 6 months', '6-12 months', '1-2 years', '2-5 years', 'More than 5 years'],
    },
    {
      id: 'q2',
      question_text: 'Which department are you in?',
      question_type: 'radio',
      is_required: true,
      display_order: 2,
      options: ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'HR', 'Other'],
    },
    {
      id: 'pb1',
      question_text: '',
      question_type: 'page_break',
      display_order: 3,
    },
    {
      id: 'q3',
      question_text: 'How would you rate your overall job satisfaction?',
      question_type: 'rating',
      is_required: true,
      display_order: 4,
      rating_min: 1,
      rating_max: 10,
      rating_labels: { '1': 'Very unhappy', '5': 'Neutral', '10': 'Very happy' },
      visual_config: { style: 'buttons' },
    },
    {
      id: 'q4',
      question_text: 'Do you feel your work is valued by management?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 5,
    },
    {
      id: 'q5',
      question_text: 'How effective is communication within your team?',
      question_type: 'rating',
      is_required: true,
      display_order: 6,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Poor', '3': 'Adequate', '5': 'Excellent' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'pb2',
      question_text: '',
      question_type: 'page_break',
      display_order: 7,
    },
    {
      id: 'q6',
      question_text: 'Would you recommend this company as a great place to work?',
      question_type: 'rating',
      is_required: true,
      display_order: 8,
      rating_min: 0,
      rating_max: 10,
      rating_labels: { '0': 'Definitely not', '5': 'Maybe', '10': 'Absolutely' },
      visual_config: { style: 'buttons' },
    },
    {
      id: 'q7',
      question_text: 'What is the one thing you would change about working here?',
      question_type: 'textarea',
      is_required: false,
      display_order: 9,
      max_length: 2000,
    },
  ],
};

const conversationalSurvey: CreateSurveyRequest = {
  title: 'Quick product check-in',
  description: 'Answer a few questions about your recent experience.',
  show_progress: true,
  thank_you_message: 'Appreciate your time!',
  layout_config: {
    layoutType: 'conversational',
    displayStyle: 'conversational',
  },
  questions: [
    {
      id: 'q1',
      question_text: 'How was your experience today?',
      question_type: 'reaction',
      is_required: true,
      display_order: 1,
    },
    {
      id: 'q2',
      question_text: 'What brought you to our site today?',
      question_type: 'radio',
      is_required: true,
      display_order: 2,
      options: ['Browsing products', 'Making a purchase', 'Customer support', 'Checking order status', 'Just exploring'],
    },
    {
      id: 'q3',
      question_text: 'Did you find what you were looking for?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 3,
    },
    {
      id: 'q4',
      question_text: 'Any comments or suggestions?',
      question_type: 'textarea',
      is_required: false,
      display_order: 4,
    },
  ],
};

const likertAndRankingSurvey: CreateSurveyRequest = {
  title: 'Product evaluation',
  description: 'Please rate and rank the following aspects of our platform.',
  show_progress: true,
  thank_you_message: 'Your evaluation has been submitted. Thank you!',
  questions: [
    {
      id: 'q1',
      question_text: 'Rate your agreement with the following statement: "The product is easy to use."',
      question_type: 'likert',
      is_required: true,
      display_order: 1,
      likert_scale_labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    },
    {
      id: 'q2',
      question_text: 'Rate your agreement: "The documentation is comprehensive and helpful."',
      question_type: 'likert',
      is_required: true,
      display_order: 2,
      likert_scale_labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    },
    {
      id: 'q3',
      question_text: 'Rate your agreement: "Customer support responds quickly."',
      question_type: 'likert',
      is_required: true,
      display_order: 3,
      likert_scale_labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    },
    {
      id: 'q4',
      question_text: 'Rank the following features from most to least important',
      question_type: 'ranking',
      is_required: true,
      display_order: 4,
      options: ['Performance', 'Ease of use', 'Documentation', 'Pricing', 'Customer support'],
    },
  ],
};

const allQuestionTypesSurvey: CreateSurveyRequest = {
  title: 'Comprehensive survey',
  description: 'This survey showcases every available question type.',
  show_progress: true,
  thank_you_message: 'Thank you for completing this comprehensive survey!',
  questions: [
    {
      id: 'q1',
      question_text: 'Your name',
      question_type: 'text',
      is_required: true,
      display_order: 1,
    },
    {
      id: 'q2',
      question_text: 'Tell us about your background',
      question_type: 'textarea',
      is_required: false,
      display_order: 2,
      max_length: 800,
    },
    {
      id: 'q3',
      question_text: 'Contact email',
      question_type: 'email',
      is_required: true,
      display_order: 3,
    },
    {
      id: 'q4',
      question_text: 'Contact phone',
      question_type: 'phone',
      is_required: false,
      display_order: 4,
    },
    {
      id: 'q5',
      question_text: 'LinkedIn profile',
      question_type: 'url',
      is_required: false,
      display_order: 5,
    },
    {
      id: 'q6',
      question_text: 'Years of experience',
      question_type: 'number',
      is_required: false,
      display_order: 6,
    },
    {
      id: 'q7',
      question_text: 'Date of birth',
      question_type: 'date',
      is_required: false,
      display_order: 7,
    },
    {
      id: 'q8',
      question_text: 'Preferred communication method',
      question_type: 'radio',
      is_required: true,
      display_order: 8,
      options: ['Email', 'Phone', 'Video call', 'In-person'],
    },
    {
      id: 'q9',
      question_text: 'Which languages do you speak?',
      question_type: 'checkbox',
      is_required: false,
      display_order: 9,
      options: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Mandarin', 'Japanese'],
    },
    {
      id: 'q10',
      question_text: 'Industry',
      question_type: 'select',
      is_required: true,
      display_order: 10,
      options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other'],
    },
    {
      id: 'q11',
      question_text: 'How would you rate your expertise level?',
      question_type: 'rating',
      is_required: true,
      display_order: 11,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Beginner', '3': 'Intermediate', '5': 'Expert' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'q12',
      question_text: 'Are you currently employed?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 12,
    },
    {
      id: 'q13',
      question_text: 'How do you feel about remote work?',
      question_type: 'reaction',
      is_required: false,
      display_order: 13,
    },
    {
      id: 'q14',
      question_text: '',
      question_html: '<h3>Advanced questions</h3><p>The following questions use advanced question types to gather structured feedback.</p>',
      question_type: 'content_block',
      display_order: 14,
    },
    {
      id: 'q15',
      question_text: 'Rate your agreement: "I feel productive working from home."',
      question_type: 'likert',
      is_required: true,
      display_order: 15,
      likert_scale_labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'],
    },
    {
      id: 'q16',
      question_text: 'Rank these workplace benefits by importance',
      question_type: 'ranking',
      is_required: true,
      display_order: 16,
      options: ['Health insurance', 'Remote work', 'Stock options', 'Professional development', 'Flexible hours'],
    },
  ],
};

const darkThemeSurvey: CreateSurveyRequest = {
  title: 'Night owl preferences',
  description: 'A survey designed for dark mode enthusiasts.',
  show_progress: true,
  thank_you_message: 'Thanks for sharing your preferences!',
  custom_branding: {
    colorScheme: 'midnight',
    customColors: {
      primary: '#60a5fa',
      primaryHover: '#3b82f6',
      background: '#0f172a',
      backgroundSecondary: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
    },
    showPoweredBy: false,
  },
  questions: [
    {
      id: 'q1',
      question_text: 'Do you prefer dark mode in applications?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 1,
    },
    {
      id: 'q2',
      question_text: 'How important is dark mode support when choosing software?',
      question_type: 'rating',
      is_required: true,
      display_order: 2,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Not important', '3': 'Somewhat', '5': 'Deal breaker' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'q3',
      question_text: 'Which dark mode style do you prefer?',
      question_type: 'radio',
      is_required: true,
      display_order: 3,
      options: ['Pure black (#000)', 'Dark grey (#1a1a1a)', 'Dark blue (#0f172a)', 'Dark purple (#1e1b4b)'],
    },
    {
      id: 'q4',
      question_text: 'Any other thoughts on dark mode?',
      question_type: 'textarea',
      is_required: false,
      display_order: 4,
    },
  ],
};

const successStateSurvey: CreateSurveyRequest = {
  title: 'Completed survey',
  description: 'This survey has been submitted.',
  show_progress: false,
  thank_you_message: 'Your responses have been recorded successfully.',
  custom_branding: {
    colorScheme: 'emerald',
    successMessage: {
      layout: 'stacked',
      emojiSize: 'large',
      textSize: 'medium',
    },
  },
  questions: [
    {
      id: 'q1',
      question_text: 'Placeholder question',
      question_type: 'text',
      is_required: true,
      display_order: 1,
    },
  ],
};

const barProgressSurvey: CreateSurveyRequest = {
  title: 'Progress bar style',
  description: 'This survey uses a bar progress indicator.',
  show_progress: true,
  thank_you_message: 'Survey complete!',
  layout_config: {
    layoutType: 'classic',
    questionDisplay: {
      showProgress: true,
      progressStyle: 'bar',
      progressPosition: 'top',
    },
  },
  questions: [
    {
      id: 'q1',
      question_text: 'First question: how are you feeling today?',
      question_type: 'reaction',
      is_required: true,
      display_order: 1,
    },
    {
      id: 'pb1',
      question_text: '',
      question_type: 'page_break',
      display_order: 2,
    },
    {
      id: 'q2',
      question_text: 'Second question: rate your experience',
      question_type: 'rating',
      is_required: true,
      display_order: 3,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Poor', '5': 'Great' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'pb2',
      question_text: '',
      question_type: 'page_break',
      display_order: 4,
    },
    {
      id: 'q3',
      question_text: 'Final question: any feedback?',
      question_type: 'textarea',
      is_required: false,
      display_order: 5,
    },
  ],
};

const dotsProgressSurvey: CreateSurveyRequest = {
  title: 'Progress dots style',
  description: 'This survey uses dots to indicate progress.',
  show_progress: true,
  thank_you_message: 'All done!',
  layout_config: {
    layoutType: 'classic',
    questionDisplay: {
      showProgress: true,
      progressStyle: 'dots',
      progressPosition: 'top',
    },
  },
  questions: [
    {
      id: 'q1',
      question_text: 'What is your favourite colour?',
      question_type: 'radio',
      is_required: true,
      display_order: 1,
      options: ['Red', 'Blue', 'Green', 'Yellow', 'Purple'],
    },
    {
      id: 'pb1',
      question_text: '',
      question_type: 'page_break',
      display_order: 2,
    },
    {
      id: 'q2',
      question_text: 'Pick your preferred season',
      question_type: 'radio',
      is_required: true,
      display_order: 3,
      options: ['Spring', 'Summer', 'Autumn', 'Winter'],
    },
    {
      id: 'pb2',
      question_text: '',
      question_type: 'page_break',
      display_order: 4,
    },
    {
      id: 'q3',
      question_text: 'Anything else to share?',
      question_type: 'textarea',
      is_required: false,
      display_order: 5,
    },
  ],
};

const percentageProgressSurvey: CreateSurveyRequest = {
  title: 'Progress percentage style',
  description: 'This survey displays progress as a percentage.',
  show_progress: true,
  thank_you_message: 'Survey submitted!',
  layout_config: {
    layoutType: 'classic',
    questionDisplay: {
      showProgress: true,
      progressStyle: 'percentage',
      progressPosition: 'top',
    },
  },
  questions: [
    {
      id: 'q1',
      question_text: 'How often do you use our product?',
      question_type: 'select',
      is_required: true,
      display_order: 1,
      options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'First time'],
    },
    {
      id: 'pb1',
      question_text: '',
      question_type: 'page_break',
      display_order: 2,
    },
    {
      id: 'q2',
      question_text: 'Rate the ease of navigation',
      question_type: 'rating',
      is_required: true,
      display_order: 3,
      rating_min: 1,
      rating_max: 10,
      rating_labels: { '1': 'Very difficult', '5': 'Moderate', '10': 'Very easy' },
      visual_config: { style: 'buttons' },
    },
    {
      id: 'pb2',
      question_text: '',
      question_type: 'page_break',
      display_order: 4,
    },
    {
      id: 'q3',
      question_text: 'Would you recommend our product?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 5,
    },
  ],
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    survey: defaultSurvey,
  },
};

export const MultiPage: Story = {
  args: {
    survey: multiPageSurvey,
  },
};

export const ConversationalMode: Story = {
  args: {
    survey: conversationalSurvey,
  },
};

export const WithLikertAndRanking: Story = {
  args: {
    survey: likertAndRankingSurvey,
  },
};

export const AllQuestionTypes: Story = {
  args: {
    survey: allQuestionTypesSurvey,
  },
};

export const DarkTheme: Story = {
  args: {
    survey: darkThemeSurvey,
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const SuccessState: Story = {
  args: {
    survey: successStateSurvey,
    forceSuccessState: true,
  },
};

export const CustomProgressStyles: Story = {
  name: 'Custom progress: bar',
  args: {
    survey: barProgressSurvey,
  },
};

export const CustomProgressDots: Story = {
  name: 'Custom progress: dots',
  args: {
    survey: dotsProgressSurvey,
  },
};

export const CustomProgressPercentage: Story = {
  name: 'Custom progress: percentage',
  args: {
    survey: percentageProgressSurvey,
  },
};
