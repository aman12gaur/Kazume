"use client";

import { useState } from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';

interface ManualStudyTimerProps {
  userId: string | null;
}

export function ManualStudyTimer({ userId }: ManualStudyTimerProps) {
  const {
    timeDisplay,
    isRunning,
    isPaused,
    hours,
    minutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    updateDuration
  } = usePomodoroTimer(userId);

  const [inputHours, setInputHours] = useState(hours.toString());
  const [inputMinutes, setInputMinutes] = useState(minutes.toString());

  const handleStart = () => {
    if (!isRunning && !isPaused) {
      // Update duration from inputs before starting
      const newHours = parseInt(inputHours) || 0;
      const newMinutes = parseInt(inputMinutes) || 0;
      updateDuration(newHours, newMinutes);
    }
    startTimer();
  };

  const handlePause = () => {
    pauseTimer();
  };

  const handleResume = () => {
    resumeTimer();
  };

  const handleReset = () => {
    resetTimer();
    setInputHours(hours.toString());
    setInputMinutes(minutes.toString());
  };

  const handleDurationChange = () => {
    if (!isRunning && !isPaused) {
      const newHours = parseInt(inputHours) || 0;
      const newMinutes = parseInt(inputMinutes) || 0;
      updateDuration(newHours, newMinutes);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Manual Study Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-gray-900 bg-gray-50 p-4 rounded-lg border">
            {timeDisplay}
          </div>
        </div>

        {/* Duration Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Hours</Label>
            <Input
              id="hours"
              type="number"
              min="0"
              max="23"
              value={inputHours}
              onChange={(e) => setInputHours(e.target.value)}
              onBlur={handleDurationChange}
              disabled={isRunning || isPaused}
              className="text-center"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Minutes</Label>
            <Input
              id="minutes"
              type="number"
              min="0"
              max="59"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              onBlur={handleDurationChange}
              disabled={isRunning || isPaused}
              className="text-center"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isRunning && !isPaused && (
            <Button
              onClick={handleStart}
              className="flex-1"
              disabled={!userId}
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          )}

          {isRunning && !isPaused && (
            <Button
              onClick={handlePause}
              variant="secondary"
              className="flex-1"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}

          {isPaused && (
            <Button
              onClick={handleResume}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume
            </Button>
          )}

          <Button
            onClick={handleReset}
            variant="outline"
            disabled={!isRunning && !isPaused}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        {/* Status Indicator */}
        {(isRunning || isPaused) && (
          <div className="text-center">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isRunning 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
              }`} />
              {isRunning ? 'Running' : 'Paused'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 