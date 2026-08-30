import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Sparkles, AlertCircle, Palette } from 'lucide-react';
import { CategoryRecord, Difficulty } from '../types';
import { CategoryIcon, AVAILABLE_CATEGORY_ICONS } from './CategoryIcon';
import { sound } from '../services/soundEffects';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: CategoryRecord | null;
  existingCategories: CategoryRecord[];
  onSaveCategory: (category: CategoryRecord) => void;
}

const GRADIENT_OPTIONS = [
  { label: 'Ocean Blue', value: 'from-blue-600 to-cyan-500' },
  { label: 'Sunset Fire', value: 'from-red-600 to-amber-500' },
  { label: 'Emerald Forest', value: 'from-green-600 to-emerald-400' },
  { label: 'Amber Gold', value: 'from-amber-600 to-yellow-400' },
  { label: 'Tangerine', value: 'from-orange-600 to-red-500' },
  { label: 'Electric Purple', value: 'from-purple-600 to-indigo-500' },
  { label: 'Neon Pink', value: 'from-pink-600 to-rose-400' },
  { label: 'Midnight Slate', value: 'from-slate-700 to-slate-900' },
  { label: 'Royal Violet', value: 'from-violet-600 to-fuchsia-500' },
  { label: 'Teal Mint', value: 'from-teal-600 to-emerald-500' },
  { label: 'Sky Azure', value: 'from-sky-600 to-blue-500' },
  { label: 'British Blue-Red', value: 'from-blue-700 to-red-600' }
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  existingCategories,
  onSaveCategory
}) => {
  const isEditing = !!categoryToEdit;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Laptop');
  const [iconEmoji, setIconEmoji] = useState('');
  const [color, setColor] = useState('from-blue-600 to-cyan-500');
  const [defaultDifficulty, setDefaultDifficulty] = useState<Difficulty>('Easy');
  const [active, setActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setCategoryId(categoryToEdit.categoryId);
      setDescription(categoryToEdit.description || '');
      setIconName(categoryToEdit.iconName || 'Laptop');
      setIconEmoji(categoryToEdit.iconEmoji || '');
      setColor(categoryToEdit.color || 'from-blue-600 to-cyan-500');
      setDefaultDifficulty(categoryToEdit.defaultDifficulty || 'Easy');
      setActive(categoryToEdit.active !== false);
    } else {
      setName('');
      setCategoryId('');
      setDescription('');
      setIconName('Sparkles');
      setIconEmoji('');
      setColor('from-blue-600 to-cyan-500');
      setDefaultDifficulty('Easy');
      setActive(true);
    }
    setError('');
  }, [categoryToEdit, isOpen]);

  // Auto generate slug from name if new
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      setCategoryId(generatedSlug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedId = categoryId.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (!trimmedName) {
      setError('Category name is required.');
      return;
    }

    if (!trimmedId) {
      setError('Category identifier (slug) is required.');
      return;
    }

    // Check duplicate ID if creating new or renaming ID
    if (!isEditing || (categoryToEdit && categoryToEdit.categoryId !== trimmedId)) {
      if (existingCategories.some(c => c.categoryId.toLowerCase() === trimmedId)) {
        setError(`A category with ID "${trimmedId}" already exists. Please choose a unique name or ID.`);
        return;
      }
    }

    // Check duplicate name
    if (!isEditing || (categoryToEdit && categoryToEdit.name.toLowerCase() !== trimmedName.toLowerCase())) {
      if (existingCategories.some(c => c.categoryId !== (categoryToEdit?.categoryId) && c.name.toLowerCase() === trimmedName.toLowerCase())) {
        setError(`A category named "${trimmedName}" already exists.`);
        return;
      }
    }

    const newRecord: CategoryRecord = {
      categoryId: trimmedId,
      name: trimmedName,
      description: description.trim() || `Logos, brands and products in ${trimmedName}`,
      iconName: iconName || 'Layers',
      iconEmoji: iconEmoji.trim() || undefined,
      color,
      sortOrder: categoryToEdit?.sortOrder ?? (existingCategories.length + 1),
      active,
      defaultDifficulty
    };

    sound.playFanfare();
    onSaveCategory(newRecord);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
              <CategoryIcon iconName={iconName} iconEmoji={iconEmoji} className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white">
                {isEditing ? `Edit Category: ${categoryToEdit?.name}` : 'Create New Category'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Update category branding, icon, and difficulty settings'
                  : 'Add a new brand category for organizing and uploading logo sets'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Luxury Watches, Aerospace"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Category Slug / ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. luxury_watches"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={isEditing}
                className={`w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono font-bold text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-400 ${
                  isEditing ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Brief description of the brands, industries or theme covered in this category"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">
                Choose Vector Icon or Custom Emoji
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">Custom Emoji:</span>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. ⌚"
                  value={iconEmoji}
                  onChange={(e) => setIconEmoji(e.target.value)}
                  className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-center text-sm font-bold text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-7 sm:grid-cols-10 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
              {AVAILABLE_CATEGORY_ICONS.map((iconKey) => (
                <button
                  type="button"
                  key={iconKey}
                  onClick={() => {
                    sound.playTap();
                    setIconName(iconKey);
                    setIconEmoji('');
                  }}
                  className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                    iconName === iconKey && !iconEmoji
                      ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400 scale-105'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title={iconKey}
                >
                  <CategoryIcon iconName={iconKey} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Color Gradient Themes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Card Color Accent Gradient
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => {
                    sound.playTap();
                    setColor(g.value);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    color === g.value
                      ? 'border-amber-400 ring-2 ring-amber-400/30 bg-slate-800'
                      : 'border-slate-700/60 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg bg-gradient-to-br ${g.value} shrink-0`} />
                  <span className="text-[11px] font-bold text-slate-300 truncate">{g.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Difficulty & Active status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Default Difficulty
              </label>
              <select
                value={defaultDifficulty}
                onChange={(e) => setDefaultDifficulty(e.target.value as Difficulty)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
                <option value="Expert">Expert</option>
                <option value="Nightmare">Nightmare</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Category Status
              </label>
              <button
                type="button"
                onClick={() => setActive(!active)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-between ${
                  active
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <span>{active ? 'Active & Visible in Game' : 'Hidden / Inactive'}</span>
                <span className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-500'}`} />
              </button>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors min-h-[44px]"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Category' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
