"use client";

import { Clock, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyTimeTracker } from '@/hooks/useStudyTimeTracker';
import { ManualStudyTimer } from './ManualStudyTimer';

interface StudyTimeProps {
  userId: string | null;
}

export function StudyTime({ userId }: StudyTimeProps) {
  const { formattedTime, isTracking } = useStudyTimeTracker(userId);

  return (
    <div className="space-y-6">
      {/* Automatic Study Time Counter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Study Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-blue-600">
              {formattedTime}
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-gray-600">This month</span>
              {isTracking && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-600">Tracking</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Automatically tracks time spent on the dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual Study Timer */}
      <ManualStudyTimer userId={userId} />
    </div>
  );
} 