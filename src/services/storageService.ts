import {
  FamilyDatabase,
  ProfileRecord,
  PuzzleProgress,
  LogoRecord,
  CategoryRecord,
  LevelRecord,
  SettingsState,
  DailyResultRecord,
  GameMode,
  Difficulty
} from '../types';
import { DEFAULT_LOGOS } from '../data/defaultLogos';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories';
import { DEFAULT_LEVELS } from '../data/defaultLevels';
import { DEFAULT_ACHIEVEMENTS } from '../data/defaultAchievements';

const STORAGE_KEY = 'family_logo_quiz_db_v1';

const DEFAULT_SETTINGS: SettingsState = {
  soundEffects: true,
  backgroundMusic: false,
  vibration: true,
  swipeNavigation: true,
  autoAdvance: true,
  confirmSkip: false,
  theme: 'dark',
  simpleFamilyMode: false,
  unlimitedHintsGlobal: false,
  largeText: false,
  reducedMotion: false
};

const DEFAULT_PROFILES: ProfileRecord[] = [
  {
    profileId: 'profile-garry',
    displayName: 'Garry',
    avatar: '👨‍💼',
    difficultyPreference: 'Medium',
    unlimitedHints: false,
    noTimer: false,
    largeText: false,
    reducedMotion: false,
    easyModeOnly: false,
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  },
  {
    profileId: 'profile-family',
    displayName: 'Family Lounge',
    avatar: '🛋️',
    difficultyPreference: 'Easy',
    unlimitedHints: false,
    noTimer: true,
    largeText: false,
    reducedMotion: false,
    easyModeOnly: false,
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  },
  {
    profileId: 'profile-kids',
    displayName: 'Kids & Junior',
    avatar: '🦁',
    difficultyPreference: 'Easy',
    isChildFriendly: true,
    unlimitedHints: true,
    noTimer: true,
    largeText: true,
    reducedMotion: false,
    easyModeOnly: true,
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  }
];

export function getInitialDatabase(): FamilyDatabase {
  return {
    profiles: DEFAULT_PROFILES,
    activeProfileId: 'profile-garry',
    logos: DEFAULT_LOGOS,
    categories: DEFAULT_CATEGORIES,
    levels: DEFAULT_LEVELS,
    progress: {},
    favourites: {},
    hintBalances: {
      'profile-garry': 15,
      'profile-family': 20,
      'profile-kids': 999
    },
    gamePoints: {
      'profile-garry': 0,
      'profile-family': 0,
      'profile-kids': 0
    },
    unlockedAchievements: {},
    dailyResults: {},
    settings: DEFAULT_SETTINGS,
    adminPin: '1234'
  };
}

class StorageService {
  private db: FamilyDatabase;

  constructor() {
    this.db = this.load();
  }

