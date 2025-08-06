import React, { useState, useRef, useCallback } from 'react';

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
    
    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          userId,
          studyType,
          startTime: now.toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to start session:', response.status);
        return;
      }

      const data = await response.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
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
    } catch (error) {
      console.error('Error starting session:', error);
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

    try {
      const response = await fetch('/api/study-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'end',
          sessionId,
          endTime: now.toISOString(),
          duration: totalDuration,
        }),
      });

      if (!response.ok) {
        console.error('Failed to end session:', response.status);
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }

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
  try {
    // Fetch all study sessions for the user using the API
    const response = await fetch(`/api/study-sessions?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch sessions for achievements');
      return;
    }

    const data = await response.json();
    const sessions = data.sessions || [];

    // Helper: check if achievement exists
    async function hasAchievement(name: string) {
      try {
        const response = await fetch('/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'check',
            userId,
            title: name,
          }),
        });
        const data = await response.json();
        return data.exists || false;
      } catch (error) {
        console.error('Error checking achievement:', error);
        return false;
      }
    }

    // Helper: grant achievement
    async function grantAchievement(userId: string, title: string, description: string, icon: string, tier: string) {
      try {
        await fetch('/api/achievements', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'grant',
            userId,
            title,
            description,
            icon,
            tier,
          }),
        });
      } catch (error) {
        console.error('Error granting achievement:', error);
      }
    }

    // First Study Session
    if (sessions.length === 1 && !(await hasAchievement('First Study Session'))) {
      await grantAchievement(userId, 'First Study Session', 'Completed your first study session!', '🎉', 'bronze');
    }

    // 1 Hour Club
    const totalStudyTime = sessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) / 60;
    if (totalStudyTime >= 60 && !(await hasAchievement('1 Hour Club'))) {
      await grantAchievement(userId, '1 Hour Club', 'Studied for 1 hour in total!', '⏰', 'silver');
    }

    // 3-Day Streak
    const days = Array.from(new Set(sessions.map((s: any) => s.start_time?.slice(0, 10)))).sort();
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

    // Marathon Study (2+ hour session)
    if (sessionDuration >= 7200 && !(await hasAchievement('Marathon Study'))) {
      await grantAchievement(userId, 'Marathon Study', 'Studied for 2+ hours in one session!', '🏃', 'gold');
    }

    // Weekend Warrior
    const dayOfWeek = sessionEnd.getDay();
    if ((dayOfWeek === 0 || dayOfWeek === 6) && !(await hasAchievement('Weekend Warrior'))) {
      await grantAchievement(userId, 'Weekend Warrior', 'Studied on a weekend!', '💪', 'bronze');
    }

  } catch (error) {
    console.error('Error in achievement logic:', error);
  }
} 