import { describe, it, expect } from 'vitest';
import {
  generateFormStyles,
  generateFormStylesheet,
  getFieldStyleClasses,
  getButtonStyleClasses,
  generateSplitLayoutStyles,
} from '../src/utils/formStyles';
import type { FormAppearanceConfig, FormLayoutConfig } from '../src/types/index';

describe('formStyles utilities', () => {
  describe('generateFormStyles', () => {
    it('returns default font family when no config provided', () => {
      const styles = generateFormStyles();
      expect(styles).toContain('--form-font-family:');
      expect(styles).toContain('Inter');
    });

    it('returns default font family when config is undefined', () => {
      const styles = generateFormStyles(undefined);
      expect(styles).toContain('Inter');
    });

    it('generates typography styles', () => {
      const config: FormAppearanceConfig = {
        typography: {
          fontFamily: 'roboto',
          questionFontSize: 'lg',
          questionFontWeight: 'bold',
          answerFontSize: 'md',
          answerFontWeight: 'normal',
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('Roboto');
      expect(styles).toContain('--form-question-font-size: 1.125rem');
      expect(styles).toContain('--form-question-font-weight: 700');
      expect(styles).toContain('--form-answer-font-size: 1rem');
      expect(styles).toContain('--form-answer-font-weight: 400');
    });

    it('generates description font size', () => {
      const config: FormAppearanceConfig = {
        typography: {
          fontFamily: 'inter',
          questionFontSize: 'lg',
          questionFontWeight: 'semibold',
          answerFontSize: 'md',
          answerFontWeight: 'normal',
          descriptionFontSize: 'sm',
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('--form-description-font-size: 0.875rem');
    });

    it('generates field styles', () => {
      const config: FormAppearanceConfig = {
        fieldStyle: {
          style: 'outlined',
          borderRadius: 'lg',
          borderWidth: '2',
          inputSize: 'md',
          inputPadding: 'lg',
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('--form-field-border-radius: 0.5rem');
      expect(styles).toContain('--form-field-border-width: 2px');
      expect(styles).toContain('--form-field-padding: 0.75rem 1.25rem');
    });

    it('generates button styles', () => {
      const config: FormAppearanceConfig = {
        buttonStyle: {
          borderRadius: 'full',
          size: 'lg',
          fontWeight: 'bold',
          fullWidth: true,
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('--form-button-border-radius: 9999px');
      expect(styles).toContain('--form-button-font-weight: 700');
      expect(styles).toContain('--form-button-padding:');
      expect(styles).toContain('--form-button-font-size: 18px');
    });

    it('generates spacing styles', () => {
      const config: FormAppearanceConfig = {
        spacing: {
          questionSpacing: 'relaxed',
          sectionSpacing: 'loose',
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('--form-question-spacing: 1.5rem');
      expect(styles).toContain('--form-section-spacing: 2rem');
    });

    it('generates card styles', () => {
      const config: FormAppearanceConfig = {
        cardStyle: {
          borderWidth: '2',
          borderRadius: 'lg',
          shadow: 'md',
          padding: 'lg',
          backgroundColor: '#f0f0f0',
          borderColor: '#cccccc',
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('--form-card-bg-color: #f0f0f0');
      expect(styles).toContain('--form-card-border-color: #cccccc');
      expect(styles).toContain('--form-card-border-width: 2px');
      expect(styles).toContain('--form-card-border-radius: 0.5rem');
      expect(styles).toContain('--form-card-shadow:');
      expect(styles).toContain('--form-card-padding:');
    });

    it('generates light theme color variables', () => {
      const config: FormAppearanceConfig = {
        theme: {
          light: {
            primary: '#ff0000',
            text: '#111111',
            fieldText: '#222222',
            fieldBackground: '#ffffff',
            formBackground: '#fafafa',
          },
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('--form-primary-color: #ff0000');
      expect(styles).toContain('--form-text-color: #111111');
      expect(styles).toContain('--form-bg-color: #fafafa');
      expect(styles).toContain('--form-field-bg-color: #ffffff');
      expect(styles).toContain('--form-field-text-color: #222222');
    });

    it('generates dark theme color variables when dark mode enabled', () => {
      const config: FormAppearanceConfig = {
        theme: {
          enableDarkMode: true,
          dark: {
            primary: '#60a5fa',
            text: '#f1f5f9',
            fieldText: '#e2e8f0',
            fieldBackground: '#1e293b',
            formBackground: '#0f172a',
          },
        },
      };
      const styles = generateFormStyles(config);
      expect(styles).toContain('--form-dark-primary-color: #60a5fa');
      expect(styles).toContain('--form-dark-text-color: #f1f5f9');
      expect(styles).toContain('--form-dark-bg-color: #0f172a');
    });
  });

  describe('generateFormStylesheet', () => {
    it('returns empty string when no theme config', () => {
      expect(generateFormStylesheet()).toBe('');
      expect(generateFormStylesheet({})).toBe('');
    });

    it('returns empty string when dark mode is not enabled', () => {
      const config: FormAppearanceConfig = {
        theme: {
          enableDarkMode: false,
          dark: {
            primary: '#60a5fa',
            text: '#f1f5f9',
            fieldText: '#e2e8f0',
            fieldBackground: '#1e293b',
            formBackground: '#0f172a',
          },
        },
      };
      expect(generateFormStylesheet(config)).toBe('');
    });

    it('generates dark mode CSS when enabled', () => {
      const config: FormAppearanceConfig = {
        theme: {
          enableDarkMode: true,
          dark: {
            primary: '#60a5fa',
            text: '#f1f5f9',
            fieldText: '#e2e8f0',
            fieldBackground: '#1e293b',
            formBackground: '#0f172a',
          },
        },
      };
      const css = generateFormStylesheet(config);
      expect(css).toContain('.dark [data-form-theme]');
      expect(css).toContain('[data-theme="dark"] [data-form-theme]');
      expect(css).toContain('--form-primary-color: #60a5fa');
      expect(css).toContain('--form-field-text-color: #e2e8f0');
    });
  });

  describe('getFieldStyleClasses', () => {
    it('returns empty string when no config', () => {
      expect(getFieldStyleClasses()).toBe('');
      expect(getFieldStyleClasses({})).toBe('');
    });

    it('returns underline classes', () => {
      const config: FormAppearanceConfig = {
        fieldStyle: {
          style: 'underline',
          borderRadius: 'md',
          borderWidth: '1',
          inputSize: 'md',
          inputPadding: 'md',
        },
      };
      const classes = getFieldStyleClasses(config);
      expect(classes).toContain('border-0');
      expect(classes).toContain('border-b-2');
      expect(classes).toContain('rounded-none');
      expect(classes).toContain('bg-transparent');
    });

    it('returns filled classes', () => {
      const config: FormAppearanceConfig = {
        fieldStyle: {
          style: 'filled',
          borderRadius: 'md',
          borderWidth: '1',
          inputSize: 'md',
          inputPadding: 'md',
        },
      };
      const classes = getFieldStyleClasses(config);
      expect(classes).toContain('border-0');
      expect(classes).toContain('bg-gray-100');
    });

    it('returns outlined classes', () => {
      const config: FormAppearanceConfig = {
        fieldStyle: {
          style: 'outlined',
          borderRadius: 'md',
          borderWidth: '1',
          inputSize: 'md',
          inputPadding: 'md',
        },
      };
      const classes = getFieldStyleClasses(config);
      expect(classes).toContain('border-2');
    });

    it('returns empty string for default style', () => {
      const config: FormAppearanceConfig = {
        fieldStyle: {
          style: 'default',
          borderRadius: 'md',
          borderWidth: '1',
          inputSize: 'md',
          inputPadding: 'md',
        },
      };
      expect(getFieldStyleClasses(config)).toBe('');
    });
  });

  describe('getButtonStyleClasses', () => {
    it('returns empty string when no config', () => {
      expect(getButtonStyleClasses()).toBe('');
      expect(getButtonStyleClasses({})).toBe('');
    });

    it('returns w-full when fullWidth is true', () => {
      const config: FormAppearanceConfig = {
        buttonStyle: {
          borderRadius: 'md',
          size: 'md',
          fontWeight: 'semibold',
          fullWidth: true,
        },
      };
      expect(getButtonStyleClasses(config)).toContain('w-full');
    });

    it('returns empty string when fullWidth is false', () => {
      const config: FormAppearanceConfig = {
        buttonStyle: {
          borderRadius: 'md',
          size: 'md',
          fontWeight: 'semibold',
          fullWidth: false,
        },
      };
      expect(getButtonStyleClasses(config)).toBe('');
    });
  });

  describe('generateSplitLayoutStyles', () => {
    it('returns empty object when no config', () => {
      expect(generateSplitLayoutStyles()).toEqual({});
      expect(generateSplitLayoutStyles({})).toEqual({});
    });

    it('generates color type styles', () => {
      const config: FormLayoutConfig = {
        layoutType: 'split',
        splitLayout: {
          mediaPosition: 'left',
          mediaWidth: '50%',
          mediaType: 'color',
          backgroundColor: '#ff0000',
        },
      };
      const styles = generateSplitLayoutStyles(config);
      expect(styles.backgroundColor).toBe('#ff0000');
    });

    it('generates image type styles', () => {
      const config: FormLayoutConfig = {
        layoutType: 'split',
        splitLayout: {
          mediaPosition: 'left',
          mediaWidth: '50%',
          mediaType: 'image',
          mediaUrl: 'https://example.com/image.jpg',
        },
      };
      const styles = generateSplitLayoutStyles(config);
      expect(styles.backgroundImage).toContain("url('https://example.com/image.jpg')");
      expect(styles.backgroundSize).toBe('cover');
      expect(styles.backgroundPosition).toBe('center');
    });

    it('generates gradient type styles', () => {
      const config: FormLayoutConfig = {
        layoutType: 'split',
        splitLayout: {
          mediaPosition: 'right',
          mediaWidth: '40%',
          mediaType: 'gradient',
          gradient: {
            from: '#ff0000',
            to: '#0000ff',
            direction: 'to-r',
          },
        },
      };
      const styles = generateSplitLayoutStyles(config);
      expect(styles.backgroundImage).toContain('linear-gradient(to right, #ff0000, #0000ff)');
    });

    it('handles gradient with different directions', () => {
      const config: FormLayoutConfig = {
        layoutType: 'split',
        splitLayout: {
          mediaPosition: 'left',
          mediaWidth: '50%',
          mediaType: 'gradient',
          gradient: {
            from: '#ff0000',
            to: '#0000ff',
            direction: 'to-br',
          },
        },
      };
      const styles = generateSplitLayoutStyles(config);
      expect(styles.backgroundImage).toContain('to bottom right');
    });
  });
});
