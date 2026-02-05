import { describe, it, expect } from 'vitest';
import React from 'react';
import { REACTION_EMOJIS, getReactionByValue, getReactionByEmoji } from '../src/constants/reactions';

describe('reactions', () => {
  describe('REACTION_EMOJIS', () => {
    it('has exactly 15 items', () => {
      expect(REACTION_EMOJIS).toHaveLength(15);
    });

    it('each item has emoji, label, value, and icon properties', () => {
      REACTION_EMOJIS.forEach(reaction => {
        expect(reaction.emoji).toBeTruthy();
        expect(typeof reaction.emoji).toBe('string');
        expect(reaction.label).toBeTruthy();
        expect(typeof reaction.label).toBe('string');
        expect(reaction.value).toBeTruthy();
        expect(typeof reaction.value).toBe('string');
        expect(reaction.icon).toBeDefined();
        expect(typeof reaction.icon).toBe('function');
      });
    });

    it('has unique values for each reaction', () => {
      const values = REACTION_EMOJIS.map(r => r.value);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(15);
    });

    it('has unique emojis for each reaction', () => {
      const emojis = REACTION_EMOJIS.map(r => r.emoji);
      const uniqueEmojis = new Set(emojis);
      expect(uniqueEmojis.size).toBe(15);
    });

    it('icon components are valid React components', () => {
      REACTION_EMOJIS.forEach(reaction => {
        // Each icon is a React.FC - it's a function that accepts props
        const element = React.createElement(reaction.icon, { width: 24, height: 24 });
        expect(element).toBeDefined();
        expect(element.type).toBe(reaction.icon);
      });
    });
  });

  describe('getReactionByValue', () => {
    it('finds reaction by value', () => {
      const reaction = getReactionByValue('thumbs_up');
      expect(reaction).toBeDefined();
      expect(reaction?.label).toBe('Thumbs Up');
    });

    it('finds heart reaction by value', () => {
      const reaction = getReactionByValue('heart');
      expect(reaction).toBeDefined();
      expect(reaction?.label).toBe('Heart');
    });

    it('returns undefined for unknown value', () => {
      expect(getReactionByValue('nonexistent')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getReactionByValue('')).toBeUndefined();
    });
  });

  describe('getReactionByEmoji', () => {
    it('finds reaction by emoji', () => {
      const reaction = getReactionByEmoji('\u{1F44D}');
      expect(reaction).toBeDefined();
      expect(reaction?.value).toBe('thumbs_up');
    });

    it('finds heart reaction by emoji', () => {
      const reaction = getReactionByEmoji('\u{2764}\u{FE0F}');
      expect(reaction).toBeDefined();
      expect(reaction?.value).toBe('heart');
    });

    it('returns undefined for unknown emoji', () => {
      expect(getReactionByEmoji('\u{1F47B}')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getReactionByEmoji('')).toBeUndefined();
    });
  });
});
