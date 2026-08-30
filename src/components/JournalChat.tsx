import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Target,
  BookmarkPlus,
  RotateCcw,
  Tag,
  Lightbulb,
  Check,
  AlertCircle,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/apiClient';
import { saveReflection, saveConversation } from '../services/storageService';
import { ChatMessage, GoalCategory, Reflection } from '../types';

interface JournalChatProps {
  onOpenActionPlan: (context: { reflectionText?: string; conversationHistory?: ChatMessage[] }) => void;
  onNavigateToReflections: () => void;
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

const REFLECTION_STARTERS = [
  {
    title: 'Presentation Confidence',
    category: 'Leadership' as GoalCategory,
    prompt: 'I want to become more confident when presenting technical architecture topics to senior stakeholders.'
  },
  {
    title: 'Delivering Constructive Feedback',
    category: 'Communication' as GoalCategory,
    prompt: 'I struggle with giving tough feedback to peers without worrying about damaging our working relationship.'
  },
  {
    title: 'Managing Tech Debt vs Speed',
    category: 'Technical Skills' as GoalCategory,
    prompt: 'Our team is pushing for rapid feature shipping, but growing technical debt is slowing our velocity. How should I frame the trade-off?'
  },
  {
    title: 'Deep Work Discipline',
    category: 'Productivity' as GoalCategory,
    prompt: 'Constant meetings and Slack messages are fracturing my focus. I need a sustainable deep work routine.'
  }
];

export const JournalChat: React.FC<JournalChatProps> = ({
  onOpenActionPlan,
  onNavigateToReflections
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory>('Career');
  const [selectedTags, setSelectedTags] = useState<string[]>(['#growth', '#reflection']);
  const [isLoading, setIsLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const lastPromptRef = useRef<string>('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (customText?: string, isRetry = false) => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || isLoading || !user) return;
    lastPromptRef.current = textToSend;

    let newHistory = messages;
    if (!isRetry) {
      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-usr`,
        role: 'user',
        content: textToSend,
        timestamp: new Date().toISOString()
      };

      newHistory = [...messages, userMessage];
      setMessages(newHistory);
      setInputText('');
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const response = await apiClient.sendChatMessage({
        messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
        coachStyle: user.coachStyle || 'action-oriented',
        currentCategory: selectedCategory
      });

      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: response.reply || 'I am reflecting on your thoughts. Let me know what specific aspect you would like to explore further.',
        timestamp: new Date().toISOString(),
        suggestedTags: response.suggestedTags
      };

      const updatedHistory = [...newHistory, assistantMessage];
      setMessages(updatedHistory);

      // Auto-merge new suggested tags if available
      if (response.suggestedTags && response.suggestedTags.length > 0) {
        setSelectedTags((prev) => {
          const combined = Array.from(new Set([...prev, ...response.suggestedTags]));
          return combined.slice(0, 8);
        });
      }

      // Auto-save active conversation session to user partition
      const conversationId = `conv-${user.uid}-${Date.now().toString().slice(-6)}`;
      saveConversation(user.uid, {
        id: conversationId,
        userId: user.uid,
        title: textToSend.slice(0, 60) + (textToSend.length > 60 ? '...' : ''),
        category: selectedCategory,
        tags: selectedTags,
        messages: updatedHistory,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Chat error', err);
      setErrorMessage(
        err.message || 'Unable to connect to Gemini reflection engine. Check your API settings.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastPromptRef.current) {
      handleSendMessage(lastPromptRef.current, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tagToRemove));
  };

  const handleSaveAsReflection = () => {
    if (!user || messages.length === 0) return;

    const userMessages = messages.filter((m) => m.role === 'user');
    const aiMessages = messages.filter((m) => m.role === 'assistant');

    const firstUserMsg = userMessages[0]?.content || 'Personal Reflection';
    const title = firstUserMsg.slice(0, 75) + (firstUserMsg.length > 75 ? '...' : '');

    const formattedContent = messages
      .map((m) => `**${m.role === 'user' ? user.displayName : 'Gemini Copilot'}**:\n${m.content}`)
      .join('\n\n');

    // Extract quick takeaways from AI responses
    const insights = aiMessages
      .map((m) => m.content.split('\n').find((line) => line.trim().startsWith('-') || line.trim().startsWith('*')))
      .filter(Boolean)
      .map((line) => line!.replace(/^[-*]\s*/, '').trim())
      .slice(0, 4);

    const newReflection: Reflection = {
      id: `ref-${Date.now()}`,
      userId: user.uid,
      title,
      content: formattedContent,
      category: selectedCategory,
      tags: selectedTags,
      insights: insights.length > 0 ? insights : ['Deepened personal awareness through reflective dialogue.'],
      actionPlanGenerated: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveReflection(user.uid, newReflection);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleResetSession = () => {
    if (messages.length > 0) {
      if (window.confirm('Start a new reflection session? Unsaved chat will be archived in conversations.')) {
        setMessages([]);
        setSavedSuccess(false);
        setErrorMessage(null);
      }
    } else {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-5xl mx-auto px-2 sm:px-4 py-3">
      {/* Top Session Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 mb-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        {/* Category selector & Coach style */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <Layers className="w-3.5 h-3.5 text-teal-400" />
            <span className="font-medium">Domain:</span>
          </div>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as GoalCategory)}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-teal-400 font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <span className="text-slate-700">|</span>

          <div className="flex items-center space-x-1 text-xs text-slate-400 hidden sm:flex">
            <span>Style:</span>
            <span className="text-teal-300 capitalize font-medium">
              {user?.coachStyle || 'Action-Oriented'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <>
              {/* Feature 1 CTA: Turn into Action Plan */}
              <button
                id="turn-into-action-plan-btn"
                onClick={() => onOpenActionPlan({ conversationHistory: messages })}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-teal-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Turn into Action Plan</span>
              </button>

              {/* Save as Reflection */}
              <button
                id="save-reflection-btn"
                onClick={handleSaveAsReflection}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">Saved!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>Save Reflection</span>
                  </>
                )}
              </button>
            </>
          )}

          <button
            id="reset-chat-btn"
            onClick={handleResetSession}
            title="New Session"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-6">
        {/* Empty State / Reflection Starters */}
        {messages.length === 0 && (
          <div className="h-full flex flex-col justify-center items-center text-center py-8 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mb-4 shadow-inner">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              What would you like to reflect on today?
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-lg leading-relaxed">
              Explore decisions, navigate roadblocks, or unpack a high-stakes moment. Gemini will listen actively, ask Socratic questions, and help distill actionable clarity.
            </p>

            {/* Prompt Starter Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 w-full text-left">
              {REFLECTION_STARTERS.map((starter, idx) => (
                <button
                  key={idx}
                  id={`prompt-starter-${idx}`}
                  onClick={() => {
                    setSelectedCategory(starter.category);
                    handleSendMessage(starter.prompt);
                  }}
                  className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-teal-500/40 transition-all text-left group"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-teal-300 mb-1">
                    <span>{starter.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                      {starter.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed group-hover:text-white">
                    &ldquo;{starter.prompt}&rdquo;
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Stream */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white'
                }`}
              >
                {isUser ? user?.displayName?.charAt(0) || 'U' : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-indigo-600/90 text-white rounded-tr-none shadow-md'
                    : 'bg-slate-800/90 text-slate-100 rounded-tl-none border border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 text-[11px] opacity-75">
                  <span className="font-semibold">
                    {isUser ? user?.displayName || 'You' : 'Gemini Copilot'}
                  </span>
                  <span className="text-[10px]">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Markdown content */}
                <div className="prose prose-invert prose-sm max-w-none text-slate-100">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>

                {/* AI Suggested Tags Pill Row */}
                {!isUser && msg.suggestedTags && msg.suggestedTags.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 flex items-center space-x-1 mr-1">
                      <Tag className="w-2.5 h-2.5" />
                      <span>Suggested Tags:</span>
                    </span>
                    {msg.suggestedTags.map((tag, tIdx) => (
                      <button
                        key={tIdx}
                        onClick={() => handleAddTag(tag)}
                        className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-teal-500/30 text-teal-300 border border-teal-500/40'
                            : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl rounded-tl-none p-4 text-sm text-slate-300 flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-slate-400 font-medium">Gemini is reflecting...</span>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleRetry}
              className="underline hover:text-white font-medium ml-3 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Tags & Input Bar */}
      <div className="mt-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg">
        {/* Active Tag Bar */}
        <div className="flex items-center flex-wrap gap-1.5 mb-2 px-1">
          <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1 mr-1">
            <Tag className="w-3 h-3 text-slate-500" />
            <span>Tags:</span>
          </span>
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-teal-500/15 text-teal-300 text-xs border border-teal-500/30"
            >
              <span>{tag}</span>
              <button
                onClick={() => handleRemoveTag(tag)}
                className="hover:text-white font-bold ml-1 text-[10px]"
              >
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="+ tag"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value.trim();
                handleAddTag(val.startsWith('#') ? val : `#${val}`);
                (e.target as HTMLInputElement).value = '';
              }
            }}
            className="bg-transparent text-xs text-slate-300 placeholder-slate-600 focus:outline-none w-16"
          />
        </div>

        {/* Textarea & Send */}
        <div className="flex items-end space-x-2">
          <textarea
            id="chat-input-textarea"
            rows={2}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Share a thought, challenge, win, or decision you are navigating... (Shift+Enter for new line)"
            className="flex-1 bg-slate-800/80 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 resize-none"
          />
          <button
            id="send-message-btn"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="h-12 w-12 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-teal-500 text-slate-950 flex items-center justify-center transition-all shadow-md shadow-teal-500/20 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
