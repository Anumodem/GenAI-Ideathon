import {
  Goal,
  Reflection,
  Conversation,
  WeeklyReview,
  UserProfile,
  GoalCategory
} from '../types';

interface UserDataStore {
  profile: UserProfile;
  reflections: Reflection[];
  conversations: Conversation[];
  goals: Goal[];
  weeklyReviews: WeeklyReview[];
}

const STORAGE_PREFIX = 'gemini_growth_user_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId}`;
}

export function getUserData(userId: string): UserDataStore {
  if (!userId) {
    return createEmptyStore({
      uid: 'guest',
      email: 'guest@example.com',
      displayName: 'Guest User',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    });
  }

  const raw = localStorage.getItem(getStorageKey(userId));
  if (!raw) {
    // Return empty store or default initial store
    const initial = createEmptyStore({
      uid: userId,
      email: `${userId}@example.com`,
      displayName: 'Growth Journaler',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    });
    setUserData(userId, initial);
    return initial;
  }

  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error parsing stored user data', e);
    const initial = createEmptyStore({
      uid: userId,
      email: `${userId}@example.com`,
      displayName: 'Growth Journaler',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    });
    return initial;
  }
}

export function setUserData(userId: string, data: UserDataStore): void {
  if (!userId) return;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(data));
}

function createEmptyStore(profile: UserProfile): UserDataStore {
  return {
    profile,
    reflections: [],
    conversations: [],
    goals: [],
    weeklyReviews: []
  };
}

// ----------------- REFLECTIONS -----------------

