import type { Meta, StoryObj } from '@storybook/react-vite';
import { FormWidget } from '../src/components/FormWidget';
import type { CreateFormRequest } from '../src/types';
import '../src/styles/widget.css';
import '../src/styles/tiptap.css';

const meta = {
  title: 'Components/FormWidget',
  component: FormWidget,
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
} satisfies Meta<typeof FormWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// Mock form data
// ---------------------------------------------------------------------------

const contactForm: CreateFormRequest = {
  title: 'Contact us',
  description: 'We would love to hear from you. Fill out the form below and we will get back to you within 24 hours.',
  thank_you_message: 'Thanks for reaching out! We will be in touch soon.',
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
      question_text: 'Email address',
      question_type: 'email',
      is_required: true,
      display_order: 2,
    },
    {
      id: 'q3',
      question_text: 'Your message',
      question_type: 'textarea',
      is_required: true,
      display_order: 3,
      min_length: 10,
      max_length: 2000,
    },
  ],
};

const allQuestionTypesForm: CreateFormRequest = {
  title: 'All question types',
  description: 'This form demonstrates every available question type.',
  thank_you_message: 'Thank you for completing the form!',
  questions: [
    {
      id: 'q1',
      question_text: 'Full name',
      question_type: 'text',
      is_required: true,
      display_order: 1,
    },
    {
      id: 'q2',
      question_text: 'Tell us about yourself',
      question_type: 'textarea',
      is_required: false,
      display_order: 2,
      max_length: 500,
    },
    {
      id: 'q3',
      question_text: 'Work email',
      question_type: 'email',
      is_required: true,
      display_order: 3,
    },
    {
      id: 'q4',
      question_text: 'Phone number',
      question_type: 'phone',
      is_required: false,
      display_order: 4,
    },
    {
      id: 'q5',
      question_text: 'Website URL',
      question_type: 'url',
      is_required: false,
      display_order: 5,
    },
    {
      id: 'q6',
      question_text: 'Team size',
      question_type: 'number',
      is_required: false,
      display_order: 6,
    },
    {
      id: 'q7',
      question_text: 'Preferred start date',
      question_type: 'date',
      is_required: false,
      display_order: 7,
    },
    {
      id: 'q8',
      question_text: 'Which plan interests you?',
      question_type: 'radio',
      is_required: true,
      display_order: 8,
      options: ['Free', 'Starter', 'Professional', 'Enterprise'],
    },
    {
      id: 'q9',
      question_text: 'Which features are most important to you?',
      question_type: 'checkbox',
      is_required: false,
      display_order: 9,
      options: ['Analytics', 'Custom branding', 'API access', 'Team collaboration', 'Priority support'],
    },
    {
      id: 'q10',
      question_text: 'How did you hear about us?',
      question_type: 'select',
      is_required: false,
      display_order: 10,
      options: ['Search engine', 'Social media', 'Friend or colleague', 'Blog post', 'Conference', 'Other'],
    },
    {
      id: 'q11',
      question_text: 'How would you rate your onboarding experience?',
      question_type: 'rating',
      is_required: true,
      display_order: 11,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Poor', '3': 'Average', '5': 'Excellent' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'q12',
      question_text: 'Would you recommend us to a friend?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 12,
    },
    {
      id: 'q13',
      question_text: 'How do you feel about the product?',
      question_type: 'reaction',
      is_required: false,
      display_order: 13,
    },
    {
      id: 'q14',
      question_text: '',
      question_html: '<h3>Additional information</h3><p>The following section is optional. Providing more details helps us tailor our response to your needs.</p>',
      question_type: 'content_block',
      display_order: 14,
    },
  ],
};

