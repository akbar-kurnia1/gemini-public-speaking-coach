export enum ViewState {
  LOGIN = 'LOGIN',
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  PREFLIGHT = 'PREFLIGHT',
  PRACTICE = 'PRACTICE',
  EVALUATION = 'EVALUATION',
}

export enum Difficulty {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  PRO = 'Pro',
}

export interface LevelNode {
  id: string;
  day: number;
  title: string;
  description: string;
  isLocked: boolean;
  isCompleted: boolean;
  score?: number;
  difficulty: Difficulty;
  promptContext: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export interface VisualMetrics {
  eyeContactScore: number; // 0-100
  postureScore: number; // 0-100
  sentiment: 'Confident' | 'Nervous' | 'Neutral';
  eyeContactTimeline: boolean[]; // true = looking at camera, false = looking away
}

export interface SessionData {
  level: LevelNode;
  messages: ChatMessage[];
  fillerWordsCount: number;
  paceRating: 'Too Slow' | 'Perfect' | 'Too Fast';
  visuals: VisualMetrics;
}

export interface Mistake {
  original: string;
  correction: string;
  type: 'grammar' | 'pronunciation';
  explanation: string;
}

export interface EvaluationMetrics {
  score: number; // 0-100
  mistakes: Mistake[];
  feedbackSummary: string;
}

export interface UserProgress {
  streak: number;
  selectedDifficulty: Difficulty | null;
  completedLevels: string[]; // Level IDs
}