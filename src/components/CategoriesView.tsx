import React, { useState } from 'react';
import {
  Plus,
  FolderUp,
  Edit,
  Eye,
  Play,
  Layers,
  Search,
  CheckCircle2,
  Sparkles,
  Sliders,
  ChevronRight,
  Filter,
  Grid,
  FileCode2,
  Trash2
} from 'lucide-react';
import { CategoryRecord, LogoRecord, ProfileRecord } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';
import { CategoryIcon } from './CategoryIcon';
import { CategoryModal } from './CategoryModal';
import { BulkVectorUploadModal } from './BulkVectorUploadModal';
import { VectorLogoEditorModal } from './VectorLogoEditorModal';

interface CategoriesViewProps {
  categories: CategoryRecord[];
  logos: LogoRecord[];
  activeProfile: ProfileRecord;
  onSelectCategory: (categoryId: string) => void;
  onRefreshData?: () => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  logos,
  activeProfile,
  onSelectCategory,
  onRefreshData
}) => {
  const [viewMode, setViewMode] = useState<'browse' | 'vector_explorer'>('browse');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);

  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [targetBulkCategoryId, setTargetBulkCategoryId] = useState<string | undefined>(undefined);

  const [inspectingLogo, setInspectingLogo] = useState<LogoRecord | null>(null);

  // Filtered logos for the Vector Explorer mode
  const filteredExplorerLogos = logos.filter(l => {
    const matchesCat = selectedCategoryFilter === 'all' || l.categoryId === selectedCategoryFilter;
    const matchesSearch =
      l.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.acceptedAnswers.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.industry && l.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleOpenCreateCategory = () => {
    sound.playTap();
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleOpenBulkUpload = (catId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playTap();
    setTargetBulkCategoryId(catId || categories[0]?.categoryId);
    setIsBulkUploadModalOpen(true);
  };

  const handleSaveCategory = (cat: CategoryRecord) => {
    storage.saveCategory(cat);
    if (onRefreshData) onRefreshData();
  };

  const handleOpenVectorExplorerForCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playTap();
    setSelectedCategoryFilter(catId);
    setViewMode('vector_explorer');
  };

  const handleOpenLogoInspector = (logo: LogoRecord) => {
    sound.playTap();
    setInspectingLogo(logo);
  };

  return (
    <div id="categories-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-blue-400 uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            Category & Vector Management
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Categories & Vector Artwork
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize brand categories, bulk upload .SVG vector files without duplicates, and inspect/edit artwork.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="create-category-btn"
            onClick={handleOpenCreateCategory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Create New Category</span>
          </button>

          <button
            id="bulk-upload-vector-btn"
            onClick={() => handleOpenBulkUpload()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all min-h-[44px]"
          >
            <FolderUp className="w-4 h-4" />
            <span>Bulk Upload SVGs</span>
          </button>
        </div>
      </div>

      {/* Segmented View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl w-fit">
          <button
            onClick={() => {
              sound.playTap();
              setViewMode('browse');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              viewMode === 'browse'
                ? 'bg-blue-600 text-white font-black shadow-md shadow-blue-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Browse Categories ({categories.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playTap();
              setViewMode('vector_explorer');
            }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all min-h-[40px] ${
              viewMode === 'vector_explorer'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileCode2 className="w-4 h-4" />
            <span>Vector Logos & SVG Editor ({logos.length})</span>
          </button>
        </div>

        {viewMode === 'vector_explorer' && (
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Categories ({logos.length})</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name} ({logos.filter(l => l.categoryId === c.categoryId).length})
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vector logos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* 1. BROWSE CATEGORIES VIEW */}
      {viewMode === 'browse' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {categories.map((cat) => {
            const categoryLogos = logos.filter(l => l.categoryId === cat.categoryId && l.active !== false);
            const solvedInCat = categoryLogos.filter(
              l => storage.getProgress(activeProfile.profileId, l.logoId)?.solved
            ).length;
            const totalInCat = Math.max(1, categoryLogos.length);
            const pct = Math.round((solvedInCat / totalInCat) * 100);
            const gradientBg = cat.color || 'from-blue-600 to-cyan-500';

            return (
              <div
                key={cat.categoryId}
                id={`category-card-${cat.categoryId}`}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-xl select-none flex flex-col justify-between group"
              >
                <div>
                  {/* Category Top Info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradientBg} text-white shadow-md shadow-blue-900/20`}>
                        <CategoryIcon iconName={cat.iconName} iconEmoji={cat.iconEmoji} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-display font-black text-base text-white line-clamp-1">
                          {cat.name}
                        </h3>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {categoryLogos.length} Vector Logos
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleOpenEditCategory(cat, e)}
                      className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      title="Edit Category Settings"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {cat.description || `Logos and brands in ${cat.name}`}
                  </p>
                </div>

                {/* Progress bar and Quick Actions */}
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-400">
                        {solvedInCat} / {categoryLogos.length} Solved
                      </span>
                      <span className="text-emerald-400">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        sound.playTap();
                        onSelectCategory(cat.categoryId);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition-colors min-h-[38px] shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Play Quiz</span>
                    </button>

                    <button
                      onClick={(e) => handleOpenVectorExplorerForCategory(cat.categoryId, e)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 transition-colors min-h-[38px]"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>Vector Logos</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. VECTOR LOGOS & SVG EDITOR VIEW */}
      {viewMode === 'vector_explorer' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400 font-bold">
              Showing <span className="text-amber-400">{filteredExplorerLogos.length}</span> vector logo(s)
              {selectedCategoryFilter !== 'all' && (
                <> in <span className="text-white font-black">{categories.find(c => c.categoryId === selectedCategoryFilter)?.name}</span></>
              )}
            </div>

            <button
              onClick={() => handleOpenBulkUpload(selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-bold text-xs"
            >
              <FolderUp className="w-4 h-4 text-amber-400" />
              <span>Bulk Upload to this Category</span>
            </button>
          </div>

          {filteredExplorerLogos.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
              <FileCode2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="font-display font-bold text-lg text-white">No Vector Logos Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                There are no logos matching your current category filter or search query. You can bulk upload .svg vector files right now!
              </p>
              <button
                onClick={() => handleOpenBulkUpload(selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs shadow-md"
              >
                Upload SVG Vector Files
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredExplorerLogos.map((logo) => {
                const cat = categories.find(c => c.categoryId === logo.categoryId);
                const isSolved = storage.getProgress(activeProfile.profileId, logo.logoId)?.solved;

                return (
                  <div
                    key={logo.logoId}
                    onClick={() => handleOpenLogoInspector(logo)}
                    className="p-3.5 bg-slate-900 border border-slate-800 hover:border-amber-500/60 rounded-2xl cursor-pointer hover:scale-[1.03] transition-all flex flex-col justify-between group shadow-lg"
                  >
                    {/* SVG Vector Image Container */}
                    <div className="w-full aspect-square bg-white rounded-xl p-2.5 flex items-center justify-center shadow-inner overflow-hidden relative">
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-105"
                        dangerouslySetInnerHTML={{ __html: logo.imageSvg || '' }}
                      />
                      {isSolved && (
                        <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Logo Title & Category */}
                    <div className="mt-3 space-y-1">
                      <div className="font-display font-black text-xs text-white truncate group-hover:text-amber-400 transition-colors">
                        {logo.brandName}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate">{cat?.name || logo.categoryId}</span>
                        <span className="font-bold text-amber-400/90 shrink-0">Lvl {logo.levelNumber}</span>
                      </div>
                    </div>

                    {/* Quick Edit Overlay Button */}
                    <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-bold">
                      <span className="text-amber-400 text-[10px]">{logo.difficulty}</span>
                      <span className="text-blue-400 flex items-center gap-1 group-hover:underline">
                        <Edit className="w-3 h-3" /> Edit SVG
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODALS */}
      {/* 1. Category Modal (Create / Edit) */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={editingCategory}
        existingCategories={categories}
        onSaveCategory={handleSaveCategory}
      />

      {/* 2. Bulk Vector Upload Modal */}
      <BulkVectorUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        categories={categories}
        existingLogos={logos}
        initialCategoryId={targetBulkCategoryId}
        onUploadSuccess={() => {
          if (onRefreshData) onRefreshData();
        }}
      />

      {/* 3. Vector Logo Inspector & Live SVG Editor */}
      <VectorLogoEditorModal
        isOpen={!!inspectingLogo}
        onClose={() => setInspectingLogo(null)}
        logo={inspectingLogo}
        categories={categories}
        onSaveSuccess={() => {
          if (onRefreshData) onRefreshData();
        }}
        onDeleteSuccess={() => {
          if (onRefreshData) onRefreshData();
        }}
      />
    </div>
  );
};
