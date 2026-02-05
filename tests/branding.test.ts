import { describe, it, expect } from 'vitest';
import { getBrandingStyles, applyBrandingStyles, generateBrandingCSS } from '../src/utils/branding';
import type { CustomBranding } from '../src/types/index';

describe('branding utilities', () => {
  describe('getBrandingStyles', () => {
    it('returns default color scheme when no branding is provided', () => {
      const styles = getBrandingStyles(undefined, 'light');
      expect(styles.colors.primary).toBe('#3b82f6');
      expect(styles.showPoweredBy).toBe(true);
    });

    it('returns default color scheme for unknown scheme id', () => {
      const branding: CustomBranding = { colorScheme: 'nonexistent' };
      const styles = getBrandingStyles(branding, 'light');
      // Falls back to default when unknown
      expect(styles.colors.primary).toBe('#3b82f6');
    });

    it('returns specified color scheme', () => {
      const branding: CustomBranding = { colorScheme: 'modern' };
      const styles = getBrandingStyles(branding, 'light');
      expect(styles.colors.primary).toBe('#8b5cf6');
    });

    it('applies dark theme colors when forceTheme is dark', () => {
      const styles = getBrandingStyles(undefined, 'dark');
      expect(styles.colors.primary).toBe('#60a5fa');
      expect(styles.colors.background).toBe('#0f172a');
    });

    it('overrides individual colors with customColors', () => {
      const branding: CustomBranding = {
        colorScheme: 'default',
        customColors: {
          primary: '#ff0000',
          text: '#00ff00',
        },
      };
      const styles = getBrandingStyles(branding, 'light');
      expect(styles.colors.primary).toBe('#ff0000');
      expect(styles.colors.text).toBe('#00ff00');
      // Non-overridden colors stay from scheme
      expect(styles.colors.background).toBe('#ffffff');
    });

    it('includes customCSS when provided', () => {
      const branding: CustomBranding = {
        colorScheme: 'default',
        customCSS: '.my-class { color: red; }',
      };
      const styles = getBrandingStyles(branding, 'light');
      expect(styles.customCSS).toBe('.my-class { color: red; }');
    });

    it('includes companyName when provided', () => {
      const branding: CustomBranding = {
        colorScheme: 'default',
        companyName: 'Acme Corp',
      };
      const styles = getBrandingStyles(branding, 'light');
      expect(styles.companyName).toBe('Acme Corp');
    });

    it('sets showPoweredBy to false when branding sets it', () => {
      const branding: CustomBranding = {
        colorScheme: 'default',
        showPoweredBy: false,
      };
      const styles = getBrandingStyles(branding, 'light');
      expect(styles.showPoweredBy).toBe(false);
    });

    it('defaults showPoweredBy to true when not explicitly set', () => {
      const branding: CustomBranding = { colorScheme: 'default' };
      const styles = getBrandingStyles(branding, 'light');
      expect(styles.showPoweredBy).toBe(true);
    });
  });

  describe('applyBrandingStyles', () => {
    it('returns CSS properties with all color variables', () => {
      const styles = getBrandingStyles(undefined, 'light');
      const cssProps = applyBrandingStyles(styles);
      expect(cssProps['--primary']).toBe('#3b82f6');
      expect(cssProps['--primary-hover']).toBe('#2563eb');
      expect(cssProps['--secondary']).toBe('#e0e7ff');
      expect(cssProps['--background']).toBe('#ffffff');
      expect(cssProps['--background-secondary']).toBe('#f8fafc');
      expect(cssProps['--text']).toBe('#111827');
      expect(cssProps['--text-secondary']).toBe('#6b7280');
      expect(cssProps['--border']).toBe('#e5e7eb');
    });
  });

  describe('generateBrandingCSS', () => {
    it('generates CSS string with color variables', () => {
      const styles = getBrandingStyles(undefined, 'light');
      const css = generateBrandingCSS(styles);
      expect(css).toContain('--primary: #3b82f6');
      expect(css).toContain('--background: #ffffff');
      expect(css).toContain('.askusers-survey-widget-container');
    });

    it('includes customCSS in generated CSS', () => {
      const branding: CustomBranding = {
        colorScheme: 'default',
        customCSS: '.custom { margin: 10px; }',
      };
      const styles = getBrandingStyles(branding, 'light');
      const css = generateBrandingCSS(styles);
      expect(css).toContain('.custom { margin: 10px; }');
    });

    it('does not include customCSS when not provided', () => {
      const styles = getBrandingStyles(undefined, 'light');
      const css = generateBrandingCSS(styles);
      // The CSS should still be valid even without customCSS
      expect(css).toContain('.askusers-survey-widget-container');
    });
  });
});
