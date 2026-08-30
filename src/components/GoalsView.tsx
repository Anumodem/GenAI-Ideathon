import React, { useState } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Trash2,
  AlertCircle,
  Clock,
  Sparkles,
  Check,
  Filter,
  Flame,
  ChevronDown
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import {
  getGoals,
  saveGoal,
  toggleGoalStep,
  deleteGoal,
  updateGoal
} from '../services/storageService';
import { Goal, GoalCategory, GoalPriority } from '../types';

interface GoalsViewProps {
  onOpenChatWithTopic: (topic: string) => void;
}

const CATEGORIES: GoalCategory[] = [
  'Career',
  'Leadership',
  'Technical Skills',
  'Communication',
  'Productivity',
  'Personal Development',
  'Learning'
];

export const GoalsView: React.FC<GoalsViewProps> = ({ onOpenChatWithTopic }) => {
  const { user } = useAuth();
  const [goalsList, setGoalsList] = useState<Goal[]>(() => (user ? getGoals(user.uid) : []));
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'completed'>('active');

  // New Goal Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<GoalCategory>('Career');
  const [newPriority, setNewPriority] = useState<GoalPriority>('high');
  const [newTargetDate, setNewTargetDate] = useState('');
  const [newSteps, setNewSteps] = useState<string[]>(['']);

  const refreshGoals = () => {
    if (user) {
      setGoalsList(getGoals(user.uid));
    }
  };

  const handleToggleStep = (goalId: string, stepId: string) => {
    if (!user) return;
    const { goal, allCompleted } = toggleGoalStep(user.uid, goalId, stepId);
    if (allCompleted) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    }
    refreshGoals();
  };

  const handleDelete = (goalId: string, title: string) => {
    if (!user) return;
    if (window.confirm(`Are you sure you want to delete the goal: "${title}"?`)) {
      deleteGoal(user.uid, goalId);
      refreshGoals();
    }
  };

  const handleAddStepInput = () => {
    setNewSteps([...newSteps, '']);
  };

  const handleStepChange = (index: number, val: string) => {
    const copy = [...newSteps];
    copy[index] = val;
    setNewSteps(copy);
  };

  const handleRemoveStepInput = (index: number) => {
    setNewSteps(newSteps.filter((_, i) => i !== index));
  };

  const handleCreateGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    const actionSteps = newSteps
      .filter((s) => s.trim().length > 0)
      .map((text, idx) => ({
        id: `step-${Date.now()}-${idx}`,
        text: text.trim(),
        completed: false
      }));

    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      userId: user.uid,
      title: newTitle.trim(),
      description: newDescription.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'active',
      targetDate: newTargetDate || undefined,
      actionSteps:
        actionSteps.length > 0
          ? actionSteps
          : [{ id: `step-${Date.now()}-0`, text: 'Initial milestone definition', completed: false }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveGoal(user.uid, newGoal);
    refreshGoals();

    // Reset & close
    setShowAddModal(false);
    setNewTitle('');
    setNewDescription('');
    setNewSteps(['']);
  };

  // Filtered Goals
  const filteredGoals = goalsList.filter((g) => {
    const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'active'
        ? g.status === 'active'
        : g.status === 'completed';
    return matchesCat && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Action Plans & Goals</h1>
            <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 text-xs font-semibold border border-teal-500/30">
              {goalsList.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Convert AI reflection breakthroughs into structured milestones and track daily execution.
          </p>
        </div>

        <button
          id="add-custom-goal-btn"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setSelectedStatus('active')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'active'
                ? 'bg-teal-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Active ({goalsList.filter((g) => g.status === 'active').length})
          </button>
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'completed'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Completed ({goalsList.filter((g) => g.status === 'completed').length})
          </button>
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedStatus === 'all'
                ? 'bg-slate-700 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({goalsList.length})
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-teal-400 font-medium"
          >
            <option value="All">All Domains</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No goals matching this filter</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Reflect in the chat to generate actionable recommendations or create a manual goal.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            Create a Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredGoals.map((goal) => {
            const completedCount = goal.actionSteps.filter((s) => s.completed).length;
            const totalCount = goal.actionSteps.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
            const isCompleted = goal.status === 'completed' || progress === 100;

            return (
              <div
                key={goal.id}
                className={`rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-slate-900/70 border-emerald-900/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 shadow-md'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {goal.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          goal.priority === 'high'
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                            : goal.priority === 'medium'
                            ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {goal.priority}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDelete(goal.id, goal.title)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className={`text-base font-bold text-white leading-snug mb-1.5 ${
                      isCompleted ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Milestone Progress</span>
                      <span
                        className={`font-bold ${isCompleted ? 'text-emerald-400' : 'text-teal-400'}`}
                      >
                        {progress}% ({completedCount}/{totalCount})
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-emerald-500'
                            : 'bg-gradient-to-r from-teal-500 to-emerald-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Steps Checklist */}
                  <div className="space-y-2 mb-4">
                    {goal.actionSteps.map((step) => (
                      <div
                        key={step.id}
                        onClick={() => handleToggleStep(goal.id, step.id)}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-start space-x-2.5 ${
                          step.completed
                            ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center flex-shrink-0 transition-colors ${
                            step.completed
                              ? 'bg-emerald-500 text-slate-950'
                              : 'border border-slate-500 bg-slate-900'
                          }`}
                        >
                          {step.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs flex-1 leading-relaxed ${
                            step.completed ? 'line-through opacity-60' : 'font-medium'
                          }`}
                        >
                          {step.text}
                        </span>
                        {step.estimatedTime && !step.completed && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {step.estimatedTime}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <span>
                      {goal.targetDate
                        ? `Target: ${new Date(goal.targetDate).toLocaleDateString()}`
                        : `Created: ${new Date(goal.createdAt).toLocaleDateString()}`}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      onOpenChatWithTopic(`Let's reflect on my progress with: "${goal.title}"`)
                    }
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Reflect on Goal</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Custom Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Create Custom Goal</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master system design interviews"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Motivation
                </label>
                <textarea
                  rows={2}
                  placeholder="Why is this important now?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Domain</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as GoalPriority)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-slate-200"
                  />
                </div>
              </div>

              {/* Action Steps Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Action Steps / Milestones
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {newSteps.map((step, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder={`Milestone #${idx + 1}`}
                        value={step}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500"
                      />
                      {newSteps.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveStepInput(idx)}
                          className="text-slate-400 hover:text-rose-400 text-xs px-1"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddStepInput}
                  className="mt-2 text-xs text-teal-400 hover:text-teal-300 font-medium"
                >
                  + Add another milestone step
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