export function getReflections(userId: string): Reflection[] {
  return getUserData(userId).reflections.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveReflection(userId: string, reflection: Reflection): void {
  const data = getUserData(userId);
  const existingIdx = data.reflections.findIndex((r) => r.id === reflection.id);
  if (existingIdx >= 0) {
    data.reflections[existingIdx] = reflection;
  } else {
    data.reflections.unshift(reflection);
  }
  setUserData(userId, data);
}

export function deleteReflection(userId: string, reflectionId: string): void {
  const data = getUserData(userId);
  data.reflections = data.reflections.filter((r) => r.id !== reflectionId);
  setUserData(userId, data);
}

// ----------------- GOALS & ACTION PLANS -----------------

export function getGoals(userId: string): Goal[] {
  return getUserData(userId).goals.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveGoal(userId: string, goal: Goal): void {
  const data = getUserData(userId);
  const existingIdx = data.goals.findIndex((g) => g.id === goal.id);
  if (existingIdx >= 0) {
    data.goals[existingIdx] = goal;
  } else {
    data.goals.unshift(goal);
  }
  setUserData(userId, data);
}

export function updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Goal | null {
  const data = getUserData(userId);
  const idx = data.goals.findIndex((g) => g.id === goalId);
  if (idx < 0) return null;

  const updated: Goal = {
    ...data.goals[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  data.goals[idx] = updated;
  setUserData(userId, data);
  return updated;
}

export function toggleGoalStep(
  userId: string,
  goalId: string,
  stepId: string
): { goal: Goal | null; allCompleted: boolean } {
  const data = getUserData(userId);
  const idx = data.goals.findIndex((g) => g.id === goalId);
  if (idx < 0) return { goal: null, allCompleted: false };

  const goal = data.goals[idx];
  goal.actionSteps = goal.actionSteps.map((step) =>
    step.id === stepId ? { ...step, completed: !step.completed } : step
  );

  const allCompleted =
    goal.actionSteps.length > 0 && goal.actionSteps.every((s) => s.completed);

  if (allCompleted && goal.status === 'active') {
    goal.status = 'completed';
    goal.completedAt = new Date().toISOString();
  } else if (!allCompleted && goal.status === 'completed') {
    goal.status = 'active';
    goal.completedAt = undefined;
  }

  goal.updatedAt = new Date().toISOString();
  data.goals[idx] = goal;
  setUserData(userId, data);

  return { goal, allCompleted };
}

export function deleteGoal(userId: string, goalId: string): void {
  const data = getUserData(userId);
  data.goals = data.goals.filter((g) => g.id !== goalId);
  setUserData(userId, data);
}

// ----------------- CONVERSATIONS -----------------

export function getConversations(userId: string): Conversation[] {
  return getUserData(userId).conversations.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function saveConversation(userId: string, conversation: Conversation): void {
  const data = getUserData(userId);
  const idx = data.conversations.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    data.conversations[idx] = conversation;
  } else {
    data.conversations.unshift(conversation);
  }
  setUserData(userId, data);
}

export function deleteConversation(userId: string, conversationId: string): void {
  const data = getUserData(userId);
  data.conversations = data.conversations.filter((c) => c.id !== conversationId);
  setUserData(userId, data);
}

// ----------------- WEEKLY REVIEWS -----------------

export function getWeeklyReviews(userId: string): WeeklyReview[] {
  return getUserData(userId).weeklyReviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function saveWeeklyReview(userId: string, review: WeeklyReview): void {
  const data = getUserData(userId);
  const idx = data.weeklyReviews.findIndex((r) => r.id === review.id);
  if (idx >= 0) {
    data.weeklyReviews[idx] = review;
  } else {
    data.weeklyReviews.unshift(review);
  }
  setUserData(userId, data);
}

export function deleteWeeklyReview(userId: string, reviewId: string): void {
  const data = getUserData(userId);
  data.weeklyReviews = data.weeklyReviews.filter((r) => r.id !== reviewId);
  setUserData(userId, data);
}

// ----------------- PROFILE & SETTINGS -----------------

export function getUserProfile(userId: string): UserProfile {
  return getUserData(userId).profile;
}

export function updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
  const data = getUserData(userId);
  data.profile = {
    ...data.profile,
    ...updates,
    lastActiveAt: new Date().toISOString()
  };
  setUserData(userId, data);
  return data.profile;
}

export function clearUserData(userId: string): void {
  localStorage.removeItem(getStorageKey(userId));
}

// ----------------- SEEDING SAMPLE AUTHENTIC DATA -----------------

export function seedDemoData(userId: string, profile: UserProfile): void {
  const now = new Date();
  const d1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const d2 = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString();
  const d3 = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString();

  const demoReflections: Reflection[] = [
    {
      id: `ref-seed-1`,
      userId,
      title: 'Navigating Cross-Functional Technical Alignment',
      content:
        'During our architectural review today, I noticed tension between shipping speed and system reliability. I felt hesitant to push back on unrealistic timelines because I did not want to sound negative. However, staying silent led to unaddressed architectural risks. I need to practice delivering constructive feedback with conviction and data.',
      category: 'Communication',
      tags: ['#communication', '#leadership', '#architecture', '#confidence'],
      insights: [
        'Silence during reviews creates compounding technical debt',
        'Frame pushback around shared product outcomes rather than roadblocks',
        'Prepare 2 data points before joining high-stakes alignment discussions'
      ],
      actionPlanGenerated: true,
      createdAt: d1,
      updatedAt: d1
    },
    {
      id: `ref-seed-2`,
      userId,
      title: 'Overcoming Imposter Syndrome in Tech Talks',
      content:
        'I delivered a lightning demo on our new microservices pipeline to 40 engineers. While the demo worked, I rushed through the slides and spoke too quickly. I realized my fear of questions made me want to get it over with quickly. I want to build genuine composure and executive presence.',
      category: 'Leadership',
      tags: ['#leadership', '#publicspeaking', '#career', '#mindset'],
      insights: [
        'Pacing reflects confidence; deliberate pauses command authority',
        'Anticipate 3 difficult questions in advance to reduce stage anxiety'
      ],
      actionPlanGenerated: true,
      createdAt: d2,
      updatedAt: d2
    },
    {
      id: `ref-seed-3`,
      userId,
      title: 'Deep Work Mastery and Context Switching',
      content:
        'Constant Slack pings and fragmented meetings destroyed my afternoon focus blocks. I spent 3 hours on low-value triage instead of tackling the core distributed cache refactor. I need strict calendar defenses.',
      category: 'Productivity',
      tags: ['#productivity', '#deepwork', '#timemanagement'],
      insights: [
        'Fragmented 30-minute gaps are useless for high-order engineering',
        'Establish 2 uninterrupted 90-minute focus blocks every morning'
      ],
      actionPlanGenerated: false,
      createdAt: d3,
      updatedAt: d3
    }
  ];

  const demoGoals: Goal[] = [
    {
      id: `goal-seed-1`,
      userId,
      title: 'Master Technical Presentation Delivery & Composure',
      description:
        'Build poise and clear storytelling when presenting architecture proposals to senior stakeholders.',
      category: 'Leadership',
      priority: 'high',
      status: 'active',
      targetDate: '2026-09-15',
      actionSteps: [
        {
          id: `step-1`,
          text: 'Practice 5-minute lightning explanation with audio recording',
          completed: true,
          estimatedTime: '20 mins'
        },
        {
          id: `step-2`,
          text: 'Introduce deliberate 3-second pauses between major slide transitions',
          completed: true,
          estimatedTime: '15 mins'
        },
        {
          id: `step-3`,
          text: 'Host a mock Q&A session with a trusted staff peer',
          completed: false,
          estimatedTime: '30 mins'
        },
        {
          id: `step-4`,
          text: 'Prepare 1-page backup FAQ document for the next tech talk',
          completed: false,
          estimatedTime: '45 mins'
        }
      ],
      createdAt: d2,
      updatedAt: d1
    },
    {
      id: `goal-seed-2`,
      userId,
      title: 'Implement Daily 90-Minute Morning Deep Work Protocol',
      description:
        'Protect cognitive bandwidth for complex systems design and critical code reviews before checking communications.',
      category: 'Productivity',
      priority: 'medium',
      status: 'active',
      targetDate: '2026-09-10',
      actionSteps: [
        {
          id: `step-5`,
          text: 'Mute Slack and email notifications until 11:00 AM daily',
          completed: true,
          estimatedTime: '5 mins'
        },
        {
          id: `step-6`,
          text: 'Define tomorrow’s #1 engineering priority before ending current workday',
          completed: true,
          estimatedTime: '10 mins'
        },
        {
          id: `step-7`,
          text: 'Track 5 consecutive days of uninterrupted morning flow',
          completed: false,
          estimatedTime: 'Daily'
        }
      ],
      createdAt: d3,
      updatedAt: d2
    },
    {
      id: `goal-seed-3`,
      userId,
      title: 'Deliver Confident Architectural Feedback in Design Reviews',
      description:
        'Articulate technical trade-offs constructively using structured data points instead of hesitating.',
      category: 'Communication',
      priority: 'high',
      status: 'completed',
      targetDate: '2026-08-28',
      completedAt: d1,
      actionSteps: [
        {
          id: `step-8`,
          text: 'Draft 3 proactive questions before each architectural review',
          completed: true,
          estimatedTime: '15 mins'
        },
        {
          id: `step-9`,
          text: 'Frame concerns around reliability metrics and latency budgets',
          completed: true,
          estimatedTime: '15 mins'
        }
      ],
      createdAt: d3,
      updatedAt: d1
    }
  ];

  const demoStore: UserDataStore = {
    profile,
    reflections: demoReflections,
    conversations: [
      {
        id: `conv-seed-1`,
        userId,
        title: 'Overcoming Imposter Syndrome in Tech Talks',
        category: 'Leadership',
        tags: ['#leadership', '#publicspeaking', '#mindset'],
        summary:
          'Explored feelings of stage anxiety during a 40-person engineering demo and identified pacing strategies.',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content:
              'I delivered a lightning demo today to 40 engineers. Even though the demo worked, I rushed through it because I was afraid of questions. How can I feel more grounded?',
            timestamp: d2
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content:
              'That is a very common experience even among principal engineers. When we feel anxious, adrenaline speeds up our speech rate to escape the spotlight quickly.\n\nNotice that the demo itself was a technical success. What specifically made you fear the questions — was it the thought of not knowing an answer on the spot?',
            timestamp: d2,
            suggestedTags: ['#leadership', '#publicspeaking', '#composure']
          },
          {
            id: 'msg-3',
            role: 'user',
            content:
              'Yes, exactly. I felt like if someone asked a deep question I could not immediately answer, they would think I did not know what I was doing.',
            timestamp: d2
          },
          {
            id: 'msg-4',
            role: 'assistant',
            content:
              'Senior leaders do not know all answers in real time — what distinguishes them is having a calm, structured response when they do not. For example: *"Great question. We evaluated that edge case and have telemetry on it; let me follow up with the exact benchmark numbers after this session."*\n\nWould you like to turn this insight into a concrete action plan for your upcoming talks?',
            timestamp: d2,
            suggestedTags: ['#mindset', '#executivepresence', '#actionplan']
          }
        ],
        createdAt: d2,
        updatedAt: d2
      }
    ],
    goals: demoGoals,
    weeklyReviews: []
  };

  setUserData(userId, demoStore);
}

export function exportUserData(userId: string): string {
  const data = getUserData(userId);
  return JSON.stringify(data, null, 2);
}

export function importUserData(userId: string, jsonContent: string): boolean {
  try {
    const data = JSON.parse(jsonContent);
    if (!data.profile || !Array.isArray(data.reflections)) {
      throw new Error('Invalid schema format');
    }
    // Ensure all entities are reassigned strictly to this authenticated userId
    data.profile.uid = userId;
    data.reflections = (data.reflections || []).map((r: any) => ({ ...r, userId }));
    data.goals = (data.goals || []).map((g: any) => ({ ...g, userId }));
    data.conversations = (data.conversations || []).map((c: any) => ({ ...c, userId }));
    data.weeklyReviews = (data.weeklyReviews || []).map((w: any) => ({ ...w, userId }));
    
    setUserData(userId, data);
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}
