import React, { useState, useMemo } from 'react';
import { Search, Heart, CheckCircle2, Lock, Filter, Eye, Info, Sparkles } from 'lucide-react';
import { LogoRecord, CategoryRecord, ProfileRecord } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

interface LogoCollectionViewProps {
  logos: LogoRecord[];
  categories: CategoryRecord[];
  activeProfile: ProfileRecord;
  onSelectLogoToPlay: (logoId: string) => void;
}

export const LogoCollectionView: React.FC<LogoCollectionViewProps> = ({
  logos,
  categories,
  activeProfile,
  onSelectLogoToPlay
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'solved' | 'unsolved' | 'favourites'>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  const progressMap = storage.getDatabase().progress[activeProfile.profileId] || {};
  const favouritesList = storage.getDatabase().favourites[activeProfile.profileId] || [];

  const filteredLogos = useMemo(() => {
    return logos.filter(logo => {
      if (logo.active === false) return false;

      const isSolved = progressMap[logo.logoId]?.solved;
      const isFav = favouritesList.includes(logo.logoId);

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = logo.brandName.toLowerCase().includes(query);
        const matchesCountry = logo.country.toLowerCase().includes(query);
        const matchesIndustry = logo.industry.toLowerCase().includes(query);
        const matchesSlogan = logo.slogan?.toLowerCase().includes(query);
        if (!matchesName && !matchesCountry && !matchesIndustry && !matchesSlogan) {
          return false;
        }
      }

      // Category match
      if (selectedCategory !== 'all' && logo.categoryId !== selectedCategory) {
        return false;
      }

      // Difficulty match
      if (difficultyFilter !== 'all' && logo.difficulty !== difficultyFilter) {
        return false;
      }

      // Status match
      if (statusFilter === 'solved' && !isSolved) return false;
      if (statusFilter === 'unsolved' && isSolved) return false;
      if (statusFilter === 'favourites' && !isFav) return false;

      return true;
    });
  }, [logos, searchTerm, selectedCategory, difficultyFilter, statusFilter, progressMap, favouritesList]);

  return (
    <div id="logo-collection-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-blue-400" />
            Brand Album & Collection
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse all discovered brands, save family favourites, and review company trivia.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-500/30">
          Showing {filteredLogos.length} of {logos.length}
        </span>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by brand name, industry, country, or slogan..."
            className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-white placeholder-slate-500 font-medium text-sm focus:outline-none focus:border-blue-500 min-h-[48px]"
          />
        </div>

        {/* Category & Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* Status Pills */}
          {(['all', 'solved', 'unsolved', 'favourites'] as const).map(st => (
            <button
              key={st}
              onClick={() => {
                sound.playTap();
                setStatusFilter(st);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all min-h-[36px] ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 focus:outline-none focus:border-blue-500 min-h-[36px]"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.iconEmoji} {cat.name}
              </option>
            ))}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold border border-slate-700 focus:outline-none focus:border-blue-500 min-h-[36px]"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
            <option value="Expert">Expert</option>
            <option value="Nightmare">Nightmare</option>
          </select>
        </div>
      </div>

      {/* Grid of Logos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {filteredLogos.map(logo => {
          const isSolved = progressMap[logo.logoId]?.solved;
          const isFav = favouritesList.includes(logo.logoId);

          return (
            <div
              key={logo.logoId}
              id={`collection-item-${logo.logoId}`}
              onClick={() => {
                sound.playTap();
                onSelectLogoToPlay(logo.logoId);
              }}
              className={`group p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between relative hover:scale-105 active:scale-95 ${
                isSolved
                  ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500 shadow-md'
                  : 'bg-slate-900/50 border-slate-800/80 hover:border-blue-500/60'
              }`}
            >
              {/* Top status */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Lvl {logo.levelNumber}
                </span>
                {isFav && (
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                )}
              </div>

              {/* Logo SVG thumbnail */}
              <div className="w-full aspect-square bg-white rounded-xl p-3 flex items-center justify-center shadow-inner my-1">
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: logo.imageSvg || '' }}
                />
              </div>

              {/* Brand Name / Solved indicator */}
              <div className="pt-2 text-center">
                <div className="text-xs font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                  {isSolved ? logo.brandName : '???'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {logo.industry}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
