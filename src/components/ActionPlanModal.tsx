import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Target,
  CheckCircle2,
  Calendar,
  Layers,
  AlertTriangle,
  Flame,
  Check,
  X,
  Plus,
  ArrowRight,
  Shield
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { saveGoal } from '../services/storageService';
import {
  ActionPlanResponse,
  Goal,
  GoalCategory,
  GoalPriority,
  ChatMessage
} from '../types';

interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: {
    reflectionText?: string;
    conversationHistory?: ChatMessage[];
  };
  onGoalSaved: (goal: Goal) => void;
}

export const ActionPlanModal: React.FC<ActionPlanModalProps> = ({
  isOpen,
  onClose,
  context,
  onGoalSaved
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State extracted from AI
  const [mainReflection, setMainReflection] = useState('');
  const [keyChallenge, setKeyChallenge] = useState('');
  const [goalTitle, setGoalTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>('Leadership');
  const [priority, setPriority] = useState<GoalPriority>('high');
  const [targetDate, setTargetDate] = useState('');
  const [encouragement, setEncouragement] = useState('');
  const [actionItems, setActionItems] = useState<
    { id: string; text: string; estimatedTime?: string; selected: boolean }[]
  >([]);
  const [newActionText, setNewActionText] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const generate = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result: ActionPlanResponse = await apiClient.generateActionPlan({
          reflectionText: context.reflectionText,
          conversationHistory: context.conversationHistory?.map((m) => ({
            role: m.role,
            content: m.content
          }))
        });

        setMainReflection(result.mainReflection || '');
        setKeyChallenge(result.keyChallenge || '');
        setGoalTitle(result.goal || 'Continuous Growth Goal');
        setCategory(result.category || 'Career');
        setPriority(result.priority || 'high');
        setTargetDate(result.targetDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
        setEncouragement(result.encouragement || 'Small daily actions compound into exponential growth.');
        
        // Mark all suggested actions selected by default, user can toggle
        setActionItems(
          (result.suggestedActions || []).map((a) => ({
            id: a.id,
            text: a.text,
            estimatedTime: a.estimatedTime || '15 mins',
            selected: true
          }))
        );
      } catch (err: any) {
        console.error('Failed to generate action plan', err);
        setError(err.message || 'Unable to synthesize action plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    generate();
  }, [isOpen, context]);

  if (!isOpen) return null;

  const toggleActionSelected = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleAddCustomAction = () => {
    if (!newActionText.trim()) return;
    setActionItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        text: newActionText.trim(),
        estimatedTime: '20 mins',
        selected: true
      }
    ]);
    setNewActionText('');
  };

  const handleSaveToGoals = () => {
    if (!user || !goalTitle.trim()) return;

    const selectedSteps = actionItems
      .filter((item) => item.selected)
      .map((item) => ({
        id: item.id,
        text: item.text,
        completed: false,
        estimatedTime: item.estimatedTime
      }));

    if (selectedSteps.length === 0) {
      alert('Please select at least one action item to save into your goal.');
      return;
    }

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      userId: user.uid,
      title: goalTitle.trim(),
      description: `${mainReflection} Challenge: ${keyChallenge}`,
      category,
      priority,
      status: 'active',
      targetDate: targetDate || undefined,
      actionSteps: selectedSteps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveGoal(user.uid, newGoal);

    // Trigger celebratory confetti for setting a clear goal
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {}

    onGoalSaved(newGoal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Reflection → Action Plan</h3>
              <p className="text-xs text-slate-400">Synthesized actionable goals from your reflection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {isLoading ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <h4 className="text-base font-semibold text-white">Synthesizing High-Leverage Plan...</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Gemini is analyzing core bottlenecks, extracting your underlying goal, and formulating actionable steps.
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-sm space-y-2">
              <p className="font-semibold">Synthesis Failed</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : (
            <>
              {/* Diagnosis Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="text-[11px] font-semibold text-teal-400 uppercase tracking-wider mb-1">
                    Core Reflection
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{mainReflection}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
                  <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-1">
                    Key Challenge / Friction
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">{keyChallenge}</p>
                </div>
              </div>

              {/* Goal Title Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Goal Title
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-teal-400"
                />
              </div>

              {/* Category, Priority & Target Date Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GoalCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-400"
                  >
                    {[
                      'Career',
                      'Leadership',
                      'Technical Skills',
                      'Communication',
                      'Productivity',
                      'Personal Development',
                      'Learning'
                    ].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as GoalPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-400 capitalize"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              {/* Suggested Action Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                    <span>Select Recommended Action Steps</span>
                    <span className="text-[11px] font-normal text-slate-400">
                      ({actionItems.filter((i) => i.selected).length} selected)
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  {actionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleActionSelected(item.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                        item.selected
                          ? 'bg-teal-950/30 border-teal-500/50 text-slate-100'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                          item.selected
                            ? 'bg-teal-500 text-slate-950'
                            : 'border border-slate-600 bg-slate-900'
                        }`}
                      >
                        {item.selected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1 text-xs">
                        <span className="leading-relaxed font-medium">{item.text}</span>
                        {item.estimatedTime && (
                          <span className="ml-2 text-[10px] text-teal-400 bg-teal-950/60 px-1.5 py-0.5 rounded border border-teal-800/50">
                            ~{item.estimatedTime}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Custom Step */}
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    placeholder="Add custom action step..."
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustomAction()}
                    className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                  <button
                    onClick={handleAddCustomAction}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Encouragement Quote */}
              {encouragement && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-teal-950/40 to-indigo-950/40 border border-teal-800/30 text-xs text-teal-200 italic">
                  &ldquo;{encouragement}&rdquo;
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Scoped to your authenticated identity</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="save-action-plan-to-goals-btn"
              onClick={handleSaveToGoals}
              disabled={isLoading || Boolean(error)}
              className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 disabled:opacity-50 transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save to My Goals</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
