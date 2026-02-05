import { FormAppearanceConfig, FormLayoutConfig } from '../types';

/**
 * Validate and escape a URL for safe use inside CSS url().
 * Only allows https:// URLs and escapes characters that could break
 * out of the url() context.
 */
function sanitizeCSSUrl(url: string): string {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) return '';
  // Escape parentheses, quotes, and backslashes to prevent CSS injection
  return trimmed
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"');
}

const FONT_FAMILIES: Record<string, string> = {
  'inter': 'Inter, system-ui, -apple-system, sans-serif',
  'roboto': 'Roboto, system-ui, -apple-system, sans-serif',
  'open-sans': '"Open Sans", system-ui, -apple-system, sans-serif',
  'lato': 'Lato, system-ui, -apple-system, sans-serif',
  'montserrat': 'Montserrat, system-ui, -apple-system, sans-serif',
  'playfair': '"Playfair Display", Georgia, serif',
  'source-sans': '"Source Sans Pro", system-ui, -apple-system, sans-serif'
};

const FONT_SIZES: Record<string, string> = {
  'xxs': '0.625rem',
  'xs': '0.75rem',
  'sm': '0.875rem',
  'md': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem'
};

const FONT_WEIGHTS: Record<string, string> = {
  'normal': '400',
  'medium': '500',
  'semibold': '600',
  'bold': '700'
};

const BORDER_RADIUS: Record<string, string> = {
  'none': '0',
  'sm': '0.125rem',
  'md': '0.375rem',
  'lg': '0.5rem',
  'full': '9999px'
};

const SPACING: Record<string, string> = {
  'tight': '0.5rem',
  'normal': '1rem',
  'relaxed': '1.5rem',
  'loose': '2rem'
};

const INPUT_SIZES: Record<string, string> = {
  'sm': '0.5rem 0.75rem',
  'md': '0.625rem 1rem',
  'lg': '0.75rem 1.25rem'
};

const SHADOWS: Record<string, string> = {
  'none': 'none',
  'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
};

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

