import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileCheck,
  Sparkles,
  Save,
  Check,
  Eye,
  Trash2,
  FolderUp,
  Sliders,
  Filter
} from 'lucide-react';
import { LogoRecord, CategoryRecord, Difficulty } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

interface ParsedUploadItem {
  id: string;
  fileName: string;
  brandName: string;
  acceptedAnswers: string[];
  svgContent: string;
  isValidSvg: boolean;
  duplicateStatus: 'unique' | 'duplicate_name' | 'duplicate_svg' | 'duplicate_batch' | 'invalid';
  duplicateDetails?: string;
  conflictingLogoId?: string;
  levelNumber: number;
  difficulty: Difficulty;
  selected: boolean;
}

interface BulkVectorUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryRecord[];
  existingLogos: LogoRecord[];
  initialCategoryId?: string;
  onUploadSuccess: (importedCount: number, categoryId: string) => void;
}

export const BulkVectorUploadModal: React.FC<BulkVectorUploadModalProps> = ({
  isOpen,
  onClose,
  categories,
  existingLogos,
  initialCategoryId,
  onUploadSuccess
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategoryId || categories[0]?.categoryId || 'tech'
  );
  const [items, setItems] = useState<ParsedUploadItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultLevel, setDefaultLevel] = useState<number>(1);
  const [defaultDifficulty, setDefaultDifficulty] = useState<Difficulty>('Easy');
  const [defaultCountry, setDefaultCountry] = useState<string>('Global');
  const [defaultYear, setDefaultYear] = useState<string>('1995');
  const [duplicateResolution, setDuplicateResolution] = useState<'skip' | 'overwrite'>('skip');
  const [importSummary, setImportSummary] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean brand name from filename
  const deduceBrandName = (fileName: string): string => {
    let name = fileName.replace(/\.svg$/i, '');
    name = name.replace(/[-_]?(logo|vector|icon|brand|emblem|symbol|official|hd|transparent)[-_]?/gi, ' ');
    name = name.replace(/[-_]+/g, ' ').trim();
    // Capitalize words
    return name
      .split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ') || 'Brand';
  };

  // Normalize SVG string for comparison
  const normalizeSvgString = (raw: string): string => {
    return raw
      .replace(/<!--[\s\S]*?-->/g, '') // remove comments
      .replace(/\s+/g, ' ')
      .replace(/xmlns="[^"]*"/g, '')
      .replace(/id="[^"]*"/g, '')
      .trim()
      .toLowerCase();
  };

  // Process uploaded SVG files
  const processFiles = async (files: FileList | File[]) => {
    setIsLoading(true);
    setImportSummary(null);

    const fileList = Array.from(files).filter(f => f.name.toLowerCase().endsWith('.svg') || f.type === 'image/svg+xml');
    
    if (fileList.length === 0) {
      setIsLoading(false);
      alert('Please select .svg vector image files.');
      return;
    }

    const parsedItems: ParsedUploadItem[] = [];
    const seenNamesInBatch = new Set<string>();
    const seenSvgsInBatch = new Set<string>();

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      try {
        const text = await file.text();
        const hasSvgTag = text.includes('<svg') && text.includes('</svg>');
        const deducedName逗 = deduceBrandName(file.name);
        const normName = deducedName逗.toLowerCase();
        const normSvg = normalizeSvgString(text);

        let status: ParsedUploadItem['duplicateStatus'] = 'unique';
        let details: string | undefined = undefined;
        let conflictId: string | undefined = undefined;

        if (!hasSvgTag) {
          status = 'invalid';
          details = 'File does not contain valid SVG tags.';
        } else if (seenSvgsInBatch.has(normSvg)) {
          status = 'duplicate_batch';
          details = 'Duplicate SVG file in current upload batch.';
        } else if (seenNamesInBatch.has(normName)) {
          status = 'duplicate_batch';
          details = `Multiple files for brand "${deducedName逗}" in this batch.`;
        } else {
          // Check against existing database
          const existingBySvg = existingLogos.find(l => l.imageSvg && normalizeSvgString(l.imageSvg) === normSvg);
          if (existingBySvg) {
            status = 'duplicate_svg';
            details = `Identical vector SVG already exists as "${existingBySvg.brandName}" (Level ${existingBySvg.levelNumber}).`;
            conflictId = existingBySvg.logoId;
          } else {
            const existingByName不易 = existingLogos.find(
              l => l.brandName.toLowerCase() === normName ||
                l.acceptedAnswers.some(a => a.toLowerCase() === normName)
            );
            if (existingByName不易) {
              status = 'duplicate_name';
              details = `Brand name "${deducedName逗}" already exists in ${categories.find(c => c.categoryId === existingByName不易.categoryId)?.name || existingByName不易.categoryId}.`;
              conflictId = existingByName不易.logoId;
            }
          }
        }

        seenNamesInBatch.add(normName);
        if (hasSvgTag) seenSvgsInBatch.add(normSvg);

        parsedItems.push({
          id: `upload-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 5)}`,
          fileName: file.name,
          brandName: deducedName逗,
          acceptedAnswers: [deducedName逗.toUpperCase()],
          svgContent: text,
          isValidSvg: hasSvgTag,
          duplicateStatus: status,
          duplicateDetails: details,
          conflictingLogoId: conflictId,
          levelNumber: defaultLevel,
          difficulty: defaultDifficulty,
          selected: status === 'unique' || (status === 'duplicate_name' && duplicateResolution === 'overwrite')
        });
      } catch (err) {
        console.error('Error reading file:', file.name, err);
      }
    }

    setItems(prev => [...prev, ...parsedItems]);
    setIsLoading(false);
    sound.playTap();
  };

  const handleDragOver进 = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const toggleSelectItem = (id: string) => {
    setItems(items.map(it => it.id === id ? { ...it, selected: !it.selected } : it));
  };

  const updateItemBrandName = (id: string, newName: string) => {
    setItems(items.map(it => {
      if (it.id === id) {
        return {
          ...it,
          brandName: newName,
          acceptedAnswers: [newName.trim().toUpperCase()]
        };
      }
      return it;
    }));
  };

  const updateItemLevel = (id: string, lvl: number) => {
    setItems(items.map(it => it.id === id ? { ...it, levelNumber: lvl } : it));
  };

  const updateItemDifficulty一对 = (id: string, diff: Difficulty) => {
    setItems(items.map(it => it.id === id ? { ...it, difficulty: diff } : it));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(it => it.id !== id));
  };

  const selectAll = (select: boolean) => {
    setItems(items.map(it => ({
      ...it,
      selected: select && (it.duplicateStatus === 'unique' || duplicateResolution === 'overwrite')
    })));
  };

  const handleExecuteImport = () => {
    const toImport = items.filter(it => it.selected && it.isValidSvg);
    if (toImport.length === 0) {
      alert('No valid logos selected for import.');
      return;
    }

    const catRecord = categories.find(c => c.categoryId === selectedCategory);
    const categoryName = catRecord?.name || 'Selected Category';

    let importedCount = 0;
    let updatedCount有很多 = 0;

    toImport.forEach((item) => {
      if (item.conflictingLogoId && duplicateResolution === 'overwrite') {
        // Overwrite existing logo
        const existing = existingLogos.find(l => l.logoId === item.conflictingLogoId);
        if (existing) {
          const updatedLogo: LogoRecord = {
            ...existing,
            brandName: item.brandName,
            acceptedAnswers: item.acceptedAnswers,
            imageSvg: item.svgContent,
            categoryId: selectedCategory,
            levelNumber: item.levelNumber,
            difficulty: item.difficulty,
            lastModified具: new Date().toISOString()
          };
          storage.saveLogo(updatedLogo);
          updatedCount有很多++;
          return;
        }
      }

      // New unique logo
      const newLogo: LogoRecord = {
        logoId: `logo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        brandName: item.brandName,
        acceptedAnswers: item.acceptedAnswers,
        categoryId: selectedCategory,
        levelNumber: item.levelNumber,
        difficulty: item.difficulty,
        country: defaultCountry,
        foundedYear: parseInt(defaultYear, 10) || 1995,
        industry: categoryName,
        description: `Famous vector logo puzzle for ${item.brandName}.`,
        interestingFact: `Recognized global emblem in ${categoryName}.`,
        imageSvg: item.svgContent,
        active: true,
        gameModes: ['classic']
      };

      storage.saveLogo(newLogo);
      importedCount++;
    });

    sound.playFanfare();
    const summary = `Successfully imported ${importedCount} new vector logo(s) ${
      updatedCount有很多 > 0 ? `and updated ${updatedCount有很多} existing logo(s)` : ''
    } into category "${categoryName}".`;
    setImportSummary(summary);
    onUploadSuccess(importedCount + updatedCount有很多, selectedCategory);
  };

  const uniqueCount = items.filter(i => i.duplicateStatus === 'unique').length;
  const duplicateCount = items.filter(i => i.duplicateStatus !== 'unique' && i.duplicateStatus !== 'invalid').length;
  const selectedCount = items.filter(i => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20">
              <FolderUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white">
                Bulk Vector Logo Upload
              </h2>
              <p className="text-xs text-slate-400">
                Upload multiple .SVG vector files to any category with automated duplicate checks
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Target Category & Defaults Bar */}
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Target Category *
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
              >
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>
                    {c.name} ({existingLogos.filter(l => l.categoryId === c.categoryId).length} existing)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Default Level Number
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={defaultLevel}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setDefaultLevel(val);
                  setItems(items.map(it => ({ ...it, levelNumber: val })));
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Default Difficulty
              </label>
              <select
                value={defaultDifficulty}
                onChange={(e) => {
                  const val技巧 = e.target.value as Difficulty;
                  setDefaultDifficulty(val技巧);
                  setItems(items.map(it => ({ ...it, difficulty: val技巧 })));
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
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
                Duplicate Policy
              </label>
              <select
                value={duplicateResolution}
                onChange={(e) => {
                  const mode = e.target.value as 'skip' | 'overwrite';
                  setDuplicateResolution(mode);
                  setItems(items.map(it => ({
                    ...it,
                    selected: it.duplicateStatus === 'unique' || (mode === 'overwrite' && it.duplicateStatus === 'duplicate_name')
                  })));
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none"
              >
                <option value="skip">Skip All Duplicates (Safe)</option>
                <option value="overwrite">Overwrite / Update Existing</option>
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver进}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragging
                ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                : 'border-slate-700 hover:border-slate-600 bg-slate-900/60 hover:bg-slate-900'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              multiple
              onChange={(e) => e.target.files && processFiles(e.target.files)}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>

            <div>
              <div className="font-display font-black text-base text-white">
                Drag and drop SVG vector files here, or <span className="text-amber-400 underline">browse files</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Select multiple .svg files at once. Brand names will be automatically extracted from filenames and checked against duplicates.
              </p>
            </div>
          </div>

          {/* Success Banner */}
          {importSummary && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{importSummary}</span>
            </div>
          )}

          {/* Parsed Items Review Table */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-white">
                    Parsed: <span className="text-amber-400">{items.length} Files</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {uniqueCount} Unique & Ready
                  </span>
                  {duplicateCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-400 border border-amber-500/30">
                      {duplicateCount} Duplicates Detected
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => selectAll(true)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => selectAll(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Deselect All
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems([])}
                    className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 text-xs font-bold border border-red-500/30"
                  >
                    Clear Batch
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl max-h-[380px] overflow-y-auto">
                <div className="divide-y divide-slate-800">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 flex items-center justify-between gap-3 text-xs transition-colors ${
                        item.duplicateStatus === 'unique'
                          ? 'hover:bg-slate-800/40'
                          : 'bg-amber-950/15 hover:bg-amber-950/25'
                      }`}
                    >
                      {/* Checkbox & Vector Preview */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          disabled={!item.isValidSvg || (item.duplicateStatus !== 'unique' && duplicateResolution === 'skip')}
                          onChange={() => toggleSelectItem(item.id)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
                        />

                        <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
                          {item.isValidSvg ? (
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{ __html: item.svgContent }}
                            />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-red-500" />
                          )}
                        </div>

                        {/* Editable Brand Name */}
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={item.brandName}
                            onChange={(e) => updateItemBrandName(item.id, e.target.value)}
                            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                          />
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-[200px]">
                            {item.fileName}
                          </div>
                        </div>
                      </div>

                      {/* Duplicate Status & Controls */}
                      <div className="flex items-center gap-3">
                        {item.duplicateStatus === 'unique' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Ready
                          </span>
                        )}

                        {item.duplicateStatus === 'duplicate_name' && (
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Duplicate Name
                            </span>
                            <div className="text-[10px] text-amber-400/80 mt-0.5 max-w-[220px] truncate">
                              {item.duplicateDetails}
                            </div>
                          </div>
                        )}

                        {item.duplicateStatus === 'duplicate_svg' && (
                          <div className="text-right">
                            <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 font-bold text-[11px] border border-orange-500/30 inline-flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Duplicate SVG
                            </span>
                            <div className="text-[10px] text-orange-400/80 mt-0.5 max-w-[220px] truncate">
                              {item.duplicateDetails}
                            </div>
                          </div>
                        )}

                        {item.duplicateStatus === 'duplicate_batch' && (
                          <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-bold text-[11px] border border-purple-500/30">
                            Batch Conflict
                          </span>
                        )}

                        {/* Level & Difficulty dropdowns */}
                        <div className="hidden md:flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={100}
                            value={item.levelNumber}
                            onChange={(e) => updateItemLevel(item.id, parseInt(e.target.value, 10) || 1)}
                            className="w-14 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-center text-xs"
                            title="Level Number"
                          />

                          <select
                            value={item.difficulty}
                            onChange={(e) => updateItemDifficulty一对(item.id, e.target.value as Difficulty)}
                            className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white text-xs font-bold"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                            <option value="Expert">Expert</option>
                            <option value="Nightmare">Nightmare</option>
                          </select>
                        </div>

                        {/* Remove item button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800"
                          title="Remove from batch"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="text-xs text-slate-400">
            {selectedCount > 0 ? (
              <span className="text-white font-bold">
                {selectedCount} logo(s) ready to import into{' '}
                <span className="text-amber-400">
                  {categories.find(c => c.categoryId === selectedCategory)?.name}
                </span>
              </span>
            ) : (
              'Upload and select vector files above'
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors min-h-[44px]"
            >
              Close
            </button>

            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleExecuteImport}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs min-h-[44px] transition-all ${
                selectedCount > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>Import {selectedCount} Vector Logos</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