const ratingStylesForm: CreateFormRequest = {
  title: 'Rating styles showcase',
  description: 'This form demonstrates different rating visual styles available.',
  thank_you_message: 'Thanks for your ratings!',
  questions: [
    {
      id: 'q1',
      question_text: 'Rate using buttons (default)',
      question_type: 'rating',
      is_required: true,
      display_order: 1,
      rating_min: 1,
      rating_max: 10,
      rating_labels: { '1': 'Not likely', '5': 'Neutral', '10': 'Very likely' },
      visual_config: { style: 'buttons' },
    },
    {
      id: 'q2',
      question_text: 'Rate using stars',
      question_type: 'rating',
      is_required: true,
      display_order: 2,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Terrible', '3': 'Okay', '5': 'Amazing' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'q3',
      question_text: 'Rate using slider',
      question_type: 'rating',
      is_required: true,
      display_order: 3,
      rating_min: 0,
      rating_max: 100,
      rating_labels: { '0': 'Very dissatisfied', '50': 'Neutral', '100': 'Very satisfied' },
      visual_config: { style: 'slider' },
    },
  ],
};

const darkThemeForm: CreateFormRequest = {
  title: 'Dark mode feedback',
  description: 'Share your thoughts on our dark mode implementation.',
  thank_you_message: 'Your feedback has been recorded.',
  custom_branding: {
    colorScheme: 'midnight',
    customColors: {
      primary: '#818cf8',
      primaryHover: '#6366f1',
      background: '#1e1b4b',
      backgroundSecondary: '#312e81',
      text: '#e0e7ff',
      textSecondary: '#a5b4fc',
      border: '#4338ca',
    },
    showPoweredBy: false,
    companyName: 'Nightshift Labs',
  },
  questions: [
    {
      id: 'q1',
      question_text: 'How readable is the text in dark mode?',
      question_type: 'rating',
      is_required: true,
      display_order: 1,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Very hard to read', '3': 'Acceptable', '5': 'Crystal clear' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'q2',
      question_text: 'Do the colors feel comfortable for extended use?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 2,
    },
    {
      id: 'q3',
      question_text: 'Any suggestions for improvement?',
      question_type: 'textarea',
      is_required: false,
      display_order: 3,
    },
  ],
};

const splitLayoutForm: CreateFormRequest = {
  title: 'Get started today',
  description: 'Create your free account and start collecting feedback in minutes.',
  thank_you_message: 'Welcome aboard! Check your email for next steps.',
  layout_config: {
    layoutType: 'split',
    splitLayout: {
      mediaPosition: 'left',
      mediaWidth: '40%',
      mediaType: 'gradient',
      gradient: {
        from: '#6366f1',
        to: '#ec4899',
        direction: 'to-br',
      },
      minFormWidth: '400px',
    },
  },
  questions: [
    {
      id: 'q1',
      question_text: 'Full name',
      question_type: 'text',
      is_required: true,
      display_order: 1,
    },
    {
      id: 'q2',
      question_text: 'Work email',
      question_type: 'email',
      is_required: true,
      display_order: 2,
    },
    {
      id: 'q3',
      question_text: 'Company name',
      question_type: 'text',
      is_required: false,
      display_order: 3,
    },
    {
      id: 'q4',
      question_text: 'What role best describes you?',
      question_type: 'select',
      is_required: true,
      display_order: 4,
      options: ['Product Manager', 'Designer', 'Developer', 'Marketing', 'Customer Success', 'Founder / CEO', 'Other'],
    },
  ],
};

const customBrandingForm: CreateFormRequest = {
  title: 'Acme Corp feedback',
  description: 'Help us build a better product for you.',
  thank_you_message: 'Thank you for your feedback!',
  custom_branding: {
    colorScheme: 'custom',
    customColors: {
      primary: '#e11d48',
      primaryHover: '#be123c',
      secondary: '#fda4af',
      background: '#fff1f2',
      backgroundSecondary: '#ffe4e6',
      text: '#1f2937',
      textSecondary: '#6b7280',
      border: '#fecdd3',
    },
    showPoweredBy: true,
    companyName: 'Acme Corporation',
    companyNameAlignment: 'center',
    logo: {
      url: 'https://placehold.co/120x40/e11d48/white?text=ACME',
      width: 120,
      height: 40,
      position: 'top',
      alignment: 'center',
    },
  },
  questions: [
    {
      id: 'q1',
      question_text: 'How satisfied are you with our product?',
      question_type: 'rating',
      is_required: true,
      display_order: 1,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Very unsatisfied', '3': 'Neutral', '5': 'Very satisfied' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'q2',
      question_text: 'Which feature do you use the most?',
      question_type: 'radio',
      is_required: true,
      display_order: 2,
      options: ['Dashboard', 'Reports', 'Integrations', 'API', 'Team management'],
    },
    {
      id: 'q3',
      question_text: 'What could we do better?',
      question_type: 'textarea',
      is_required: false,
      display_order: 3,
    },
  ],
};

