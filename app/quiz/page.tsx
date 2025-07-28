"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Trophy, Clock, CheckCircle, XCircle, RotateCcw, Play, BookOpen, Target } from "lucide-react"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { ChatOpenAI } from "@langchain/openai";
import { StateGraph, MessagesAnnotation } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { supabase } from '@/lib/supabaseClient';

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  subject: string
  chapter: string
  topic?: string
  difficulty: string
  source?: string // Added for fallback questions
}

interface QuizResult {
  score: number
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  timeTaken: string
  answers: { questionId: string; selectedAnswer: number; isCorrect: boolean }[]
}

// Course data structure
const courseData = {
  english: {
    id: "english",
    name: "English",
    icon: "📚",
    chapters: [
      {
        id: "beehive-prose",
        name: "Beehive (Prose)",
        topics: [
          { id: "the-fun-they-had", name: "The Fun They Had" },
          { id: "the-sound-of-music", name: "The Sound of Music" },
          { id: "the-little-girl", name: "The Little Girl" },
          { id: "a-truly-beautiful-mind", name: "A Truly Beautiful Mind" },
          { id: "the-snake-and-the-mirror", name: "The Snake and the Mirror" },
          { id: "my-childhood", name: "My Childhood" },
        ],
      },
      {
        id: "grammar-writing",
        name: "Grammar & Writing",
        topics: [
          { id: "tenses", name: "Tenses" },
          { id: "modals", name: "Modals" },
          { id: "reported-speech", name: "Reported Speech" },
          { id: "clauses", name: "Clauses" },
        ],
      },
    ],
  },
  math: {
    id: "math",
    name: "Mathematics",
    icon: "📐",
    chapters: [
      {
        id: "number-systems",
        name: "Number Systems",
        topics: [
          { id: "irrational-numbers", name: "Irrational Numbers" },
          { id: "real-number-representation", name: "Real Number Representation" },
          { id: "laws-of-exponents", name: "Laws of Exponents" },
        ],
      },
      {
        id: "polynomials",
        name: "Polynomials",
        topics: [
          { id: "definition-degree", name: "Definition and Degree" },
          { id: "zeroes-of-polynomial", name: "Zeroes of a Polynomial" },
          { id: "factorisation", name: "Factorisation" },
        ],
      },
      {
        id: "coordinate-geometry",
        name: "Coordinate Geometry",
        topics: [
          { id: "cartesian-plane", name: "Cartesian Plane" },
          { id: "plotting-points", name: "Plotting Points" },
        ],
      },
    ],
  },
  science: {
    id: "science",
    name: "Science",
    icon: "🔬",
    chapters: [
      {
        id: "motion",
        name: "Motion",
        topics: [
          { id: "distance-displacement", name: "Distance and Displacement" },
          { id: "speed-velocity", name: "Speed and Velocity" },
          { id: "acceleration", name: "Acceleration" },
        ],
      },
      {
        id: "force-laws",
        name: "Force and Laws of Motion",
        topics: [
          { id: "newtons-laws", name: "Newton's Laws" },
          { id: "inertia", name: "Inertia" },
          { id: "momentum", name: "Momentum" },
        ],
      },
      {
        id: "matter-in-surroundings",
        name: "Matter in Our Surroundings",
        topics: [
          { id: "states-of-matter", name: "States of Matter" },
          { id: "evaporation", name: "Evaporation and Sublimation" },
        ],
      },
    ],
  },
  sst: {
    id: "sst",
    name: "Social Studies",
    icon: "🌍",
    chapters: [
      {
        id: "history",
        name: "History",
        topics: [
          { id: "french-revolution", name: "The French Revolution" },
          { id: "socialism-europe", name: "Socialism in Europe and the Russian Revolution" },
          { id: "nazism-hitler", name: "Nazism and the Rise of Hitler" },
        ],
      },
      {
        id: "geography",
        name: "Geography",
        topics: [
          { id: "size-location", name: "India – Size and Location" },
          { id: "physical-features", name: "Physical Features of India" },
          { id: "drainage", name: "Drainage" },
        ],
      },
    ],
  },
}

