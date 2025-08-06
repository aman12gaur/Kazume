# Study Time Features Implementation

This document describes the implementation of automatic and manual study time tracking features using Luxon.

## Features Overview

### 1. Automatic Study Time Counter (Navbar)
- **Location**: Available in the navbar at all times
- **Functionality**: Tracks total time spent on the dashboard in the current month
- **Display**: Shows formatted time (e.g., "3h 45m") with "This month" label
- **Real-time**: Updates dynamically and shows tracking indicator

### 2. Manual Study Timer (Pomodoro-style)
- **Location**: Progress tab under Study Time component
- **Functionality**: User-configurable study session timer
- **Features**: Start, pause, reset, custom time (hours & minutes)
- **Style**: Rectangular box with modern UI

## Technical Implementation

### Libraries Used
- **Luxon**: For handling durations, intervals, and timezone management
- **React Hooks**: Custom hooks for state management
- **Supabase**: Database storage for study sessions

### Core Components

#### 1. `useStudyTimeTracker` Hook
```typescript
// Automatic dashboard study time tracking
const { formattedTime, isTracking } = useStudyTimeTracker(userId);
```

**Features:**
- Tracks when user enters/leaves dashboard
- Calculates session duration using Luxon's `Interval.fromDateTimes()`
- Stores data in localStorage and Supabase
- Updates every minute
- Handles page visibility changes

#### 2. `usePomodoroTimer` Hook
```typescript
// Manual Pomodoro-style timer
const {
  timeDisplay,
  isRunning,
  isPaused,
  startTimer,
  pauseTimer,
  resumeTimer,
  resetTimer
} = usePomodoroTimer(userId);
```

**Features:**
- Countdown timer with Luxon Duration
- Pause/resume functionality
- Custom duration input
- Automatic session saving to database

### Components

#### 1. `StudyTimeNavbar` Component
- Displays in navbar
- Shows current month's study time
- Includes tracking indicator
- Responsive design

#### 2. `ManualStudyTimer` Component
- Pomodoro-style interface
- Time display (HH:MM:SS format)
- Input fields for hours/minutes
- Control buttons (Start/Pause/Reset)
- Status indicators

#### 3. `StudyTime` Component
- Combines automatic and manual timers
- Used in Progress tab
- Clean, organized layout

## Database Schema

### Study Sessions Table
```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- in seconds
  study_type TEXT, -- 'dashboard_tracking' or 'pomodoro_timer'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Usage Examples

### Automatic Tracking
```typescript
// Automatically tracks dashboard time
const { formattedTime, isTracking } = useStudyTimeTracker(userId);

// Display in navbar
<StudyTimeNavbar userId={userId} />
```

### Manual Timer
```typescript
// Manual Pomodoro timer
const timer = usePomodoroTimer(userId);

// Start a 25-minute session
timer.updateDuration(0, 25);
timer.startTimer();
```

### Combined Usage
```typescript
// In Progress tab
<StudyTime userId={userId} />
```

## Luxon Implementation Details

### Duration Handling
```typescript
import { DateTime, Duration } from 'luxon';

// Create duration
const duration = Duration.fromObject({ hours: 2, minutes: 30 });

