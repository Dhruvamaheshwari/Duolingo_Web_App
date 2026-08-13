const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface Skill {
  id: number;
  title: string;
  description: string;
  position: number;
  xp_reward: number;
  progress: number;
  state: 'locked' | 'available' | 'completed';
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
  total_xp: number;
  current_streak: number;
  hearts: number;
  last_activity_date: string | null;
  daily_xp: number;
  daily_goal: number;
  skill_progress: any[];
  lesson_progress: any[];
}

export interface Lesson {
  id: number;
  title: string;
  position: number;
  skill: number;
  exercises?: any[];
}

export const getLearningPath = async (): Promise<Course> => {
  const res = await fetch(`${API_URL}/learning-path/`);
  if (!res.ok) throw new Error('Failed to fetch learning path');
  return res.json();
};

export const getLesson = async (id: number): Promise<Lesson> => {
  const res = await fetch(`${API_URL}/lessons/${id}/`);
  if (!res.ok) throw new Error('Failed to fetch lesson');
  return res.json();
};

export const getLearnerProgress = async (): Promise<LearnerProgress> => {
  const res = await fetch(`${API_URL}/progress/`);
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
};

export const completeLesson = async (id: number): Promise<{ success: boolean; skill_progress_percent: number }> => {
  const res = await fetch(`${API_URL}/lessons/${id}/complete/`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to complete lesson');
  return res.json();
};

export const refillHearts = async (): Promise<{ success: boolean; hearts: number }> => {
  const res = await fetch(`${API_URL}/progress/refill-hearts/`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to refill hearts');
  return res.json();
};
