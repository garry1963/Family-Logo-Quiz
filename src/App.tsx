import React, { useState, useEffect, useMemo } from 'react';
import { storage } from './services/storageService';
import { sound } from './services/soundEffects';
import { NavigationRail, ActiveTab } from './components/NavigationRail';
import { HomeScreen } from './components/HomeScreen';
import { PuzzleScreen } from './components/PuzzleScreen';
import { LevelsView } from './components/LevelsView';
import { CategoriesView } from './components/CategoriesView';
import { SpecialModesView } from './components/SpecialModesView';
import { DailyChallengeView } from './components/DailyChallengeView';
import { LogoCollectionView } from './components/LogoCollectionView';
import { AchievementsView } from './components/AchievementsView';
import { StatisticsView } from './components/StatisticsView';
import { FamilyLeaderboardView } from './components/FamilyLeaderboardView';
import { FamilyGameNight } from './components/FamilyGameNight';
import { SettingsView } from './components/SettingsView';
import { AdminDashboard } from './components/AdminDashboard';
import { ProfileSelectorModal } from './components/ProfileSelectorModal';
import { CustomQuizModal } from './components/CustomQuizModal';
import { getTodayDateString, getDailyChallengeForDate, getCurrentWeekKey, getWeeklyChallengeForWeek } from './data/dailyChallenges';
import { DEFAULT_ACHIEVEMENTS } from './data/defaultAchievements';
import { GameMode, LogoRecord, DailyChallengeRecord, WeeklyChallengeRecord } from './types';

