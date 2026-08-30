import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar, NavTab } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { JournalChat } from './components/JournalChat';
import { GoalsView } from './components/GoalsView';
import { GrowthDashboard } from './components/GrowthDashboard';
import { WeeklyReviewView } from './components/WeeklyReviewView';
import { ReflectionsView } from './components/ReflectionsView';
import { ActionPlanModal } from './components/ActionPlanModal';
import { SecurityBadgeModal } from './components/SecurityBadgeModal';
import { SettingsModal } from './components/SettingsModal';
import { ChatMessage, Goal, Reflection } from './types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('chat');

  // Modals state
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [actionPlanContext, setActionPlanContext] = useState<{
    isOpen: boolean;
    reflectionText?: string;
    conversationHistory?: ChatMessage[];
  }>({
    isOpen: false
  });

  // State trigger for refreshing dashboard/goals upon data changes
  const [dataVersion, setDataVersion] = useState(0);
  const triggerDataRefresh = () => setDataVersion((v) => v + 1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <div className="w-10 h-10 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
        <div className="text-sm font-semibold text-white">Initializing Gemini Growth Journal...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LandingPage onOpenSecurity={() => setIsSecurityOpen(true)} />
        <SecurityBadgeModal
          isOpen={isSecurityOpen}
          onClose={() => setIsSecurityOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Tab Views */}
      <main className="flex-1 pb-12">
        {activeTab === 'chat' && (
          <JournalChat
            onOpenActionPlan={(ctx) =>
              setActionPlanContext({
                isOpen: true,
                reflectionText: ctx.reflectionText,
                conversationHistory: ctx.conversationHistory
              })
            }
            onNavigateToReflections={() => setActiveTab('reflections')}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            key={`goals-${dataVersion}`}
            onOpenChatWithTopic={(topic) => {
              setActiveTab('chat');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <GrowthDashboard
            key={`dash-${dataVersion}`}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onOpenActionPlan={(ctx) =>
              setActionPlanContext({
                isOpen: true,
                ...ctx
              })
            }
          />
        )}

        {activeTab === 'weekly' && (
          <WeeklyReviewView
            key={`weekly-${dataVersion}`}
            onNavigateToChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'reflections' && (
          <ReflectionsView
            key={`reflections-${dataVersion}`}
            onOpenActionPlanWithReflection={(ref: Reflection) =>
              setActionPlanContext({
                isOpen: true,
                reflectionText: `Title: ${ref.title}\nContent: ${ref.content}\nInsights: ${ref.insights.join('; ')}`
              })
            }
            onNavigateToChat={() => setActiveTab('chat')}
          />
        )}
      </main>

      {/* Feature 1 Modal: Action Plan Generator */}
      <ActionPlanModal
        isOpen={actionPlanContext.isOpen}
        onClose={() => setActionPlanContext({ isOpen: false })}
        context={{
          reflectionText: actionPlanContext.reflectionText,
          conversationHistory: actionPlanContext.conversationHistory
        }}
        onGoalSaved={(newGoal: Goal) => {
          triggerDataRefresh();
          setActiveTab('goals');
        }}
      />

      {/* Security Threat Model Modal */}
      <SecurityBadgeModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      {/* User Settings & Data Export Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onDataReset={triggerDataRefresh}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
