import { DailyChallengeRecord, WeeklyChallengeRecord, Difficulty, LogoRecord } from '../types';
import { DEFAULT_LOGOS } from './defaultLogos';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

export function getWeekStartAndEndDates(weekKey: string): { startDate: string; endDate: string } {
  const parts = weekKey.split('-W');
  const year = parseInt(parts[0], 10) || new Date().getFullYear();
  const week = parseInt(parts[1], 10) || 1;

  // Simple calculation of Monday of that ISO week
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }

  const start = new Date(ISOweekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const format = (dt: Date) => {
    return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return {
    startDate: format(start),
    endDate: format(end)
  };
}

export function getTimeRemainingInWeek(): { days: number; hours: number; minutes: number } {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  const daysUntilSunday = (7 - dayOfWeek) % 7;
  
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + daysUntilSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  const diffMs = Math.max(0, endOfWeek.getTime() - now.getTime());
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  return { days, hours, minutes };
}

export function getDailyChallengeForDate(dateString: string, allLogos: LogoRecord[] = DEFAULT_LOGOS): DailyChallengeRecord {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);
  
  const difficultyList: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Mixed' as unknown as Difficulty];
  const diff = difficultyList[positiveHash % difficultyList.length];

  const pool = allLogos.filter(l => l.active !== false);
  const selectedLogos: string[] = [];
  const count = 5; // 5 logos per daily challenge for quick family play

  for (let i = 0; i < count; i++) {
    const idx = (positiveHash + i * 7) % pool.length;
    if (pool[idx] && !selectedLogos.includes(pool[idx].logoId)) {
      selectedLogos.push(pool[idx].logoId);
    }
  }

  let fallbackIdx = 0;
  while (selectedLogos.length < count && fallbackIdx < pool.length) {
    if (!selectedLogos.includes(pool[fallbackIdx].logoId)) {
      selectedLogos.push(pool[fallbackIdx].logoId);
    }
    fallbackIdx++;
  }

  const dayNames = ['Sunday Splash', 'Monday Mindset', 'Tuesday Trivia', 'Wednesday Wonder', 'Thursday Thinker', 'Friday Fanfare', 'Saturday Special'];
  const dayIdx = new Date(dateString).getDay();
  const themeDay = dayNames[dayIdx] || 'Daily Puzzle';

  return {
    challengeId: `daily-${dateString}`,
    dateString,
    title: `${themeDay} · ${new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
    description: `Solve today's 5 curated mixed brand puzzles to earn +3 hints and keep your streak burning!`,
    difficulty: diff,
    logoIds: selectedLogos,
    rewardHints: 3,
    rewardPoints: 50
  };
}

const WEEKLY_THEMES = [
  {
    theme: 'Tech Titans & Silicon Valley',
    title: 'Tech & Digital Innovation Week',
    description: 'Master 10 iconic computing, software, and social media logos from Silicon Valley to global tech giants.',
    categories: ['tech_gadgets', 'gaming_entertainment'],
    badgeName: 'Silicon Innovator',
    badgeIcon: '⚡'
  },
  {
    theme: 'Food & Flavor Heritage',
    title: 'World Culinary & Snack Icons',
    description: 'Identify 10 mouth-watering fast food, candy, snack, and beverage emblems beloved across generations.',
    categories: ['fast_food', 'food_snacks', 'confectionery', 'beverages'],
    badgeName: 'Flavor Connoisseur',
    badgeIcon: '🍔'
  },
  {
    theme: 'Automotive & Supercars',
    title: 'Horsepower & Heritage Emblems',
    description: 'Test your motoring knowledge with 10 world-famous automotive badges and supercar emblems.',
    categories: ['automotive'],
    badgeName: 'Gearhead Champion',
    badgeIcon: '🏎️'
  },
  {
    theme: 'Luxury Fashion & Apparel',
    title: 'Haute Couture & Streetwear Legends',
    description: 'Decode 10 chic fashion houses, athletic wear labels, and luxury design insignias.',
    categories: ['apparel_fashion', 'retail_supermarket'],
    badgeName: 'Fashionista Master',
    badgeIcon: '👑'
  },
  {
    theme: 'Retro & Vintage Classics',
    title: 'Golden Age Nostalgia Showcase',
    description: 'Journey into the past with 10 historic corporate marks, retro typography, and heritage emblems.',
    categories: ['historic_vintage', 'media_streaming'],
    badgeName: 'Time Traveler',
    badgeIcon: '🕰️'
  },
  {
    theme: 'Sports & Athletic Powerhouses',
    title: 'Athletic Glory & Championship Brands',
    description: 'Recognize 10 leading athletic manufacturers, sports equipment icons, and global sportswear legends.',
    categories: ['sports_outdoors', 'apparel_fashion'],
    badgeName: 'All-Star MVP',
    badgeIcon: '🏆'
  }
];

export function getWeeklyChallengeForWeek(weekKey: string = getCurrentWeekKey(), allLogos: LogoRecord[] = DEFAULT_LOGOS): WeeklyChallengeRecord {
  let hash = 0;
  for (let i = 0; i < weekKey.length; i++) {
    hash = (hash << 5) - hash + weekKey.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = Math.abs(hash);

  const themeData = WEEKLY_THEMES[positiveHash % WEEKLY_THEMES.length];
  const { startDate, endDate } = getWeekStartAndEndDates(weekKey);

  const pool = allLogos.filter(l => l.active !== false);
  // Match theme categories first if available
  const preferredPool = pool.filter(l => themeData.categories.includes(l.categoryId));
  const candidatePool = preferredPool.length >= 10 ? preferredPool : pool;

  const selectedLogos: string[] = [];
  const targetCount = 10;

  for (let i = 0; i < candidatePool.length && selectedLogos.length < targetCount; i++) {
    const idx = (positiveHash + i * 3) % candidatePool.length;
    const logo = candidatePool[idx];
    if (logo && !selectedLogos.includes(logo.logoId)) {
      selectedLogos.push(logo.logoId);
    }
  }

  // If still need more, fill from general pool
  let fallbackIdx = 0;
  while (selectedLogos.length < targetCount && fallbackIdx < pool.length) {
    if (!selectedLogos.includes(pool[fallbackIdx].logoId)) {
      selectedLogos.push(pool[fallbackIdx].logoId);
    }
    fallbackIdx++;
  }

  return {
    challengeId: `weekly-${weekKey}`,
    weekKey,
    title: `${themeData.title}`,
    theme: themeData.theme,
    description: themeData.description,
    difficulty: 'Medium',
    logoIds: selectedLogos,
    rewardHints: 10,
    rewardPoints: 200,
    badgeName: themeData.badgeName,
    badgeIcon: themeData.badgeIcon,
    startDate,
    endDate
  };
}

export function getRecentWeekKeys(count: number = 4): string[] {
  const result: string[] = [];
  const current = new Date();
  for (let i = 0; i < count; i++) {
    const pastDate = new Date(current);
    pastDate.setDate(current.getDate() - i * 7);
    result.push(getCurrentWeekKey(pastDate));
  }
  return result;
}

export function getMonthDates(year: number, monthZeroIndexed: number): string[] {
  const daysInMonth = new Date(year, monthZeroIndexed + 1, 0).getDate();
  const dates: string[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const mm = String(monthZeroIndexed + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    dates.push(`${year}-${mm}-${dd}`);
  }
  return dates;
}
