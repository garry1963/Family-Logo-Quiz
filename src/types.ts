export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Nightmare';

export type GameMode = 
  | 'classic'
  | 'food_drink'
  | 'guess_colour'
  | 'retro'
  | 'slogan'
  | 'minimalist'
  | 'expert'
  | 'practice'
  | 'custom_quiz'
  | 'family_night'
  | 'daily'
  | 'weekly';

export type HintType = 'reveal_letter' | 'remove_letters' | 'first_letter' | 'category_clue' | 'reveal_answer';

export interface LogoRecord {
  logoId: string;
  brandName: string;
  acceptedAnswers: string[]; // e.g. ["APPLE", "APPLE INC"]
  alternativeSpellings?: string[];
  categoryId: string;
  subCategory?: string;
  difficulty: Difficulty;
  levelNumber: number; // 1 to 52+
  imageSvg?: string; // High-quality vector representation
  imageUrl?: string;
  historicImageUrl?: string;
  historicImageSvg?: string;
  historicEra?: string; // e.g. "1976 - 1977"
  minimalistImageSvg?: string;
  colourChoices?: { name: string; hex: string; isCorrect: boolean }[]; // for Guess the Colour mode
  slogan?: string; // e.g. "Just Do It" for Slogan Mode
  country: string;
  industry: string;
  foundedYear: number;
  description: string;
  interestingFact: string;
  website?: string;
  active: boolean;
  gameModes: GameMode[];
  dateCreated?: string;
  lastModified?: string;
}

export interface CategoryRecord {
  categoryId: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon identifier
  color: string;
  sortOrder: number;
  active: boolean;
  defaultDifficulty: Difficulty;
}

export interface LevelRecord {
  levelId: string;
  levelNumber: number;
  name: string;
  difficulty: Difficulty;
  unlockRequirement: {
    requiredLogosSolved: number;
    requiredPercentage?: number;
    previousLevelCompleted?: boolean;
  };
  active: boolean;
  logoIds?: string[];
}

export interface ProfileRecord {
  profileId: string;
  displayName: string;
  avatar: string; // Avatar identifier or emoji
  difficultyPreference: Difficulty;
  isChildFriendly?: boolean;
  unlimitedHints: boolean;
  noTimer: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  easyModeOnly: boolean;
  createdAt: string;
  lastPlayed: string;
}

export interface PuzzleProgress {
  profileId: string;
  logoId: string;
  solved: boolean;
  attempts: number;
  hintsUsed: number;
  hintsRevealedIndices: number[]; // indices of answer letters revealed
  lettersRemoved: string[]; // pool letters that were disabled by hints
  categoryClueShown: boolean;
  solvedAt?: string;
  timeSpentSeconds?: number;
  gameMode: GameMode;
}

export interface AchievementRecord {
  achievementId: string;
  name: string;
  description: string;
  icon: string;
  category: 'progress' | 'mastery' | 'streak' | 'mode';
  target: number;
}

export interface DailyChallengeRecord {
  challengeId: string;
  dateString: string; // YYYY-MM-DD
  title: string;
  description: string;
  difficulty: Difficulty;
  logoIds: string[];
  rewardHints: number;
  rewardPoints: number;
}

export interface DailyResultRecord {
  profileId: string;
  challengeId: string;
  dateString: string;
  solvedCount: number;
  totalCount: number;
  score: number;
  accuracy: number;
  isPerfect: boolean;
  completedAt: string;
}

export interface WeeklyChallengeRecord {
  challengeId: string;
  weekKey: string; // e.g. "2026-W35"
  title: string;
  theme: string;
  description: string;
  difficulty: Difficulty;
  logoIds: string[];
  rewardHints: number;
  rewardPoints: number;
  badgeName: string;
  badgeIcon: string;
  startDate: string;
  endDate: string;
}

export interface WeeklyResultRecord {
  profileId: string;
  challengeId: string;
  weekKey: string;
  solvedCount: number;
  totalCount: number;
  score: number;
  accuracy: number;
  isPerfect: boolean;
  completedAt: string;
}

export interface SettingsState {
  soundEffects: boolean;
  backgroundMusic: boolean;
  vibration: boolean;
  swipeNavigation: boolean;
  autoAdvance: boolean;
  confirmSkip: boolean;
  theme: 'light' | 'dark' | 'system';
  simpleFamilyMode: boolean; // all unlocked, unlimited hints, relaxed
  unlimitedHintsGlobal: boolean;
  largeText: boolean;
  reducedMotion: boolean;
}

export interface FamilyGameNightSession {
  sessionId: string;
  playerProfileIds: string[];
  currentTurnIndex: number;
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedCategories: string[];
  selectedDifficulty: Difficulty | 'Mixed';
  scores: Record<string, number>; // profileId -> score
  questionLogos: LogoRecord[];
  isComplete: boolean;
}

export interface CustomQuizConfig {
  questionCount: number;
  categories: string[];
  difficulty: Difficulty | 'Mixed';
  gameModes: GameMode[];
}

export interface FamilyDatabase {
  profiles: ProfileRecord[];
  activeProfileId: string;
  logos: LogoRecord[];
  categories: CategoryRecord[];
  levels: LevelRecord[];
  progress: Record<string, Record<string, PuzzleProgress>>; // profileId -> logoId -> PuzzleProgress
  favourites: Record<string, string[]>; // profileId -> logoId[]
  hintBalances: Record<string, number>; // profileId -> points/hints count
  gamePoints: Record<string, number>; // profileId -> points count
  unlockedAchievements: Record<string, Record<string, string>>; // profileId -> achievementId -> unlockedAt
  dailyResults: Record<string, Record<string, DailyResultRecord>>; // profileId -> dateString -> DailyResultRecord
  weeklyResults?: Record<string, Record<string, WeeklyResultRecord>>; // profileId -> weekKey -> WeeklyResultRecord
  settings: SettingsState;
  adminPin: string; // default "1234"
}
