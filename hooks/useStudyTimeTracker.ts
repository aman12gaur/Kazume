import { useState, useEffect, useRef } from 'react';
import { DateTime, Duration } from 'luxon';
import { supabase } from '@/lib/supabaseClient';

interface StudySession {
  start: DateTime;
  end: DateTime;
  duration: Duration;
}

interface StudyTimeState {
  totalDuration: Duration;
  currentSessionStart: DateTime | null;
  isTracking: boolean;
  formattedTime: string;
}

export function useStudyTimeTracker(userId: string | null) {
  const [state, setState] = useState<StudyTimeState>({
    totalDuration: Duration.fromMillis(0),
    currentSessionStart: null,
    isTracking: false,
    formattedTime: '0h 0m'
  });

  const sessionStartRef = useRef<DateTime | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing study time from localStorage and database
  useEffect(() => {
    if (!userId) return;

    const loadStudyTime = async () => {
      try {
        // Load from localStorage for immediate display
        const stored = localStorage.getItem(`studyTime_${userId}`);
        if (stored) {
          const { totalMillis, lastUpdated } = JSON.parse(stored);
          const lastUpdate = DateTime.fromISO(lastUpdated);
          const currentMonth = DateTime.now().startOf('month');
          
          // Only use stored data if it's from current month
          if (lastUpdate.hasSame(currentMonth, 'month')) {
            setState(prev => ({
              ...prev,
              totalDuration: Duration.fromMillis(totalMillis),
              formattedTime: formatDuration(Duration.fromMillis(totalMillis))
            }));
          }
        }

        // Load from database
        const { data: sessions } = await supabase
          .from('study_sessions')
          .select('start_time, end_time, duration')
          .eq('user_id', userId)
          .gte('start_time', DateTime.now().startOf('month').toISO())
          .order('start_time', { ascending: false });

        if (sessions && sessions.length > 0) {
          const totalMillis = sessions.reduce((acc, session) => {
            return acc + (session.duration || 0) * 1000; // Convert seconds to milliseconds
          }, 0);

          const totalDuration = Duration.fromMillis(totalMillis);
          setState(prev => ({
            ...prev,
            totalDuration,
            formattedTime: formatDuration(totalDuration)
          }));

          // Update localStorage
          localStorage.setItem(`studyTime_${userId}`, JSON.stringify({
            totalMillis,
            lastUpdated: DateTime.now().toISO()
          }));
        }
      } catch (error) {
        console.error('Error loading study time:', error);
      }
    };

    loadStudyTime();
  }, [userId]);

  // Start tracking when component mounts or user becomes available
  useEffect(() => {
    if (!userId) return;

    const startTracking = () => {
      const now = DateTime.now();
      sessionStartRef.current = now;
      setState(prev => ({
        ...prev,
        currentSessionStart: now,
        isTracking: true
      }));

      // Update every minute
      intervalRef.current = setInterval(() => {
        updateDisplay();
      }, 60000); // Update every minute
    };

    const stopTracking = () => {
      if (sessionStartRef.current) {
        const sessionEnd = DateTime.now();
        const sessionDuration = sessionEnd.diff(sessionStartRef.current);
        
        // Add to total duration
        setState(prev => {
          const newTotal = prev.totalDuration.plus(sessionDuration);
          const formatted = formatDuration(newTotal);
          
          // Save to localStorage
          localStorage.setItem(`studyTime_${userId}`, JSON.stringify({
            totalMillis: newTotal.toMillis(),
            lastUpdated: DateTime.now().toISO()
          }));

          return {
            ...prev,
            totalDuration: newTotal,
            formattedTime: formatted,
            currentSessionStart: null,
            isTracking: false
          };
        });

        // Save session to database
        saveSessionToDatabase(sessionStartRef.current, sessionEnd, sessionDuration);
        
        sessionStartRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Start tracking
    startTracking();

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTracking();
      } else {
        startTracking();
      }
    };

    // Handle beforeunload
    const handleBeforeUnload = () => {
      stopTracking();
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      stopTracking();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId]);

  const updateDisplay = () => {
    if (sessionStartRef.current) {
      const currentDuration = DateTime.now().diff(sessionStartRef.current);
      setState(prev => {
        const newTotal = prev.totalDuration.plus(currentDuration);
        return {
          ...prev,
          totalDuration: newTotal,
          formattedTime: formatDuration(newTotal)
        };
      });
    }
  };

  const saveSessionToDatabase = async (start: DateTime, end: DateTime, duration: Duration) => {
    if (!userId) return;

    try {
      await supabase.from('study_sessions').insert({
        user_id: userId,
        start_time: start.toISO(),
        end_time: end.toISO(),
        duration: Math.floor(duration.as('seconds')),
        study_type: 'dashboard_tracking'
      });
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  };

  const formatDuration = (duration: Duration): string => {
    const hours = Math.floor(duration.as('hours'));
    const minutes = Math.floor(duration.as('minutes')) % 60;
    return `${hours}h ${minutes}m`;
  };

  return {
    formattedTime: state.formattedTime,
    isTracking: state.isTracking,
    totalDuration: state.totalDuration
  };
} 