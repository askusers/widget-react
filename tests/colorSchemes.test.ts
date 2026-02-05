import { describe, it, expect } from 'vitest';
import { colorSchemes, getColorScheme, getDefaultColorScheme, type ColorPalette } from '../src/constants/colorSchemes';

describe('colorSchemes', () => {
  const expectedSchemeIds = [
    'default', 'modern', 'nature', 'sunset',
    'ocean', 'minimal', 'corporate', 'vibrant', 'dark',
  ];

  const requiredColorProperties: (keyof ColorPalette)[] = [
    'primary', 'primaryHover', 'secondary',
    'background', 'backgroundSecondary',
    'text', 'textSecondary', 'border',
    'success', 'error', 'warning', 'info',
  ];

  it('has exactly 9 color schemes', () => {
    expect(colorSchemes).toHaveLength(9);
  });

  it('contains all expected scheme ids', () => {
    const ids = colorSchemes.map(s => s.id);
    expectedSchemeIds.forEach(id => {
      expect(ids).toContain(id);
    });
  });

  describe('each scheme has required structure', () => {
    colorSchemes.forEach(scheme => {
      describe(`scheme: ${scheme.id}`, () => {
        it('has id, name, and description', () => {
          expect(scheme.id).toBeTruthy();
          expect(scheme.name).toBeTruthy();
          expect(scheme.description).toBeTruthy();
        });

        it('has preview with isDark boolean', () => {
          expect(typeof scheme.preview.isDark).toBe('boolean');
        });

        it('has light palette with all required color properties', () => {
          requiredColorProperties.forEach(prop => {
            expect(scheme.colors.light[prop]).toBeTruthy();
            expect(typeof scheme.colors.light[prop]).toBe('string');
          });
        });

        it('has dark palette with all required color properties', () => {
          requiredColorProperties.forEach(prop => {
            expect(scheme.colors.dark[prop]).toBeTruthy();
            expect(typeof scheme.colors.dark[prop]).toBe('string');
          });
        });
      });
    });
  });

  describe('getColorScheme', () => {
    it('returns correct scheme by id', () => {
      const scheme = getColorScheme('modern');
      expect(scheme).toBeDefined();
      expect(scheme?.name).toBe('Modern Purple');
    });

    it('returns correct scheme for each known id', () => {
      expectedSchemeIds.forEach(id => {
        const scheme = getColorScheme(id);
        expect(scheme).toBeDefined();
        expect(scheme?.id).toBe(id);
      });
    });

    it('returns undefined for unknown id', () => {
      expect(getColorScheme('nonexistent')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getColorScheme('')).toBeUndefined();
    });
  });

  describe('getDefaultColorScheme', () => {
    it('returns Professional Blue', () => {
      const scheme = getDefaultColorScheme();
      expect(scheme.id).toBe('default');
      expect(scheme.name).toBe('Professional Blue');
    });

    it('has valid light and dark palettes', () => {
      const scheme = getDefaultColorScheme();
      expect(scheme.colors.light.primary).toBe('#3b82f6');
      expect(scheme.colors.dark.primary).toBe('#60a5fa');
    });
  });
});
