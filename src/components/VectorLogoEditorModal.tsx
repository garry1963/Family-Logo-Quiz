import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Trash2,
  Download,
  Copy,
  Check,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Code,
  Sparkles,
  Layers,
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  Grid
} from 'lucide-react';
import { LogoRecord, CategoryRecord, Difficulty } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

interface VectorLogoEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  logo: LogoRecord | null;
  categories: CategoryRecord[];
  onSaveSuccess: (updatedLogo: LogoRecord) => void;
  onDeleteSuccess?: (logoId: string) => void;
}

export const VectorLogoEditorModal: React.FC<VectorLogoEditorModalProps> = ({
  isOpen,
  onClose,
  logo,
  categories,
  onSaveSuccess,
  onDeleteSuccess
}) => {
  // Metadata state
  const [brandName, setBrandName] = useState('');
  const [acceptedAnswers, setAcceptedAnswers] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [levelNumber, setLevelNumber] = useState<number>(1);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [country, setCountry] = useState('Global');
  const [foundedYear, setFoundedYear] = useState('1990');
  const [industry, setIndustry] = useState('');
  const [slogan, setSlogan] = useState('');
  const [description, setDescription] = useState('');
  const [interestingFact, setInterestingFact] = useState('');
  const [active, setActive] = useState(true);

  // SVG Vector state
  const [svgCode, setSvgCode] = useState('');
  const [bgCanvas, setBgCanvas] = useState<'white' | 'dark' | 'checker'>('white');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [editorTab, setEditorTab] = useState<'preview' | 'code' | 'metadata'>('preview');
  const [errorMsg, setErrorMsg] = useState('');
  const [svgParseError, setSvgParseError] = useState(false);

  useEffect(() => {
    if (logo) {
      setBrandName(logo.brandName);
      setAcceptedAnswers((logo.acceptedAnswers || []).join(', '));
      setCategoryId(logo.categoryId || categories[0]?.categoryId || 'tech');
      setLevelNumber(logo.levelNumber || 1);
      setDifficulty(logo.difficulty || 'Easy');
      setCountry(logo.country || 'Global');
      setFoundedYear(String(logo.foundedYear || 1990));
      setIndustry(logo.industry || '');
      setSlogan(logo.slogan || '');
      setDescription(logo.description || '');
      setInterestingFact(logo.interestingFact || '');
      setActive(logo.active !== false);
      setSvgCode(logo.imageSvg || '');
      setZoomLevel(1);
      setErrorMsg('');
      setSvgParseError(false);
    }
  }, [logo, isOpen, categories]);

  // Handle local SVG file replacement
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      setErrorMsg('Please select a valid .svg vector file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content && content.includes('<svg')) {
        setSvgCode(content);
        setErrorMsg('');
        sound.playFanfare();
      } else {
        setErrorMsg('The selected file does not contain valid SVG markup.');
      }
    };
    reader.readAsText(file);
  };

  const handleCopySvg = () => {
    if (!svgCode) return;
    navigator.clipboard.writeText(svgCode);
    setCopied(true);
    sound.playTap();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgCode) return;
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_vector.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    sound.playFanfare();
  };

  const handleOptimizeSvg = () => {
    if (!svgCode) return;
    let cleaned = svgCode.trim();
    // Ensure xmlns is present
    if (!cleaned.includes('xmlns=')) {
      cleaned = cleaned.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    // Ensure viewBox is present
    if (!cleaned.includes('viewBox=')) {
      cleaned = cleaned.replace('<svg', '<svg viewBox="0 0 100 100"');
    }
    setSvgCode(cleaned);
    sound.playTap();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      setErrorMsg('Brand name is required.');
      return;
    }
    if (!svgCode.trim()) {
      setErrorMsg('Vector SVG code is required.');
      return;
    }

    const answers = acceptedAnswers
      .split(',')
      .map(a => a.trim().toUpperCase())
      .filter(Boolean);

    if (answers.length === 0) {
      answers.push(brandName.trim().toUpperCase());
    }

    const updatedLogoRecord: LogoRecord = {
      logoId: logo?.logoId || `logo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      brandName: brandName.trim(),
      acceptedAnswers: answers,
      categoryId,
      levelNumber: Number(levelNumber) || 1,
      difficulty,
      country: country.trim() || 'Global',
      foundedYear: parseInt(foundedYear, 10) || 1990,
      industry: industry.trim() || categories.find(c => c.categoryId === categoryId)?.name || 'General',
      slogan: slogan.trim() || undefined,
      description: description.trim() || `Famous brand in ${categories.find(c => c.categoryId === categoryId)?.name || 'industry'}.`,
      interestingFact: interestingFact.trim() || 'Iconic global vector branding and emblem.',
      imageSvg: svgCode.trim(),
      active,
      gameModes: logo?.gameModes || ['classic']
    };

    storage.saveLogo(updatedLogoRecord);
    sound.playFanfare();
    onSaveSuccess(updatedLogoRecord);
    onClose();
  };

  const handleDelete = () => {
    if (!logo) return;
    if (window.confirm(`Are you sure you want to permanently delete the vector logo for "${logo.brandName}"?`)) {
      sound.playDelete();
      storage.deleteLogo(logo.logoId);
      if (onDeleteSuccess) onDeleteSuccess(logo.logoId);
      onClose();
    }
  };

  if (!isOpen || !logo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center border border-slate-700 shadow-md">
              <div
                className="w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgCode }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-black text-xl text-white">
                  {brandName || 'Vector Logo Inspector'}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Level {levelNumber}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {difficulty}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Category: <span className="text-slate-200 font-bold">{categories.find(c => c.categoryId === categoryId)?.name || categoryId}</span> · ID: <span className="font-mono text-slate-400">{logo.logoId}</span>
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

        {/* View Tabs */}
        <div className="px-6 pt-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditorTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                editorTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Vector Visual Inspector</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                editorTab === 'code'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Live SVG Code</span>
            </button>

            <button
              type="button"
              onClick={() => setEditorTab('metadata')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                editorTab === 'metadata'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Brand Metadata & Trivia</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySvg}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              title="Copy SVG code"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy SVG'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              title="Download SVG file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .SVG</span>
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: VISUAL VECTOR INSPECTOR */}
          {editorTab === 'preview' && (
            <div className="space-y-4">
              {/* Canvas Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Canvas Background:</span>
                  <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setBgCanvas('white')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        bgCanvas === 'white' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>White</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgCanvas('dark')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        bgCanvas === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" />
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBgCanvas('checker')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 ${
                        bgCanvas === 'checker' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Grid</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Zoom:</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white px-2 min-w-[48px] text-center">
                      {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(Math.min(3, zoomLevel + 0.25))}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomLevel(1)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold px-2"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Vector Stage */}
              <div
                className={`relative w-full h-80 sm:h-96 rounded-3xl border border-slate-700/80 flex items-center justify-center overflow-hidden transition-colors shadow-inner ${
                  bgCanvas === 'white'
                    ? 'bg-white'
                    : bgCanvas === 'dark'
                    ? 'bg-slate-950'
                    : 'bg-slate-900 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]'
                }`}
              >
                <div
                  className="transition-transform duration-200 flex items-center justify-center p-6"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    maxWidth: '80%',
                    maxHeight: '80%',
                    width: '260px',
                    height: '260px'
                  }}
                  dangerouslySetInnerHTML={{ __html: svgCode }}
                />
              </div>

              {/* Upload Replacement Vector Action */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-amber-400" />
                    Replace Vector Image with Local .SVG File
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Upload a new clean SVG file to replace this vector artwork instantly.
                  </div>
                </div>

                <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-2 transition-all">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <span>Choose .SVG File</span>
                  <input
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SVG CODE EDITOR */}
          {editorTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300 font-bold">
                  Raw Vector SVG Code (Edit live to modify paths, fills, strokes, or colors):
                </div>

                <button
                  type="button"
                  onClick={handleOptimizeSvg}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Wrap & Optimize SVG</span>
                </button>
              </div>

              <textarea
                rows={12}
                required
                value={svgCode}
                onChange={(e) => setSvgCode(e.target.value)}
                className="w-full px-4 py-3 font-mono text-xs bg-slate-950 border border-slate-700 rounded-2xl text-emerald-400 focus:outline-none focus:border-amber-400 leading-relaxed"
                placeholder="<svg viewBox='0 0 100 100' ...> ... </svg>"
              />

              {/* Side by side mini live preview */}
              <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center gap-4">
                <div className="w-20 h-20 bg-white rounded-xl p-2 flex items-center justify-center border border-slate-600 shrink-0">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: svgCode }}
                  />
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white">Live SVG Render Check</div>
                  <p className="text-slate-400 text-[11px]">
                    Changes in the code box update the rendering in real-time across the game.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BRAND METADATA & TRIVIA */}
          {editorTab === 'metadata' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Category Assignment
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  {categories.map(c => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Accepted Guess Answers (comma-separated)
                </label>
                <input
                  type="text"
                  value={acceptedAnswers}
                  onChange={(e) => setAcceptedAnswers(e.target.value)}
                  placeholder="e.g. APPLE, APPLE INC, MACINTOSH"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-mono font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Level Number (1 - 52+)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={levelNumber}
                  onChange={(e) => setLevelNumber(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Difficulty
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
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
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Founded Year
                </label>
                <input
                  type="text"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Slogan (Optional)
                </label>
                <input
                  type="text"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  placeholder="e.g. Just Do It"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Interesting Fact / Trivia
                </label>
                <textarea
                  rows={2}
                  value={interestingFact}
                  onChange={(e) => setInterestingFact(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-xs"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 font-bold text-xs transition-colors min-h-[44px]"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Delete Logo</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors min-h-[44px]"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all min-h-[44px]"
              >
                <Save className="w-4 h-4" />
                <span>Save Vector Logo</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