export function generateFormStyles(
  appearanceConfig?: FormAppearanceConfig,
  _layoutConfig?: FormLayoutConfig
): string {
  const styles: string[] = [];

  if (!appearanceConfig) {
    styles.push(`--form-font-family: ${FONT_FAMILIES.inter};`);
    return styles.join(' ');
  }

  if (appearanceConfig.theme?.light) {
    const light = appearanceConfig.theme.light;

    styles.push(`--form-primary-color: ${light.primary};`);
    styles.push(`--form-text-color: ${light.text};`);

    const formBg = light.formBackground || '#FFFFFF';
    const fieldBg = light.fieldBackground || '#FFFFFF';
    styles.push(`--form-bg-color: ${formBg};`);

    const primaryHover = darkenColor(light.primary, 15);
    styles.push(`--form-primary-hover: ${primaryHover};`);

    const fieldTextColor = light.fieldText || light.text;
    styles.push(`--form-field-border-color: ${fieldTextColor}30;`);
    styles.push(`--form-field-focus-border-color: ${light.primary};`);
    styles.push(`--form-field-bg-color: ${fieldBg};`);
    styles.push(`--form-field-focus-bg-color: ${fieldBg};`);
    styles.push(`--form-field-text-color: ${fieldTextColor};`);
    styles.push(`--form-field-placeholder-color: ${fieldTextColor}60;`);

    styles.push(`--form-button-bg-color: ${light.primary};`);
    styles.push(`--form-button-hover-bg-color: ${primaryHover};`);
    styles.push(`--form-button-text-color: #FFFFFF;`);

    styles.push(`--form-card-bg-color: ${formBg};`);
    styles.push(`--form-card-border-color: ${fieldTextColor}20;`);
  }

  if (appearanceConfig.theme?.enableDarkMode && appearanceConfig.theme?.dark) {
    const dark = appearanceConfig.theme.dark;

    styles.push(`--form-dark-primary-color: ${dark.primary};`);
    styles.push(`--form-dark-text-color: ${dark.text};`);

    const darkFormBg = dark.formBackground || '#1F2937';
    const darkFieldBg = dark.fieldBackground || '#1F2937';
    styles.push(`--form-dark-bg-color: ${darkFormBg};`);

    const darkPrimaryHover = darkenColor(dark.primary, 15);
    styles.push(`--form-dark-primary-hover: ${darkPrimaryHover};`);

    const darkFieldTextColor = dark.fieldText || dark.text;
    styles.push(`--form-dark-field-border-color: ${darkFieldTextColor}30;`);
    styles.push(`--form-dark-field-focus-border-color: ${dark.primary};`);
    styles.push(`--form-dark-field-bg-color: ${darkFieldBg};`);
    styles.push(`--form-dark-field-focus-bg-color: ${darkFieldBg};`);
    styles.push(`--form-dark-field-text-color: ${darkFieldTextColor};`);
    styles.push(`--form-dark-field-placeholder-color: ${darkFieldTextColor}60;`);

    styles.push(`--form-dark-button-bg-color: ${dark.primary};`);
    styles.push(`--form-dark-button-hover-bg-color: ${darkPrimaryHover};`);
    styles.push(`--form-dark-button-text-color: #FFFFFF;`);

    styles.push(`--form-dark-card-bg-color: ${darkFormBg};`);
    styles.push(`--form-dark-card-border-color: ${darkFieldTextColor}20;`);
  }

  if (appearanceConfig.typography) {
    const typo = appearanceConfig.typography;

    const fontFamily = typo.fontFamily ? FONT_FAMILIES[typo.fontFamily] || FONT_FAMILIES.inter : FONT_FAMILIES.inter;
    styles.push(`--form-font-family: ${fontFamily};`);

    if (typo.questionFontSize) {
      styles.push(`--form-question-font-size: ${FONT_SIZES[typo.questionFontSize] || FONT_SIZES.lg};`);
    }

    if (typo.questionFontWeight) {
      styles.push(`--form-question-font-weight: ${FONT_WEIGHTS[typo.questionFontWeight] || FONT_WEIGHTS.semibold};`);
    }

    if (typo.answerFontSize) {
      styles.push(`--form-answer-font-size: ${FONT_SIZES[typo.answerFontSize] || FONT_SIZES.md};`);
    }

    if (typo.answerFontWeight) {
      styles.push(`--form-answer-font-weight: ${FONT_WEIGHTS[typo.answerFontWeight] || FONT_WEIGHTS.normal};`);
    }

    if (typo.descriptionFontSize) {
      styles.push(`--form-description-font-size: ${FONT_SIZES[typo.descriptionFontSize] || FONT_SIZES.md};`);
    }
  } else {
    styles.push(`--form-font-family: ${FONT_FAMILIES.inter};`);
  }

  if (appearanceConfig.fieldStyle) {
    const field = appearanceConfig.fieldStyle;

    if (field.borderRadius) {
      styles.push(`--form-field-border-radius: ${BORDER_RADIUS[field.borderRadius] || BORDER_RADIUS.md};`);
    }

    if (field.borderWidth) {
      styles.push(`--form-field-border-width: ${field.borderWidth}px;`);
    }

    if (field.inputPadding) {
      styles.push(`--form-field-padding: ${INPUT_SIZES[field.inputPadding] || INPUT_SIZES.md};`);
    }
  }

  if (appearanceConfig.buttonStyle) {
    const button = appearanceConfig.buttonStyle;

    if (button.borderRadius) {
      styles.push(`--form-button-border-radius: ${BORDER_RADIUS[button.borderRadius] || BORDER_RADIUS.md};`);
    }

    if (button.fontWeight) {
      styles.push(`--form-button-font-weight: ${FONT_WEIGHTS[button.fontWeight] || FONT_WEIGHTS.semibold};`);
    }

    if (button.size) {
      const buttonPaddingMap: Record<string, string> = {
        xs: '0.375rem 0.75rem',
        sm: '0.5rem 1rem',
        md: '0.625rem 1.5rem',
        lg: '0.75rem 2rem'
      };
      styles.push(`--form-button-padding: ${buttonPaddingMap[button.size] || buttonPaddingMap.md};`);

      const buttonFontSizeMap: Record<string, string> = {
        xs: '13px',
        sm: '14px',
        md: '16px',
        lg: '18px'
      };
      styles.push(`--form-button-font-size: ${buttonFontSizeMap[button.size] || buttonFontSizeMap.md};`);

      const choiceButtonPaddingMap: Record<string, string> = {
        xs: '6px 10px',
        sm: '8px 12px',
        md: '10px 16px',
        lg: '12px 20px'
      };
      styles.push(`--form-choice-button-padding: ${choiceButtonPaddingMap[button.size] || choiceButtonPaddingMap.md};`);

      const choiceButtonFontSizeMap: Record<string, string> = {
        xs: '12px',
        sm: '13px',
        md: '14px',
        lg: '15px'
      };
      styles.push(`--form-choice-button-font-size: ${choiceButtonFontSizeMap[button.size] || choiceButtonFontSizeMap.md};`);

      const ratingButtonSizeMap: Record<string, string> = {
        xs: '32px',
        sm: '36px',
        md: '40px',
        lg: '48px'
      };
      styles.push(`--form-rating-button-size: ${ratingButtonSizeMap[button.size] || ratingButtonSizeMap.md};`);
    }
  }

  if (appearanceConfig.spacing) {
    const spacing = appearanceConfig.spacing;

    if (spacing.questionSpacing) {
      styles.push(`--form-question-spacing: ${SPACING[spacing.questionSpacing] || SPACING.normal};`);
    }

    if (spacing.sectionSpacing) {
      styles.push(`--form-section-spacing: ${SPACING[spacing.sectionSpacing] || SPACING.normal};`);
    }
  }

  if (appearanceConfig.cardStyle) {
    const card = appearanceConfig.cardStyle;

    if (card.backgroundColor) {
      styles.push(`--form-card-bg-color: ${card.backgroundColor};`);
    }

    if (card.borderColor) {
      styles.push(`--form-card-border-color: ${card.borderColor};`);
    }

    if (card.borderWidth) {
      styles.push(`--form-card-border-width: ${card.borderWidth}px;`);
    }

    if (card.borderRadius) {
      styles.push(`--form-card-border-radius: ${BORDER_RADIUS[card.borderRadius] || BORDER_RADIUS.lg};`);
    }

    if (card.shadow) {
      styles.push(`--form-card-shadow: ${SHADOWS[card.shadow] || SHADOWS.sm};`);
    }

    if (card.padding) {
      styles.push(`--form-card-padding: ${SPACING[card.padding] || SPACING.md};`);
    }
  }

  return styles.join(' ');
}