// Format for display
const hours = Math.floor(duration.as('hours'));
const minutes = Math.floor(duration.as('minutes')) % 60;
const formatted = `${hours}h ${minutes}m`;
```

### Time Display Formatting
```typescript
// HH:MM:SS format for timer display
const formatTimeDisplay = (duration: Duration): string => {
  const hours = Math.floor(duration.as('hours'));
  const minutes = Math.floor(duration.as('minutes')) % 60;
  const seconds = Math.floor(duration.as('seconds')) % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
```

### Monthly Boundaries
```typescript
// Get current month boundaries
const monthStart = DateTime.now().startOf('month');
const monthEnd = DateTime.now().endOf('month');

// Query sessions for current month
const { data: sessions } = await supabase
  .from('study_sessions')
  .select('*')
  .eq('user_id', userId)
  .gte('start_time', monthStart.toISO())
  .lte('start_time', monthEnd.toISO());
```

## State Management

### Automatic Tracker State
```typescript
interface StudyTimeState {
  totalDuration: Duration;
  currentSessionStart: DateTime | null;
  isTracking: boolean;
  formattedTime: string;
}
```

### Manual Timer State
```typescript
interface TimerState {
  initialDuration: Duration;
  remaining: Duration;
  isRunning: boolean;
  isPaused: boolean;
  hours: number;
  minutes: number;
}
```

## Event Handling

### Page Visibility
```typescript
// Handle tab switching
const handleVisibilityChange = () => {
  if (document.hidden) {
    stopTracking(); // Pause automatic tracking
  } else {
    startTracking(); // Resume automatic tracking
  }
};
```

### Before Unload
```typescript
// Handle page close/navigation
const handleBeforeUnload = () => {
  stopTracking(); // Save current session
};
```

## Data Persistence

### LocalStorage
```typescript
// Store study time for immediate display
localStorage.setItem(`studyTime_${userId}`, JSON.stringify({
  totalMillis: totalDuration.toMillis(),
  lastUpdated: DateTime.now().toISO()
}));
```

### Supabase Database
```typescript
// Save study session
await supabase.from('study_sessions').insert({
  user_id: userId,
  start_time: sessionStart.toISO(),
  end_time: sessionEnd.toISO(),
  duration: Math.floor(sessionDuration.as('seconds')),
  study_type: 'dashboard_tracking'
});
```

## UI/UX Features

### Visual Indicators
- **Tracking indicator**: Green pulsing dot when active
- **Status badges**: Running/Paused states
- **Progress visualization**: Time remaining display

### Responsive Design
- **Desktop**: Full navbar integration
- **Mobile**: Collapsible in mobile menu
- **Tablet**: Adaptive layout

### Accessibility
- **Keyboard navigation**: All controls accessible
- **Screen readers**: Proper ARIA labels
- **Color contrast**: WCAG compliant

## Testing

### Manual Testing
1. **Automatic tracking**: Navigate to dashboard and verify time increases
2. **Manual timer**: Set custom duration and test start/pause/reset
3. **Data persistence**: Check localStorage and database storage
4. **Page visibility**: Switch tabs and verify tracking behavior

### Automated Testing
```typescript
// Test Luxon implementation
import { testLuxonImplementation, testStudyTimeTracking } from '@/lib/timezone-test';

// Run tests
testLuxonImplementation();
testStudyTimeTracking();
```

## Performance Considerations

### Optimization
- **Update frequency**: Automatic tracker updates every minute
- **Memory management**: Cleanup intervals on unmount
- **Database queries**: Efficient indexing on user_id and timestamps

### Scalability
- **Session storage**: Efficient localStorage usage
- **Database queries**: Pagination for large datasets
- **Real-time updates**: Minimal re-renders

## Future Enhancements

### Planned Features
1. **Study goals**: Set daily/weekly study targets
2. **Analytics**: Detailed study time analytics
3. **Notifications**: Timer completion alerts
4. **Export**: Study time reports
5. **Integration**: Calendar integration for study sessions

### Technical Improvements
1. **Offline support**: Service worker for offline tracking
2. **Real-time sync**: WebSocket for live updates
3. **Advanced analytics**: Study pattern analysis
4. **Mobile app**: Native mobile integration

## Troubleshooting

### Common Issues
1. **Timer not starting**: Check user authentication
2. **Time not updating**: Verify Luxon installation
3. **Data not saving**: Check Supabase connection
4. **Display issues**: Verify component imports

### Debug Commands
```typescript
// Check current study time
console.log('Study time:', formattedTime);

// Check timer state
console.log('Timer running:', isRunning);

// Check Luxon functionality
console.log('Current time:', DateTime.now().toISO());
```

## Conclusion

The Study Time features provide comprehensive tracking of both automatic dashboard usage and manual Pomodoro-style study sessions. The implementation uses Luxon for robust time handling and provides a seamless user experience across all devices. 