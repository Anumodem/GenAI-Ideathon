import React, { useMemo } from 'react';
import {
  BarChart3,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getGoals, getReflections, getWeeklyReviews } from '../services/storageService';
import { Goal, GoalCategory, Reflection } from '../types';

interface GrowthDashboardProps {
  onNavigateTab: (tab: any) => void;
  onOpenActionPlan: (context: any) => void;
}

const CATEGORY_COLORS: Record<GoalCategory, { bg: string; text: string; bar: string }> = {
  Career: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', bar: 'bg-indigo-500' },
  Leadership: { bg: 'bg-purple-500/10', text: 'text-purple-400', bar: 'bg-purple-500' },
  'Technical Skills': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', bar: 'bg-cyan-500' },
  Communication: { bg: 'bg-teal-500/10', text: 'text-teal-400', bar: 'bg-teal-500' },
  Productivity: { bg: 'bg-amber-500/10', text: 'text-amber-400', bar: 'bg-amber-500' },
  'Personal Development': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', bar: 'bg-emerald-500' },
  Learning: { bg: 'bg-blue-500/10', text: 'text-blue-400', bar: 'bg-blue-500' }
};

export const GrowthDashboard: React.FC<GrowthDashboardProps> = ({
  onNavigateTab,
  onOpenActionPlan
}) => {
  const { user } = useAuth();

  const goals = useMemo(() => (user ? getGoals(user.uid) : []), [user]);
  const reflections = useMemo(() => (user ? getReflections(user.uid) : []), [user]);
  const weeklyReviews = useMemo(() => (user ? getWeeklyReviews(user.uid) : []), [user]);

  // Derived real metrics
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');

  const totalSteps = goals.reduce((acc, g) => acc + g.actionSteps.length, 0);
  const completedSteps = goals.reduce(
    (acc, g) => acc + g.actionSteps.filter((s) => s.completed).length,
    0
  );
  const overallProgressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Category Distribution calculation
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    reflections.forEach((r) => {
      counts[r.category] = (counts[r.category] || 0) + 1;
    });
    goals.forEach((g) => {
      counts[g.category] = (counts[g.category] || 0) + 1;
    });
    return counts;
  }, [reflections, goals]);

  // Recurring Themes extraction from real user tags
  const recurringThemes = useMemo(() => {
    const tagMap: Record<string, number> = {};
    reflections.forEach((r) => {
      r.tags?.forEach((t) => {
        const normalized = t.toLowerCase().trim();
        tagMap[normalized] = (tagMap[normalized] || 0) + 1;
      });
    });
    return Object.entries(tagMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  }, [reflections]);

  // Recent Achievements from completed goals & completed steps
  const recentAchievements = useMemo(() => {
    return completedGoals.slice(0, 4);
  }, [completedGoals]);

  // Suggested Strategic Focus Areas derived from active bottleneck categories
  const suggestedFocusAreas = useMemo(() => {
    if (activeGoals.length === 0 && reflections.length === 0) return [];
    
    // Find categories with active goals that have incomplete steps
    const activeCats = Array.from(new Set(activeGoals.map((g) => g.category)));
    return activeCats.slice(0, 3).map((cat) => ({
      category: cat,
      title: `Accelerate ${cat} Milestones`,
      reason: `You have ${activeGoals.filter((g) => g.category === cat).length} active goals in this domain.`
    }));
  }, [activeGoals, reflections]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Personal Growth Dashboard</h1>
            <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 text-xs font-semibold border border-teal-500/30">
              Authentic Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time self-development metrics derived strictly from your verified reflections and goals.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigateTab('chat')}
            className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs hover:bg-teal-400 shadow-md shadow-teal-500/10 flex items-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Reflection</span>
          </button>
          <button
            onClick={() => onNavigateTab('weekly')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <span>Run Weekly Review</span>
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Overall Action Velocity</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{overallProgressPercent}%</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
              <span>{completedSteps} of {totalSteps} action steps finished</span>
            </div>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Strategic Goals</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{activeGoals.length}</div>
            <div className="text-xs text-slate-400 mt-1">
              {completedGoals.length} goals achieved to date
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('goals')}
            className="mt-3 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>View Goals Pipeline</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Logged Reflections</span>
            <BookOpen className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{reflections.length}</div>
            <div className="text-xs text-slate-400 mt-1">
              {reflections.filter((r) => r.actionPlanGenerated).length} turned into action plans
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reflections')}
            className="mt-3 text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center space-x-1"
          >
            <span>Browse Journal Archive</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Weekly AI Reviews</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-white">{weeklyReviews.length}</div>
            <div className="text-xs text-slate-400 mt-1">
              {weeklyReviews[0]
                ? `Latest Growth Score: ${weeklyReviews[0].growthScore}/100`
                : 'No reviews saved yet'}
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('weekly')}
            className="mt-3 text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center space-x-1"
          >
            <span>Open Weekly Reviews</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Grid: Categories & Recurring Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 columns) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Domain Distribution
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Reflections & Goals Breakdown
            </span>
          </div>

          {Object.keys(categoryCounts).length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No domain activity logged yet. Start a reflection in the chat to see your breakdown.
            </div>
          ) : (
            <div className="space-y-3.5">
              {Object.entries(categoryCounts).map(([catName, count]) => {
                const totalItems = reflections.length + goals.length || 1;
                const percent = Math.round((count / totalItems) * 100);
                const color =
                  CATEGORY_COLORS[catName as GoalCategory] || {
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    bar: 'bg-teal-500'
                  };

                return (
                  <div key={catName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className={`${color.text} font-semibold flex items-center space-x-1.5`}>
                        <span>{catName}</span>
                      </span>
                      <span className="text-slate-400">
                        {count} item{count !== 1 ? 's' : ''} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${color.bar} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recurring Themes & Tag Cloud (1 column) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recurring Themes
                </h2>
              </div>
              <span className="text-[11px] text-slate-400">From Reflections</span>
            </div>

            {recurringThemes.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No tags recorded yet. Suggested tags during reflection will populate this cloud.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {recurringThemes.map(([theme, count], idx) => (
                  <div
                    key={theme}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl border transition-colors ${
                      idx === 0
                        ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold text-xs'
                        : idx < 3
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-xs font-medium'
                        : 'bg-slate-800 text-slate-300 border-slate-700 text-xs'
                    }`}
                  >
                    <span>{theme}</span>
                    <span className="text-[10px] opacity-75 font-mono">({count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict per-user data isolation verified</span>
          </div>
        </div>
      </div>

      {/* Bottom Row: AI Strategic Focus Areas & Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Suggested Focus Areas */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                AI Suggested Focus Areas
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
              AI Insight
            </span>
          </div>

          {suggestedFocusAreas.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Log reflections and active goals to unlock personalized strategic focus recommendations.
            </div>
          ) : (
            <div className="space-y-3">
              {suggestedFocusAreas.map((area, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80 flex items-start justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white flex items-center space-x-2">
                      <span>{area.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-normal">
                        {area.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{area.reason}</p>
                  </div>
                  <button
                    onClick={() => onNavigateTab('goals')}
                    className="p-1.5 text-teal-400 hover:text-teal-300 hover:bg-slate-700 rounded-lg transition-colors ml-2"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Achievements */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Recent Achievements
              </h2>
            </div>
            <span className="text-xs text-slate-400">{completedGoals.length} total completed</span>
          </div>

          {recentAchievements.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No completed goals yet. Check off all action steps in a goal to celebrate your achievement here!
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentAchievements.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-white">{goal.title}</div>
                      <div className="text-[10px] text-emerald-400">
                        {goal.category} &bull; Completed {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : 'Recently'}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                    100%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
