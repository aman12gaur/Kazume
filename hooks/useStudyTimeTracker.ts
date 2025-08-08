import { useState, useEffect, useRef } from 'react';
import { DateTime, Duration } from 'luxon';

interface StudyTimeState {
  baseTotalDuration: Duration; // Total from completed sessions
  currentSessionStart: DateTime | null;
  isTracking: boolean;
  formattedTime: string;
}

export function useStudyTimeTracker(userId: string | null) {
  const [state, setState] = useState<StudyTimeState>({
    baseTotalDuration: Duration.fromMillis(0),
    currentSessionStart: null,
    isTracking: false,
    formattedTime: '0h 0m'
  });

  const sessionStartRef = useRef<DateTime | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load existing study time from localStorage and server
  useEffect(() => {
    if (!userId) return;

    const loadStudyTime = async () => {
      try {
        let baseTotalMillis = 0;
        
        // Fetch from server API (service key)
        const monthStart = DateTime.now().startOf('month').toISO();
        const res = await fetch(`/api/progress/study-sessions?userId=${encodeURIComponent(userId)}&month=${encodeURIComponent(monthStart!)}`);
        if (res.ok) {
          const { data: sessions } = await res.json();
          if (sessions && sessions.length > 0) {
            baseTotalMillis = sessions.reduce((acc: number, session: any) => acc + (session.duration || 0) * 1000, 0);
          }
        }

        // Then check localStorage for any unsaved session data
        const stored = localStorage.getItem(`studyTime_${userId}`);
        if (stored) {
          const { totalMillis: storedMillis, lastUpdated, sessionStart } = JSON.parse(stored);
          const lastUpdate = DateTime.fromISO(lastUpdated);
          const currentMonth = DateTime.now().startOf('month');
          
          // Only use stored data if it's from current month
          if (lastUpdate.hasSame(currentMonth, 'month')) {
            // Use the stored total as the base total
            baseTotalMillis = Math.max(baseTotalMillis, storedMillis);
            
            // If there's an ongoing session, start tracking from that point
            if (sessionStart) {
              const sessionStartTime = DateTime.fromISO(sessionStart);
              sessionStartRef.current = sessionStartTime;
              setState(prev => ({
                ...prev,
                baseTotalDuration: Duration.fromMillis(baseTotalMillis),
                currentSessionStart: sessionStartTime,
                isTracking: true,
                formattedTime: formatDuration(Duration.fromMillis(baseTotalMillis))
              }));
              
              // Start the interval for updates
              intervalRef.current = setInterval(() => {
                updateDisplay();
              }, 60000); // Update every minute
              
              return; // Exit early since we're continuing an existing session
            }
          }
        }

        const baseTotalDuration = Duration.fromMillis(baseTotalMillis);
        setState(prev => ({
          ...prev,
          baseTotalDuration,
          formattedTime: formatDuration(baseTotalDuration)
        }));

        // Update localStorage with current base total
        localStorage.setItem(`studyTime_${userId}`, JSON.stringify({
          totalMillis: baseTotalMillis,
          lastUpdated: DateTime.now().toISO()
        }));
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

      // Save session start to localStorage for continuity
      const stored = localStorage.getItem(`studyTime_${userId}`);
      const storedData = stored ? JSON.parse(stored) : {};
      localStorage.setItem(`studyTime_${userId}`, JSON.stringify({
        ...storedData,
        sessionStart: now.toISO(),
        lastUpdated: now.toISO()
      }));

      // Update every minute
      intervalRef.current = setInterval(() => {
        updateDisplay();
      }, 60000); // Update every minute
    };

    const stopTracking = () => {
      if (sessionStartRef.current) {
        const sessionEnd = DateTime.now();
        const sessionStart = sessionStartRef.current;
        const sessionDuration = sessionEnd.diff(sessionStart);
        
        // Add session duration to the base total
        setState(prev => {
          const newBaseTotal = prev.baseTotalDuration.plus(sessionDuration);
          const formatted = formatDuration(newBaseTotal);
          
          // Save to localStorage (remove sessionStart to indicate no ongoing session)
          localStorage.setItem(`studyTime_${userId}`, JSON.stringify({
            totalMillis: newBaseTotal.toMillis(),
            lastUpdated: DateTime.now().toISO()
          }));

          return {
            ...prev,
            baseTotalDuration: newBaseTotal,
            formattedTime: formatted,
            currentSessionStart: null,
            isTracking: false
          };
        });

        // Persist session via API
        if (userId) {
          fetch('/api/progress/study-sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              start_time: sessionStart.toISO(),
              end_time: sessionEnd.toISO(),
              duration: Math.floor(sessionDuration.as('seconds')),
              subject: null,
            })
          }).catch(err => console.error('Error saving study session:', err));
        }
        
        sessionStartRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    // Only start tracking if we don't already have an ongoing session
    if (!sessionStartRef.current) {
      startTracking();
    }

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopTracking();
      } else {
        if (!sessionStartRef.current) {
          startTracking();
        }
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
        // Calculate display total: base total + current session duration
        const displayTotal = prev.baseTotalDuration.plus(currentDuration);
        
        // Update localStorage with current total for display
        localStorage.setItem(`studyTime_${userId}`, JSON.stringify({
          totalMillis: displayTotal.toMillis(),
          lastUpdated: DateTime.now().toISO(),
          sessionStart: sessionStartRef.current?.toISO()
        }));
        
        return {
          ...prev,
          formattedTime: formatDuration(displayTotal)
        };
      });
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
    totalDuration: state.baseTotalDuration
  };
} 