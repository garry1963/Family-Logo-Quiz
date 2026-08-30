import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Layers,
  Grid,
  Lock,
  X,
  Sparkles,
  Save,
  Check,
  FolderUp,
  Filter,
  Eye,
  FileCode2,
  Edit
} from 'lucide-react';
import { LogoRecord, CategoryRecord, LevelRecord, Difficulty } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';
import { CategoryIcon } from './CategoryIcon';
import { CategoryModal } from './CategoryModal';
import { BulkVectorUploadModal } from './BulkVectorUploadModal';
import { VectorLogoEditorModal } from './VectorLogoEditorModal';

interface AdminDashboardProps {
  logos: LogoRecord[];
  categories: CategoryRecord[];
  levels: LevelRecord[];
  onCloseAdmin: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  logos,
  categories,
  levels,
  onCloseAdmin,
  onRefreshData
}) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'logos' | 'categories' | 'bulk' | 'levels' | 'pin'>('logos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Modals state
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [targetBulkCategory, setTargetBulkCategory] = useState<string | undefined>(undefined);

  const [vectorInspectorLogo, setVectorInspectorLogo] = useState<LogoRecord | null>(null);
  const [isCreatingNewLogo, setIsCreatingNewLogo] = useState(false);

  // PIN change state
  const [currentAdminPin, setCurrentAdminPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showAdminPins, setShowAdminPins] = useState(false);
  const [pinChangeMsg, setPinChangeMsg] = useState('');
  const [pinChangeErr, setPinChangeErr] = useState('');

  const filteredLogos = logos.filter(l => {
    const matchesCategory = selectedCategoryFilter === 'all' || l.categoryId === selectedCategoryFilter;
    const matchesSearch =
      l.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.acceptedAnswers.some(a => a.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.industry && l.industry.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenCreateCategory = () => {
    sound.playTap();
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryRecord) => {
    sound.playTap();
    setEditingCategory(cat);
    setIsCategoryModalOpen(true);
  };

  const handleDeleteCategory = (categoryId: string, name: string) => {
    const associatedLogos = logos.filter(l => l.categoryId === categoryId);
    if (associatedLogos.length > 0) {
      if (!window.confirm(`Category "${name}" contains ${associatedLogos.length} logos. Deleting this category will leave these logos unassigned. Do you want to proceed?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) {
        return;
      }
    }

    sound.playDelete();
    storage.deleteCategory(categoryId);
    onRefreshData();
  };

  const handleOpenBulkUpload = (catId?: string) => {
    sound.playTap();
    setTargetBulkCategory(catId || categories[0]?.categoryId);
    setIsBulkUploadModalOpen(true);
  };

  const handleOpenCreateLogo = () => {
    sound.playTap();
    const blankLogo: LogoRecord = {
      logoId: `logo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brandName: '',
      acceptedAnswers: [],
      categoryId: selectedCategoryFilter !== 'all' ? selectedCategoryFilter : (categories[0]?.categoryId || 'tech'),
      levelNumber: 1,
      difficulty: 'Easy',
      country: 'Global',
      foundedYear: 1990,
      industry: 'General',
      description: 'Famous brand recognized worldwide.',
      interestingFact: 'Iconic vector symbol.',
      imageSvg: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="42" fill="#2563eb" />\n  <text x="50" y="58" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">BRAND</text>\n</svg>`,
      active: true,
      gameModes: ['classic']
    };
    setVectorInspectorLogo(blankLogo);
    setIsCreatingNewLogo(true);
  };

  const handleOpenVectorInspector = (logo: LogoRecord) => {
    sound.playTap();
    setIsCreatingNewLogo(false);
    setVectorInspectorLogo(logo);
  };

  const handleDeleteLogo = (logoId: string, name: string) => {
    if (window.confirm(`Delete logo "${name}"?`)) {
      sound.playDelete();
      storage.deleteLogo(logoId);
      onRefreshData();
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeErr('');
    setPinChangeMsg('');

    if (!storage.verifyAdminPin(currentAdminPin)) {
      sound.playIncorrect();
      setPinChangeErr('Current Admin Password / PIN is incorrect.');
      return;
    }

    const trimmedNew = newPin.trim();
    if (trimmedNew.length < 4) {
      sound.playIncorrect();
      setPinChangeErr('New Admin Password / PIN must be at least 4 characters/digits.');
      return;
    }

    if (trimmedNew !== confirmNewPin.trim()) {
      sound.playIncorrect();
      setPinChangeErr('New password / PIN and confirmation do not match.');
      return;
    }

    storage.updateAdminPin(trimmedNew);
    sound.playFanfare();
    setPinChangeMsg('Admin password / PIN updated successfully!');
    setCurrentAdminPin('');
    setNewPin('');
    setConfirmNewPin('');
    setTimeout(() => setPinChangeMsg(''), 3000);
  };

  return (
    <div id="admin-dashboard-container" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto select-none">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-amber-400 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            Protected Administrator Suite
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
            Content & Vector Management
          </h1>
        </div>

        <button
          onClick={onCloseAdmin}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs border border-slate-700 min-h-[44px]"
        >
          <X className="w-4 h-4" />
          <span>Exit Admin Suite</span>
        </button>
      </div>

      {/* Admin Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveAdminTab('logos')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all min-h-[44px] ${
            activeAdminTab === 'logos'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Logos & Vector Editor ({logos.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all min-h-[44px] ${
            activeAdminTab === 'categories'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Categories Manager ({categories.length})
        </button>
        <button
          onClick={() => {
            sound.playTap();
            handleOpenBulkUpload();
          }}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all min-h-[44px] flex items-center gap-1.5 ${
            activeAdminTab === 'bulk'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-amber-400 hover:text-white border border-slate-800'
          }`}
        >
          <FolderUp className="w-3.5 h-3.5" />
          <span>Bulk Upload SVGs</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('levels')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all min-h-[44px] ${
            activeAdminTab === 'levels'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Levels ({levels.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('pin')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all min-h-[44px] ${
            activeAdminTab === 'pin'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Security & PIN
        </button>
      </div>

      {/* 1. LOGOS TAB */}
      {activeAdminTab === 'logos' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Category Filter */}
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="all">All Categories ({logos.length})</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name} ({logos.filter(l => l.categoryId === c.categoryId).length})
                  </option>
                ))}
              </select>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search brand or accepted answer..."
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => handleOpenBulkUpload(selectedCategoryFilter !== 'all' ? selectedCategoryFilter : undefined)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs border border-slate-700 min-h-[44px]"
              >
                <FolderUp className="w-4 h-4 text-amber-400" />
                <span>Bulk Upload SVGs</span>
              </button>

              <button
                id="admin-add-logo-btn"
                onClick={handleOpenCreateLogo}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs min-h-[44px] shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Add Single Logo</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-black tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">Vector Preview</th>
                    <th className="p-3.5">Brand Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Level</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogos.map(logo => {
                    const cat = categories.find(c => c.categoryId === logo.categoryId);

                    return (
                      <tr key={logo.logoId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3.5">
                          <div
                            onClick={() => handleOpenVectorInspector(logo)}
                            className="w-11 h-11 bg-white rounded-xl p-1.5 flex items-center justify-center border border-slate-700 shadow-sm cursor-pointer hover:scale-110 transition-transform"
                            title="Click to inspect & edit vector SVG"
                          >
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: logo.imageSvg || '' }}
                            />
                          </div>
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          <button
                            onClick={() => handleOpenVectorInspector(logo)}
                            className="hover:text-amber-400 text-left font-black transition-colors"
                          >
                            {logo.brandName}
                          </button>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {logo.acceptedAnswers.slice(0, 2).join(', ')}
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold">
                            {cat?.name || logo.categoryId}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold">
                          Lvl {logo.levelNumber}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300 border border-amber-500/30">
                            {logo.difficulty}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenVectorInspector(logo)}
                              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1 border border-slate-700"
                              title="Inspect & Edit SVG"
                            >
                              <FileCode2 className="w-3.5 h-3.5" />
                              <span>Edit SVG</span>
                            </button>
                            <button
                              onClick={() => handleDeleteLogo(logo.logoId, logo.brandName)}
                              className="p-1.5 bg-slate-800 hover:bg-red-950/40 text-red-400 rounded-lg"
                              title="Delete Logo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CATEGORIES TAB */}
      {activeAdminTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Manage your game's logo categories. Create custom categories, bulk upload vector files, or configure icons.
            </p>
            <button
              onClick={handleOpenCreateCategory}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const catLogos = logos.filter(l => l.categoryId === cat.categoryId);

              return (
                <div
                  key={cat.categoryId}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${cat.color || 'from-blue-600 to-cyan-500'} text-white shadow-md`}>
                        <CategoryIcon iconName={cat.iconName} iconEmoji={cat.iconEmoji} className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-display font-black text-white text-base">{cat.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{cat.categoryId}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Edit Category"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.categoryId, cat.name)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/40 text-red-400"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {cat.description || `Brands and logos in ${cat.name}`}
                  </p>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      {catLogos.length} Logos
                    </span>

                    <button
                      onClick={() => handleOpenBulkUpload(cat.categoryId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700"
                    >
                      <FolderUp className="w-3.5 h-3.5 text-amber-400" />
                      <span>Bulk Upload SVGs</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. LEVELS TAB */}
      {activeAdminTab === 'levels' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {levels.map(lvl => (
            <div key={lvl.levelId} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center">
              <div className="font-black text-white text-sm">Level {lvl.levelNumber}</div>
              <div className="text-[11px] text-amber-400 font-bold">{lvl.difficulty}</div>
            </div>
          ))}
        </div>
      )}

      {/* 4. PIN SECURITY TAB */}
      {activeAdminTab === 'pin' && (
        <div className="max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Change Administrator Password / PIN
            </h3>
            <button
              type="button"
              onClick={() => setShowAdminPins(!showAdminPins)}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium"
            >
              {showAdminPins ? 'Hide Values' : 'Show Values'}
            </button>
          </div>
          <p className="text-xs text-slate-400">
            Set a new custom password or 4-16 character/digit PIN to protect the admin tools and settings.
          </p>

          {pinChangeMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl flex items-center gap-2">
              <span>{pinChangeMsg}</span>
            </div>
          )}

          {pinChangeErr && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-bold rounded-xl flex items-center gap-2">
              <span>{pinChangeErr}</span>
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Current Admin Password / PIN
              </label>
              <input
                type={showAdminPins ? 'text' : 'password'}
                required
                value={currentAdminPin}
                onChange={(e) => setCurrentAdminPin(e.target.value)}
                placeholder="Enter current PIN (default: 1234)"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                New Admin Password / PIN (Min 4 chars)
              </label>
              <input
                type={showAdminPins ? 'text' : 'password'}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 4+ character password/PIN"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Confirm New Password / PIN
              </label>
              <input
                type={showAdminPins ? 'text' : 'password'}
                required
                value={confirmNewPin}
                onChange={(e) => setConfirmNewPin(e.target.value)}
                placeholder="Confirm new PIN"
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all min-h-[44px]"
            >
              Update Admin Password / PIN
            </button>
          </form>
        </div>
      )}

      {/* ALL REUSABLE MODALS */}
      {/* 1. Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categoryToEdit={editingCategory}
        existingCategories={categories}
        onSaveCategory={(cat) => {
          storage.saveCategory(cat);
          onRefreshData();
        }}
      />

      {/* 2. Bulk Vector Upload Modal */}
      <BulkVectorUploadModal
        isOpen={isBulkUploadModalOpen}
        onClose={() => setIsBulkUploadModalOpen(false)}
        categories={categories}
        existingLogos={logos}
        initialCategoryId={targetBulkCategory}
        onUploadSuccess={() => {
          onRefreshData();
        }}
      />

      {/* 3. Vector Logo Editor & Inspector Modal */}
      <VectorLogoEditorModal
        isOpen={!!vectorInspectorLogo}
        onClose={() => setVectorInspectorLogo(null)}
        logo={vectorInspectorLogo}
        categories={categories}
        onSaveSuccess={() => {
          onRefreshData();
        }}
        onDeleteSuccess={() => {
          onRefreshData();
        }}
      />
    </div>
  );
};
