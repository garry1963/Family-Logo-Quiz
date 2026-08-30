import React, { useState } from 'react';
import { X, Plus, Check, ShieldCheck, Heart, UserPlus, Trash2 } from 'lucide-react';
import { ProfileRecord, Difficulty } from '../types';
import { sound } from '../services/soundEffects';

interface ProfileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: ProfileRecord[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onAddProfile: (profile: Omit<ProfileRecord, 'profileId' | 'createdAt' | 'lastPlayed'>) => void;
  onDeleteProfile: (profileId: string) => void;
}

const AVATAR_OPTIONS = [
  '👨‍💼', '👩‍🦰', '👦', '👧', '🦁', '🚀', '🦄', '🎨', '🏎️', '🍕',
  '🐶', '🐱', '🐼', '🦊', '🦉', '👑', '⭐', '⚽', '🎸', '🎮'
];

export const ProfileSelectorModal: React.FC<ProfileSelectorModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  onDeleteProfile
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('👨‍💼');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [unlimitedHints, setUnlimitedHints] = useState(false);
  const [noTimer, setNoTimer] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [easyModeOnly, setEasyModeOnly] = useState(false);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    sound.playTap();
    onAddProfile({
      displayName: name.trim(),
      avatar: selectedAvatar,
      difficultyPreference: difficulty,
      unlimitedHints,
      noTimer,
      largeText,
      reducedMotion: false,
      easyModeOnly,
      isChildFriendly: unlimitedHints || easyModeOnly
    });
    setName('');
    setIsCreating(false);
    onClose();
  };

  return (
    <div 
      id="profile-selector-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div 
        id="profile-selector-card"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display font-black text-2xl text-white tracking-tight">
              {isCreating ? 'Create Family Member' : "Who's Playing?"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isCreating
                ? 'Customize player settings and kid-friendly helpers'
                : 'Select your personal tablet profile to load progress'}
            </p>
          </div>
          <button
            id="close-profile-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {!isCreating ? (
            <>
              {/* Profiles Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {profiles.map(profile => {
                  const isCurrent = profile.profileId === activeProfileId;
                  return (
                    <div
                      key={profile.profileId}
                      className={`relative flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                        isCurrent
                          ? 'bg-blue-950/60 border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                      onClick={() => {
                        sound.playTap();
                        onSelectProfile(profile.profileId);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-3xl p-1 bg-slate-800 rounded-xl border border-slate-700">
                          {profile.avatar}
                        </span>
                        <div className="truncate">
                          <div className="font-bold text-white text-base truncate flex items-center gap-2">
                            {profile.displayName}
                            {isCurrent && (
                              <Check className="w-4 h-4 text-blue-400 inline shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <span>{profile.difficultyPreference}</span>
                            {profile.unlimitedHints && (
                              <span className="text-amber-400 font-semibold">· ∞ Hints</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {profiles.length > 1 && (
                        <button
                          id={`delete-profile-${profile.profileId}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete profile "${profile.displayName}"?`)) {
                              sound.playDelete();
                              onDeleteProfile(profile.profileId);
                            }
                          }}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ml-2 shrink-0"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Profile Trigger */}
              <button
                id="open-add-profile-form-btn"
                onClick={() => {
                  sound.playTap();
                  setIsCreating(true);
                }}
                className="w-full flex items-center justify-center gap-2.5 p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 hover:bg-blue-950/20 text-slate-300 hover:text-blue-400 font-bold transition-all min-h-[52px]"
              >
                <UserPlus className="w-5 h-5" />
                Add New Family Member Profile
              </button>
            </>
          ) : (
            /* Creation Form */
            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Name / Nickname
                </label>
                <input
                  type="text"
                  required
                  maxLength={25}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mum, Lucas, Garry, Grandpa"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 font-semibold focus:outline-none focus:border-blue-500 min-h-[48px]"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Choose Avatar
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-2 bg-slate-800/60 rounded-2xl border border-slate-700/60 max-h-36 overflow-y-auto">
                  {AVATAR_OPTIONS.map(emoji => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => {
                        sound.playTap();
                        setSelectedAvatar(emoji);
                      }}
                      className={`text-2xl p-2 rounded-xl flex items-center justify-center transition-transform hover:scale-110 min-h-[44px] min-w-[44px] ${
                        selectedAvatar === emoji
                          ? 'bg-blue-600 ring-2 ring-blue-400'
                          : 'hover:bg-slate-700'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Preferred Starting Difficulty
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['Easy', 'Medium', 'Hard', 'Expert', 'Nightmare'] as Difficulty[]).map(diff => (
                    <button
                      type="button"
                      key={diff}
                      onClick={() => {
                        sound.playTap();
                        setDifficulty(diff);
                      }}
                      className={`py-2 px-1 text-xs font-bold rounded-xl border transition-all min-h-[44px] ${
                        difficulty === diff
                          ? 'bg-blue-600 border-blue-400 text-white'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Child-Friendly & Accessibility Toggles */}
              <div className="p-4 bg-slate-800/40 rounded-2xl border border-slate-700/60 space-y-3">
                <div className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  Child-Friendly & Helper Options
                </div>

                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                  <div>
                    <div className="text-sm font-semibold text-white">Unlimited Free Hints</div>
                    <div className="text-xs text-slate-400">Great for younger kids or relaxed play</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={unlimitedHints}
                    onChange={(e) => setUnlimitedHints(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                  <div>
                    <div className="text-sm font-semibold text-white">No Timers or Time Pressure</div>
                    <div className="text-xs text-slate-400">Puzzles never rush you</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={noTimer}
                    onChange={(e) => setNoTimer(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer min-h-[44px]">
                  <div>
                    <div className="text-sm font-semibold text-white">Easy Mode Only</div>
                    <div className="text-xs text-slate-400">Focuses purely on famous everyday brands</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={easyModeOnly}
                    onChange={(e) => setEasyModeOnly(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-0"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors min-h-[48px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-lg shadow-blue-600/30 transition-all min-h-[48px]"
                >
                  Create & Play
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
