const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
  const res = await fetch(`${API_URL}/learning-path/`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch learning path');
  return res.json();
};

export const getLesson = async (id: number): Promise<Lesson> => {
  const res = await fetch(`${API_URL}/lessons/${id}/`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch lesson');
  return res.json();
};

export const getLearnerProgress = async (): Promise<LearnerProgress> => {
  const res = await fetch(`${API_URL}/progress/`, { credentials: 'include' });
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
  const res = await fetch(`${API_URL}/lessons/${id}/complete/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to complete lesson');
  return res.json();
};

export const refillHearts = async (): Promise<{ success: boolean; hearts: number }> => {
  const res = await fetch(`${API_URL}/progress/refill-hearts/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to refill hearts');
  return res.json();
};

export const deductHeart = async (): Promise<{ success: boolean; hearts: number }> => {
  const res = await fetch(`${API_URL}/progress/deduct-heart/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to deduct heart');
  return res.json();
};

export const getLeaderboard = async (): Promise<LeaderboardEntry[]> => {
  const res = await fetch(`${API_URL}/progress/leaderboard/`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch leaderboard');
  return res.json();
};

export interface User {
  id: number;
  email: string;
  name: string;
}

export const signup = async (data: any): Promise<{ message: string; user: User }> => {
  const res = await fetch(`${API_URL}/auth/signup/`, {
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
  const res = await fetch(`${API_URL}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to login');
  }
  return res.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const res = await fetch(`${API_URL}/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to logout');
  return res.json();
};

export const getMe = async (): Promise<{ user: User }> => {
  const res = await fetch(`${API_URL}/auth/me/`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Not authenticated');
  return res.json();
};