const successStateForm: CreateFormRequest = {
  title: 'Quick poll',
  description: 'A one-question poll.',
  thank_you_message: 'Your vote has been counted!',
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
      question_text: 'Do you enjoy using our platform?',
      question_type: 'yes_no',
      is_required: true,
      display_order: 1,
    },
  ],
};

const loadingStateForm: CreateFormRequest = {
  title: 'Submitting your response',
  description: 'Please wait while we save your data.',
  questions: [
    {
      id: 'q1',
      question_text: 'Your name',
      question_type: 'text',
      is_required: true,
      display_order: 1,
    },
  ],
};

const hiddenTitleForm: CreateFormRequest = {
  title: 'Hidden title form',
  description: 'This description should also be hidden.',
  questions: [
    {
      id: 'q1',
      question_text: 'Email address',
      question_type: 'email',
      is_required: true,
      display_order: 1,
    },
    {
      id: 'q2',
      question_text: 'How would you rate this page?',
      question_type: 'rating',
      is_required: true,
      display_order: 2,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Bad', '5': 'Great' },
      visual_config: { style: 'stars' },
    },
    {
      id: 'q3',
      question_text: 'Additional comments',
      question_type: 'textarea',
      is_required: false,
      display_order: 3,
    },
  ],
};

const demoModeForm: CreateFormRequest = {
  title: 'Product feedback',
  description: 'This form is running in demo mode. Submissions will not be saved.',
  thank_you_message: 'Thanks! (Demo mode - nothing was actually submitted)',
  questions: [
    {
      id: 'q1',
      question_text: 'What feature would you like to see next?',
      question_type: 'radio',
      is_required: true,
      display_order: 1,
      options: ['Dark mode', 'Mobile app', 'API improvements', 'Better analytics', 'Integrations'],
    },
    {
      id: 'q2',
      question_text: 'How urgent is this for you?',
      question_type: 'rating',
      is_required: true,
      display_order: 2,
      rating_min: 1,
      rating_max: 5,
      rating_labels: { '1': 'Not urgent', '3': 'Moderate', '5': 'Critical' },
      visual_config: { style: 'buttons' },
    },
    {
      id: 'q3',
      question_text: 'Anything else you want to share?',
      question_type: 'textarea',
      is_required: false,
      display_order: 3,
    },
  ],
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

export const Default: Story = {
  args: {
    form: contactForm,
  },
};

export const AllQuestionTypes: Story = {
  args: {
    form: allQuestionTypesForm,
  },
};

export const WithRatingStyles: Story = {
  args: {
    form: ratingStylesForm,
  },
};

export const DarkTheme: Story = {
  args: {
    form: darkThemeForm,
    theme: 'dark',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
};

export const SplitLayout: Story = {
  args: {
    form: splitLayoutForm,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export const CustomBranding: Story = {
  args: {
    form: customBrandingForm,
  },
};

export const SuccessState: Story = {
  args: {
    form: successStateForm,
    forceSuccessState: true,
  },
};

export const LoadingState: Story = {
  args: {
    form: loadingStateForm,
    forceLoadingState: true,
  },
};

export const HiddenTitleAndDescription: Story = {
  args: {
    form: hiddenTitleForm,
    hideTitle: true,
    hideDescription: true,
  },
};

export const DemoMode: Story = {
  args: {
    form: demoModeForm,
    isDemo: true,
  },
};