// Fallback questions for when AI fails
const getFallbackQuestions = (subject: string): Question[] => {
  const questionSets: Record<string, Question[]> = {
    english: [
      {
        id: "eng1",
        question: "Which of the following is a noun?",
        options: ["Run", "Beautiful", "Happiness", "Quickly"],
        correctAnswer: 2,
        explanation: "Happiness is a noun (specifically an abstract noun) as it names a feeling or emotion.",
        subject: "English",
        chapter: "Grammar",
        difficulty: "easy",
        source: "fallback",
      },
      {
        id: "eng2",
        question: "What is the past tense of 'go'?",
        options: ["Goed", "Gone", "Went", "Going"],
        correctAnswer: 2,
        explanation: "The past tense of 'go' is 'went'. This is an irregular verb.",
        subject: "English",
        chapter: "Tenses",
        difficulty: "easy",
        source: "fallback",
      },
    ],
    math: [
      {
        id: "math1",
        question: "Which of the following is a rational number?",
        options: ["√2", "√3", "1/3", "π"],
        correctAnswer: 2,
        explanation:
          "1/3 is a rational number because it can be expressed as a fraction p/q where p and q are integers and q ≠ 0.",
        subject: "Mathematics",
        chapter: "Number Systems",
        difficulty: "medium",
        source: "fallback",
      },
      {
        id: "math2",
        question: "If x² - 5x + 6 = 0, what are the values of x?",
        options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = 0, 5"],
        correctAnswer: 0,
        explanation: "Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3",
        subject: "Mathematics",
        chapter: "Polynomials",
        difficulty: "medium",
        source: "fallback",
      },
    ],
    science: [
      {
        id: "sci1",
        question: "Which state of matter has definite shape and volume?",
        options: ["Gas", "Liquid", "Solid", "Plasma"],
        correctAnswer: 2,
        explanation:
          "Solids have definite shape and volume because their particles are closely packed with strong intermolecular forces.",
        subject: "Science",
        chapter: "Matter in Our Surroundings",
        difficulty: "easy",
        source: "fallback",
      },
      {
        id: "sci2",
        question: "What is the SI unit of force?",
        options: ["Joule", "Newton", "Watt", "Pascal"],
        correctAnswer: 1,
        explanation: "Newton (N) is the SI unit of force, named after Sir Isaac Newton.",
        subject: "Science",
        chapter: "Force and Laws of Motion",
        difficulty: "easy",
        source: "fallback",
      },
    ],
    sst: [
      {
        id: "sst1",
        question: "The French Revolution began in which year?",
        options: ["1789", "1799", "1776", "1804"],
        correctAnswer: 0,
        explanation: "The French Revolution began in 1789 with the financial crisis and social inequality in France.",
        subject: "Social Studies",
        chapter: "The French Revolution",
        difficulty: "medium",
        source: "fallback",
      },
      {
        id: "sst2",
        question: "Who was the first President of India?",
        options: ["Jawaharlal Nehru", "Dr. Rajendra Prasad", "Mahatma Gandhi", "Sardar Patel"],
        correctAnswer: 1,
        explanation: "Dr. Rajendra Prasad was the first President of India from 1950 to 1962.",
        subject: "Social Studies",
        chapter: "Constitutional Design",
        difficulty: "easy",
        source: "fallback",
      },
    ],
  }

  return questionSets[subject] || questionSets.math
}

// Use this if you need UUID (browser-safe polyfill)
function makeId() {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// Helper to check if a string is a valid UUID
function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}
// Helper to generate a UUID (v4, browser-safe)
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c: string) {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 👇 Replace your entire callLLMAPI with this function

async function callLLMAPI(subject: string, chapter: string, topic: string, difficulty: string): Promise<Question[]> {
  try {
    const response = await fetch("/api/groq", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, chapter, topic, difficulty, type: "questions" }),
    });
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data;
    }
    return getFallbackQuestions(subject.toLowerCase());
  } catch (error) {
    return getFallbackQuestions(subject.toLowerCase());
  }
}

