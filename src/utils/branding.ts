import { CustomBranding } from '../types';
import { getColorScheme, getDefaultColorScheme, ColorPalette } from '../constants/colorSchemes';

export interface BrandingStyles {
  colors: ColorPalette;
  customCSS?: string;
  companyName?: string;
  showPoweredBy: boolean;
}

function detectTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  // Check if user has explicitly set a theme preference
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme === 'light') {
    return 'light';
  }
  if (savedTheme === 'dark') {
    return 'dark';
  }

  // Check the actual DOM state
  const dataTheme = document.documentElement.dataset.theme;
  if (dataTheme === 'dark') {
    return 'dark';
  }
  if (dataTheme === 'light') {
    return 'light';
  }

  // Check DOM classes as backup
  if (document.documentElement.classList.contains('dark')) {
    return 'dark';
  }
  if (document.documentElement.classList.contains('light')) {
    return 'light';
  }

  // Finally, check system preference as last resort
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

export function getBrandingStyles(branding?: CustomBranding, forceTheme?: 'light' | 'dark'): BrandingStyles {
  const colorScheme = branding?.colorScheme
    ? getColorScheme(branding.colorScheme) || getDefaultColorScheme()
    : getDefaultColorScheme();

  // Detect current theme
  const theme = forceTheme || detectTheme();

  // Start with the appropriate theme color palette
  const colors = { ...colorScheme.colors[theme] };

  // Override with any custom colors
  if (branding?.customColors) {
    Object.entries(branding.customColors).forEach(([key, value]) => {
      if (value && key in colors) {
        colors[key as keyof typeof colors] = value;
      }
    });
  }

  return {
    colors,
    customCSS: branding?.customCSS,
    companyName: branding?.companyName,
    showPoweredBy: branding?.showPoweredBy !== false, // default to true
  };
}

/**
 * Sanitize user-supplied CSS to prevent injection attacks.
 * Strips dangerous properties and selectors that could enable
 * data exfiltration, UI redressing, or resource loading.
 */
function sanitizeCSS(css?: string): string {
  if (!css) return '';

  // Remove any HTML tags (e.g., </style><script>)
  let sanitized = css.replace(/<[^>]*>/g, '');

  // Remove @import rules (could load external resources)
  sanitized = sanitized.replace(/@import\b[^;]*/gi, '');

  // Remove url() references (could exfiltrate data or load external resources)
  sanitized = sanitized.replace(/url\s*\([^)]*\)/gi, 'url()');

  // Remove expression() (IE CSS expressions)
  sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');

  // Remove -moz-binding (Firefox XBL)
  sanitized = sanitized.replace(/-moz-binding\s*:[^;]*/gi, '');

  // Remove behavior (IE .htc behaviors)
  sanitized = sanitized.replace(/behavior\s*:[^;]*/gi, '');

  // Remove position: fixed/absolute that could overlay host page
  sanitized = sanitized.replace(/position\s*:\s*(fixed|absolute)\b[^;]*/gi, '');

  // Remove z-index (prevent overlaying host content)
  sanitized = sanitized.replace(/z-index\s*:[^;]*/gi, '');

  return sanitized;
}

export function generateBrandingCSS(styles: BrandingStyles): string {
  const { colors } = styles;

  return `
    .askusers-survey-widget-container {
      --primary: ${colors.primary};
      --primary-hover: ${colors.primaryHover};
      --secondary: ${colors.secondary};
      --background: ${colors.background};
      --background-secondary: ${colors.backgroundSecondary};
      --text: ${colors.text};
      --text-secondary: ${colors.textSecondary};
      --border: ${colors.border};
    }

    .askusers-survey-widget-container .primary-bg {
      background-color: var(--primary);
    }

    .askusers-survey-widget-container .primary-bg:hover {
      background-color: var(--primary-hover);
    }

    .askusers-survey-widget-container .primary-text {
      color: var(--primary);
    }

    .askusers-survey-widget-container .primary-border {
      border-color: var(--primary);
    }

    .askusers-survey-widget-container .primary-focus:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 20%, transparent);
    }

    .askusers-survey-widget-container .bg-background {
      background-color: var(--background);
    }

    .askusers-survey-widget-container .bg-background-secondary {
      background-color: var(--background-secondary);
    }

    .askusers-survey-widget-container .text-primary {
      color: var(--text);
    }

    .askusers-survey-widget-container .text-secondary {
      color: var(--text-secondary);
    }

    .askusers-survey-widget-container .border-custom {
      border-color: var(--border);
    }

    ${sanitizeCSS(styles.customCSS)}
  `.trim();
}

export function applyBrandingStyles(styles: BrandingStyles): React.CSSProperties {
  const { colors } = styles;

  return {
    '--primary': colors.primary,
    '--primary-hover': colors.primaryHover,
    '--secondary': colors.secondary,
    '--background': colors.background,
    '--background-secondary': colors.backgroundSecondary,
    '--text': colors.text,
    '--text-secondary': colors.textSecondary,
    '--border': colors.border,
  } as React.CSSProperties;
}
