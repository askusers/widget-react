# @askusers/widget-react

React components for embedding [Ask Users](https://askusers.org) forms and surveys into any React application.

## Installation

```bash
npm install @askusers/widget-react
```

## Quick start

```tsx
import { FormWidget, SurveyWidget } from '@askusers/widget-react';
import '@askusers/widget-react/styles';

// Inline form
function App() {
  return (
    <FormWidget
      formId="your-form-id"
      apiKey="your-api-key"
    />
  );
}

// Survey with callbacks
function FeedbackPage() {
  return (
    <SurveyWidget
      surveyId="your-survey-id"
      apiKey="your-api-key"
      onSubmitSuccess={() => console.log('Survey submitted!')}
    />
  );
}
```

## Components

### `<FormWidget />`

Renders a form with all question types, theming, conditional logic, and submission handling.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `formId` | `string` | - | Form ID to fetch from API |
| `apiKey` | `string` | - | API key for authentication |
| `baseUrl` | `string` | `https://api.askusers.org` | API base URL |
| `form` | `CreateFormRequest` | - | Pre-loaded form data (alternative to formId) |
| `className` | `string` | - | CSS class for the container |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme override |
| `hideTitle` | `boolean` | `false` | Hide the form title |
| `hideDescription` | `boolean` | `false` | Hide the form description |
| `showPoweredBy` | `boolean` | `true` | Show "Powered by Ask Users" |
| `onLoad` | `() => void` | - | Called when form data is loaded |
| `onSubmit` | `(responses) => Promise<void>` | - | Custom submit handler |
| `onSubmitSuccess` | `() => void` | - | Called after successful submission |
| `onSubmitError` | `(error: Error) => void` | - | Called on submission error |

### `<SurveyWidget />`

Renders a survey with multi-page navigation, progress tracking, and all question types.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `surveyId` | `string` | - | Survey ID to fetch from API |
| `apiKey` | `string` | - | API key for authentication |
| `baseUrl` | `string` | `https://api.askusers.org` | API base URL |
| `survey` | `CreateSurveyRequest` | - | Pre-loaded survey data |
| `className` | `string` | - | CSS class for the container |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Theme override |
| `hideTitle` | `boolean` | `false` | Hide the survey title |
| `hideDescription` | `boolean` | `false` | Hide the survey description |
| `showPoweredBy` | `boolean` | `true` | Show "Powered by Ask Users" |
| `onLoad` | `() => void` | - | Called when survey data is loaded |
| `onSubmit` | `(responses) => Promise<void>` | - | Custom submit handler |
| `onSubmitSuccess` | `() => void` | - | Called after successful submission |
| `onSubmitError` | `(error: Error) => void` | - | Called on submission error |

## Supported question types

- Text input
- Textarea
- Email, phone, URL, number, date
- Radio (single choice)
- Checkbox (multiple choice)
- Select (dropdown)
- Rating (buttons, stars, slider)
- Yes/No
- Reaction (emoji/icon)
- Likert scale (surveys only)
- Ranking with drag-and-drop (surveys only)
- Content block (rich HTML)
- Page break (multi-page)

## Theming

The widget automatically detects and follows the host page's theme. It checks:

1. `localStorage.getItem('theme')`
2. `document.documentElement.dataset.theme`
3. `document.documentElement.classList` (light/dark)
4. `prefers-color-scheme` media query

You can force a theme with the `theme` prop:

```tsx
<FormWidget formId="..." apiKey="..." theme="dark" />
```

## Pre-loaded data

If you already have form/survey data, pass it directly to avoid an API call:

```tsx
const formData = {
  title: 'Feedback form',
  questions: [
    { question_text: 'How was your experience?', question_type: 'rating', display_order: 0, rating_min: 1, rating_max: 5 },
    { question_text: 'Any comments?', question_type: 'textarea', display_order: 1 },
  ],
};

<FormWidget form={formData} />
```

## API client

For advanced use cases, you can use the API client directly:

```tsx
import { AskUsersClient } from '@askusers/widget-react';

const client = new AskUsersClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.askusers.org',
});

const { form, questions } = await client.getForm('form-id');
await client.submitForm('form-id', { submission_data: { ... } });
```

## License

MIT
