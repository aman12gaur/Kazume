// Question validation utilities for ensuring correct answers and proper format

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  correctAnswerText: string;
  explanation: string;
  subject: string;
  chapter: string;
  topic: string;
  difficulty: string;
}

export function validateQuestion(question: any, index: number): Question {
  // Validate required fields
  if (!question.question || typeof question.question !== 'string') {
    throw new Error(`Question ${index + 1}: Missing or invalid question text`);
  }
  
  if (!question.options || !Array.isArray(question.options) || question.options.length !== 4) {
    throw new Error(`Question ${index + 1}: Must have exactly 4 options`);
  }
  
  // Validate options are strings
  question.options.forEach((option: any, optIndex: number) => {
    if (typeof option !== 'string' || option.trim() === '') {
      throw new Error(`Question ${index + 1}, Option ${optIndex + 1}: Must be non-empty string`);
    }
  });
  
  // Validate correctAnswer
  if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || question.correctAnswer > 3) {
    throw new Error(`Question ${index + 1}: correctAnswer must be 0-3`);
  }
  
  // Ensure correctAnswerText matches the correct option
  const correctOption = question.options[question.correctAnswer];
  const correctAnswerText = question.correctAnswerText || correctOption;
  
  if (correctAnswerText !== correctOption) {
    console.warn(`Question ${index + 1}: correctAnswerText mismatch, fixing...`);
    question.correctAnswerText = correctOption;
  }
  
  return {
    id: question.id || `q_${Date.now()}_${index}`,
    question: question.question.trim(),
    options: question.options.map((opt: string) => opt.trim()),
    correctAnswer: question.correctAnswer,
    correctAnswerText: correctOption,
    explanation: question.explanation || 'Correct answer explanation',
    subject: question.subject || 'Unknown',
    chapter: question.chapter || 'Unknown',
    topic: question.topic || 'Unknown',
    difficulty: question.difficulty || 'medium'
  };
}

export function validateQuestions(questions: any[]): Question[] {
  if (!Array.isArray(questions)) {
    throw new Error('Questions must be an array');
  }
  
  if (questions.length === 0) {
    throw new Error('No questions provided');
  }
  
  return questions.map((q, index) => validateQuestion(q, index));
}

export function testQuestionGeneration() {
  console.log('Testing question validation...');
  
  // Test valid question
  const validQuestion = {
    question: "What is the capital of India?",
    options: ["Mumbai", "Delhi", "Kolkata", "Chennai"],
    correctAnswer: 1,
    correctAnswerText: "Delhi",
    explanation: "Delhi is the capital of India",
    subject: "Geography",
    chapter: "Indian Geography",
    topic: "Capitals",
    difficulty: "easy"
  };
  
  try {
    const validated = validateQuestion(validQuestion, 0);
    console.log('✅ Valid question passed validation');
    console.log('Validated question:', validated);
  } catch (error) {
    console.error('❌ Valid question failed validation:', error);
  }
  
  // Test invalid question
  const invalidQuestion = {
    question: "What is 2+2?",
    options: ["3", "4", "5"], // Only 3 options
    correctAnswer: 1,
    correctAnswerText: "4",
    explanation: "2+2=4",
    subject: "Math",
    chapter: "Basic Math",
    topic: "Addition",
    difficulty: "easy"
  };
  
  try {
    validateQuestion(invalidQuestion, 1);
    console.error('❌ Invalid question should have failed validation');
  } catch (error) {
    console.log('✅ Invalid question correctly failed validation:', error.message);
  }
  
  console.log('Question validation test completed!');
}

// Run test if in browser
if (typeof window !== 'undefined') {
  testQuestionGeneration();
} 