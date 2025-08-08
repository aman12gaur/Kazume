// Test utility for subject progress calculation

export interface TestQuizResult {
  id: string;
  user_id: string;
  subject: string;
  chapter: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  created_at: string;
}

export function testSubjectProgressCalculation() {
  console.log('Testing Subject Progress Calculation...');
  
  // Mock quiz results data
  const mockQuizResults: TestQuizResult[] = [
    {
      id: '1',
      user_id: 'test-user',
      subject: 'Math',
      chapter: 'Math Algebra',
      score: 85,
      correct_answers: 17,
      total_questions: 20,
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      user_id: 'test-user',
      subject: 'Math',
      chapter: 'Math Geometry',
      score: 90,
      correct_answers: 18,
      total_questions: 20,
      created_at: '2024-01-16T10:00:00Z'
    },
    {
      id: '3',
      user_id: 'test-user',
      subject: 'Science',
      chapter: 'Science Physics',
      score: 75,
      correct_answers: 15,
      total_questions: 20,
      created_at: '2024-01-17T10:00:00Z'
    },
    {
      id: '4',
      user_id: 'test-user',
      subject: 'Science',
      chapter: 'Science Chemistry',
      score: 80,
      correct_answers: 16,
      total_questions: 20,
      created_at: '2024-01-18T10:00:00Z'
    },
    {
      id: '5',
      user_id: 'test-user',
      subject: 'English',
      chapter: 'English Grammar',
      score: 95,
      correct_answers: 19,
      total_questions: 20,
      created_at: '2024-01-19T10:00:00Z'
    }
  ];
  
  // Test subject extraction from chapter names
  const subjectMap: Record<string, string[]> = {};
  mockQuizResults.forEach(result => {
    if (result.chapter) {
      const subject = result.chapter.split(' ')[0];
      if (!subjectMap[subject]) {
        subjectMap[subject] = [];
      }
      subjectMap[subject].push(result.chapter);
    }
  });
  
  console.log('Subject Map:', subjectMap);
  
  // Test subject progress calculation
  const subjects = Object.keys(subjectMap);
  const subjectProgress = subjects.map((subject, i) => {
    const subjectResults = mockQuizResults.filter(r => r.chapter && r.chapter.startsWith(subject));
    const progress = subjectResults.length > 0 
      ? Math.round(subjectResults.reduce((acc, r) => acc + (r.score || 0), 0) / subjectResults.length) 
      : 0;
    
    return { subject, progress, color: `bg-color-${i}` };
  });
  
  console.log('Subject Progress:', subjectProgress);
  
  // Test strongest subject calculation
  const subjectAttempts: Record<string, number> = {};
  mockQuizResults.forEach(result => {
    if (result.chapter) {
      const subject = result.chapter.split(' ')[0];
      subjectAttempts[subject] = (subjectAttempts[subject] || 0) + 1;
    }
  });
  
  let strongestSubject = '';
  let maxAttempts = 0;
  for (const [subject, attempts] of Object.entries(subjectAttempts)) {
    if (attempts > maxAttempts) {
      maxAttempts = attempts;
      strongestSubject = subject;
    }
  }
  
  console.log('Subject Attempts:', subjectAttempts);
  console.log('Strongest Subject:', strongestSubject, 'with', maxAttempts, 'attempts');
  
  // Test improvement needed calculation
  const subjectScores: Record<string, { total: number; count: number }> = {};
  mockQuizResults.forEach(result => {
    if (result.chapter) {
      const subject = result.chapter.split(' ')[0];
      if (!subjectScores[subject]) {
        subjectScores[subject] = { total: 0, count: 0 };
      }
      subjectScores[subject].total += result.score || 0;
      subjectScores[subject].count += 1;
    }
  });
  
  let improvementNeeded = '';
  let minAvgScore = 101;
  for (const [subject, scores] of Object.entries(subjectScores)) {
    const avgScore = scores.total / scores.count;
    console.log(`${subject}: ${avgScore}% average`);
    if (avgScore < minAvgScore) {
      minAvgScore = avgScore;
      improvementNeeded = subject;
    }
  }
  
  console.log('Improvement Needed:', improvementNeeded, 'with', minAvgScore, '% average');
  
  console.log('✅ Subject progress calculation test completed successfully!');
  
  return {
    subjectProgress,
    strongestSubject,
    improvementNeeded,
    subjectAttempts,
    subjectScores
  };
}

// Run test if in browser
if (typeof window !== 'undefined') {
  testSubjectProgressCalculation();
} 