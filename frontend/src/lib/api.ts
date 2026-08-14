const getApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:8000/api`;
  }
  return 'http://localhost:8000/api';
};

async function customFetch(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err: any) {
    throw new Error('Unable to connect to server. Please check your connection.');
  }
}

export interface Skill {
  id: number;
  title: string;
  description: string;
  position: number;
  xp_reward: number;
  progress: number;
  state: 'locked' | 'available' | 'completed';
  first_lesson_id: number | null;
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  position: number;
  skills: Skill[];
}

export interface Course {
  id: number;
  name: string;
  language: string;
  description: string;
  units: Unit[];
}

export interface LearnerProgress {
  username: string;
  total_xp: number;
  current_streak: number;
  hearts: number;
  last_activity_date: string | null;
  daily_xp: number;
  daily_goal: number;
  skill_progress: Record<string, unknown>[];
  lesson_progress: Record<string, unknown>[];
}

export interface Lesson {
  id: number;
  title: string;
  position: number;
  skill: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exercises?: any[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  total_xp: number;
  is_current: boolean;
}

export const getLearningPath = async (): Promise<Course> => {
  const res = await customFetch(`${getApiUrl()}/learning-path/`, { credentials: 'include' });
  if (res.status === 401) throw new Error('Not authenticated');
  if (!res.ok) throw new Error('Failed to fetch learning path');
  return res.json();
};

export const getLesson = async (id: number): Promise<Lesson> => {
  const res = await customFetch(`${getApiUrl()}/lessons/${id}/`, { credentials: 'include' });
  if (res.status === 401) throw new Error('Not authenticated');
  if (!res.ok) throw new Error('Failed to fetch lesson');
  return res.json();
};

export const getLearnerProgress = async (): Promise<LearnerProgress> => {
  const res = await customFetch(`${getApiUrl()}/progress/`, { credentials: 'include' });
  if (res.status === 401) throw new Error('Not authenticated');
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
};

export const completeLesson = async (id: number): Promise<{ 
  success: boolean; 
  skill_progress_percent: number;
  xp_earned?: number;
  new_total_xp?: number;
  new_streak?: number;
}> => {
  const res = await customFetch(`${getApiUrl()}/lessons/${id}/complete/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('Not authenticated');
  if (!res.ok) throw new Error('Failed to complete lesson');
  return res.json();
};

export const refillHearts = async (): Promise<{ success: boolean; hearts: number }> => {
  const res = await customFetch(`${getApiUrl()}/progress/refill-hearts/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('Not authenticated');
  if (!res.ok) throw new Error('Failed to refill hearts');
  return res.json();
};

export const deductHeart = async (): Promise<{ success: boolean; hearts: number }> => {
  const res = await customFetch(`${getApiUrl()}/progress/deduct-heart/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (res.status === 401) throw new Error('Not authenticated');
  if (!res.ok) throw new Error('Failed to deduct heart');
  return res.json();
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await customFetch(`${getApiUrl()}/progress/leaderboard/`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
};

export interface User {
  id: number;
  email: string;
  name: string;
}

export const signup = async (data: any): Promise<{ message: string; user: User }> => {
  const res = await customFetch(`${getApiUrl()}/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to signup');
  }
  return res.json();
};

export const login = async (data: any): Promise<{ message: string; user: User }> => {
  const res = await customFetch(`${getApiUrl()}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid email or password');
  }
  return res.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const res = await customFetch(`${getApiUrl()}/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to logout');
  return res.json();
};

export const getMe = async (): Promise<{ user: User }> => {
  const res = await customFetch(`${getApiUrl()}/auth/me/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
};