export function generateFormStylesheet(
  appearanceConfig?: FormAppearanceConfig,
  _layoutConfig?: FormLayoutConfig
): string {
  if (!appearanceConfig?.theme) {
    return '';
  }

  const cssRules: string[] = [];

  if (appearanceConfig.theme.enableDarkMode && appearanceConfig.theme.dark) {
    const dark = appearanceConfig.theme.dark;
    const darkPrimaryHover = darkenColor(dark.primary, 15);
    const darkFormBg = dark.formBackground || '#1F2937';
    const darkFieldBg = dark.fieldBackground || '#1F2937';
    const darkFieldTextColor = dark.fieldText || dark.text;

    cssRules.push(`
      .dark [data-form-theme],
      [data-theme="dark"] [data-form-theme],
      html.dark [data-form-theme],
      [data-form-theme].dark,
      [data-form-theme][data-theme="dark"] {
        --form-primary-color: ${dark.primary};
        --form-text-color: ${dark.text};
        --form-bg-color: ${darkFormBg};
        --form-primary-hover: ${darkPrimaryHover};
        --form-field-border-color: ${darkFieldTextColor}30;
        --form-field-focus-border-color: ${dark.primary};
        --form-field-bg-color: ${darkFieldBg};
        --form-field-focus-bg-color: ${darkFieldBg};
        --form-field-text-color: ${darkFieldTextColor};
        --form-field-placeholder-color: ${darkFieldTextColor}60;
        --form-button-bg-color: ${dark.primary};
        --form-button-hover-bg-color: ${darkPrimaryHover};
        --form-button-text-color: #FFFFFF;
        --form-card-bg-color: ${darkFormBg};
        --form-card-border-color: ${darkFieldTextColor}20;
      }
    `);
  }

  return cssRules.join('\n');
}

