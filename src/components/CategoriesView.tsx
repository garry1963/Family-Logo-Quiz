import React from 'react';
import { CategoryRecord, LogoRecord, ProfileRecord } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';
import { ChevronRight, Layers } from 'lucide-react';

interface CategoriesViewProps {
  categories: CategoryRecord[];
  logos: LogoRecord[];
  activeProfile: ProfileRecord;
  onSelectCategory: (categoryId: string) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  logos,
  activeProfile,
  onSelectCategory
}) => {
  return (
    <div id="categories-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Browse by Category
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore 28+ industries from fast food and tech to automakers and sports.
          </p>
        </div>

        <span className="px-3.5 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-500/30">
          {categories.length} Categories
        </span>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map(cat => {
          const categoryLogos = logos.filter(l => l.categoryId === cat.categoryId && l.active !== false);
          const solvedInCat = categoryLogos.filter(l => storage.getProgress(activeProfile.profileId, l.logoId)?.solved).length;
          const totalInCat = Math.max(1, categoryLogos.length);
          const pct = Math.round((solvedInCat / totalInCat) * 100);

          return (
            <div
              key={cat.categoryId}
              id={`category-card-${cat.categoryId}`}
              onClick={() => {
                sound.playTap();
                onSelectCategory(cat.categoryId);
              }}
              className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/60 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-xl select-none flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl p-2 bg-slate-800 rounded-2xl border border-slate-700">
                    {cat.iconEmoji}
                  </span>
                  <div className="truncate">
                    <h3 className="font-display font-black text-lg text-white truncate">
                      {cat.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">
                      {categoryLogos.length} Brands
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {cat.description}
                </p>
              </div>

              {/* Progress bar and play button */}
              <div className="space-y-2 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">{solvedInCat} / {categoryLogos.length} Solved</span>
                  <span className="text-emerald-400">{pct}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
