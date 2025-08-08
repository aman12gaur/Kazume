// Test utility for study time tracking

import { DateTime, Duration } from 'luxon';

export function testStudyTimeTracking() {
  console.log('Testing Study Time Tracking Logic...');
  
  // Test 1: Basic duration calculation
  const startTime = DateTime.now();
  const endTime = startTime.plus({ minutes: 30 });
  const duration = endTime.diff(startTime);
  
  console.log('Test 1 - Basic Duration:');
  console.log('Start:', startTime.toISO());
  console.log('End:', endTime.toISO());
  console.log('Duration:', duration.toISO());
  console.log('Duration in minutes:', duration.as('minutes'));
  console.log('Duration in seconds:', duration.as('seconds'));
  
  // Test 2: Format duration
  const formatDuration = (duration: Duration): string => {
    const hours = Math.floor(duration.as('hours'));
    const minutes = Math.floor(duration.as('minutes')) % 60;
    return `${hours}h ${minutes}m`;
  };
  
  console.log('Test 2 - Format Duration:');
  console.log('30 minutes:', formatDuration(Duration.fromObject({ minutes: 30 })));
  console.log('90 minutes:', formatDuration(Duration.fromObject({ minutes: 90 })));
  console.log('125 minutes:', formatDuration(Duration.fromObject({ minutes: 125 })));
  
  // Test 3: Base total + current session
  const baseTotal = Duration.fromObject({ hours: 2, minutes: 30 }); // 2h 30m
  const currentSession = Duration.fromObject({ minutes: 15 }); // 15 minutes
  const displayTotal = baseTotal.plus(currentSession);
  
  console.log('Test 3 - Base Total + Current Session:');
  console.log('Base total:', formatDuration(baseTotal));
  console.log('Current session:', formatDuration(currentSession));
  console.log('Display total:', formatDuration(displayTotal));
  
  // Test 4: Session continuity
  const sessionStart = DateTime.now().minus({ minutes: 45 });
  const currentTime = DateTime.now();
  const ongoingSessionDuration = currentTime.diff(sessionStart);
  
  console.log('Test 4 - Ongoing Session:');
  console.log('Session start:', sessionStart.toISO());
  console.log('Current time:', currentTime.toISO());
  console.log('Ongoing duration:', formatDuration(ongoingSessionDuration));
  
  // Test 5: Monthly boundaries
  const now = DateTime.now();
  const monthStart = now.startOf('month');
  const monthEnd = now.endOf('month');
  
  console.log('Test 5 - Monthly Boundaries:');
  console.log('Current month start:', monthStart.toISO());
  console.log('Current month end:', monthEnd.toISO());
  console.log('Days in month:', monthEnd.diff(monthStart, 'days').days);
  
  // Test 6: localStorage simulation
  const mockLocalStorage = {
    totalMillis: baseTotal.toMillis(),
    lastUpdated: DateTime.now().toISO(),
    sessionStart: sessionStart.toISO()
  };
  
  console.log('Test 6 - LocalStorage Simulation:');
  console.log('Stored data:', mockLocalStorage);
  console.log('Base total from storage:', formatDuration(Duration.fromMillis(mockLocalStorage.totalMillis)));
  
  if (mockLocalStorage.sessionStart) {
    const storedSessionStart = DateTime.fromISO(mockLocalStorage.sessionStart);
    const currentDuration = DateTime.now().diff(storedSessionStart);
    const displayTotalFromStorage = Duration.fromMillis(mockLocalStorage.totalMillis).plus(currentDuration);
    console.log('Display total from storage:', formatDuration(displayTotalFromStorage));
  }
  
  console.log('✅ Study time tracking test completed successfully!');
  
  return {
    baseTotal: formatDuration(baseTotal),
    currentSession: formatDuration(currentSession),
    displayTotal: formatDuration(displayTotal),
    ongoingSession: formatDuration(ongoingSessionDuration)
  };
}

// Run test if in browser
if (typeof window !== 'undefined') {
  testStudyTimeTracking();
} 