/**
 * LocalStorage utilities for persisting user data
 */

export interface SessionRecord {
  id: string;
  date: string;
  passageId: string;
  passageTitle: string;
  difficulty: string;
  wpm: number;
  accuracy: number;
  retention: number;
  speedLearningScore: number;
  readingTimeSeconds: number;
  category: string;
}

export interface UserPreferences {
  fontSize: number; // 12-24
  fontFamily: 'serif' | 'sans-serif' | 'dyslexic';
  theme: 'light' | 'sepia' | 'dark';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
  textWidth: 'narrow' | 'medium' | 'wide';
  readingMode: 'normal' | 'rsvp' | 'guided';
  rsvpSpeed: number; // WPM for RSVP mode
  showLiveStats: boolean;
}

export interface UserProgress {
  sessions: SessionRecord[];
  totalSessions: number;
  bestWPM: number;
  bestAccuracy: number;
  bestRetention: number;
  lastSessionDate: string | null;
  completedPassages: string[]; // IDs of completed passages
  currentStreak: number;
}

const STORAGE_KEYS = {
  SESSIONS: 'reading_assessment_sessions',
  PREFERENCES: 'reading_assessment_preferences',
  PROGRESS: 'reading_assessment_progress',
};

const DEFAULT_PREFERENCES: UserPreferences = {
  fontSize: 18,
  fontFamily: 'sans-serif',
  theme: 'light',
  lineSpacing: 'normal',
  textWidth: 'medium',
  readingMode: 'normal',
  rsvpSpeed: 300,
  showLiveStats: true,
};

const DEFAULT_PROGRESS: UserProgress = {
  sessions: [],
  totalSessions: 0,
  bestWPM: 0,
  bestAccuracy: 0,
  bestRetention: 0,
  lastSessionDate: null,
  completedPassages: [],
  currentStreak: 0,
};

// Generic localStorage helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// User Preferences
export function getPreferences(): UserPreferences {
  return getItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

export function savePreferences(preferences: Partial<UserPreferences>): void {
  const current = getPreferences();
  setItem(STORAGE_KEYS.PREFERENCES, { ...current, ...preferences });
}

export function resetPreferences(): void {
  setItem(STORAGE_KEYS.PREFERENCES, DEFAULT_PREFERENCES);
}

// User Progress
export function getProgress(): UserProgress {
  return getItem(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
}

function saveProgress(progress: UserProgress): void {
  setItem(STORAGE_KEYS.PROGRESS, progress);
}

// Sessions
export function getSessions(limit?: number): SessionRecord[] {
  const progress = getProgress();
  const sessions = progress.sessions || [];

  // Sort by date descending (most recent first)
  sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return limit ? sessions.slice(0, limit) : sessions;
}

export function addSession(session: Omit<SessionRecord, 'id' | 'date'>): void {
  const progress = getProgress();

  const newSession: SessionRecord = {
    ...session,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };

  // Add session
  const sessions = [newSession, ...(progress.sessions || [])];

  // Keep only last 50 sessions
  const trimmedSessions = sessions.slice(0, 50);

  // Update statistics
  const bestWPM = Math.max(progress.bestWPM, session.wpm);
  const bestAccuracy = Math.max(progress.bestAccuracy, session.accuracy);
  const bestRetention = Math.max(progress.bestRetention, session.retention);

  // Track completed passages
  const completedPassages = progress.completedPassages || [];
  if (!completedPassages.includes(session.passageId)) {
    completedPassages.push(session.passageId);
  }

  // Calculate streak
  const currentStreak = calculateStreak(trimmedSessions);

  const updatedProgress: UserProgress = {
    sessions: trimmedSessions,
    totalSessions: (progress.totalSessions || 0) + 1,
    bestWPM,
    bestAccuracy,
    bestRetention,
    lastSessionDate: newSession.date,
    completedPassages,
    currentStreak,
  };

  saveProgress(updatedProgress);
}

function calculateStreak(sessions: SessionRecord[]): number {
  if (sessions.length === 0) return 0;

  let streak = 1;
  let currentDate = new Date(sessions[0].date);
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sessions.length; i++) {
    const sessionDate = new Date(sessions[i].date);
    sessionDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.floor(
      (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (dayDiff === 1) {
      streak++;
      currentDate = sessionDate;
    } else if (dayDiff > 1) {
      break;
    }
    // If dayDiff === 0 (same day), continue without incrementing streak
  }

  return streak;
}

// Analytics
export interface AnalyticsData {
  averageWPM: number;
  averageAccuracy: number;
  averageRetention: number;
  averageScore: number;
  totalReadingTime: number; // in minutes
  passagesCompleted: number;
  recentSessions: SessionRecord[];
  progressOverTime: {
    date: string;
    wpm: number;
    accuracy: number;
    score: number;
  }[];
}

export function getAnalytics(days: number = 30): AnalyticsData {
  const sessions = getSessions();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentSessions = sessions.filter(
    (s) => new Date(s.date) >= cutoffDate
  );

  if (recentSessions.length === 0) {
    return {
      averageWPM: 0,
      averageAccuracy: 0,
      averageRetention: 0,
      averageScore: 0,
      totalReadingTime: 0,
      passagesCompleted: 0,
      recentSessions: [],
      progressOverTime: [],
    };
  }

  const averageWPM = Math.round(
    recentSessions.reduce((sum, s) => sum + s.wpm, 0) / recentSessions.length
  );
  const averageAccuracy = Math.round(
    recentSessions.reduce((sum, s) => sum + s.accuracy, 0) / recentSessions.length
  );
  const averageRetention = Math.round(
    recentSessions.reduce((sum, s) => sum + s.retention, 0) / recentSessions.length
  );
  const averageScore = Math.round(
    recentSessions.reduce((sum, s) => sum + s.speedLearningScore, 0) / recentSessions.length
  );
  const totalReadingTime = Math.round(
    recentSessions.reduce((sum, s) => sum + s.readingTimeSeconds, 0) / 60
  );

  // Group by date for progress chart
  const sessionsByDate: { [date: string]: SessionRecord[] } = {};
  recentSessions.forEach((session) => {
    const dateKey = new Date(session.date).toISOString().split('T')[0];
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(session);
  });

  const progressOverTime = Object.entries(sessionsByDate).map(([date, sessions]) => ({
    date,
    wpm: Math.round(sessions.reduce((sum, s) => sum + s.wpm, 0) / sessions.length),
    accuracy: Math.round(sessions.reduce((sum, s) => sum + s.accuracy, 0) / sessions.length),
    score: Math.round(sessions.reduce((sum, s) => sum + s.speedLearningScore, 0) / sessions.length),
  })).sort((a, b) => a.date.localeCompare(b.date));

  return {
    averageWPM,
    averageAccuracy,
    averageRetention,
    averageScore,
    totalReadingTime,
    passagesCompleted: new Set(recentSessions.map(s => s.passageId)).size,
    recentSessions: recentSessions.slice(0, 10),
    progressOverTime,
  };
}

// Clear all data
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  localStorage.removeItem(STORAGE_KEYS.PROGRESS);
}

// Export for testing
export function isPassageCompleted(passageId: string): boolean {
  const progress = getProgress();
  return progress.completedPassages.includes(passageId);
}
