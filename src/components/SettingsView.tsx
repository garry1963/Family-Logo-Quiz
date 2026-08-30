import React, { useState } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Smartphone,
  Sparkles,
  Heart,
  ShieldAlert,
  Download,
  Upload,
  RotateCcw,
  Check,
  Lock,
  KeyRound,
  Eye,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import { SettingsState, ProfileRecord } from '../types';
import { storage } from '../services/storageService';
import { sound } from '../services/soundEffects';

interface SettingsViewProps {
  settings: SettingsState;
  onUpdateSettings: (newSettings: Partial<SettingsState>) => void;
  activeProfile: ProfileRecord;
  onUnlockAdmin: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  activeProfile,
  onUnlockAdmin
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const realPin = storage.getDatabase().adminPin || '1234';
    if (pinInput === realPin) {
      sound.playFanfare();
      onUnlockAdmin();
    } else {
      sound.playIncorrect();
      setPinError(true);
      setTimeout(() => setPinError(false), 800);
    }
  };

  const handleExportBackup = () => {
    sound.playTap();
    const data = storage.exportFullBackup();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `family_logo_quiz_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storage.importFullBackup(content);
      if (res.success) {
        sound.playFanfare();
        setImportStatus('Backup restored successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1200);
      } else {
        sound.playIncorrect();
        setImportStatus(`Error: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-view" className="p-4 sm:p-6 md:p-8 space-y-6 max-w-4xl mx-auto select-none">
      {/* Header */}
      <div>
        <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-blue-400" />
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Tablet controls, appearance & colour scheme, family accessibility helpers, audio feedback, and administrator controls.
        </p>
      </div>

      {/* Colour Scheme / Theme Section */}
      <div id="appearance-settings-section" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            Appearance & Colour Scheme
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Current: <strong className="text-blue-400 capitalize">{settings.theme || 'dark'}</strong>
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Choose between a crisp, high-contrast light theme for bright rooms or the classic deep dark palette.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Light Theme Option */}
          <button
            type="button"
            id="theme-option-light"
            onClick={() => {
              sound.playTap();
              onUpdateSettings({ theme: 'light' });
            }}
            className={`flex flex-col items-start gap-2.5 p-4 rounded-2xl border-2 transition-all text-left min-h-[90px] ${
              settings.theme === 'light'
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-white">Light Scheme</span>
              </div>
              {settings.theme === 'light' && (
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400">
              Bright background with crisp dark typography
            </span>
          </button>

          {/* Dark Theme Option */}
          <button
            type="button"
            id="theme-option-dark"
            onClick={() => {
              sound.playTap();
              onUpdateSettings({ theme: 'dark' });
            }}
            className={`flex flex-col items-start gap-2.5 p-4 rounded-2xl border-2 transition-all text-left min-h-[90px] ${
              settings.theme === 'dark'
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-white">Dark Scheme</span>
              </div>
              {settings.theme === 'dark' && (
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400">
              Midnight slate background, easy on the eyes
            </span>
          </button>

          {/* System Auto Option */}
          <button
            type="button"
            id="theme-option-system"
            onClick={() => {
              sound.playTap();
              onUpdateSettings({ theme: 'system' });
            }}
            className={`flex flex-col items-start gap-2.5 p-4 rounded-2xl border-2 transition-all text-left min-h-[90px] ${
              settings.theme === 'system'
                ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10'
                : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Laptop className="w-4 h-4" />
                </div>
                <span className="font-display font-bold text-sm text-white">System Auto</span>
              </div>
              {settings.theme === 'system' && (
                <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400">
              Automatically match your device's preference
            </span>
          </button>
        </div>
      </div>

      {/* Audio & Haptics Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-blue-400" />
          Audio & Feedback
        </h3>

        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60 cursor-pointer min-h-[48px]">
          <div>
            <div className="text-sm font-bold text-white">Sound Effects (Web Audio API)</div>
            <div className="text-xs text-slate-400">Synthesized audio cues for taps, corrects, fanfare, and hints</div>
          </div>
          <input
            type="checkbox"
            checked={settings.soundEffects}
            onChange={(e) => {
              sound.playTap();
              onUpdateSettings({ soundEffects: e.target.checked });
            }}
            className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700"
          />
        </label>
      </div>

      {/* Family Accessibility & Helpers Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
          <Heart className="w-5 h-5 text-amber-400" />
          Family Play & Helpers
        </h3>

        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60 cursor-pointer min-h-[48px]">
          <div>
            <div className="text-sm font-bold text-white">Global Unlimited Hints</div>
            <div className="text-xs text-slate-400">All players get infinite free hints with no deduction</div>
          </div>
          <input
            type="checkbox"
            checked={settings.unlimitedHintsGlobal}
            onChange={(e) => {
              sound.playTap();
              onUpdateSettings({ unlimitedHintsGlobal: e.target.checked });
            }}
            className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60 cursor-pointer min-h-[48px]">
          <div>
            <div className="text-sm font-bold text-white">Simple Family Mode (Unlock All 52 Levels)</div>
            <div className="text-xs text-slate-400">Removes level lock barriers so family can jump straight into any level</div>
          </div>
          <input
            type="checkbox"
            checked={settings.simpleFamilyMode}
            onChange={(e) => {
              sound.playTap();
              onUpdateSettings({ simpleFamilyMode: e.target.checked });
            }}
            className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700"
          />
        </label>

        <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-2xl border border-slate-700/60 cursor-pointer min-h-[48px]">
          <div>
            <div className="text-sm font-bold text-white">Tablet Touch Swipe Navigation</div>
            <div className="text-xs text-slate-400">Swipe left or right across the screen to quickly flip between puzzles</div>
          </div>
          <input
            type="checkbox"
            checked={settings.swipeNavigation}
            onChange={(e) => {
              sound.playTap();
              onUpdateSettings({ swipeNavigation: e.target.checked });
            }}
            className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700"
          />
        </label>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-400" />
          Data Backup & Transfer
        </h3>
        <p className="text-xs text-slate-400">
          Save your family's puzzle progress, custom profiles, and unlocked badges to a JSON file to transfer between devices.
        </p>

        {importStatus && (
          <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-xs font-bold text-blue-300">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all min-h-[44px]"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Full Backup (.json)</span>
          </button>

          <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer min-h-[44px]">
            <Upload className="w-4 h-4 text-blue-400" />
            <span>Import Backup File</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          <button
            onClick={() => {
              if (window.confirm('Reset all family progress to factory defaults? This will erase custom progress!')) {
                sound.playDelete();
                storage.resetToFactory();
                window.location.reload();
              }
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 text-red-300 font-bold text-xs border border-red-500/30 transition-all min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Reset to Factory</span>
          </button>
        </div>
      </div>

      {/* Admin Suite PIN Login Section */}
      <div className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            Administrator Suite Access
          </h3>
          <span className="text-xs text-amber-400 font-bold">Default PIN: 1234</span>
        </div>

        <p className="text-xs text-slate-400">
          Unlock full content management tools: add new brand logos, edit vector SVGs, configure levels and categories, or perform bulk imports.
        </p>

        <form onSubmit={handleAdminLogin} className="flex items-center gap-3">
          <input
            type="password"
            maxLength={8}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="Enter Admin PIN (1234)"
            className={`px-4 py-3 bg-slate-800 border rounded-xl text-white font-bold text-sm focus:outline-none min-h-[48px] w-56 ${
              pinError ? 'border-red-500 bg-red-950/20' : 'border-slate-700 focus:border-amber-400'
            }`}
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all min-h-[48px]"
          >
            <KeyRound className="w-4 h-4" />
            <span>Unlock Admin Suite</span>
          </button>
        </form>
      </div>
    </div>
  );
};
