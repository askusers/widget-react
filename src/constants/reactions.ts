import React from 'react';

/**
 * Available reaction emojis for reaction-type questions.
 * Uses inline SVGs instead of lucide-react for zero external icon dependencies.
 */
export interface ReactionEmoji {
  emoji: string;
  label: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

function createIcon(pathD: string): React.FC<React.SVGProps<SVGSVGElement>> {
  const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) =>
    React.createElement('svg', {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      ...props,
    }, React.createElement('path', { d: pathD }));
  return Icon;
}

const ThumbsUpIcon = createIcon('M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3');
const ThumbsDownIcon = createIcon('M10 15V19A3 3 0 0 0 13 22L17 13V2H5.72A2 2 0 0 0 3.72 3.7L2.34 12.7A2 2 0 0 0 4.34 15ZM17 2H20A2 2 0 0 1 22 4V11A2 2 0 0 1 20 13H17');
const HeartIcon = createIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
const SmileIcon = createIcon('M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01');
const MehIcon = createIcon('M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10zM8 15h8M9 9h.01M15 9h.01');
const FrownIcon = createIcon('M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10zM16 16s-1.5-2-4-2-4 2-4 2M9 9h.01M15 9h.01');
const HeartHandshakeIcon = createIcon('M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z');
const AngryIcon = createIcon('M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10zM16 16s-1.5-2-4-2-4 2-4 2M7.5 8l2 1M16.5 8l-2 1');
const PartyIcon = createIcon('M5.8 11.3 2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12v.01c.09.6-.032 1.216-.352 1.738a2.897 2.897 0 0 1-4.073.97l-.025-.018c-.532-.396-1.2-.567-1.87-.467a2.9 2.9 0 0 0-2.39 2.44l-.13.8');
const FlameIcon = createIcon('M12 12c2-2.96 0-7-1-8 0 3.038-1.773 4.741-3 6-1.226 1.26-2 3.24-2 5a6 6 0 1 0 12 0c0-1.532-1.056-3.94-2-5-1.786 3-2.791 3-4 2z');
const StarIcon = createIcon('M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z');
const CheckIcon = createIcon('M20 6L9 17l-5-5');
const XIcon = createIcon('M18 6L6 18M6 6l12 12');
const TrendingUpIcon = createIcon('M23 6l-9.5 9.5-5-5L1 18');
const HandIcon = createIcon('M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10V6a2 2 0 0 0-4 0v8l-1.46-1.46a2 2 0 0 0-2.83 2.83L8 21.73A5 5 0 0 0 11.5 23H14a6 6 0 0 0 6-6v-6a2 2 0 0 0-4 0v1');

export const REACTION_EMOJIS: ReactionEmoji[] = [
  { emoji: '\u{1F44D}', label: 'Thumbs Up', value: 'thumbs_up', icon: ThumbsUpIcon },
  { emoji: '\u{1F44E}', label: 'Thumbs Down', value: 'thumbs_down', icon: ThumbsDownIcon },
  { emoji: '\u{2764}\u{FE0F}', label: 'Heart', value: 'heart', icon: HeartIcon },
  { emoji: '\u{1F600}', label: 'Happy', value: 'happy', icon: SmileIcon },
  { emoji: '\u{1F610}', label: 'Neutral', value: 'neutral', icon: MehIcon },
  { emoji: '\u{1F61E}', label: 'Sad', value: 'sad', icon: FrownIcon },
  { emoji: '\u{1F60D}', label: 'Love It', value: 'love_it', icon: HeartHandshakeIcon },
  { emoji: '\u{1F621}', label: 'Angry', value: 'angry', icon: AngryIcon },
  { emoji: '\u{1F389}', label: 'Celebrate', value: 'celebrate', icon: PartyIcon },
  { emoji: '\u{1F525}', label: 'Fire', value: 'fire', icon: FlameIcon },
  { emoji: '\u{2B50}', label: 'Star', value: 'star', icon: StarIcon },
  { emoji: '\u{2705}', label: 'Check', value: 'check', icon: CheckIcon },
  { emoji: '\u{274C}', label: 'Cross', value: 'cross', icon: XIcon },
  { emoji: '\u{1F4AF}', label: '100', value: 'hundred', icon: TrendingUpIcon },
  { emoji: '\u{1F44F}', label: 'Clap', value: 'clap', icon: HandIcon },
];

export const getReactionByValue = (value: string): ReactionEmoji | undefined => {
  return REACTION_EMOJIS.find(r => r.value === value);
};

export const getReactionByEmoji = (emoji: string): ReactionEmoji | undefined => {
  return REACTION_EMOJIS.find(r => r.emoji === emoji);
};