export default function App() {
  const [dbVersion, setDbVersion] = useState(0);
  const triggerDbUpdate = () => setDbVersion(v => v + 1);

  // Active views
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCustomQuizModalOpen, setIsCustomQuizModalOpen] = useState(false);

  // Active Game State
  const [activeGameMode, setActiveGameMode] = useState<GameMode>('classic');
  const [activeLevelNumber, setActiveLevelNumber] = useState<number>(1);
  const [activeLogosPlaylist, setActiveLogosPlaylist] = useState<LogoRecord[]>([]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);

  // Database snapshot
  const db = useMemo(() => storage.getDatabase(), [dbVersion]);
  const activeProfile = useMemo(() => storage.getActiveProfile(), [db, dbVersion]);
  const hintBalance = storage.getHintBalance(activeProfile.profileId);
  const isUnlimitedHints = storage.isUnlimitedHints(activeProfile.profileId);

  // Today's daily challenge & Weekly challenge
  const todayStr = getTodayDateString();
  const todayChallenge = useMemo(() => getDailyChallengeForDate(todayStr, db.logos), [todayStr, db.logos]);
  const isTodayDailyCompleted = !!db.dailyResults[activeProfile.profileId]?.[todayStr];
  const { currentStreak } = storage.calculateStreak(activeProfile.profileId);

  const currentWeekKey = useMemo(() => getCurrentWeekKey(), []);
  const currentWeeklyChallenge = useMemo(() => getWeeklyChallengeForWeek(currentWeekKey, db.logos), [currentWeekKey, db.logos]);
  const isCurrentWeeklyCompleted = !!storage.getWeeklyResults(activeProfile.profileId)[currentWeekKey];

  // General counts
  const progressList = Object.values(db.progress[activeProfile.profileId] || {}) as { solved?: boolean; attempts?: number }[];
  const solvedCount = progressList.filter(p => p.solved).length;
  const attempts = progressList.reduce((acc, p) => acc + (p.attempts || 1), 0);
  const accuracy = attempts > 0 ? Math.round((solvedCount / attempts) * 100) : 100;
  const unlockedAchievementsCount = Object.keys(db.unlockedAchievements[activeProfile.profileId] || {}).length;

  // Sound effects preference sync
  useEffect(() => {
    sound.setEnabled(db.settings.soundEffects);
  }, [db.settings.soundEffects]);

  // Theme (Light / Dark / System) calculation & DOM sync
  const isLightMode = useMemo(() => {
    if (db.settings.theme === 'light') return true;
    if (db.settings.theme === 'dark') return false;
    // System auto
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: light)').matches;
    }
    return false;
  }, [db.settings.theme]);

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
    }
  }, [isLightMode]);

  // Launch classic campaign level
  const handleStartClassicLevel = (levelNum: number = 1) => {
    setActiveGameMode('classic');
    setActiveLevelNumber(levelNum);
    const levelLogos = db.logos.filter(l => l.levelNumber === levelNum && l.active !== false);
    const playlist = levelLogos.length > 0 ? levelLogos : db.logos.slice(0, 10);
    setActiveLogosPlaylist(playlist);
    
    // Find first unsolved puzzle in level
    const firstUnsolved = playlist.findIndex(l => !storage.getProgress(activeProfile.profileId, l.logoId)?.solved);
    setCurrentPuzzleIndex(firstUnsolved !== -1 ? firstUnsolved : 0);
    setActiveTab('play');
  };

  // Launch special game mode
  const handleStartGameMode = (mode: GameMode) => {
    setActiveGameMode(mode);
    let playlist: LogoRecord[] = [];

    if (mode === 'food_drink') {
      playlist = db.logos.filter(l => ['fast_food', 'food_snacks', 'confectionery', 'beverages', 'cereal_breakfast'].includes(l.categoryId) && l.active !== false);
    } else if (mode === 'guess_colour') {
      playlist = db.logos.filter(l => l.colourChoices && l.colourChoices.length > 0 && l.active !== false);
    } else if (mode === 'retro') {
      playlist = db.logos.filter(l => l.historicImageSvg && l.active !== false);
    } else if (mode === 'slogan') {
      playlist = db.logos.filter(l => l.slogan && l.active !== false);
    } else if (mode === 'minimalist') {
      playlist = db.logos.filter(l => l.minimalistImageSvg && l.active !== false);
    } else if (mode === 'expert') {
      playlist = db.logos.filter(l => ['Expert', 'Nightmare', 'Hard'].includes(l.difficulty) && l.active !== false);
    } else if (mode === 'practice') {
      playlist = [...db.logos].filter(l => l.active !== false).sort(() => 0.5 - Math.random());
    }

    if (playlist.length === 0) {
      playlist = db.logos.slice(0, 10);
    }

    setActiveLogosPlaylist(playlist);
    setCurrentPuzzleIndex(0);
    setActiveTab('play');
  };

  // Launch daily challenge
  const handleStartDailyChallenge = (challenge: DailyChallengeRecord = todayChallenge) => {
    setActiveGameMode('daily');
    const playlist = challenge.logoIds
      .map(id => db.logos.find(l => l.logoId === id))
      .filter((l): l is LogoRecord => !!l);
    
    setActiveLogosPlaylist(playlist.length > 0 ? playlist : db.logos.slice(0, 5));
    setCurrentPuzzleIndex(0);
    setActiveTab('play');
  };

  // Launch weekly mega challenge
  const handleStartWeeklyChallenge = (challenge: WeeklyChallengeRecord = currentWeeklyChallenge) => {
    setActiveGameMode('weekly');
    const playlist = challenge.logoIds
      .map(id => db.logos.find(l => l.logoId === id))
      .filter((l): l is LogoRecord => !!l);
    
    setActiveLogosPlaylist(playlist.length > 0 ? playlist : db.logos.slice(0, 10));
    setCurrentPuzzleIndex(0);
    setActiveTab('play');
  };

  // Launch category quick play
  const handleStartCategoryPlay = (categoryId: string) => {
    setActiveGameMode('classic');
    const playlist = db.logos.filter(l => l.categoryId === categoryId && l.active !== false);
    setActiveLogosPlaylist(playlist.length > 0 ? playlist : db.logos.slice(0, 10));
    setCurrentPuzzleIndex(0);
    setActiveTab('play');
  };

  // Launch direct logo from collection
  const handlePlayDirectLogo = (logoId: string) => {
    const targetIdx = db.logos.findIndex(l => l.logoId === logoId);
    if (targetIdx !== -1) {
      setActiveLogosPlaylist(db.logos);
      setCurrentPuzzleIndex(targetIdx);
      setActiveTab('play');
    }
  };

  // Launch custom quiz
  const handleStartCustomQuiz = (selectedLogos: LogoRecord[]) => {
    setActiveGameMode('classic');
    setActiveLogosPlaylist(selectedLogos);
    setCurrentPuzzleIndex(0);
    setActiveTab('play');
  };

  // Current active logo for puzzle screen
  const currentLogo = activeLogosPlaylist[currentPuzzleIndex] || db.logos[0];
  const currentProgress = currentLogo ? storage.getProgress(activeProfile.profileId, currentLogo.logoId) : undefined;
  const isCurrentSolved = currentProgress?.solved || false;
  const isCurrentFavourite = currentLogo ? storage.isFavourite(activeProfile.profileId, currentLogo.logoId) : false;
  const currentCategory = db.categories.find(c => c.categoryId === currentLogo?.categoryId)?.name || 'General';

  // Handle puzzle solve
  const handleSolveCurrentPuzzle = (
    hintsUsed: number,
    revealedIndices: number[],
    lettersRemoved: string[],
    categoryClueShown: boolean
  ) => {
    if (!currentLogo) return;
    storage.recordProgress(
      activeProfile.profileId,
      currentLogo.logoId,
      true,
      hintsUsed,
      revealedIndices,
      lettersRemoved,
      categoryClueShown,
      activeGameMode
    );

    // If in daily challenge mode, check if all 5 completed
    if (activeGameMode === 'daily') {
      const allDailySolved = activeLogosPlaylist.every(l => 
        l.logoId === currentLogo.logoId || storage.getProgress(activeProfile.profileId, l.logoId)?.solved
      );
      if (allDailySolved) {
        storage.recordDailyResult({
          profileId: activeProfile.profileId,
          challengeId: todayChallenge.challengeId,
          dateString: todayStr,
          solvedCount: activeLogosPlaylist.length,
          totalCount: activeLogosPlaylist.length,
          score: 500,
          accuracy: 100,
          isPerfect: hintsUsed === 0,
          completedAt: new Date().toISOString()
        });
      }
    }

    // If in weekly challenge mode, check if all 10 completed
    if (activeGameMode === 'weekly') {
      const allWeeklySolved = activeLogosPlaylist.every(l =>
        l.logoId === currentLogo.logoId || storage.getProgress(activeProfile.profileId, l.logoId)?.solved
      );
      if (allWeeklySolved) {
        storage.recordWeeklyResult({
          profileId: activeProfile.profileId,
          challengeId: currentWeeklyChallenge.challengeId,
          weekKey: currentWeeklyChallenge.weekKey,
          solvedCount: activeLogosPlaylist.length,
          totalCount: activeLogosPlaylist.length,
          score: 1000,
          accuracy: 100,
          isPerfect: hintsUsed === 0,
          completedAt: new Date().toISOString()
        });
      }
    }

    triggerDbUpdate();
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-500 selection:text-white pb-16 md:pb-0">
      {/* Tablet Navigation Rail (Landscape) / Mobile Header & Bottom Bar (Portrait) */}
      <NavigationRail
        activeTab={activeTab}
        setActiveTab={(tab) => {
          sound.playTap();
          setActiveTab(tab);
        }}
        activeProfile={activeProfile}
        onOpenProfilePicker={() => {
          sound.playTap();
          setIsProfileModalOpen(true);
        }}
        hintBalance={hintBalance}
        isUnlimitedHints={isUnlimitedHints}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 h-full overflow-y-auto">
        {activeTab === 'home' && (
          <HomeScreen
            activeProfile={activeProfile}
            setActiveTab={setActiveTab}
            onStartClassicPlay={handleStartClassicLevel}
            onStartGameMode={handleStartGameMode}
            onStartDailyChallenge={handleStartDailyChallenge}
            onStartWeeklyChallenge={() => handleStartWeeklyChallenge(currentWeeklyChallenge)}
            solvedCount={solvedCount}
            totalLogosCount={db.logos.filter(l => l.active !== false).length}
            currentLevelNumber={activeLevelNumber}
            currentStreak={currentStreak}
            accuracy={accuracy}
            todayChallenge={todayChallenge}
            isTodayDailyCompleted={isTodayDailyCompleted}
            weeklyChallengeTitle={currentWeeklyChallenge.title}
            isWeeklyCompleted={isCurrentWeeklyCompleted}
            unlockedAchievementsCount={unlockedAchievementsCount}
            totalAchievementsCount={DEFAULT_ACHIEVEMENTS.length}
          />
        )}

        {activeTab === 'play' && (
          <PuzzleScreen
            logos={activeLogosPlaylist.length > 0 ? activeLogosPlaylist : db.logos.slice(0, 10)}
            currentIndex={currentPuzzleIndex}
            onNavigateIndex={(newIdx) => setCurrentPuzzleIndex(newIdx)}
            onBack={() => {
              sound.playTap();
              setActiveTab('home');
            }}
            activeProfile={activeProfile}
            gameMode={activeGameMode}
            levelNumber={activeLevelNumber}
            isSolved={isCurrentSolved}
            onSolve={handleSolveCurrentPuzzle}
            isFavourite={isCurrentFavourite}
            onToggleFavourite={() => {
              if (currentLogo) {
                storage.toggleFavourite(activeProfile.profileId, currentLogo.logoId);
                triggerDbUpdate();
              }
            }}
            hintBalance={hintBalance}
            isUnlimitedHints={isUnlimitedHints}
            onUseHintDeduct={(cost) => {
              const ok = storage.useHint(activeProfile.profileId, cost);
              if (ok) triggerDbUpdate();
              return ok;
            }}
            categoryName={currentCategory}
            swipeNavigationEnabled={db.settings.swipeNavigation}
            initialHintsRevealedIndices={currentProgress?.hintsRevealedIndices}
            initialCategoryClueShown={currentProgress?.categoryClueShown}
          />
        )}

        {activeTab === 'levels' && (
          <LevelsView
            levels={db.levels}
            logos={db.logos}
            activeProfile={activeProfile}
            onSelectLevel={(lvlNum) => handleStartClassicLevel(lvlNum)}
          />
        )}

        {activeTab === 'categories' && (
          <CategoriesView
            categories={db.categories}
            logos={db.logos}
            activeProfile={activeProfile}
            onSelectCategory={(catId) => handleStartCategoryPlay(catId)}
            onRefreshData={triggerDbUpdate}
          />
        )}

        {activeTab === 'special_modes' && (
          <SpecialModesView
            onStartMode={handleStartGameMode}
            onOpenCustomQuiz={() => setIsCustomQuizModalOpen(true)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'daily' && (
          <DailyChallengeView
            activeProfile={activeProfile}
            logos={db.logos}
            onPlayDaily={(challenge) => handleStartDailyChallenge(challenge)}
            onPlayWeekly={(challenge) => handleStartWeeklyChallenge(challenge)}
          />
        )}

        {activeTab === 'collection' && (
          <LogoCollectionView
            logos={db.logos}
            categories={db.categories}
            activeProfile={activeProfile}
            onSelectLogoToPlay={(logoId) => handlePlayDirectLogo(logoId)}
          />
        )}

        {activeTab === 'achievements' && (
          <AchievementsView
            activeProfile={activeProfile}
            logos={db.logos}
          />
        )}

        {activeTab === 'statistics' && (
          <StatisticsView
            activeProfile={activeProfile}
            logos={db.logos}
            categories={db.categories}
          />
        )}

        {activeTab === 'family_scores' && (
          <FamilyLeaderboardView
            profiles={db.profiles}
            logos={db.logos}
            activeProfileId={activeProfile.profileId}
          />
        )}

        {activeTab === 'family_night' && (
          <FamilyGameNight
            profiles={db.profiles}
            logos={db.logos}
            categories={db.categories}
            onExit={() => {
              sound.playTap();
              setActiveTab('home');
            }}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={db.settings}
            onUpdateSettings={(newSettings) => {
              storage.updateSettings(newSettings);
              triggerDbUpdate();
            }}
            activeProfile={activeProfile}
            onUnlockAdmin={() => {
              setActiveTab('admin');
            }}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            logos={db.logos}
            categories={db.categories}
            levels={db.levels}
            onCloseAdmin={() => {
              sound.playTap();
              setActiveTab('home');
            }}
            onRefreshData={triggerDbUpdate}
          />
        )}
      </div>

      {/* Profile Switcher & Creator Modal */}
      <ProfileSelectorModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profiles={db.profiles}
        activeProfileId={activeProfile.profileId}
        onSelectProfile={(profileId) => {
          storage.setActiveProfile(profileId);
          triggerDbUpdate();
        }}
        onAddProfile={(newProfile) => {
          storage.addProfile(newProfile);
          triggerDbUpdate();
        }}
        onDeleteProfile={(profileId) => {
          storage.deleteProfile(profileId);
          triggerDbUpdate();
        }}
      />

      {/* Custom Quiz Modal */}
      <CustomQuizModal
        isOpen={isCustomQuizModalOpen}
        onClose={() => setIsCustomQuizModalOpen(false)}
        categories={db.categories}
        logos={db.logos}
        onStartCustomQuiz={handleStartCustomQuiz}
      />
    </div>
  );
}
