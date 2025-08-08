import React, { useEffect, useState, useCallback } from 'react';

export interface SubjectProgress {
  subject: string;
  progress: number;
  color: string;
}

export interface RecentQuiz {
  id: string;
  subject: string;
  score: number;
  date: string;
  timeTaken: string;
  questionsCorrect: number;
  totalQuestions: number;
  chapter?: string;
  created_at?: string;
}

export interface OverallStats {
  totalQuizzes: number;
  averageScore: number;
  totalStudyTime: string;
  currentStreak: number;
  strongestSubject: string;
  improvementNeeded: string;
  totalQuestionsSolved: number;
  totalCorrect: number;
  totalWrong: number;
  chaptersCompleted: string[];
  activeDays: string[];
}

export interface UserMetrics {
  quizzesAttempted: number;
  totalQuestions: number;
  currentStreak: number;
  weeklyProgress: number[];
  subjectProgress: SubjectProgress[];
  recentQuizzes: RecentQuiz[];
  overallStats: OverallStats;
  quizzesDeltaLastWeek: number;
  questionsDeltaYesterday: number;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserMetrics(userId: string | null): UserMetrics {
  const [quizzesAttempted, setQuizzesAttempted] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [weeklyProgress, setWeeklyProgress] = useState<number[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<SubjectProgress[]>([]);
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalQuizzes: 0,
    averageScore: 0,
    totalStudyTime: '0h 0m',
    currentStreak: 0,
    strongestSubject: '',
    improvementNeeded: '',
    totalQuestionsSolved: 0,
    totalCorrect: 0,
    totalWrong: 0,
    chaptersCompleted: [],
    activeDays: [],
  });
  const [quizzesDeltaLastWeek, setQuizzesDeltaLastWeek] = useState(0);
  const [questionsDeltaYesterday, setQuestionsDeltaYesterday] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/progress/metrics?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as any));
        throw new Error((body as any).error || `Failed to load metrics (${res.status})`);
      }
      const { data } = (await res.json()) as { data: any[] };
      const quizResults = (data || []) as Array<{
        id: string;
        subject?: string;
        score?: number;
        created_at?: string;
        time_taken?: number;
        correct_answers?: number;
        wrong_answers?: number;
        total_questions?: number;
        chapter?: string;
      }>;

      // Quizzes attempted
      setQuizzesAttempted(quizResults.length);
      
      // Total questions solved (quiz only)
      const quizQuestions = quizResults.reduce((acc, r) => acc + (r.total_questions || 0), 0);
      setTotalQuestions(quizQuestions);
      
      // Total correct/wrong (quiz only)
      const totalCorrect = quizResults.reduce((acc, r) => acc + (r.correct_answers || 0), 0);
      const totalWrong = quizResults.reduce((acc, r) => acc + (r.wrong_answers || 0), 0);
      
      // Chapters completed (from quiz_results only)
      const quizChapters = quizResults.map(r => r.chapter).filter((v): v is string => Boolean(v));
      const chaptersCompleted = Array.from(new Set<string>(quizChapters));
      
      // Recent quizzes (last 4)
      setRecentQuizzes(quizResults.slice(0, 4).map(r => ({
        id: r.id,
        subject: r.subject || 'Unknown',
        score: r.score || 0,
        date: r.created_at?.slice(0, 10) || '',
        timeTaken: (r.time_taken ?? 0).toString(),
        questionsCorrect: r.correct_answers || 0,
        totalQuestions: r.total_questions || 0,
        chapter: r.chapter,
        created_at: r.created_at,
      })));
      
      // Weekly progress (last 7 days)
      const week = Array(7).fill(0) as number[];
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const dayStr = day.toISOString().slice(0, 10);
        const dayResults = quizResults.filter(r => (r.created_at?.slice(0, 10) || '') === dayStr);
        week[6 - i] = dayResults.length > 0 ? Math.round(dayResults.reduce((acc, r) => acc + (r.score || 0), 0) / dayResults.length) : 0;
      }
      setWeeklyProgress(week);
      
      // Subject progress/mastery - extract subjects from chapter names
      const subjects = Array.from(new Set<string>(
        quizResults
          .filter(r => !!r.chapter)
          .map(r => (r.chapter as string).split(' ')[0])
      ));
      const subjectColors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-orange-500',
        'bg-pink-500',
        'bg-yellow-500',
      ];
      const subjectProg: SubjectProgress[] = subjects.map((subject, i) => {
        const subjectResults = quizResults.filter(r => r.chapter && (r.chapter as string).startsWith(subject));
        const progress = subjectResults.length > 0 ? Math.round(subjectResults.reduce((acc, r) => acc + (r.score || 0), 0) / subjectResults.length) : 0;
        return { subject, progress, color: subjectColors[i % subjectColors.length] };
      });
      setSubjectProgress(subjectProg);
      
      // Streak calculation
      const quizDays = quizResults.map(r => r.created_at?.slice(0, 10)).filter((v): v is string => Boolean(v));
      const allDays = Array.from(new Set<string>(quizDays)).sort();
      let streak = 1;
      let maxStreak = 1;
      for (let i = allDays.length - 1; i > 0; i--) {
        const d1 = new Date(allDays[i] as string);
        const d2 = new Date(allDays[i - 1] as string);
        if (d1.getTime() - d2.getTime() === 86400000) {
          streak++;
          if (streak > maxStreak) maxStreak = streak;
        } else {
          streak = 1;
        }
      }
      const todayStr = now.toISOString().slice(0, 10);
      if (allDays.length === 0 || allDays[allDays.length - 1] !== todayStr) {
        streak = 1;
      }
      setCurrentStreak(streak);
      
      // Overall stats
      const totalQuizzes = quizResults.length;
      const averageScore = totalQuizzes > 0 ? Math.round(quizResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalQuizzes) : 0;
      const subjectAttempts: Record<string, number> = {};
      quizResults.forEach(result => {
        if (result.chapter) {
          const subject = (result.chapter as string).split(' ')[0];
          subjectAttempts[subject] = (subjectAttempts[subject] || 0) + 1;
        }
      });
      let strongestSubject = '';
      let maxAttempts = 0;
      for (const [subject, attempts] of Object.entries(subjectAttempts)) {
        if (attempts > maxAttempts) {
          maxAttempts = attempts;
          strongestSubject = subject;
        }
      }
      const subjectScores: Record<string, { total: number; count: number }> = {};
      quizResults.forEach(result => {
        if (result.chapter) {
          const subject = (result.chapter as string).split(' ')[0];
          if (!subjectScores[subject]) {
            subjectScores[subject] = { total: 0, count: 0 };
          }
          subjectScores[subject].total += result.score || 0;
          subjectScores[subject].count += 1;
        }
      });
      let improvementNeeded = '';
      let minAvgScore = 101;
      for (const [subject, scores] of Object.entries(subjectScores)) {
        const avgScore = scores.total / scores.count;
        if (avgScore < minAvgScore) {
          minAvgScore = avgScore;
          improvementNeeded = subject;
        }
      }
      setOverallStats({
        totalQuizzes,
        averageScore,
        totalStudyTime: '0h 0m',
        currentStreak: streak,
        strongestSubject,
        improvementNeeded,
        totalQuestionsSolved: quizQuestions,
        totalCorrect,
        totalWrong,
        chaptersCompleted,
        activeDays: allDays,
      });
      
      // Deltas
      const getDayStr = (date: Date) => date.toISOString().slice(0, 10);
      const quizzesByDay: Record<string, number> = {};
      quizResults.forEach(r => {
        const d = r.created_at?.slice(0, 10);
        if (d) quizzesByDay[d] = (quizzesByDay[d] || 0) + 1;
      });
      let quizzesThisWeek = 0;
      let quizzesLastWeek = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        quizzesThisWeek += quizzesByDay[getDayStr(d)] || 0;
      }
      for (let i = 7; i < 14; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        quizzesLastWeek += quizzesByDay[getDayStr(d)] || 0;
      }
      setQuizzesDeltaLastWeek(quizzesThisWeek - quizzesLastWeek);
      
      let questionsToday = 0;
      let questionsYesterday = 0;
      const today = getDayStr(now);
      const yesterday = getDayStr(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
      quizResults.forEach(r => {
        const d = r.created_at?.slice(0, 10);
        if (d === today) questionsToday += r.total_questions || 0;
        if (d === yesterday) questionsYesterday += r.total_questions || 0;
      });
      setQuestionsDeltaYesterday(questionsToday - questionsYesterday);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    quizzesAttempted,
    totalQuestions,
    currentStreak,
    weeklyProgress,
    subjectProgress,
    recentQuizzes,
    overallStats,
    quizzesDeltaLastWeek,
    questionsDeltaYesterday,
    loading,
    error,
    refetch: fetchMetrics,
  };
} 