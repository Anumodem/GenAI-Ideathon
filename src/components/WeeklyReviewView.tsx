import React, { useState, useMemo } from 'react';
import {
  CalendarDays,
  Sparkles,
  Award,
  TrendingUp,
  AlertTriangle,
  Target,
  CheckCircle2,
  BookmarkPlus,
  Trash2,
  Clock,
  Layers,
  ArrowRight,
  Shield,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import {
  getReflections,
  getGoals,
  getWeeklyReviews,
  saveWeeklyReview,
  deleteWeeklyReview
} from '../services/storageService';
import { WeeklyReview, WeeklyReviewResponse } from '../types';

interface WeeklyReviewViewProps {
  onNavigateToChat: () => void;
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({ onNavigateToChat }) => {
  const { user } = useAuth();
  const [timeframeDays, setTimeframeDays] = useState<number>(7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState<WeeklyReviewResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const reviewsList = useMemo(() => (user ? getWeeklyReviews(user.uid) : []), [user, saveSuccess]);
  const reflections = useMemo(() => (user ? getReflections(user.uid) : []), [user]);
  const goals = useMemo(() => (user ? getGoals(user.uid) : []), [user]);

  // Filter user's reflections within selected timeframe
  const targetReflections = useMemo(() => {
    const cutoff = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000).getTime();
    return reflections.filter((r) => new Date(r.createdAt).getTime() >= cutoff);
  }, [reflections, timeframeDays]);

  const handleGenerateReview = async () => {
    if (!user) return;

    if (reflections.length === 0) {
      setError('No reflections found in your journal. Please create a reflection in the chat first!');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
      const endDate = new Date().toISOString().split('T')[0];

      // Pass user's real entries to server-side Gemini
      const result: WeeklyReviewResponse = await apiClient.generateWeeklyReview({
        reflections: targetReflections.length > 0 ? targetReflections : reflections.slice(0, 5),
        goals,
        startDate,
        endDate
      });

      setGeneratedReview(result);
    } catch (err: any) {
      console.error('Weekly Review error', err);
      setError(err.message || 'Failed to synthesize weekly review with Gemini.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveReview = () => {
    if (!user || !generatedReview) return;

    const startDate = new Date(Date.now() - timeframeDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    const newRecord: WeeklyReview = {
      id: `rev-${Date.now()}`,
      userId: user.uid,
      weekStartDate: startDate,
      weekEndDate: endDate,
      keyThemes: generatedReview.keyThemes,
      wins: generatedReview.wins,
      challenges: generatedReview.challenges,
      goalsProgressed: generatedReview.goalsProgressed,
      areasNeedingAttention: generatedReview.areasNeedingAttention,
      recommendedFocusNextWeek: generatedReview.recommendedFocusNextWeek,
      executiveSummary: generatedReview.executiveSummary,
      growthScore: generatedReview.growthScore,
      reflectionCount: targetReflections.length || reflections.length,
      createdAt: new Date().toISOString(),
      isSavedByUser: true
    };

    saveWeeklyReview(user.uid, newRecord);
    setSaveSuccess(true);

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch {}
  };

  const handleDeleteSavedReview = (reviewId: string) => {
    if (!user) return;
    if (window.confirm('Delete this historical weekly review?')) {
      deleteWeeklyReview(user.uid, reviewId);
      setSaveSuccess(!saveSuccess);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Weekly AI Review</h1>
            <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 text-xs font-semibold border border-teal-500/30">
              Executive Synthesis
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gemini analyzes only your historical reflections to produce executive themes, wins, challenges, and strategic focus.
          </p>
        </div>

        {/* Timeframe & Generator Trigger */}
        <div className="flex items-center space-x-2">
          <select
            value={timeframeDays}
            onChange={(e) => setTimeframeDays(Number(e.target.value))}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-teal-400"
          >
            <option value={7}>Past 7 Days</option>
            <option value={14}>Past 14 Days</option>
            <option value={30}>Past Month</option>
          </select>

          <button
            id="generate-weekly-review-btn"
            onClick={handleGenerateReview}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing...' : 'Generate Review'}</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={onNavigateToChat} className="underline font-semibold ml-3">
            Open Chat
          </button>
        </div>
      )}

      {/* Active Generated Review Display */}
      {generatedReview && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-2xl p-6 shadow-2xl space-y-6 animate-in fade-in duration-200">
          {/* Top Bar with Growth Score & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Synthesized Review & Strategy</h2>
                <span className="text-xs text-slate-400">
                  (Based on {targetReflections.length || reflections.length} reflections)
                </span>
              </div>
              <p className="text-xs text-teal-400 font-medium mt-0.5">
                Review this AI-generated assessment before saving to your permanent record.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-teal-950/60 border border-teal-800/60">
                <Award className="w-4 h-4 text-teal-400" />
                <span className="text-xs font-semibold text-slate-300">Momentum:</span>
                <span className="text-sm font-extrabold text-teal-300">
                  {generatedReview.growthScore}/100
                </span>
              </div>

              <button
                id="save-weekly-review-btn"
                onClick={handleSaveReview}
                disabled={saveSuccess}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Saved to Archive!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Save Weekly Review</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="p-4 rounded-xl bg-slate-800/70 border border-slate-700">
            <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2">
              Executive Growth Summary
            </h3>
            <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
              {generatedReview.executiveSummary}
            </p>
          </div>

          {/* 6 Grid Analysis Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Key Themes */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300 mb-2">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Key Themes</span>
              </div>
              <ul className="space-y-1.5">
                {generatedReview.keyThemes.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-indigo-400 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Wins & Breakthroughs */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-emerald-300 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Wins & Breakthroughs</span>
              </div>
              <ul className="space-y-1.5">
                {generatedReview.wins.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-emerald-400 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Challenges & Friction */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-rose-300 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Challenges & Friction</span>
              </div>
              <ul className="space-y-1.5">
                {generatedReview.challenges.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-rose-400 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Goals Progressed */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Goals Progressed</span>
              </div>
              <ul className="space-y-1.5">
                {generatedReview.goalsProgressed.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-cyan-400 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas Needing Attention */}
            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/80">
              <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Areas Needing Attention</span>
              </div>
              <ul className="space-y-1.5">
                {generatedReview.areasNeedingAttention.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-amber-400 mt-0.5">&bull;</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Focus for Next Week */}
            <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/50">
              <div className="flex items-center space-x-2 text-xs font-bold text-teal-300 mb-2">
                <Target className="w-3.5 h-3.5 text-teal-400" />
                <span>Next Week Focus</span>
              </div>
              <ul className="space-y-1.5">
                {generatedReview.recommendedFocusNextWeek.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-200 flex items-start space-x-2">
                    <span className="text-teal-400 font-bold mt-0.5">{idx + 1}.</span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Historical Reviews Archive */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-teal-400" />
            <h2 className="text-base font-bold text-white">Saved Weekly Reviews Archive</h2>
          </div>
          <span className="text-xs text-slate-400">{reviewsList.length} saved</span>
        </div>

        {reviewsList.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-md mx-auto">
            <CalendarDays className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">
              No historical weekly reviews saved yet. Click &ldquo;Generate Review&rdquo; above to create your first executive synthesis!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-xs font-bold text-white">
                      Review: {rev.weekStartDate} &rarr; {rev.weekEndDate}
                    </div>
                    <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 text-[10px] font-bold border border-teal-800">
                      Score: {rev.growthScore}/100
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {rev.reflectionCount} reflections synthesized
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteSavedReview(rev.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-xl">
                  {rev.executiveSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-800/40 p-2.5 rounded-lg">
                    <div className="font-semibold text-emerald-400 text-[11px] mb-1">Top Wins</div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {rev.wins.slice(0, 2).map((w, i) => (
                        <li key={i} className="truncate">
                          &bull; {w}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-800/40 p-2.5 rounded-lg">
                    <div className="font-semibold text-rose-400 text-[11px] mb-1">Challenges</div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {rev.challenges.slice(0, 2).map((c, i) => (
                        <li key={i} className="truncate">
                          &bull; {c}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-800/40 p-2.5 rounded-lg">
                    <div className="font-semibold text-teal-400 text-[11px] mb-1">Next Week Focus</div>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {rev.recommendedFocusNextWeek.slice(0, 2).map((f, i) => (
                        <li key={i} className="truncate">
                          &bull; {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
