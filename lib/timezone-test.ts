// Test file for Luxon timezone implementation
import { DateTime, Duration } from 'luxon';

// Test basic Luxon functionality
export function testLuxonImplementation() {
  console.log('Testing Luxon Implementation...');
  
  // Test current time
  const now = DateTime.now();
  console.log('Current time:', now.toISO());
  
  // Test duration creation
  const duration = Duration.fromObject({ hours: 2, minutes: 30 });
  console.log('Duration:', duration.toISO());
  
  // Test duration formatting
  const hours = Math.floor(duration.as('hours'));
  const minutes = Math.floor(duration.as('minutes')) % 60;
  const formatted = `${hours}h ${minutes}m`;
  console.log('Formatted duration:', formatted);
  
  // Test time display formatting
  const timeDisplay = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  console.log('Time display:', timeDisplay);
  
  // Test monthly boundaries
  const monthStart = now.startOf('month');
  const monthEnd = now.endOf('month');
  console.log('Month start:', monthStart.toISO());
  console.log('Month end:', monthEnd.toISO());
  
  console.log('Luxon implementation test completed successfully!');
}

// Test study time tracking
export function testStudyTimeTracking() {
  console.log('Testing Study Time Tracking...');
  
  // Simulate a study session
  const sessionStart = DateTime.now();
  console.log('Session start:', sessionStart.toISO());
  
  // Simulate session end after 2 hours
  const sessionEnd = sessionStart.plus({ hours: 2, minutes: 30 });
  console.log('Session end:', sessionEnd.toISO());
  
  // Calculate session duration
  const sessionDuration = sessionEnd.diff(sessionStart);
  console.log('Session duration:', sessionDuration.toISO());
  
  // Format duration for display
  const hours = Math.floor(sessionDuration.as('hours'));
  const minutes = Math.floor(sessionDuration.as('minutes')) % 60;
  const formatted = `${hours}h ${minutes}m`;
  console.log('Formatted session:', formatted);
  
  console.log('Study time tracking test completed successfully!');
}

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
  // Browser environment
  console.log('Running Luxon tests in browser...');
  testLuxonImplementation();
  testStudyTimeTracking();
} 