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
  EyeOff,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  AlertCircle
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

  // Change Admin Password / PIN state
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [showPins, setShowPins] = useState(false);
  const [pinChangeError, setPinChangeError] = useState<string | null>(null);
  const [pinChangeSuccess, setPinChangeSuccess] = useState<string | null>(null);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (storage.verifyAdminPin(pinInput)) {
      sound.playFanfare();
      onUnlockAdmin();
    } else {
      sound.playIncorrect();
      setPinError(true);
      setTimeout(() => setPinError(false), 800);
    }
  };

  const handleChangeAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeError(null);
    setPinChangeSuccess(null);

    if (!storage.verifyAdminPin(currentPinInput)) {
      sound.playIncorrect();
      setPinChangeError('Current admin password / PIN is incorrect.');
      return;
    }

    const trimmedNew = newPinInput.trim();
    if (trimmedNew.length < 4) {
      sound.playIncorrect();
      setPinChangeError('New password / PIN must be at least 4 characters or digits.');
      return;
    }

    if (trimmedNew !== confirmPinInput.trim()) {
      sound.playIncorrect();
      setPinChangeError('New password / PIN and confirmation do not match.');
      return;
    }

    storage.updateAdminPin(trimmedNew);
    sound.playFanfare();
    setPinChangeSuccess('Admin password / PIN updated successfully!');
    setCurrentPinInput('');
    setNewPinInput('');
    setConfirmPinInput('');
    setTimeout(() => {
      setPinChangeSuccess(null);
      setIsChangingPin(false);
    }, 2500);
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

      {/* Admin Security & Password Management Section */}
      <div id="admin-security-section" className="bg-slate-900/80 border border-amber-500/30 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Administrator Access & Password
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Protect content management, logo editors, and level configurations with a secure custom password or PIN.
            </p>
          </div>
          <button
            type="button"
            id="toggle-change-pin-btn"
            onClick={() => {
              sound.playTap();
              setIsChangingPin(!isChangingPin);
              setPinChangeError(null);
              setPinChangeSuccess(null);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto min-h-[40px]"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>{isChangingPin ? 'Cancel Password Change' : 'Change Admin Password'}</span>
          </button>
        </div>

        {/* Change Admin Password Form */}
        {isChangingPin && (
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-amber-500/40 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="font-display font-extrabold text-sm text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Set New Admin Password / PIN
              </h4>
              <button
                type="button"
                onClick={() => setShowPins(!showPins)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-medium"
              >
                {showPins ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPins ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>
            </div>

            {pinChangeSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{pinChangeSuccess}</span>
              </div>
            )}

            {pinChangeError && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{pinChangeError}</span>
              </div>
            )}

            <form onSubmit={handleChangeAdminPassword} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Current Password / PIN
                  </label>
                  <input
                    type={showPins ? 'text' : 'password'}
                    required
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder="Enter current PIN"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    New Password / PIN
                  </label>
                  <input
                    type={showPins ? 'text' : 'password'}
                    required
                    minLength={4}
                    maxLength={16}
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="Min 4 characters / digits"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type={showPins ? 'text' : 'password'}
                    required
                    minLength={4}
                    maxLength={16}
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-amber-400 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="save-new-pin-btn"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all min-h-[44px]"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Update Admin Password</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admin Suite Unlock Controls */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Enter your administrator password / PIN to open content management tools:</span>
            {storage.getAdminPin() === '1234' && (
              <span className="text-amber-400 font-bold text-[11px]">(Default PIN: 1234)</span>
            )}
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-wrap items-center gap-3">
            <input
              type="password"
              maxLength={16}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="Enter Admin Password / PIN"
              className={`px-4 py-3 bg-slate-800 border rounded-xl text-white font-bold text-sm focus:outline-none min-h-[48px] w-64 ${
                pinError ? 'border-red-500 bg-red-950/20' : 'border-slate-700 focus:border-amber-400'
              }`}
            />
            <button
              type="submit"
              id="unlock-admin-suite-btn"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all min-h-[48px] shadow-md shadow-amber-500/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>Unlock Admin Suite</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
