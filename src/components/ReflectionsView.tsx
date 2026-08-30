import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Calendar,
  Layers,
  Sparkles,
  Target,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Shield
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { getReflections, deleteReflection } from '../services/storageService';
import { Reflection, GoalCategory } from '../types';

interface ReflectionsViewProps {
  onOpenActionPlanWithReflection: (reflection: Reflection) => void;
  onNavigateToChat: () => void;
}

export const ReflectionsView: React.FC<ReflectionsViewProps> = ({
  onOpenActionPlanWithReflection,
  onNavigateToChat
}) => {
  const { user } = useAuth();
  const [reflectionsList, setReflectionsList] = useState<Reflection[]>(() =>
    user ? getReflections(user.uid) : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const refreshList = () => {
    if (user) {
      setReflectionsList(getReflections(user.uid));
    }
  };

  const handleDelete = (id: string, title: string) => {
    if (!user) return;
    if (window.confirm(`Delete reflection "${title}"?`)) {
      deleteReflection(user.uid, id);
      refreshList();
    }
  };

  // Extract all unique tags
  const allTags = Array.from(
    new Set(reflectionsList.flatMap((r) => r.tags || []))
  );

  // Filtered Reflections
  const filtered = reflectionsList.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? r.tags?.includes(selectedTag) : true;
    const matchesCat = selectedCategory === 'All' ? true : r.category === selectedCategory;
    return matchesSearch && matchesTag && matchesCat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Journal & Reflection Archive</h1>
            <span className="px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 text-xs font-semibold border border-teal-500/30">
              {reflectionsList.length} Entries
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search and revisit your historical dialogues, extract action plans, or reflect deeper with Gemini.
          </p>
        </div>

        <button
          id="new-reflection-btn"
          onClick={onNavigateToChat}
          className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>New Reflection Dialogue</span>
        </button>
      </div>

      {/* Search & Tag Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search reflections by keywords, thoughts, or dilemmas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-teal-400 w-full sm:w-auto"
          >
            <option value="All">All Domains</option>
            {[
              'Career',
              'Leadership',
              'Technical Skills',
              'Communication',
              'Productivity',
              'Personal Development',
              'Learning'
            ].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Tags filter chips */}
        {allTags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-medium mr-1">Filter by Tag:</span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold hover:text-white"
              >
                Clear Tag Filter &times;
              </button>
            )}
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                  selectedTag === tag
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reflections List */}
      {filtered.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">No reflections found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery || selectedTag
              ? 'Try clearing your search query or tag filter.'
              : 'Start a dialogue in the chat to save your first reflection.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((ref) => {
            const isExpanded = expandedId === ref.id;
            return (
              <div
                key={ref.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm space-y-4"
              >
                {/* Top Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-800 text-teal-300 border border-slate-700">
                      {ref.category}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(ref.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* Action Plan Trigger from Reflection */}
                    <button
                      onClick={() => onOpenActionPlanWithReflection(ref)}
                      className="px-3 py-1 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 text-xs font-semibold border border-teal-500/30 flex items-center space-x-1 transition-colors"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Synthesize Action Plan</span>
                    </button>

                    <button
                      onClick={() => handleDelete(ref.id, ref.title)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white leading-snug">{ref.title}</h3>

                {/* Tags */}
                {ref.tags && ref.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {ref.tags.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Core Insights Highlight */}
                {ref.insights && ref.insights.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/70 space-y-1">
                    <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                      Key Takeaways
                    </div>
                    <ul className="space-y-1 text-xs text-slate-200">
                      {ref.insights.map((ins, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5">
                          <span className="text-teal-400">&bull;</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content Accordion */}
                <div>
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : ref.id)}
                    className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 font-medium"
                  >
                    <span>{isExpanded ? 'Hide full transcript' : 'View full dialogue transcript'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 prose prose-invert prose-xs max-w-none animate-in fade-in">
                      <ReactMarkdown>{ref.content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
