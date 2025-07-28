import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useStudySession(userId: string | null, studyType: string) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<number>(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTime, setPausedTime] = useState<number>(0); // in seconds
  const pauseStartRef = useRef<Date | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start a new study session
  const startSession = useCallback(async () => {
    if (!userId || isActive) return;
    const now = new Date();
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        start_time: now.toISOString(),
        study_type: studyType,
      })
      .select('id')
      .single();
    if (!error && data) {
      setSessionId(data.id);
      setStartTime(now);
      setEndTime(null);
      setDuration(0);
      setPausedTime(0);
      setIsActive(true);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    }
  }, [userId, studyType, isActive]);

  // End the current study session
  const endSession = useCallback(async () => {
    if (!userId || !sessionId || !startTime) return;
    const now = new Date();
    let totalDuration = duration;
    if (isPaused && pauseStartRef.current) {
      totalDuration -= Math.floor((now.getTime() - pauseStartRef.current.getTime()) / 1000);
    }
    await supabase
      .from('study_sessions')
      .update({
        end_time: now.toISOString(),
        duration: totalDuration,
      })
      .eq('id', sessionId);
    setSessionId(null);
    setStartTime(null);
    setEndTime(now);
    setDuration(0);
    setPausedTime(0);
    setIsActive(false);
    setIsPaused(false);
    if (timerRef.current) clearInterval(timerRef.current);
    // Check for achievements
    await checkAndGrantAchievements(userId, now, totalDuration);
  }, [userId, sessionId, startTime, duration, isPaused]);

  // Pause the session
  const pauseSession = useCallback(() => {
    if (!isActive || isPaused) return;
    setIsPaused(true);
    pauseStartRef.current = new Date();
    if (timerRef.current) clearInterval(timerRef.current);
  }, [isActive, isPaused]);

  // Resume the session
  const resumeSession = useCallback(() => {
    if (!isActive || !isPaused) return;
    setIsPaused(false);
    if (pauseStartRef.current) {
      setPausedTime((pt) => pt + Math.floor((new Date().getTime() - pauseStartRef.current!.getTime()) / 1000));
    }
    pauseStartRef.current = null;
    timerRef.current = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
  }, [isActive, isPaused]);

  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
    sessionId,
    startTime,
    endTime,
    duration: isPaused && pauseStartRef.current ? duration - Math.floor((new Date().getTime() - pauseStartRef.current.getTime()) / 1000) : duration,
    isActive,
    isPaused,
    pausedTime,
    startSession,
    endSession,
    pauseSession,
    resumeSession,
  };
}

// --- Achievement Logic ---
async function checkAndGrantAchievements(userId: string, sessionEnd: Date, sessionDuration: number) {
  // Fetch all study sessions for the user
  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId);
  if (!sessions) return;

  // Helper: check if achievement exists
  async function hasAchievement(name: string) {
    const { data } = await supabase
      .from('achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('title', name)
      .single();
    return !!data;
  }

  // First Study Session
  if (sessions.length === 1 && !(await hasAchievement('First Study Session'))) {
    await grantAchievement(userId, 'First Study Session', 'Completed your first study session!', '🎉', 'bronze');
  }

  // 1 Hour Club
  const totalStudyTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 60;
  if (totalStudyTime >= 60 && !(await hasAchievement('1 Hour Club'))) {
    await grantAchievement(userId, '1 Hour Club', 'Studied for 1 hour in total!', '⏰', 'silver');
  }

  // 3-Day Streak
  const days = Array.from(new Set(sessions.map(s => s.start_time?.slice(0, 10)))).sort();
  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    const d1 = new Date(days[i]);
    const d2 = new Date(days[i - 1]);
    if (d1.getTime() - d2.getTime() === 86400000) {
      streak++;
      if (streak >= 3) break;
    } else {
      streak = 1;
    }
  }
  if (streak >= 3 && !(await hasAchievement('3-Day Streak'))) {
    await grantAchievement(userId, '3-Day Streak', 'Studied 3 days in a row!', '🔥', 'silver');
  }

  // Night Owl
  const startHour = sessionEnd.getHours();
  if (startHour >= 0 && startHour < 3 && !(await hasAchievement('Night Owl'))) {
    await grantAchievement(userId, 'Night Owl', 'Studied between 12AM and 3AM!', '🦉', 'bronze');
  }

  // Marathoner
  if (sessionDuration >= 2 * 60 * 60 && !(await hasAchievement('Marathoner'))) {
    await grantAchievement(userId, 'Marathoner', 'Studied for 2 hours in one session!', '🏃‍♂️', 'gold');
  }
}

async function grantAchievement(userId: string, title: string, description: string, icon: string, type: string) {
  await supabase.from('achievements').insert({
    user_id: userId,
    title,
    description,
    icon,
    type,
    achieved_at: new Date().toISOString(),
  });
} 