export default function QuizPage() {
  const [quizState, setQuizState] = useState<"select" | "loading" | "active" | "completed">("select")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({})
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes for 10 questions
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null)
  const [isUsingAI, setIsUsingAI] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([])
  const [chatInput, setChatInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<HTMLDivElement>(null)
  const [userId, setUserId] = useState<string | null>(null);

  // Always fetch the current user's UID from Supabase Auth on mount
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [chatMessages])

  // Scroll to top of selection when topic changes
  useEffect(() => {
    if (selectionRef.current) {
      selectionRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }
  }, [selectedTopic])

  const subjects = Object.values(courseData)
  const difficulties = [
    { value: "easy", label: "Easy", description: "Basic concepts and definitions" },
    { value: "medium", label: "Medium", description: "Application of concepts" },
    { value: "hard", label: "Hard", description: "Complex problem solving" },
  ]

  const getChapters = () => {
    if (!selectedSubject) return []
    const subject = Object.values(courseData).find((s) => s.name === selectedSubject)
    return subject?.chapters || []
  }

  const getTopics = () => {
    if (!selectedSubject || !selectedChapter) return []
    const subject = Object.values(courseData).find((s) => s.name === selectedSubject)
    const chapter = subject?.chapters.find((c) => c.name === selectedChapter)
    return chapter?.topics || []
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (quizState === "active" && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0 && quizState === "active") {
      handleQuizComplete()
    }
    return () => clearTimeout(timer)
  }, [timeLeft, quizState])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const isFormValid = () => {
    return selectedSubject && selectedChapter && selectedTopic && selectedDifficulty
  }

  const startQuiz = async () => {
    if (!isFormValid()) return

    setQuizState("loading")
    setIsUsingAI(false)

    try {
      console.log("Starting quiz for:", selectedSubject, selectedChapter, selectedTopic, selectedDifficulty)
      const questions = await callLLMAPI(selectedSubject, selectedChapter, selectedTopic, selectedDifficulty)

      setIsUsingAI(
        questions.length > 0 &&
          questions[0].id !== "math1" &&
          questions[0].id !== "sci1" &&
          questions[0].id !== "sst1" &&
          questions[0].id !== "eng1",
      )

      setCurrentQuestions(questions)
      setQuizState("active")
      setStartTime(new Date())
      setTimeLeft(600) // 10 minutes
      setSelectedAnswers({})
      setSelectedAnswer(null)
      setCurrentQuestionIndex(0)
    } catch (error) {
      console.error("Error starting quiz:", error)
      const fallbackQuestions = getFallbackQuestions(selectedSubject.toLowerCase())
      setCurrentQuestions(fallbackQuestions)
      setIsUsingAI(false)
      setQuizState("active")
      setStartTime(new Date())
      setTimeLeft(600)
      setSelectedAnswers({})
      setSelectedAnswer(null)
      setCurrentQuestionIndex(0)
    }
  }

  const handleAnswerSelect = (value: string) => {
    setSelectedAnswer(Number.parseInt(value))
  }

  const handleNextQuestion = () => {
    const currentQuestionId = currentQuestions[currentQuestionIndex].id

    // Always save current selection (even if unchanged)
    if (selectedAnswer !== null) {
      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionId]: selectedAnswer,
      }))
    }

    const nextIndex = currentQuestionIndex + 1

    if (nextIndex < currentQuestions.length) {
      setCurrentQuestionIndex(nextIndex)

      // ✅ Restore previously selected answer if it exists
      const nextQuestionId = currentQuestions[nextIndex].id
      const savedAnswer = selectedAnswers[nextQuestionId] ?? null
      setSelectedAnswer(savedAnswer)
    } else {
      handleQuizComplete()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1

      setCurrentQuestionIndex(prevIndex)

      const prevQuestionId = currentQuestions[prevIndex].id
      const savedAnswer = selectedAnswers[prevQuestionId] ?? null
      setSelectedAnswer(savedAnswer)
    }
  }

  const handleQuizComplete = async () => {
    const endTime = new Date()
    const timeTaken = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0

    // ✅ Include the last question's selected answer!
    const updatedAnswers = {
      ...selectedAnswers,
      [currentQuestions[currentQuestionIndex].id]: selectedAnswer ?? -1,
    }

    let correct = 0
    const answers = currentQuestions.map((q) => {
      const picked = updatedAnswers[q.id] ?? -1
      const isCorrect = picked === q.correctAnswer
      if (isCorrect) correct++
      return { questionId: q.id, selectedAnswer: picked, isCorrect }
    })

    const result = {
      score: Math.round((correct / currentQuestions.length) * 100),
      totalQuestions: currentQuestions.length,
      correctAnswers: correct,
      wrongAnswers: currentQuestions.length - correct,
      timeTaken: formatTime(timeTaken),
      answers,
    }

    setQuizResult(result)
    setQuizState("completed")

    // Store result in Supabase
    // userId is always the Supabase Auth UID
    if (!userId) {
      alert('You must be logged in to save quiz results.');
      return;
    }
    // Insert into quiz_results (main summary)
    const { data: quizResultInsert, error: quizResultError } = await supabase.from('quiz_results').insert([
      {
        user_id: userId, // Always use Supabase Auth UID
        chapter: selectedChapter || '',
        score: result.score,
        total_questions: result.totalQuestions,
        correct_answers: result.correctAnswers,
        wrong_answers: result.wrongAnswers,
        time_taken: timeTaken, // timeTaken is already seconds (int)
      }
    ]).select('id').single();

    if (quizResultError) {
      console.error('Error saving quiz result:', quizResultError.message || quizResultError);
      alert('Failed to save your quiz result. Please try again.');
      return;
    }

    // Insert answers into quiz_answers table (one row per answer)
    if (quizResultInsert && quizResultInsert.id) {
      const preparedAnswers = [];
      for (const a of result.answers) {
        if (a.questionId && a.selectedAnswer !== undefined && a.selectedAnswer !== null) {
          let questionId = a.questionId;
          const fallbackQ = currentQuestions.find(q => q.id === a.questionId);
          // If not a valid UUID, treat as fallback and do NOT insert into quiz_questions
          const isFallback = !isValidUUID(questionId) || (fallbackQ && fallbackQ.source === 'fallback');
          if (isFallback) {
            // Save answer with question_id null, and raw question text
            preparedAnswers.push({
              quiz_result_id: quizResultInsert.id,
              question_id: null,
              selected_answer: a.selectedAnswer,
              is_correct: a.isCorrect,
              question_text: fallbackQ ? fallbackQ.question : null,
              // Optionally: source: 'fallback',
            });
            continue;
          }
          // Otherwise, insert answer with valid question_id
          preparedAnswers.push({
            quiz_result_id: quizResultInsert.id,
            question_id: questionId,
            selected_answer: a.selectedAnswer,
            is_correct: a.isCorrect,
            question_text: null,
          });
        }
      }
      if (preparedAnswers.length > 0) {
        const { error: answersError } = await supabase.from('quiz_answers').insert(preparedAnswers);
        if (answersError) {
          console.error('Error saving quiz answers:', answersError.message || answersError);
          alert('Failed to save your quiz answers. Please try again.');
        }
      }
    }
  }

  const resetQuiz = () => {
    setQuizState("select")
    setCurrentQuestions([])
    setSelectedAnswers({})
    setSelectedAnswer(null)
    setCurrentQuestionIndex(0)
    setTimeLeft(600)
    setStartTime(null)
    setQuizResult(null)
    setIsUsingAI(false)
  }

  // ------------------- UI ---------------------

  if (quizState === "select") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Start Your Quiz</CardTitle>
                <CardDescription>Test your knowledge and track your progress</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Subject selection */}
                <div ref={selectionRef} style={{ maxHeight: 400, overflowY: 'auto' }}>
                  <div>
                    <Label className="text-base font-medium">Select Subject</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {subjects.map((subject) => (
                        <Button
                          key={subject.id}
                          variant={selectedSubject === subject.name ? "default" : "outline"}
                          className="h-auto p-4 justify-start"
                          onClick={() => {
                            setSelectedSubject(subject.name)
                            setSelectedChapter("")
                            setSelectedTopic("")
                            setSelectedDifficulty("")
                          }}
                        >
                          <div className="text-left">
                            <div className="font-medium">{subject.name}</div>
                            <div className="text-xs text-muted-foreground">10 questions</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Chapter, Topic, Difficulty selectors */}
                  {selectedSubject && (
                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Select Chapter</Label>
                        <div className="grid grid-cols-1 gap-2 mt-2">
                          {getChapters().map((chapter) => (
                            <Button
                              key={chapter.id}
                              variant={selectedChapter === chapter.name ? "default" : "outline"}
                              onClick={() => {
                                setSelectedChapter(chapter.name)
                                setSelectedTopic("") // clear topic on chapter change
                                setSelectedDifficulty("")
                              }}
                            >
                              {chapter.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {selectedChapter && (
                        <div>
                          <Label className="text-base font-medium">Select Topic</Label>
                          <div className="grid grid-cols-1 gap-2 mt-2">
                            {getTopics().map((topic) => (
                              <Button
                                key={topic.id}
                                variant={selectedTopic === topic.name ? "default" : "outline"}
                                onClick={() => {
                                  setSelectedTopic(topic.name)
                                  setSelectedDifficulty("")
                                }}
                              >
                                {topic.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedTopic && (
                        <div>
                          <Label className="text-base font-medium">Select Difficulty</Label>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {difficulties.map((d) => (
                              <Button
                                key={d.value}
                                variant={selectedDifficulty === d.value ? "default" : "outline"}
                                onClick={() => setSelectedDifficulty(d.value)}
                              >
                                {d.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Quiz details info box */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Quiz Details</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>10 Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>10 Minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      <span>Multiple Choice Questions</span>
                    </div>
                  </div>
                </div>

                {/* Start button */}
                <Button onClick={startQuiz} className="w-full h-12 text-lg" disabled={!isFormValid()}>
                  <Play className="w-5 h-5 mr-2" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
            {/* Chatbot UI */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Quiz Chatbot</CardTitle>
                <CardDescription>Ask any quiz-related question!</CardDescription>
              </CardHeader>
              <CardContent>
                <div style={{ height: 240, overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: 8, padding: 8, background: '#f9fafb', marginBottom: 12 }}>
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '4px 0' }}>
                      <span style={{ background: msg.role === 'user' ? '#2563eb' : '#e5e7eb', color: msg.role === 'user' ? '#fff' : '#111', borderRadius: 8, padding: '6px 12px', display: 'inline-block', maxWidth: '80%' }}>{msg.text}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <form onSubmit={e => {
                  e.preventDefault();
                  if (!chatInput.trim()) return;
                  setChatMessages(msgs => [...msgs, { role: 'user', text: chatInput }]);
                  // Simulate bot reply
                  setTimeout(() => setChatMessages(msgs => [...msgs, { role: 'bot', text: 'This is a sample bot reply.' }]), 600);
                  setChatInput("");
                }} className="flex gap-2">
                  <input
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="Type your message..."
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                  />
                  <Button type="submit">Send</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (quizState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Navbar />
        <div className="text-center space-y-4">
          <div className="text-blue-500 animate-spin">
            <RotateCcw className="w-10 h-10" />
          </div>
          <p className="text-lg font-medium">Generating your quiz questions...</p>
          <p className="text-sm text-gray-600">This may take a few seconds</p>
        </div>
      </div>
    )
  }

  if (quizState === "completed" && quizResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6">
              <CardHeader className="text-center">
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    quizResult.score >= 80 ? "bg-green-100" : quizResult.score >= 60 ? "bg-yellow-100" : "bg-red-100"
                  }`}
                >
                  <Trophy
                    className={`w-10 h-10 ${
                      quizResult.score >= 80
                        ? "text-green-600"
                        : quizResult.score >= 60
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  />
                </div>
                <CardTitle className="text-3xl">Quiz Completed!</CardTitle>
                <CardDescription>Here's how you performed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{quizResult.score}%</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{quizResult.correctAnswers}</div>
                    <div className="text-sm text-gray-600">Correct</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{quizResult.wrongAnswers}</div>
                    <div className="text-sm text-gray-600">Wrong</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{quizResult.timeTaken}</div>
                    <div className="text-sm text-gray-600">Time</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Button onClick={resetQuiz} variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button asChild>
                    <Link href="/courses">
                      <BookOpen className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Review Answers</CardTitle>
                <CardDescription>See the correct answers and explanations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentQuestions.map((question, index) => {
                  const userAnswer = quizResult.answers.find((a) => a.questionId === question.id)
                  const isCorrect = userAnswer?.isCorrect ?? false

                  return (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start gap-3 mb-3">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-1" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 mt-1" />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium mb-2">
                            {index + 1}. {question.question}
                          </h3>
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={optionIndex}
                                className={`p-2 rounded text-sm ${
                                  optionIndex === question.correctAnswer
                                    ? "bg-green-100 text-green-800 border border-green-200"
                                    : optionIndex === userAnswer?.selectedAnswer && !isCorrect
                                      ? "bg-red-100 text-red-800 border border-red-200"
                                      : "bg-gray-50"
                                }`}
                              >
                                {option}
                                {optionIndex === question.correctAnswer && (
                                  <Badge variant="secondary" className="ml-2 text-xs">
                                    Correct
                                  </Badge>
                                )}
                                {optionIndex === userAnswer?.selectedAnswer && !isCorrect && (
                                  <Badge variant="destructive" className="ml-2 text-xs">
                                    Your Answer
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-blue-50 rounded text-sm">
                            <strong>Explanation:</strong> {question.explanation}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ---------------- Active ----------------
  const currentQuestion = currentQuestions[currentQuestionIndex]
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedSubject} Quiz</CardTitle>
                  <CardDescription>
                    Question {currentQuestionIndex + 1} of {currentQuestions.length}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-lg font-mono">
                    <Clock className="w-5 h-5" />
                    {formatTime(timeLeft)}
                  </div>
                  <Badge variant={timeLeft < 60 ? "destructive" : "secondary"}>
                    {timeLeft < 60 ? "Hurry up!" : "Time remaining"}
                  </Badge>
                </div>
              </div>
              <Progress value={((currentQuestionIndex + 1) / currentQuestions.length) * 100} className="mt-4" />
            </CardHeader>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{currentQuestion?.question}</CardTitle>
              <CardDescription>{currentQuestion?.chapter} • Select the correct answer</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedAnswer?.toString()} onValueChange={(value) => handleAnswerSelect(value)}>
                <div className="space-y-3">
                  {currentQuestion?.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                      <Label
                        htmlFor={`option-${index}`}
                        className="flex-1 p-3 rounded-lg border cursor-pointer hover:bg-gray-50"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                  Previous
                </Button>
                <div className="text-sm text-gray-500">
                  {Object.keys(selectedAnswers).length} of {currentQuestions.length} answered
                </div>
                <Button onClick={handleNextQuestion} disabled={selectedAnswer === null}>
                  {currentQuestionIndex === currentQuestions.length - 1 ? "Finish Quiz" : "Next"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
