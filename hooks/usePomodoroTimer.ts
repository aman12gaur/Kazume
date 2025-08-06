import { useState, useEffect, useRef } from 'react';
import { DateTime, Duration } from 'luxon';
import { supabase } from '@/lib/supabaseClient';

interface TimerState {
  initialDuration: Duration;
  remaining: Duration;
  isRunning: boolean;
  isPaused: boolean;
  hours: number;
  minutes: number;
}

export function usePomodoroTimer(userId: string | null) {
  const [state, setState] = useState<TimerState>({
    initialDuration: Duration.fromObject({ hours: 0, minutes: 25 }),
    remaining: Duration.fromObject({ hours: 0, minutes: 25 }),
    isRunning: false,
    isPaused: false,
    hours: 0,
    minutes: 25
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<DateTime | null>(null);

  // Format time display (HH:MM:SS)
  const formatTimeDisplay = (duration: Duration): string => {
    const hours = Math.floor(duration.as('hours'));
    const minutes = Math.floor(duration.as('minutes')) % 60;
    const seconds = Math.floor(duration.as('seconds')) % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (state.isRunning) return;

    const now = DateTime.now();
    startTimeRef.current = now;
    
    setState(prev => ({
      ...prev,
      isRunning: true,
      isPaused: false
    }));

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const elapsed = DateTime.now().diff(startTimeRef.current!);
        const newRemaining = prev.initialDuration.minus(elapsed);

        if (newRemaining.toMillis() <= 0) {
          // Timer finished
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          
          // Save completed session to database
          if (userId && startTimeRef.current) {
            saveSessionToDatabase(startTimeRef.current, DateTime.now(), prev.initialDuration);
          }

          return {
            ...prev,
            remaining: Duration.fromMillis(0),
            isRunning: false,
            isPaused: false
          };
        }

        return {
          ...prev,
          remaining: newRemaining
        };
      });
    }, 1000);
  };

  // Pause timer
  const pauseTimer = () => {
    if (!state.isRunning || state.isPaused) return;

    clearInterval(intervalRef.current!);
    intervalRef.current = null;

    setState(prev => ({
      ...prev,
      isPaused: true
    }));
  };

  // Resume timer
  const resumeTimer = () => {
    if (!state.isRunning || !state.isPaused) return;

    const now = DateTime.now();
    startTimeRef.current = now.minus(state.initialDuration.minus(state.remaining));

    setState(prev => ({
      ...prev,
      isPaused: false
    }));

    intervalRef.current = setInterval(() => {
      setState(prev => {
        const elapsed = DateTime.now().diff(startTimeRef.current!);
        const newRemaining = prev.initialDuration.minus(elapsed);

        if (newRemaining.toMillis() <= 0) {
          // Timer finished
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          
          // Save completed session to database
          if (userId && startTimeRef.current) {
            saveSessionToDatabase(startTimeRef.current, DateTime.now(), prev.initialDuration);
          }

          return {
            ...prev,
            remaining: Duration.fromMillis(0),
            isRunning: false,
            isPaused: false
          };
        }

        return {
          ...prev,
          remaining: newRemaining
        };
      });
    }, 1000);
  };

  // Reset timer
  const resetTimer = () => {
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    startTimeRef.current = null;

    setState(prev => ({
      ...prev,
      remaining: prev.initialDuration,
      isRunning: false,
      isPaused: false
    }));
  };

  // Update timer duration
  const updateDuration = (hours: number, minutes: number) => {
    const newDuration = Duration.fromObject({ hours, minutes });
    
    setState(prev => ({
      ...prev,
      initialDuration: newDuration,
      remaining: newDuration,
      hours,
      minutes
    }));
  };

  // Save session to database
  const saveSessionToDatabase = async (start: DateTime, end: DateTime, duration: Duration) => {
    if (!userId) return;

    try {
      await supabase.from('study_sessions').insert({
        user_id: userId,
        start_time: start.toISO(),
        end_time: end.toISO(),
        duration: Math.floor(duration.as('seconds')),
        study_type: 'pomodoro_timer'
      });
    } catch (error) {
      console.error('Error saving pomodoro session:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeDisplay: formatTimeDisplay(state.remaining),
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    hours: state.hours,
    minutes: state.minutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateDuration
  };
} 