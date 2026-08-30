import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  Trash2,
  User,
  Sparkles,
  Shield,
  X,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  exportUserData,
  importUserData,
  clearUserData,
  seedDemoData,
  getUserData
} from '../services/storageService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataReset
}) => {
  const { user, updateCoachStyle } = useAuth();
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const handleExport = () => {
    const dataStr = exportUserData(user.uid);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gemini-growth-journal-${user.displayName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importUserData(user.uid, content);
      if (success) {
        setImportStatus('Data imported successfully!');
        onDataReset();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Invalid JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
    if (
      window.confirm(
        'Are you sure you want to clear all your journal entries, goals, and reviews? This cannot be undone.'
      )
    ) {
      clearUserData(user.uid);
      onDataReset();
      onClose();
    }
  };

  const handleReseed = () => {
    if (window.confirm('Reset this profile with authentic sample reflection data?')) {
      seedDemoData(user.uid, user);
      onDataReset();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Settings & Data Management</h3>
              <p className="text-xs text-slate-400">Manage your private journal partition and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* User Profile Card */}
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-teal-700 flex items-center justify-center text-base font-bold text-white flex-shrink-0">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                user.displayName.charAt(0)
              )}
            </div>
            <div className="truncate">
              <div className="text-sm font-bold text-white">{user.displayName}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
              <div className="text-[10px] text-teal-400 font-mono mt-0.5 truncate">
                UID: {user.uid}
              </div>
            </div>
          </div>

          {/* AI Coach Persona Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Gemini Coaching Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'action-oriented',
                  title: 'Action-Oriented',
                  desc: 'Direct synthesis, constructive feedback, rapid next steps.'
                },
                {
                  id: 'socratic',
                  title: 'Socratic',
                  desc: 'Probing questions, uncovers underlying assumptions.'
                },
                {
                  id: 'empathetic',
                  title: 'Empathetic',
                  desc: 'Validation, emotional safety, supportive encouragement.'
                }
              ].map((style) => {
                const isSelected = (user.coachStyle || 'action-oriented') === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => updateCoachStyle(style.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-teal-950/40 border-teal-500/60 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-bold text-teal-300 mb-1">{style.title}</div>
                    <div className="text-[11px] leading-relaxed opacity-80">{style.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data Ownership & Export / Import */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
              Data Ownership & Backup
            </label>
            <p className="text-xs text-slate-400">
              You own all your reflections and goals. Export your full history at any time or import an existing JSON archive.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4 text-teal-400" />
                <span>Export JSON Data</span>
              </button>

              <label className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-semibold flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div className="p-2 rounded-lg bg-teal-950/60 border border-teal-800 text-teal-200 text-xs text-center font-medium">
                {importStatus}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-xs font-bold text-rose-400 uppercase tracking-wider">
              Reset & Maintenance
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReseed}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 font-medium flex items-center space-x-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Seed Demo Data</span>
              </button>

              <button
                onClick={handleClear}
                className="px-3 py-2 rounded-lg bg-rose-950/50 hover:bg-rose-950 border border-rose-800 text-xs text-rose-300 font-medium flex items-center space-x-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All User Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
