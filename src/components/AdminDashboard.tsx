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
  Check
} from 'lucide-react';
import { LogoRecord, CategoryRecord, LevelRecord, Difficulty } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

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
  const [activeAdminTab, setActiveAdminTab] = useState<'logos' | 'categories' | 'levels' | 'bulk' | 'pin'>('logos');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLogo, setEditingLogo] = useState<LogoRecord | null>(null);
  const [isCreatingLogo, setIsCreatingLogo] = useState(false);

  // Logo Editor Form State
  const [brandName, setBrandName] = useState('');
  const [acceptedAnswers, setAcceptedAnswers] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [levelNumber, setLevelNumber] = useState(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [country, setCountry] = useState('Global');
  const [foundedYear, setFoundedYear] = useState('1980');
  const [industry, setIndustry] = useState('');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [interestingFact, setInterestingFact] = useState('');
  const [imageSvg, setImageSvg] = useState('');

  // PIN change state
  const [newPin, setNewPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  const filteredLogos = logos.filter(l =>
    l.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenEdit = (logo: LogoRecord) => {
    sound.playTap();
    setEditingLogo(logo);
    setIsCreatingLogo(false);
    setBrandName(logo.brandName);
    setAcceptedAnswers(logo.acceptedAnswers.join(', '));
    setCategoryId(logo.categoryId);
    setLevelNumber(logo.levelNumber);
    setDifficulty(logo.difficulty);
    setCountry(logo.country);
    setFoundedYear(logo.foundedYear);
    setIndustry(logo.industry);
    setSlogan(logo.slogan || '');
    setDescription(logo.description);
    setInterestingFact(logo.interestingFact || '');
    setImageSvg(logo.imageSvg || '');
  };

  const handleOpenCreate = () => {
    sound.playTap();
    setEditingLogo(null);
    setIsCreatingLogo(true);
    setBrandName('');
    setAcceptedAnswers('');
    setCategoryId(categories[0]?.categoryId || 'fast_food');
    setLevelNumber(1);
    setDifficulty('Easy');
    setCountry('United States');
    setFoundedYear('1990');
    setIndustry('Retail');
    setSlogan('');
    setDescription('Famous global brand recognized worldwide.');
    setInterestingFact('Founded with innovative beginnings.');
    setImageSvg(`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="#2563eb"/><text x="50" y="58" font-size="28" font-weight="bold" fill="#fff" text-anchor="middle">LOGO</text></svg>`);
  };

  const handleSaveLogo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim() || !imageSvg.trim()) return;

    const answersArray = acceptedAnswers.split(',').map(a => a.trim().toUpperCase()).filter(Boolean);
    if (answersArray.length === 0) answersArray.push(brandName.trim().toUpperCase());

    const logoToSave: LogoRecord = {
      logoId: editingLogo ? editingLogo.logoId : `logo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brandName: brandName.trim(),
      acceptedAnswers: answersArray,
      categoryId,
      levelNumber: Number(levelNumber),
      difficulty,
      country: country.trim(),
      foundedYear: parseInt(foundedYear, 10) || 1990,
      industry: industry.trim(),
      slogan: slogan.trim() || undefined,
      description: description.trim(),
      interestingFact: interestingFact.trim() || 'Famous global brand recognition.',
      imageSvg: imageSvg.trim(),
      active: true,
      gameModes: editingLogo?.gameModes || ['classic']
    };

    storage.saveLogo(logoToSave);
    sound.playFanfare();
    setEditingLogo(null);
    setIsCreatingLogo(false);
    onRefreshData();
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
    if (newPin.trim().length >= 4) {
      storage.updateAdminPin(newPin.trim());
      sound.playFanfare();
      setPinChangeMsg('PIN updated successfully!');
      setNewPin('');
      setTimeout(() => setPinChangeMsg(''), 2500);
    }
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
            Content & Puzzle Management
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
          Logos Manager ({logos.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all min-h-[44px] ${
            activeAdminTab === 'categories'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          Categories ({categories.length})
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
      {activeAdminTab === 'logos' && !editingLogo && !isCreatingLogo && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logos..."
                className="w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <button
              id="admin-add-logo-btn"
              onClick={handleOpenCreate}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs min-h-[44px] shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Brand Logo</span>
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/80 text-slate-400 uppercase font-black tracking-wider sticky top-0 z-10">
                  <tr>
                    <th className="p-3.5">Logo</th>
                    <th className="p-3.5">Brand</th>
                    <th className="p-3.5">Level</th>
                    <th className="p-3.5">Difficulty</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredLogos.map(logo => (
                    <tr key={logo.logoId} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5">
                        <div className="w-10 h-10 bg-white rounded-lg p-1.5 flex items-center justify-center">
                          <div
                            className="w-full h-full flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: logo.imageSvg || '' }}
                          />
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-white">
                        {logo.brandName}
                      </td>
                      <td className="p-3.5 font-semibold">
                        Lvl {logo.levelNumber}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-amber-300 border border-amber-500/30">
                          {logo.difficulty}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {logo.industry}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(logo)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLogo(logo.logoId, logo.brandName)}
                            className="p-2 bg-slate-800 hover:bg-red-950/40 text-red-400 rounded-lg"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* LOGO ADD / EDIT MODAL FORM */}
      {(editingLogo || isCreatingLogo) && (
        <form onSubmit={handleSaveLogo} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="font-display font-black text-xl text-white">
              {isCreatingLogo ? 'Create New Brand Puzzle' : `Edit "${brandName}"`}
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingLogo(null);
                setIsCreatingLogo(false);
              }}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Accepted Answers (comma-separated)</label>
              <input
                type="text"
                value={acceptedAnswers}
                onChange={(e) => setAcceptedAnswers(e.target.value)}
                placeholder="e.g. MCDONALDS, MCDONALD'S, MACCA'S"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.iconEmoji} {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Level (1 - 52)</label>
              <input
                type="number"
                min={1}
                max={52}
                value={levelNumber}
                onChange={(e) => setLevelNumber(parseInt(e.target.value, 10))}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
                <option value="Nightmare">Nightmare</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 mb-1">Country / Year</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Country"
                  className="w-1/2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold"
                />
                <input
                  type="text"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="Year"
                  className="w-1/2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Slogan</label>
              <input
                type="text"
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                placeholder="e.g. Just Do It"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Interesting Fact</label>
              <textarea
                rows={2}
                value={interestingFact}
                onChange={(e) => setInterestingFact(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 mb-1">Vector Logo SVG *</label>
              <textarea
                rows={4}
                required
                value={imageSvg}
                onChange={(e) => setImageSvg(e.target.value)}
                className="w-full px-3 py-2 font-mono text-xs bg-slate-800 border border-slate-700 rounded-xl text-slate-200"
              />

              {/* Live Preview */}
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold">SVG Preview:</span>
                <div className="w-16 h-16 bg-white rounded-xl p-2 flex items-center justify-center border border-slate-700">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: imageSvg }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setEditingLogo(null);
                setIsCreatingLogo(false);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Logo</span>
            </button>
          </div>
        </form>
      )}

      {/* 2. CATEGORIES TAB */}
      {activeAdminTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat.categoryId} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
              <span className="text-3xl p-2 bg-slate-800 rounded-xl">{cat.iconEmoji}</span>
              <div>
                <div className="font-bold text-white text-sm">{cat.name}</div>
                <div className="text-xs text-slate-400">{cat.categoryId}</div>
              </div>
            </div>
          ))}
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
        <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="font-display font-black text-lg text-white">
            Change Administrator PIN
          </h3>
          <p className="text-xs text-slate-400">
            Set a new 4-8 digit numeric PIN to lock access to this admin suite.
          </p>

          {pinChangeMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl">
              {pinChangeMsg}
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-3">
            <input
              type="password"
              required
              minLength={4}
              maxLength={8}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              placeholder="New PIN (min 4 digits)"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
            >
              Update PIN
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
