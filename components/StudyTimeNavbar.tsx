"use client";

import { Clock } from 'lucide-react';
import { useStudyTimeTracker } from '@/hooks/useStudyTimeTracker';

interface StudyTimeNavbarProps {
  userId: string | null;
}

export function StudyTimeNavbar({ userId }: StudyTimeNavbarProps) {
  const { formattedTime, isTracking } = useStudyTimeTracker(userId);

  if (!userId) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
      <Clock className="w-4 h-4 text-blue-600" />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-blue-900">
          {formattedTime}
        </span>
        <span className="text-xs text-blue-600">
          This month
        </span>
      </div>
      {isTracking && (
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
} 