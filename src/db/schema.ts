// src/db/schema.ts
import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Users table authenticated via Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  photoUrl: text('photo_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
});

// Categories table
export const categories = pgTable('categories', {
  categoryId: text('category_id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull().default(''),
  iconName: text('icon_name').notNull().default('Tag'),
  iconEmoji: text('icon_emoji'),
  color: text('color').notNull().default('from-blue-600 to-cyan-500'),
  sortOrder: integer('sort_order').notNull().default(0),
  active: boolean('active').notNull().default(true),
  defaultDifficulty: text('default_difficulty').notNull().default('Easy'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Logos table (Vector SVG and Game Content)
export const logos = pgTable('logos', {
  logoId: text('logo_id').primaryKey(),
  brandName: text('brand_name').notNull(),
  acceptedAnswers: jsonb('accepted_answers').notNull().$type<string[]>(),
  alternativeSpellings: jsonb('alternative_spellings').$type<string[]>(),
  categoryId: text('category_id').notNull().references(() => categories.categoryId),
  subCategory: text('sub_category'),
  difficulty: text('difficulty').notNull().default('Easy'),
  levelNumber: integer('level_number').notNull().default(1),
  imageSvg: text('image_svg'),
  imageUrl: text('image_url'),
  historicImageUrl: text('historic_image_url'),
  historicImageSvg: text('historic_image_svg'),
  historicEra: text('historic_era'),
  minimalistImageSvg: text('minimalist_image_svg'),
  colourChoices: jsonb('colour_choices').$type<{ name: string; hex: string; isCorrect: boolean }[]>(),
  slogan: text('slogan'),
  country: text('country').notNull().default('Global'),
  industry: text('industry').notNull().default('General'),
  foundedYear: integer('founded_year').notNull().default(1990),
  description: text('description').notNull().default(''),
  interestingFact: text('interesting_fact').notNull().default(''),
  website: text('website'),
  active: boolean('active').notNull().default(true),
  gameModes: jsonb('game_modes').notNull().$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Levels definition
export const levels = pgTable('levels', {
  levelId: text('level_id').primaryKey(),
  levelNumber: integer('level_number').notNull().unique(),
  name: text('name').notNull(),
  difficulty: text('difficulty').notNull().default('Easy'),
  unlockRequirement: jsonb('unlock_requirement').notNull().$type<{
    requiredLogosSolved: number;
    requiredPercentage?: number;
    previousLevelCompleted?: boolean;
  }>(),
  active: boolean('active').notNull().default(true),
});

// Profiles table per account
export const profiles = pgTable('profiles', {
  profileId: text('profile_id').primaryKey(),
  userId: text('user_id').notNull(), // maps to users.uid
  displayName: text('display_name').notNull(),
  avatar: text('avatar').notNull().default('👤'),
  difficultyPreference: text('difficulty_preference').notNull().default('Easy'),
  isChildFriendly: boolean('is_child_friendly').notNull().default(false),
  unlimitedHints: boolean('unlimited_hints').notNull().default(false),
  noTimer: boolean('no_timer').notNull().default(false),
  largeText: boolean('large_text').notNull().default(false),
  reducedMotion: boolean('reduced_motion').notNull().default(false),
  easyModeOnly: boolean('easy_mode_only').notNull().default(false),
  hintBalance: integer('hint_balance').notNull().default(25),
  gamePoints: integer('game_points').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastPlayed: timestamp('last_played').defaultNow().notNull(),
});

// Puzzle Progress table
export const puzzleProgress = pgTable('puzzle_progress', {
  id: serial('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.profileId, { onDelete: 'cascade' }),
  logoId: text('logo_id').notNull().references(() => logos.logoId, { onDelete: 'cascade' }),
  solved: boolean('solved').notNull().default(false),
  attempts: integer('attempts').notNull().default(0),
  hintsUsed: integer('hints_used').notNull().default(0),
  hintsRevealedIndices: jsonb('hints_revealed_indices').notNull().$type<number[]>().default([]),
  lettersRemoved: jsonb('letters_removed').notNull().$type<string[]>().default([]),
  categoryClueShown: boolean('category_clue_shown').notNull().default(false),
  solvedAt: timestamp('solved_at'),
  timeSpentSeconds: integer('time_spent_seconds').default(0),
  gameMode: text('game_mode').notNull().default('classic'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Profile Favourites
export const profileFavourites = pgTable('profile_favourites', {
  id: serial('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.profileId, { onDelete: 'cascade' }),
  logoId: text('logo_id').notNull().references(() => logos.logoId, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User Unlocked Achievements
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.profileId, { onDelete: 'cascade' }),
  achievementId: text('achievement_id').notNull(),
  unlockedAt: timestamp('unlocked_at').defaultNow().notNull(),
});

// Daily & Weekly Challenge results
export const challengeResults = pgTable('challenge_results', {
  id: serial('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => profiles.profileId, { onDelete: 'cascade' }),
  challengeType: text('challenge_type').notNull(), // 'daily' | 'weekly'
  periodKey: text('period_key').notNull(), // YYYY-MM-DD or 2026-W35
  solvedCount: integer('solved_count').notNull(),
  totalCount: integer('total_count').notNull(),
  score: integer('score').notNull(),
  accuracy: integer('accuracy').notNull(),
  isPerfect: boolean('is_perfect').notNull().default(false),
  completedAt: timestamp('completed_at').defaultNow().notNull(),
});

// Game Settings
export const appSettings = pgTable('app_settings', {
  userId: text('user_id').primaryKey(),
  settings: jsonb('settings').notNull(),
  adminPin: text('admin_pin').notNull().default('1234'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
