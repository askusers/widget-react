export interface ColorPalette {
  primary: string;
  primaryHover: string;
  secondary: string;
  background: string;
  backgroundSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  info: string;
}

export interface ColorScheme {
  id: string;
  name: string;
  description: string;
  colors: {
    light: ColorPalette;
    dark: ColorPalette;
  };
  preview: {
    gradient?: string;
    isDark: boolean;
  };
}

export const colorSchemes: ColorScheme[] = [
  {
    id: 'default',
    name: 'Professional Blue',
    description: 'Clean and professional blue theme',
    colors: {
      light: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        secondary: '#e0e7ff',
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      },
      dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        secondary: '#1e3a8a',
        background: '#0f172a',
        backgroundSecondary: '#1e293b',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #e0e7ff 100%)',
      isDark: false
    }
  },
  {
    id: 'modern',
    name: 'Modern Purple',
    description: 'Trendy purple gradient theme',
    colors: {
      light: {
        primary: '#8b5cf6',
        primaryHover: '#7c3aed',
        secondary: '#ede9fe',
        background: '#ffffff',
        backgroundSecondary: '#faf9ff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#8b5cf6'
      },
      dark: {
        primary: '#a78bfa',
        primaryHover: '#8b5cf6',
        secondary: '#581c87',
        background: '#0f0a1a',
        backgroundSecondary: '#1e1b31',
        text: '#f3f0ff',
        textSecondary: '#c7a8ff',
        border: '#4c1d95',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#a78bfa'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ede9fe 100%)',
      isDark: false
    }
  },
  {
    id: 'nature',
    name: 'Nature Green',
    description: 'Earthy green tones for natural brands',
    colors: {
      light: {
        primary: '#059669',
        primaryHover: '#047857',
        secondary: '#d1fae5',
        background: '#ffffff',
        backgroundSecondary: '#f0fdf4',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#059669'
      },
      dark: {
        primary: '#34d399',
        primaryHover: '#10b981',
        secondary: '#064e3b',
        background: '#064e3b',
        backgroundSecondary: '#065f46',
        text: '#ecfdf5',
        textSecondary: '#86efac',
        border: '#047857',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#34d399'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #059669 0%, #d1fae5 100%)',
      isDark: false
    }
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    description: 'Warm orange and red tones',
    colors: {
      light: {
        primary: '#ea580c',
        primaryHover: '#dc2626',
        secondary: '#fed7aa',
        background: '#ffffff',
        backgroundSecondary: '#fff7ed',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#ea580c'
      },
      dark: {
        primary: '#fb923c',
        primaryHover: '#ea580c',
        secondary: '#9a3412',
        background: '#1c0a05',
        backgroundSecondary: '#431407',
        text: '#fff7ed',
        textSecondary: '#fdba74',
        border: '#9a3412',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#fb923c'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #ea580c 0%, #fed7aa 100%)',
      isDark: false
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Teal',
    description: 'Cool teal and aqua theme',
    colors: {
      light: {
        primary: '#0891b2',
        primaryHover: '#0e7490',
        secondary: '#cffafe',
        background: '#ffffff',
        backgroundSecondary: '#f0fdff',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#0891b2'
      },
      dark: {
        primary: '#22d3ee',
        primaryHover: '#06b6d4',
        secondary: '#0e7490',
        background: '#0c1e1e',
        backgroundSecondary: '#134e4a',
        text: '#f0fdfa',
        textSecondary: '#5eead4',
        border: '#0f766e',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#22d3ee'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #0891b2 0%, #cffafe 100%)',
      isDark: false
    }
  },
  {
    id: 'minimal',
    name: 'Minimal Mono',
    description: 'Clean black and white design',
    colors: {
      light: {
        primary: '#111827',
        primaryHover: '#000000',
        secondary: '#f3f4f6',
        background: '#ffffff',
        backgroundSecondary: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#111827'
      },
      dark: {
        primary: '#f9fafb',
        primaryHover: '#ffffff',
        secondary: '#374151',
        background: '#111827',
        backgroundSecondary: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#d1d5db',
        border: '#4b5563',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#f9fafb'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #111827 0%, #f3f4f6 100%)',
      isDark: false
    }
  },
  {
    id: 'corporate',
    name: 'Corporate Navy',
    description: 'Professional navy and gold theme',
    colors: {
      light: {
        primary: '#1e3a8a',
        primaryHover: '#1e40af',
        secondary: '#dbeafe',
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#d97706',
        info: '#1e3a8a'
      },
      dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        secondary: '#1e3a8a',
        background: '#0c1a2e',
        backgroundSecondary: '#1e3a8a',
        text: '#f1f5f9',
        textSecondary: '#94a3b8',
        border: '#334155',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#60a5fa'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #d97706 100%)',
      isDark: false
    }
  },
  {
    id: 'vibrant',
    name: 'Vibrant Fun',
    description: 'Bright and playful colors',
    colors: {
      light: {
        primary: '#ec4899',
        primaryHover: '#db2777',
        secondary: '#fce7f3',
        background: '#ffffff',
        backgroundSecondary: '#fdf2f8',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#ec4899'
      },
      dark: {
        primary: '#f472b6',
        primaryHover: '#ec4899',
        secondary: '#831843',
        background: '#1a0a14',
        backgroundSecondary: '#500724',
        text: '#fdf2f8',
        textSecondary: '#f9a8d4',
        border: '#be185d',
        success: '#22c55e',
        error: '#f87171',
        warning: '#fbbf24',
        info: '#f472b6'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #ec4899 0%, #fce7f3 100%)',
      isDark: false
    }
  },
  {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Modern dark theme',
    colors: {
      light: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        secondary: '#e0e7ff',
        background: '#ffffff',
        backgroundSecondary: '#f8fafc',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
      },
      dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        secondary: '#1e293b',
        background: '#0f172a',
        backgroundSecondary: '#1e293b',
        text: '#f8fafc',
        textSecondary: '#cbd5e1',
        border: '#334155',
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#60a5fa'
      }
    },
    preview: {
      gradient: 'linear-gradient(135deg, #0f172a 0%, #60a5fa 100%)',
      isDark: true
    }
  }
];

export function getColorScheme(id: string): ColorScheme | undefined {
  return colorSchemes.find(scheme => scheme.id === id);
}

export function getDefaultColorScheme(): ColorScheme {
  return colorSchemes[0]; // Professional Blue
}