  private load(): FamilyDatabase {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY);
      if (serialized) {
        const parsed = JSON.parse(serialized);
        // Guarantee backwards compatibility and missing fields
        return {
          ...getInitialDatabase(),
          ...parsed,
          settings: {
            ...DEFAULT_SETTINGS,
            ...(parsed.settings || {})
          }
        };
      }
    } catch (e) {
      console.warn('Failed to parse saved database from localStorage', e);
    }
    return getInitialDatabase();
  }

  public save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.db));
    } catch (e) {
      console.error('Could not save database to localStorage', e);
    }
  }

  public getDatabase(): FamilyDatabase {
    return this.db;
  }

  public getActiveProfile(): ProfileRecord {
    const active = this.db.profiles.find(p => p.profileId === this.db.activeProfileId);
    return active || this.db.profiles[0] || DEFAULT_PROFILES[0];
  }

  public setActiveProfile(profileId: string) {
    if (this.db.profiles.some(p => p.profileId === profileId)) {
      this.db.activeProfileId = profileId;
      const profile = this.db.profiles.find(p => p.profileId === profileId);
      if (profile) {
        profile.lastPlayed = new Date().toISOString();
      }
      this.save();
    }
  }

  public addProfile(profile: Omit<ProfileRecord, 'profileId' | 'createdAt' | 'lastPlayed'>): ProfileRecord {
    const newProfile: ProfileRecord = {
      ...profile,
      profileId: `profile-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString()
    };
    this.db.profiles.push(newProfile);
    this.db.hintBalances[newProfile.profileId] = profile.unlimitedHints ? 999 : 15;
    this.db.gamePoints[newProfile.profileId] = 0;
    this.db.activeProfileId = newProfile.profileId;
    this.save();
    return newProfile;
  }

  public updateProfile(profileId: string, updates: Partial<ProfileRecord>) {
    const idx = this.db.profiles.findIndex(p => p.profileId === profileId);
    if (idx !== -1) {
      this.db.profiles[idx] = { ...this.db.profiles[idx], ...updates };
      this.save();
    }
  }

  public deleteProfile(profileId: string) {
    if (this.db.profiles.length <= 1) return; // Keep at least 1 profile
    this.db.profiles = this.db.profiles.filter(p => p.profileId !== profileId);
    if (this.db.activeProfileId === profileId) {
      this.db.activeProfileId = this.db.profiles[0].profileId;
    }
    delete this.db.progress[profileId];
    delete this.db.favourites[profileId];
    delete this.db.hintBalances[profileId];
    delete this.db.gamePoints[profileId];
    delete this.db.unlockedAchievements[profileId];
    delete this.db.dailyResults[profileId];
    this.save();
  }

  public getProgress(profileId: string, logoId: string): PuzzleProgress | undefined {
    return this.db.progress[profileId]?.[logoId];
  }

  public recordProgress(
    profileId: string,
    logoId: string,
    solved: boolean,
    hintsUsed: number,
    hintsRevealedIndices: number[] = [],
    lettersRemoved: string[] = [],
    categoryClueShown: boolean = false,
    gameMode: GameMode = 'classic'
  ) {
    if (!this.db.progress[profileId]) {
      this.db.progress[profileId] = {};
    }
    const current = this.db.progress[profileId][logoId] || {
      profileId,
      logoId,
      solved: false,
      attempts: 0,
      hintsUsed: 0,
      hintsRevealedIndices: [],
      lettersRemoved: [],
      categoryClueShown: false,
      gameMode
    };

    const newAttempts = current.attempts + 1;
    const isNowSolved = current.solved || solved;

    this.db.progress[profileId][logoId] = {
      ...current,
      solved: isNowSolved,
      attempts: newAttempts,
      hintsUsed: Math.max(current.hintsUsed, hintsUsed),
      hintsRevealedIndices: Array.from(new Set([...current.hintsRevealedIndices, ...hintsRevealedIndices])),
      lettersRemoved: Array.from(new Set([...current.lettersRemoved, ...lettersRemoved])),
      categoryClueShown: current.categoryClueShown || categoryClueShown,
      solvedAt: isNowSolved && !current.solved ? new Date().toISOString() : current.solvedAt,
      gameMode
    };

    if (solved && !current.solved) {
      // Award free gameplay points and free hint
      const currentPts = this.db.gamePoints[profileId] || 0;
      const currentHints = this.db.hintBalances[profileId] || 10;
      this.db.gamePoints[profileId] = currentPts + 10;
      this.db.hintBalances[profileId] = currentHints + 1; // Award 1 free hint per solve
      this.checkAchievements(profileId);
    }

    this.save();
  }

  public isUnlimitedHints(profileId?: string): boolean {
    if (this.db.settings.simpleFamilyMode || this.db.settings.unlimitedHintsGlobal) {
      return true;
    }
    const profile = profileId ? this.db.profiles.find(p => p.profileId === profileId) : this.getActiveProfile();
    return profile?.unlimitedHints || false;
  }

  public getHintBalance(profileId: string): number {
    if (this.isUnlimitedHints(profileId)) return 999;
    return this.db.hintBalances[profileId] ?? 10;
  }

  public useHint(profileId: string, amount: number = 1): boolean {
    if (this.isUnlimitedHints(profileId)) return true;
    const cur = this.getHintBalance(profileId);
    if (cur >= amount) {
      this.db.hintBalances[profileId] = cur - amount;
      this.save();
      return true;
    }
    return false;
  }

  public toggleFavourite(profileId: string, logoId: string): boolean {
    if (!this.db.favourites[profileId]) {
      this.db.favourites[profileId] = [];
    }
    const list = this.db.favourites[profileId];
    const index = list.indexOf(logoId);
    let isFav = false;
    if (index >= 0) {
      list.splice(index, 1);
      isFav = false;
    } else {
      list.push(logoId);
      isFav = true;
    }
    this.save();
    return isFav;
  }

  public isFavourite(profileId: string, logoId: string): boolean {
    return this.db.favourites[profileId]?.includes(logoId) || false;
  }

  public recordDailyResult(result: DailyResultRecord) {
    const { profileId, dateString } = result;
    if (!this.db.dailyResults[profileId]) {
      this.db.dailyResults[profileId] = {};
    }
    this.db.dailyResults[profileId][dateString] = result;
    // Award daily rewards
    this.db.hintBalances[profileId] = (this.db.hintBalances[profileId] || 10) + 3;
    this.db.gamePoints[profileId] = (this.db.gamePoints[profileId] || 0) + 50;
    this.checkAchievements(profileId);
    this.save();
  }

  public calculateStreak(profileId: string): { currentStreak: number; bestStreak: number } {
    const records = this.db.dailyResults[profileId] || {};
    const dates = Object.keys(records).sort();
    if (dates.length === 0) return { currentStreak: 0, bestStreak: 0 };

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check consecutive days
    const dateObjs = dates.map(d => {
      const [y, m, day] = d.split('-').map(Number);
      return new Date(y, m - 1, day);
    });

    for (let i = 0; i < dateObjs.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const diffDays = Math.round((dateObjs[i].getTime() - dateObjs[i - 1].getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }

    // Check if current streak extends to today or yesterday
    const lastDate = dateObjs[dateObjs.length - 1];
    const diffFromToday = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffFromToday <= 1) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }

    return { currentStreak, bestStreak };
  }

  public checkAchievements(profileId: string) {
    if (!this.db.unlockedAchievements[profileId]) {
      this.db.unlockedAchievements[profileId] = {};
    }
    const unlocked = this.db.unlockedAchievements[profileId];
    const progressMap = this.db.progress[profileId] || {};
    const solvedLogos = Object.values(progressMap).filter(p => p.solved);
    const solvedCount = solvedLogos.length;
    const dailyCount = Object.keys(this.db.dailyResults[profileId] || {}).length;
    const { currentStreak, bestStreak } = this.calculateStreak(profileId);

    const unlock = (id: string) => {
      if (!unlocked[id]) {
        unlocked[id] = new Date().toISOString();
      }
    };

    if (solvedCount >= 1) unlock('first_logo');
    if (solvedCount >= 25) unlock('getting_started');
    if (solvedCount >= 100) unlock('logo_fan');
    if (solvedCount >= 250) unlock('brand_expert');
    if (solvedCount >= 500) unlock('logo_master');

    if (dailyCount >= 7) unlock('daily_player');
    if (currentStreak >= 14 || bestStreak >= 14) unlock('streak_master');

    const foodCount = solvedLogos.filter(p => p.gameMode === 'food_drink').length;
    if (foodCount >= 20) unlock('food_drink_pro');

    const colorCount = solvedLogos.filter(p => p.gameMode === 'guess_colour').length;
    if (colorCount >= 15) unlock('color_detective');

    const retroCount = solvedLogos.filter(p => p.gameMode === 'retro').length;
    if (retroCount >= 15) unlock('retro_historian');

    const sloganCount = solvedLogos.filter(p => p.gameMode === 'slogan').length;
    if (sloganCount >= 15) unlock('slogan_scholar');

    const minCount = solvedLogos.filter(p => p.gameMode === 'minimalist').length;
    if (minCount >= 15) unlock('minimalist_vision');
  }

  public updateSettings(settings: Partial<SettingsState>) {
    this.db.settings = { ...this.db.settings, ...settings };
    this.save();
  }

  public updateAdminPin(newPin: string) {
    this.db.adminPin = newPin;
    this.save();
  }

  public getLevelStars(profileId: string, levelNumber: number): number {
    const levelLogos = this.db.logos.filter(l => l.levelNumber === levelNumber && l.active !== false);
    if (levelLogos.length === 0) return 0;
    const progressMap = this.db.progress[profileId] || {};
    
    let solvedCount = 0;
    let totalHints = 0;
    let totalAttempts = 0;

    levelLogos.forEach(l => {
      const p = progressMap[l.logoId];
      if (p?.solved) {
        solvedCount++;
        totalHints += p.hintsUsed || 0;
        totalAttempts += p.attempts || 1;
      }
    });

    const ratio = solvedCount / levelLogos.length;
    if (ratio === 0) return 0;
    if (ratio < 0.3) return 1;
    if (ratio < 0.6) return 2;
    if (ratio < 0.9) return 3;
    if (ratio < 1.0) return 4;
    // Perfect level with minimal hints gives 5 stars
    return totalHints <= 1 ? 5 : 4;
  }

  public isLevelUnlocked(profileId: string, levelNumber: number): boolean {
    if (this.db.settings.simpleFamilyMode) return true;
    if (levelNumber === 1) return true;
    
    const targetLevel = this.db.levels.find(l => l.levelNumber === levelNumber);
    if (!targetLevel) return true;

    // Check total solved logos across previous levels
    const progressMap = this.db.progress[profileId] || {};
    const totalSolved = Object.values(progressMap).filter(p => p.solved).length;
    
    return totalSolved >= targetLevel.unlockRequirement.requiredLogosSolved;
  }

  // Admin Logo Management
  public saveLogo(logo: LogoRecord) {
    const idx = this.db.logos.findIndex(l => l.logoId === logo.logoId);
    if (idx !== -1) {
      this.db.logos[idx] = { ...logo, lastModified: new Date().toISOString() };
    } else {
      this.db.logos.push({ ...logo, dateCreated: new Date().toISOString(), lastModified: new Date().toISOString() });
    }
    this.save();
  }

  public deleteLogo(logoId: string) {
    this.db.logos = this.db.logos.filter(l => l.logoId !== logoId);
    this.save();
  }

  // Admin Category & Level Management
  public saveCategory(category: CategoryRecord) {
    const idx = this.db.categories.findIndex(c => c.categoryId === category.categoryId);
    if (idx !== -1) {
      this.db.categories[idx] = category;
    } else {
      this.db.categories.push(category);
    }
    this.save();
  }

  public deleteCategory(categoryId: string) {
    this.db.categories = this.db.categories.filter(c => c.categoryId !== categoryId);
    this.save();
  }

  public saveLevel(level: LevelRecord) {
    const idx = this.db.levels.findIndex(l => l.levelId === level.levelId);
    if (idx !== -1) {
      this.db.levels[idx] = level;
    } else {
      this.db.levels.push(level);
    }
    this.save();
  }

  // Full Backup & Export/Import
  public exportFullBackup(): string {
    return JSON.stringify(this.db, null, 2);
  }

  public importFullBackup(jsonContent: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!parsed.profiles || !parsed.logos || !parsed.levels) {
        return { success: false, message: 'Invalid backup format: Missing profiles, logos or levels data.' };
      }
      this.db = {
        ...getInitialDatabase(),
        ...parsed
      };
      this.save();
      return { success: true, message: 'Family database restored successfully!' };
    } catch (e) {
      return { success: false, message: `Failed to import JSON: ${(e as Error).message}` };
    }
  }

  public resetToFactory() {
    this.db = getInitialDatabase();
    this.save();
  }
}

export const storage = new StorageService();
