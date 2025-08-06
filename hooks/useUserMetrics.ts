import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

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
      // Fetch quiz results only
      const { data: quizResults, error: quizError } = await supabase
        .from('quiz_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (quizError) throw quizError;

      // Quizzes attempted
      setQuizzesAttempted(quizResults.length);
      
      // Total questions solved (quiz only)
      const quizQuestions = quizResults.reduce((acc, r) => acc + (r.total_questions || 0), 0);
      setTotalQuestions(quizQuestions);
      
      // Total correct/wrong (quiz only)
      const totalCorrect = quizResults.reduce((acc, r) => acc + (r.correct_answers || 0), 0);
      const totalWrong = quizResults.reduce((acc, r) => acc + (r.wrong_answers || 0), 0);
      
      // Chapters completed (from quiz_results only)
      const quizChapters = quizResults.map(r => r.chapter).filter(Boolean);
      const chaptersCompleted = Array.from(new Set(quizChapters));
      
      // Recent quizzes (last 4)
      setRecentQuizzes(quizResults.slice(0, 4).map(r => ({
        id: r.id,
        subject: r.subject || 'Unknown',
        score: r.score,
        date: r.created_at?.slice(0, 10) || '',
        timeTaken: r.time_taken?.toString() || '0',
        questionsCorrect: r.correct_answers,
        totalQuestions: r.total_questions,
        chapter: r.chapter,
      })));
      
      // Weekly progress (last 7 days)
      const week = Array(7).fill(0);
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const dayStr = day.toISOString().slice(0, 10);
        const dayResults = quizResults.filter(r => r.created_at?.slice(0, 10) === dayStr);
        week[6 - i] = dayResults.length > 0 ? Math.round(dayResults.reduce((acc, r) => acc + (r.score || 0), 0) / dayResults.length) : 0;
      }
      setWeeklyProgress(week);
      
      // Calculate strongest subject based on quiz attempts and performance
      const subjectStats: Record<string, { attempts: number; totalScore: number; avgScore: number }> = {};
      
      quizResults.forEach(result => {
        if (result.chapter) {
          // Extract subject from chapter (assuming format like "english-beehive-prose")
          const subject = result.chapter.split('-')[0];
          if (subject) {
            if (!subjectStats[subject]) {
              subjectStats[subject] = { attempts: 0, totalScore: 0, avgScore: 0 };
            }
            subjectStats[subject].attempts += 1;
            subjectStats[subject].totalScore += result.score || 0;
          }
        }
      });

      // Calculate average scores and find strongest subject
      let strongestSubject = '';
      let maxScore = 0;
      for (const [subject, stats] of Object.entries(subjectStats)) {
        stats.avgScore = stats.totalScore / stats.attempts;
        if (stats.attempts >= 2 && stats.avgScore > maxScore) { // Require at least 2 attempts
          maxScore = stats.avgScore;
          strongestSubject = subject.charAt(0).toUpperCase() + subject.slice(1); // Capitalize
        }
      }
      
      // Subject progress/mastery based on actual quiz data
      const subjectColors = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-orange-500',
        'bg-pink-500',
        'bg-yellow-500',
      ];
      
      // Calculate subject progress from actual quiz data
      const subjectProg = Object.entries(subjectStats).map(([subject, stats], i) => {
        const progress = Math.round(stats.avgScore);
        return { 
          subject: subject.charAt(0).toUpperCase() + subject.slice(1), 
          progress, 
          color: subjectColors[i % subjectColors.length] 
        };
      });
      setSubjectProgress(subjectProg);
      
      // Streak calculation (active days from quiz results only)
      const quizDays = quizResults.map(r => r.created_at?.slice(0, 10)).filter(Boolean);
      const allDays = Array.from(new Set(quizDays)).sort();
      
      // Calculate streak: increment for each consecutive day, reset to 1 if a day is missed
      let streak = 1;
      let maxStreak = 1;
      for (let i = allDays.length - 1; i > 0; i--) {
        const d1 = new Date(allDays[i]);
        const d2 = new Date(allDays[i - 1]);
        if (d1.getTime() - d2.getTime() === 86400000) {
          streak++;
          if (streak > maxStreak) maxStreak = streak;
        } else {
          streak = 1;
        }
      }
      // If the last active day is not today, streak = 1
      const todayStr = now.toISOString().slice(0, 10);
      if (allDays.length === 0 || allDays[allDays.length - 1] !== todayStr) {
        streak = 1;
      }
      setCurrentStreak(streak);
      
      // Overall stats
      const totalQuizzes = quizResults.length;
      const averageScore = totalQuizzes > 0 ? Math.round(quizResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalQuizzes) : 0;

      // Calculate improvement needed (subject with lowest average score)
      let improvementNeeded = '';
      let minScore = 101;
      for (const s of subjectProg) {
        if (s.progress < minScore && s.progress > 0) {
          minScore = s.progress;
          improvementNeeded = s.subject;
        }
      }
      
      setOverallStats({
        totalQuizzes,
        averageScore,
        totalStudyTime: '0h 0m', // No study sessions table
        currentStreak: streak,
        strongestSubject,
        improvementNeeded,
        totalQuestionsSolved: quizQuestions,
        totalCorrect,
        totalWrong,
        chaptersCompleted,
        activeDays: allDays,
      });

      // --- Calculate deltas for dashboard ---
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
      
      // Questions: today vs yesterday
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