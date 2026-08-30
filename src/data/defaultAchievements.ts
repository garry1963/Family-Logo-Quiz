import { AchievementRecord } from '../types';

export const DEFAULT_ACHIEVEMENTS: AchievementRecord[] = [
  {
    achievementId: 'first_logo',
    name: 'First Discovery',
    description: 'Solve your very first logo puzzle.',
    icon: 'Sparkles',
    category: 'progress',
    target: 1
  },
  {
    achievementId: 'getting_started',
    name: 'Getting Started',
    description: 'Solve 25 logo puzzles across any category.',
    icon: 'Compass',
    category: 'progress',
    target: 25
  },
  {
    achievementId: 'logo_fan',
    name: 'Logo Fan',
    description: 'Solve 100 logo puzzles.',
    icon: 'Heart',
    category: 'progress',
    target: 100
  },
  {
    achievementId: 'brand_expert',
    name: 'Brand Expert',
    description: 'Solve 250 logo puzzles.',
    icon: 'Award',
    category: 'progress',
    target: 250
  },
  {
    achievementId: 'logo_master',
    name: 'Logo Master',
    description: 'Solve 500 logo puzzles and become a legend.',
    icon: 'Crown',
    category: 'progress',
    target: 500
  },
  {
    achievementId: 'perfect_level',
    name: 'Sharp Eye',
    description: 'Complete any level without using a single hint.',
    icon: 'Eye',
    category: 'mastery',
    target: 1
  },
  {
    achievementId: 'no_help_needed',
    name: 'No Help Needed',
    description: 'Solve 10 consecutive logos in a row without using hints.',
    icon: 'Zap',
    category: 'mastery',
    target: 10
  },
  {
    achievementId: 'daily_player',
    name: 'Daily Player',
    description: 'Complete 7 Daily Challenges.',
    icon: 'Calendar',
    category: 'streak',
    target: 7
  },
  {
    achievementId: 'streak_master',
    name: 'Streak Master',
    description: 'Maintain a 14-day Daily Challenge streak.',
    icon: 'Flame',
    category: 'streak',
    target: 14
  },
  {
    achievementId: 'food_drink_pro',
    name: 'Foodie Connoisseur',
    description: 'Solve 20 logos in Food & Drink Mode.',
    icon: 'Utensils',
    category: 'mode',
    target: 20
  },
  {
    achievementId: 'color_detective',
    name: 'Colour Detective',
    description: 'Identify 15 brands in Guess the Colour Mode.',
    icon: 'Palette',
    category: 'mode',
    target: 15
  },
  {
    achievementId: 'retro_historian',
    name: 'Retro Historian',
    description: 'Solve 15 historical vintage logos in Retro Mode.',
    icon: 'History',
    category: 'mode',
    target: 15
  },
  {
    achievementId: 'slogan_scholar',
    name: 'Slogan Scholar',
    description: 'Correctly identify 15 brand slogans.',
    icon: 'Quote',
    category: 'mode',
    target: 15
  },
  {
    achievementId: 'minimalist_vision',
    name: 'Minimalist Vision',
    description: 'Solve 15 stripped-back logos in Minimalist Mode.',
    icon: 'Layers',
    category: 'mode',
    target: 15
  },
  {
    achievementId: 'game_night_champion',
    name: 'Game Night Champion',
    description: 'Participate in and win a Family Game Night competition.',
    icon: 'Trophy',
    category: 'mastery',
    target: 1
  }
];
