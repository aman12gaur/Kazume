import { useState } from "react";

// Types for each page's state
// Quiz Page Types
interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  subject: string;
  chapter: string;
  topic?: string;
  difficulty: string;
}
interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  timeTaken: string;
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[];
}

// Courses Page Types
interface Subject {
  id: string;
  name: string;
  icon: string;
  color?: string;
  chapters: Chapter[];
}
interface Chapter {
  id: string;
  name: string;
  topics: Topic[];
  completed?: boolean;
}
interface Topic {
  id: string;
  name: string;
  content?: string;
  examples?: string[];
  completed?: boolean;
}
interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

// Writing Page Types
// (Reuses Subject, Chapter, Topic)

type PageType = "quiz" | "courses" | "writing";

function usePageState(page: PageType) {
  switch (page) {
    case "quiz": {
      const [quizState, setQuizState] = useState<"select" | "loading" | "active" | "completed">("select");
      const [selectedSubject, setSelectedSubject] = useState("");
      const [selectedChapter, setSelectedChapter] = useState("");
      const [selectedTopic, setSelectedTopic] = useState("");
      const [selectedDifficulty, setSelectedDifficulty] = useState("");
      const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
      const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
      const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
      const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
      const [timeLeft, setTimeLeft] = useState(600);
      const [startTime, setStartTime] = useState<Date | null>(null);
      const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
      const [isUsingAI, setIsUsingAI] = useState(false);
      return {
        quizState, setQuizState,
        selectedSubject, setSelectedSubject,
        selectedChapter, setSelectedChapter,
        selectedTopic, setSelectedTopic,
        selectedDifficulty, setSelectedDifficulty,
        currentQuestions, setCurrentQuestions,
        currentQuestionIndex, setCurrentQuestionIndex,
        selectedAnswers, setSelectedAnswers,
        selectedAnswer, setSelectedAnswer,
        timeLeft, setTimeLeft,
        startTime, setStartTime,
        quizResult, setQuizResult,
        isUsingAI, setIsUsingAI,
      };
    }
    case "courses": {
      const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
      const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
      const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
      const [topicContent, setTopicContent] = useState("");
      const [isLoadingContent, setIsLoadingContent] = useState(false);
      const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
      const [chatInput, setChatInput] = useState("");
      const [isAiTyping, setIsAiTyping] = useState(false);
      const [isSpeaking, setIsSpeaking] = useState(false);
      const [isPaused, setIsPaused] = useState(false);
      const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hindi">("english");
      return {
        selectedSubject, setSelectedSubject,
        selectedChapter, setSelectedChapter,
        selectedTopic, setSelectedTopic,
        topicContent, setTopicContent,
        isLoadingContent, setIsLoadingContent,
        chatMessages, setChatMessages,
        chatInput, setChatInput,
        isAiTyping, setIsAiTyping,
        isSpeaking, setIsSpeaking,
        isPaused, setIsPaused,
        selectedLanguage, setSelectedLanguage,
      };
    }
    case "writing": {
      const [step, setStep] = useState("select");
      const [selectedSubject, setSelectedSubject] = useState("");
      const [selectedChapter, setSelectedChapter] = useState("");
      const [selectedTopic, setSelectedTopic] = useState("");
      const [selectedDifficulty, setSelectedDifficulty] = useState("");
      const [question, setQuestion] = useState("");
      const [modelAnswer, setModelAnswer] = useState("");
      const [userAnswer, setUserAnswer] = useState("");
      const [feedback, setFeedback] = useState("");
      const [error, setError] = useState("");
      const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
      return {
        step, setStep,
        selectedSubject, setSelectedSubject,
        selectedChapter, setSelectedChapter,
        selectedTopic, setSelectedTopic,
        selectedDifficulty, setSelectedDifficulty,
        question, setQuestion,
        modelAnswer, setModelAnswer,
        userAnswer, setUserAnswer,
        feedback, setFeedback,
        error, setError,
        previousQuestions, setPreviousQuestions,
      };
    }
    default:
      throw new Error("Unknown page type for usePageState");
  }
}

export default usePageState; 