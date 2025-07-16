"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Navbar } from "@/components/navbar"
import { RotateCcw, Play, BookOpen, Target, Clock } from "lucide-react"
import { supabase } from '@/lib/supabaseClient';

// Exposed SambaNova Key
const SAMBANOVA_API_KEY = "8cd9f61e-8d04-4da7-a6e2-5119a6debc38"
const SAMBANOVA_API_URL = "https://api.sambanova.ai/v1/chat/completions"

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

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
]

export default function WritingPage() {
  const [step, setStep] = useState("select")
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedChapter, setSelectedChapter] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("")
  const [question, setQuestion] = useState("")
  const [modelAnswer, setModelAnswer] = useState("")
  const [userAnswer, setUserAnswer] = useState("")
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState("")
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])

  const subjects = Object.values(courseData)
  const getChapters = () =>
    subjects.find((s) => s.name === selectedSubject)?.chapters ?? []
  const getTopics = () =>
    getChapters().find((c) => c.name === selectedChapter)?.topics ?? []

  const isFormValid = () =>
    selectedSubject && selectedChapter && selectedTopic && selectedDifficulty

  async function callSambaNova(prompt: string) {
    const res = await fetch(SAMBANOVA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SAMBANOVA_API_KEY}`,
      },
      body: JSON.stringify({
        model: "Llama-4-Maverick-17B-128E-Instruct",
        messages: [
          { role: "system", content: "You are a helpful CBSE Class 9 teacher." },
          { role: "user", content: prompt },
        ],
      }),
    })
  

  const data = await res.json();
  return data.choices[0].message.content;
  }

  function getRandomString() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  }

  async function generateQuestion(retryCount = 0) {
    if (!isFormValid()) return;

    setStep("loading");
    setError("");

    const prompt = `
You are a CBSE Class 9 teacher. Create ONE subjective (descriptive/essay) exam question with answer in JSON:

- Subject: "${selectedSubject}"
- Chapter: "${selectedChapter}"
- Topic: "${selectedTopic}"
- Difficulty: "${selectedDifficulty}"
- Unique ID: ${getRandomString()}

Rules:
- Must match NCERT CBSE Class 9 standard
- Question must be open-ended
- Answer must be clear, structured, and accurate

JSON format:
{
  "question": "Write a short note on ...",
  "answer": "Detailed CBSE Class 9 appropriate answer..."
}

Output ONLY the JSON.
`;

    try {
      let content = await callSambaNova(prompt);

      // Clean up markdown code block wrappers if present
      if (content.startsWith("```json")) {
        content = content.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      } else if (content.startsWith("```")) {
        content = content.replace(/^```\n?/, "").replace(/\n?```$/, "");
      }

      const parsed = JSON.parse(content);
      // Check for repeat
      if (previousQuestions.includes(parsed.question)) {
        if (retryCount < 5) {
          // Try again with a new random string
          return await generateQuestion(retryCount + 1);
        } else {
          setError("Could not generate a new question after several attempts. Please try changing the topic or difficulty.");
          setStep("select");
          return;
        }
      }
      setPreviousQuestions((prev) => [...prev, parsed.question]);
      setQuestion(parsed.question);
      setModelAnswer(parsed.answer);
      setStep("writing");
    } catch (err: any) {
      console.error(err);
      alert("Failed to generate question:\n" + err.message);
      setStep("select");
    }
  }

async function evaluateAnswer() {
  setStep("loading")
  setError("")
  const prompt = `
You are a CBSE Class 9 teacher. Compare the student's answer to the model answer. Give clear, actionable feedback:

- Model answer: """${modelAnswer}"""
- Student answer: """${userAnswer}"""

Instructions:
- Identify differences
- Suggest improvements
- Highlight missing points
- Be polite, clear, helpful
- Align with CBSE NCERT standard

Output ONLY the feedback text.
  `
  try {
    let content = await callSambaNova(prompt)
    setFeedback(content)
    setStep("result")

    // Store writing attempt in Supabase
    await supabase.from('writing_attempts').insert([
      {
        subject: selectedSubject,
        chapter: selectedChapter,
        topic: selectedTopic,
        difficulty: selectedDifficulty,
        question,
        model_answer: modelAnswer,
        user_answer: userAnswer,
        feedback: content,
        timestamp: new Date().toISOString(),
      }
    ])
  } catch (err: any) {
    console.error(err)
    alert("Failed to evaluate answer:\n" + err.message)
    setStep("writing")
  }
}



// --- UI ---

  if (step === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Navbar />
        <div className="text-center space-y-4">
          <div className="text-blue-500 animate-spin">
            <RotateCcw className="w-10 h-10" />
          </div>
          <p className="text-lg font-medium">Please wait...</p>
          <p className="text-sm text-gray-600">Contacting the AI teacher...</p>
        </div>
      </div>
    )
  }

  if (step === "select") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Start Your Writing Exercise</CardTitle>
              <CardDescription>Practice CBSE Class 9 descriptive questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

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
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

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
                            setSelectedTopic("")
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

              <Button
                onClick={() => generateQuestion()}
                className="w-full h-12 text-lg"
                disabled={!isFormValid()}
              >
                <Play className="w-5 h-5 mr-2" />
                Generate Question
              </Button>

            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "writing") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Write Your Answer</CardTitle>
              <CardDescription>{selectedSubject} • {selectedChapter} • {selectedTopic} • {selectedDifficulty}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium">Question</Label>
                <p className="mt-2 p-4 bg-blue-50 rounded">{question}</p>
              </div>
              <div>
                <Label className="font-medium">Your Answer</Label>
                <Textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  rows={8}
                  placeholder="Write your detailed answer here..."
                />
              </div>
              <Button onClick={evaluateAnswer} disabled={!userAnswer.trim()} className="w-full">
                Submit Answer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (step === "result") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your Results</CardTitle>
              <CardDescription>Feedback and Suggestions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="font-medium">Question</Label>
                <p className="mt-2 p-4 bg-blue-50 rounded">{question}</p>
              </div>
              <div>
                <Label className="font-medium">Model Answer</Label>
                <p className="mt-2 p-4 bg-green-50 rounded whitespace-pre-wrap">{modelAnswer}</p>
              </div>
              <div>
                <Label className="font-medium">Your Answer</Label>
                <p className="mt-2 p-4 bg-gray-50 rounded whitespace-pre-wrap">{userAnswer}</p>
              </div>
              <div>
                <Label className="font-medium">Feedback</Label>
                <p className="mt-2 p-4 bg-yellow-50 rounded whitespace-pre-wrap">{feedback}</p>
              </div>
              <Button onClick={() => setStep("select")} className="w-full mt-4">
                <RotateCcw className="w-5 h-5 mr-2" />
                Try Another
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return null
}