export function getFieldStyleClasses(appearanceConfig?: FormAppearanceConfig): string {
  if (!appearanceConfig?.fieldStyle) return '';

  const classes: string[] = [];
  const style = appearanceConfig.fieldStyle.style;

  switch (style) {
    case 'underline':
      classes.push('border-0 border-b-2 rounded-none bg-transparent');
      break;
    case 'filled':
      classes.push('border-0 bg-gray-100 dark:bg-gray-800');
      break;
    case 'outlined':
      classes.push('border-2');
      break;
    default:
      break;
  }

  return classes.join(' ');
}

export function getButtonStyleClasses(appearanceConfig?: FormAppearanceConfig): string {
  if (!appearanceConfig?.buttonStyle) return '';

  const classes: string[] = [];

  if (appearanceConfig.buttonStyle.fullWidth) {
    classes.push('w-full');
  }

  return classes.join(' ');
}

export function generateBackgroundStyles(layoutConfig?: FormLayoutConfig): Record<string, string> {
  if (!layoutConfig?.background || layoutConfig.background.type === 'none') {
    return {};
  }

  const bg = layoutConfig.background;
  const styles: Record<string, string> = {};

  switch (bg.type) {
    case 'color':
      if (bg.value) {
        styles.backgroundColor = bg.value;
      }
      break;
    case 'image':
      if (bg.value) {
        const safeUrl = sanitizeCSSUrl(bg.value);
        if (!safeUrl) break;
        if (bg.overlay) {
          const overlayOpacity = (bg.overlayOpacity || 50) / 100;
          styles.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), url('${safeUrl}')`;
        } else {
          styles.backgroundImage = `url('${safeUrl}')`;
        }
        styles.backgroundSize = bg.backgroundSize || 'cover';
        styles.backgroundPosition = 'center';
        styles.backgroundRepeat = 'no-repeat';
      }
      break;
    case 'gradient':
      if (bg.value) {
        if (bg.overlay) {
          const overlayOpacity = (bg.overlayOpacity || 50) / 100;
          styles.backgroundImage = `linear-gradient(rgba(0, 0, 0, ${overlayOpacity}), rgba(0, 0, 0, ${overlayOpacity})), ${bg.value}`;
        } else {
          styles.backgroundImage = bg.value;
        }
      }
      break;
  }

  if (bg.opacity !== undefined && bg.opacity < 100) {
    styles.opacity = (bg.opacity / 100).toString();
  }

  return styles;
}

export function generateSplitLayoutStyles(layoutConfig?: FormLayoutConfig): Record<string, string> {
  if (!layoutConfig?.splitLayout) {
    return {};
  }

  const split = layoutConfig.splitLayout;
  const styles: Record<string, string> = {};

  switch (split.mediaType) {
    case 'color':
      if (split.backgroundColor) {
        styles.backgroundColor = split.backgroundColor;
      }
      break;
    case 'image':
      if (split.mediaUrl) {
        const safeSplitUrl = sanitizeCSSUrl(split.mediaUrl);
        if (!safeSplitUrl) break;
        styles.backgroundImage = `url('${safeSplitUrl}')`;
        styles.backgroundSize = 'cover';
        styles.backgroundPosition = 'center';
        styles.backgroundRepeat = 'no-repeat';
      }
      break;
    case 'gradient':
      if (split.gradient) {
        const { from, to, direction } = split.gradient;
        const gradientMap: Record<string, string> = {
          'to-r': 'to right',
          'to-l': 'to left',
          'to-t': 'to top',
          'to-b': 'to bottom',
          'to-br': 'to bottom right',
          'to-bl': 'to bottom left'
        };
        styles.backgroundImage = `linear-gradient(${gradientMap[direction] || 'to bottom right'}, ${from}, ${to})`;
      }
      break;
  }

  return styles;
}
