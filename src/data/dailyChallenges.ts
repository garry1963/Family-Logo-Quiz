import { DailyChallengeRecord, Difficulty, LogoRecord } from '../types';
import { DEFAULT_LOGOS } from './defaultLogos';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyChallengeForDate(dateString: string, allLogos: LogoRecord[] = DEFAULT_LOGOS): DailyChallengeRecord {
  // Simple deterministic hash based on date string
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
  const count = 5; // 5 logos per daily challenge for family enjoyment

  for (let i = 0; i < count; i++) {
    const idx = (positiveHash + i * 7) % pool.length;
    if (pool[idx] && !selectedLogos.includes(pool[idx].logoId)) {
      selectedLogos.push(pool[idx].logoId);
    }
  }

  // If duplicate filtered out, pad with first items
  let fallbackIdx = 0;
  while (selectedLogos.length < count && fallbackIdx < pool.length) {
    if (!selectedLogos.includes(pool[fallbackIdx].logoId)) {
      selectedLogos.push(pool[fallbackIdx].logoId);
    }
    fallbackIdx++;
  }

  return {
    challengeId: `daily-${dateString}`,
    dateString,
    title: `Daily Challenge · ${new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', weekday: 'short' })}`,
    description: `Identify 5 mixed brands to boost your streak and earn bonus gameplay hints!`,
    difficulty: diff,
    logoIds: selectedLogos,
    rewardHints: 3,
    rewardPoints: 50
  };
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
