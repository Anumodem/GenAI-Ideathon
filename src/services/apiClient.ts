import {
  ChatMessage,
  ActionPlanResponse,
  WeeklyReviewResponse,
  GoalCategory,
  TagSuggestionResponse
} from '../types';

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async sendChatMessage(params: {
    messages: { role: string; content: string }[];
    coachStyle?: 'socratic' | 'action-oriented' | 'empathetic';
    currentCategory?: GoalCategory;
  }): Promise<{ reply: string; suggestedTags: string[] }> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `AI Chat request failed (${res.status})`);
      }

      return await res.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('AI Copilot reflection timed out. Please try sending your message again.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateActionPlan(params: {
    conversationHistory?: { role: string; content: string }[];
    reflectionText?: string;
  }): Promise<ActionPlanResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch('/api/ai/action-plan', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate action plan (${res.status})`);
      }

      return await res.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Action plan generation timed out. Please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async generateWeeklyReview(params: {
    reflections: any[];
    goals?: any[];
    startDate?: string;
    endDate?: string;
  }): Promise<WeeklyReviewResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch('/api/ai/weekly-review', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
        signal: controller.signal
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate weekly review (${res.status})`);
      }

      return await res.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Weekly review generation timed out. Please try again.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async suggestTags(text: string): Promise<TagSuggestionResponse> {
    const res = await fetch('/api/ai/suggest-tags', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ text })
    });

    if (!res.ok) {
      return {
        tags: ['#reflection', '#growth', '#mindset'],
        suggestedCategory: 'Personal Development'
      };
    }

    return res.json();
  }

  async checkHealth(): Promise<{ status: string; geminiConfigured: boolean }> {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch {
      return { status: 'offline', geminiConfigured: false };
    }
  }

  async createSession(user: {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
  }): Promise<{ sessionToken: string; user: any }> {
    const res = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) {
      throw new Error('Failed to create session');
    }
    return res.json();
  }
}

export const apiClient = new ApiClient();
