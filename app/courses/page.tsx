"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  ChevronRight,
  Play,
  CheckCircle,
  Clock,
  MessageCircle,
  Send,
  Volume2,
  Loader2,
  Brain,
  VolumeX,
  Pause,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Textarea } from "@/components/ui/textarea"
import { askGroqAI, generateCourseContent } from "@/lib/groq-ai"
import { useEnhancedVoice } from "@/components/enhanced-voice"
import { supabase } from '@/lib/supabaseClient';

interface Subject {
  id: string
  name: string
  icon: string
  color: string
  chapters: Chapter[]
}

interface Chapter {
  id: string
  name: string
  topics: Topic[]
  completed: boolean
}

interface Topic {
  id: string
  name: string
  content?: string
  examples?: string[]
  completed: boolean
}

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
}

const subjects: Subject[] = [
  {
    id: "english",
    name: "English",
    icon: "📚",
    color: "bg-orange-500",
    chapters: [
      {
        id: "beehive-prose",
        name: "Beehive (Prose)",
        completed: false,
        topics: [
          { id: "the-fun-they-had", name: "The Fun They Had", completed: false },
          { id: "the-sound-of-music", name: "The Sound of Music", completed: false },
          { id: "the-little-girl", name: "The Little Girl", completed: false },
          { id: "a-truly-beautiful-mind", name: "A Truly Beautiful Mind", completed: false },
          { id: "the-snake-and-the-mirror", name: "The Snake and the Mirror", completed: false },
          { id: "my-childhood", name: "My Childhood", completed: false },
          { id: "packing", name: "Packing", completed: false },
          { id: "reach-for-the-top", name: "Reach for the Top", completed: false },
          { id: "the-bond-of-love", name: "The Bond of Love", completed: false },
          { id: "kathmandu", name: "Kathmandu", completed: false },
          { id: "if-i-were-you", name: "If I Were You", completed: false },
        ],
      },
      {
        id: "beehive-poems",
        name: "Beehive (Poems)",
        completed: false,
        topics: [
          { id: "the-road-not-taken", name: "The Road Not Taken", completed: false },
          { id: "wind", name: "Wind", completed: false },
          { id: "rain-on-the-roof", name: "Rain on the Roof", completed: false },
          { id: "lake-isle-of-innisfree", name: "The Lake Isle of Innisfree", completed: false },
          { id: "a-legend-of-the-northland", name: "A Legend of the Northland", completed: false },
          { id: "no-men-are-foreign", name: "No Men Are Foreign", completed: false },
          { id: "the-duck-and-the-kangaroo", name: "The Duck and the Kangaroo", completed: false },
          { id: "on-killing-a-tree", name: "On Killing a Tree", completed: false },
          { id: "the-snake-trying", name: "The Snake Trying", completed: false },
          { id: "a-slumber-did-my-spirit-seal", name: "A Slumber Did My Spirit Seal", completed: false },
        ],
      },
      {
        id: "moments",
        name: "Moments (Supplementary)",
        completed: false,
        topics: [
          { id: "the-lost-child", name: "The Lost Child", completed: false },
          { id: "the-adventures-of-toto", name: "The Adventures of Toto", completed: false },
          { id: "iswaran-the-storyteller", name: "Iswaran the Storyteller", completed: false },
          { id: "in-the-kingdom-of-fools", name: "In the Kingdom of Fools", completed: false },
          { id: "the-happy-prince", name: "The Happy Prince", completed: false },
          { id: "weathering-the-storm", name: "Weathering the Storm in Ersama", completed: false },
          { id: "the-last-leaf", name: "The Last Leaf", completed: false },
          { id: "a-house-is-not-a-home", name: "A House is Not a Home", completed: false },
          { id: "the-accidental-tourist", name: "The Accidental Tourist", completed: false },
          { id: "the-beggar", name: "The Beggar", completed: false },
        ],
      },
      {
        id: "grammar-writing",
        name: "Grammar & Writing",
        completed: false,
        topics: [
          { id: "tenses", name: "Tenses", completed: false },
          { id: "modals", name: "Modals", completed: false },
          { id: "subject-verb-concord", name: "Subject-Verb Concord", completed: false },
          { id: "reported-speech", name: "Reported Speech", completed: false },
          { id: "determiners", name: "Determiners", completed: false },
          { id: "clauses", name: "Clauses", completed: false },
          { id: "gap-filling", name: "Gap Filling", completed: false },
          { id: "editing-omission", name: "Editing/Omission", completed: false },
          { id: "diary-entry", name: "Diary Entry", completed: false },
          { id: "story-writing", name: "Story Writing", completed: false },
          { id: "letter-writing", name: "Letter Writing", completed: false },
          { id: "descriptive-paragraph", name: "Descriptive Paragraph", completed: false },
        ],
      },
    ],
  },
  {
    id: "math",
    name: "Mathematics",
    icon: "📐",
    color: "bg-blue-500",
    chapters: [
      {
        id: "number-systems",
        name: "Number Systems",
        completed: false,
        topics: [
          { id: "irrational-numbers", name: "Irrational Numbers", completed: false },
          { id: "real-number-representation", name: "Real Number Representation", completed: false },
          { id: "laws-of-exponents", name: "Laws of Exponents", completed: false },
        ],
      },
      {
        id: "polynomials",
        name: "Polynomials",
        completed: false,
        topics: [
          { id: "definition-degree", name: "Definition and Degree", completed: false },
          { id: "zeroes-of-polynomial", name: "Zeroes of a Polynomial", completed: false },
          { id: "factorisation", name: "Factorisation", completed: false },
        ],
      },
      {
        id: "coordinate-geometry",
        name: "Coordinate Geometry",
        completed: false,
        topics: [
          { id: "cartesian-plane", name: "Cartesian Plane", completed: false },
          { id: "plotting-points", name: "Plotting Points", completed: false },
        ],
      },
      {
        id: "linear-equations",
        name: "Linear Equations in Two Variables",
        completed: false,
        topics: [
          { id: "solution-linear-equations", name: "Solution of Linear Equations", completed: false },
          { id: "graph-linear-equations", name: "Graph of Linear Equations", completed: false },
        ],
      },
      {
        id: "euclids-geometry",
        name: "Introduction to Euclid’s Geometry",
        completed: false,
        topics: [
          { id: "postulates-axioms", name: "Euclid’s Postulates and Axioms", completed: false },
          { id: "equivalent-versions", name: "Equivalent Versions", completed: false },
        ],
      },
      {
        id: "lines-angles",
        name: "Lines and Angles",
        completed: false,
        topics: [
          { id: "basic-terms", name: "Basic Terms", completed: false },
          { id: "intersecting-parallel-lines", name: "Intersecting and Parallel Lines", completed: false },
          { id: "angle-relationships", name: "Angle Relationships", completed: false },
        ],
      },
      {
        id: "triangles",
        name: "Triangles",
        completed: false,
        topics: [
          { id: "congruence-triangles", name: "Congruence of Triangles", completed: false },
          { id: "criteria", name: "Criteria (SSS, SAS, ASA, RHS)", completed: false },
          { id: "inequalities-triangles", name: "Inequalities in Triangles", completed: false },
        ],
      },
      {
        id: "quadrilaterals",
        name: "Quadrilaterals",
        completed: false,
        topics: [
          { id: "types-quadrilaterals", name: "Types of Quadrilaterals", completed: false },
          { id: "properties-parallelogram", name: "Properties of Parallelogram", completed: false },
        ],
      },
      {
        id: "areas",
        name: "Areas of Parallelograms and Triangles",
        completed: false,
        topics: [
          {
            id: "same-base-parallels",
            name: "Parallelogram on Same Base and Between Same Parallels",
            completed: false,
          },
        ],
      },
      {
        id: "circles",
        name: "Circles",
        completed: false,
        topics: [
          { id: "angle-chord", name: "Angle Subtended by Chord", completed: false },
          { id: "cyclic-quadrilaterals", name: "Cyclic Quadrilaterals", completed: false },
        ],
      },
      {
        id: "constructions",
        name: "Constructions",
        completed: false,
        topics: [
          { id: "bisectors", name: "Bisectors", completed: false },
          { id: "given-measure", name: "Angle of Given Measure", completed: false },
          { id: "triangle-construction", name: "Triangle Construction", completed: false },
        ],
      },
      {
        id: "herons-formula",
        name: "Heron’s Formula",
        completed: false,
        topics: [{ id: "area-using-heron", name: "Area of Triangle using Heron’s Formula", completed: false }],
      },
      {
        id: "surface-areas-volumes",
        name: "Surface Areas and Volumes",
        completed: false,
        topics: [
          { id: "cubes-cuboids", name: "Cubes, Cuboids", completed: false },
          { id: "cylinders", name: "Cylinders", completed: false },
          { id: "spheres", name: "Spheres", completed: false },
        ],
      },
      {
        id: "statistics",
        name: "Statistics",
        completed: false,
        topics: [
          { id: "collection-data", name: "Collection of Data", completed: false },
          { id: "presentation-tables", name: "Presentation in Tables", completed: false },
          { id: "mean-median-mode", name: "Mean, Median, Mode", completed: false },
        ],
      },
      {
        id: "probability",
        name: "Probability",
        completed: false,
        topics: [
          { id: "simple-events", name: "Simple Events", completed: false },
          { id: "empirical-probability", name: "Empirical Probability", completed: false },
        ],
      },
    ],
  },
  {
    id: "science",
    name: "Science",
    icon: "🔬",
    color: "bg-green-500",
    chapters: [
      {
        id: "motion",
        name: "Motion",
        completed: false,
        topics: [
          { id: "distance-displacement", name: "Distance and Displacement", completed: false },
          { id: "speed-velocity", name: "Speed and Velocity", completed: false },
          { id: "acceleration", name: "Acceleration", completed: false },
        ],
      },
      {
        id: "force-laws",
        name: "Force and Laws of Motion",
        completed: false,
        topics: [
          { id: "newtons-laws", name: "Newton’s Laws", completed: false },
          { id: "inertia", name: "Inertia", completed: false },
          { id: "momentum", name: "Momentum", completed: false },
        ],
      },
      {
        id: "gravitation",
        name: "Gravitation",
        completed: false,
        topics: [
          { id: "universal-law", name: "Universal Law", completed: false },
          { id: "free-fall", name: "Free Fall", completed: false },
          { id: "buoyancy", name: "Buoyancy", completed: false },
        ],
      },
      {
        id: "work-energy",
        name: "Work and Energy",
        completed: false,
        topics: [
          { id: "work-done", name: "Work Done", completed: false },
          { id: "kinetic-energy", name: "Kinetic Energy", completed: false },
          { id: "potential-energy", name: "Potential Energy", completed: false },
        ],
      },
      {
        id: "sound",
        name: "Sound",
        completed: false,
        topics: [
          { id: "nature-of-sound", name: "Nature of Sound", completed: false },
          { id: "speed-frequency", name: "Speed, Frequency, Wavelength", completed: false },
          { id: "echo-sonar", name: "Echo, SONAR", completed: false },
        ],
      },
      {
        id: "matter-in-surroundings",
        name: "Matter in Our Surroundings",
        completed: false,
        topics: [
          { id: "states-of-matter", name: "States of Matter", completed: false },
          { id: "evaporation", name: "Evaporation and Sublimation", completed: false },
        ],
      },
      {
        id: "is-matter-pure",
        name: "Is Matter Around Us Pure",
        completed: false,
        topics: [
          { id: "mixtures-solutions", name: "Mixtures and Solutions", completed: false },
          { id: "separation-techniques", name: "Separation Techniques", completed: false },
          { id: "compounds-vs-mixtures", name: "Compounds vs Mixtures", completed: false },
        ],
      },
      {
        id: "atoms-molecules",
        name: "Atoms and Molecules",
        completed: false,
        topics: [
          { id: "laws-chemical-combination", name: "Laws of Chemical Combination", completed: false },
          { id: "atomic-mass", name: "Atomic Mass", completed: false },
          { id: "mole-concept", name: "Mole Concept", completed: false },
        ],
      },
      {
        id: "structure-atom",
        name: "Structure of the Atom",
        completed: false,
        topics: [
          { id: "electrons-protons-neutrons", name: "Electrons, Protons, Neutrons", completed: false },
          { id: "thomson-model", name: "Thomson, Rutherford, Bohr Model", completed: false },
        ],
      },
      {
        id: "fundamental-unit-life",
        name: "The Fundamental Unit of Life",
        completed: false,
        topics: [
          { id: "cell-structure", name: "Cell Structure", completed: false },
          { id: "organelles", name: "Organelles", completed: false },
        ],
      },
      {
        id: "tissues",
        name: "Tissues",
        completed: false,
        topics: [
          { id: "plant-tissues", name: "Plant Tissues", completed: false },
          { id: "animal-tissues", name: "Animal Tissues", completed: false },
        ],
      },
      {
        id: "diversity-living",
        name: "Diversity in Living Organisms",
        completed: false,
        topics: [
          { id: "classification", name: "Classification", completed: false },
          { id: "hierarchy-plantae-animalia", name: "Hierarchy, Plantae, Animalia", completed: false },
        ],
      },
      {
        id: "why-fall-ill",
        name: "Why Do We Fall Ill",
        completed: false,
        topics: [
          { id: "health-disease", name: "Health & Disease", completed: false },
          { id: "infectious-agents", name: "Infectious Agents", completed: false },
        ],
      },
      {
        id: "natural-resources",
        name: "Natural Resources",
        completed: false,
        topics: [
          { id: "air-water-soil", name: "Air, Water, Soil", completed: false },
          { id: "biogeochemical-cycles", name: "Biogeochemical Cycles", completed: false },
        ],
      },
      {
        id: "food-resources",
        name: "Improvement in Food Resources",
        completed: false,
        topics: [
          { id: "crop-production", name: "Crop Production", completed: false },
          { id: "animal-husbandry", name: "Animal Husbandry", completed: false },
        ],
      },
    ],
  },
  {
    id: "sst",
    name: "Social Studies",
    icon: "🌍",
    color: "bg-purple-500",
    chapters: [
      {
        id: "history",
        name: "History – India and the Contemporary World - I",
        completed: false,
        topics: [
          { id: "french-revolution", name: "The French Revolution", completed: false },
          { id: "socialism-europe", name: "Socialism in Europe and the Russian Revolution", completed: false },
          { id: "nazism-hitler", name: "Nazism and the Rise of Hitler", completed: false },
          { id: "forest-society", name: "Forest Society and Colonialism", completed: false },
          { id: "pastoralists", name: "Pastoralists in the Modern World", completed: false },
          { id: "peasants-farmers", name: "Peasants and Farmers", completed: false },
          { id: "history-sport", name: "History and Sport (Project)", completed: false },
        ],
      },
      {
        id: "geography",
        name: "Geography – Contemporary India - I",
        completed: false,
        topics: [
          { id: "size-location", name: "India – Size and Location", completed: false },
          { id: "physical-features", name: "Physical Features of India", completed: false },
          { id: "drainage", name: "Drainage", completed: false },
          { id: "climate", name: "Climate", completed: false },
          { id: "vegetation-wildlife", name: "Natural Vegetation and Wildlife", completed: false },
          { id: "population", name: "Population", completed: false },
        ],
      },
      {
        id: "political-science",
        name: "Political Science – Democratic Politics - I",
        completed: false,
        topics: [
          { id: "what-is-democracy", name: "What is Democracy? Why Democracy?", completed: false },
          { id: "constitutional-design", name: "Constitutional Design", completed: false },
          { id: "electoral-politics", name: "Electoral Politics", completed: false },
          { id: "working-institutions", name: "Working of Institutions", completed: false },
          { id: "democratic-rights", name: "Democratic Rights", completed: false },
        ],
      },
      {
        id: "economics",
        name: "Economics – Understanding Economic Development",
        completed: false,
        topics: [
          { id: "village-palampur", name: "The Story of Village Palampur", completed: false },
          { id: "people-as-resource", name: "People as Resource", completed: false },
          { id: "poverty-challenge", name: "Poverty as a Challenge", completed: false },
          { id: "food-security", name: "Food Security in India", completed: false },
        ],
      },
    ],
  },
]

const cleanAIResponse = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown
    .replace(/\*(.*?)\*/g, "$1") // Remove italic markdown
    .replace(/#{1,6}\s/g, "") // Remove heading markdown
    .replace(/`{1,3}(.*?)`{1,3}/g, "$1") // Remove code markdown
    .trim()
}

export default function CoursesPage() {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [topicContent, setTopicContent] = useState<string>("")
  const [isLoadingContent, setIsLoadingContent] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isAiTyping, setIsAiTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<"english" | "hindi">("english")

  const { speakWithEmotion, stopSpeaking, pauseSpeaking, resumeSpeaking } = useEnhancedVoice()

  useEffect(() => {
    if (selectedTopic && !selectedTopic.content) {
      fetchTopicContent(selectedTopic, selectedLanguage)
    }
  }, [selectedTopic, selectedLanguage])

  const fetchTopicContent = async (topic: Topic, language: "english" | "hindi") => {
    setIsLoadingContent(true)

    try {
      // Use real AI to generate content
      const content = await generateCourseContent(topic.name, selectedSubject?.name || "", language)
      setTopicContent(content)
    } catch (error) {
      console.error("Error fetching topic content:", error)
      setTopicContent(generateMockContent(topic.name))
    } finally {
      setIsLoadingContent(false)
    }
  }

  const generateMockContent = (topicName: string) => {
    const contents: { [key: string]: string } = {
      "Zeroes of a Polynomial": `
# Zeroes of a Polynomial

## Introduction
A polynomial is an expression consisting of variables and coefficients, involving only addition, subtraction, and multiplication. The **zeroes of a polynomial** are the values of the variable for which the polynomial becomes zero.

---

## Definition
**Zeroes of a polynomial** are the values of the variable that satisfy the equation:

\`\`\`
P(x) = 0
\`\`\`

---

## Example
Consider the quadratic equation:

\`\`\`
x² + 5x + 6 = 0
\`\`\`

We factor it:

\`\`\`
x² + 5x + 6 = (x + 2)(x + 3) = 0
\`\`\`

Therefore:

\`\`\`
x + 2 = 0  ⇒  x = -2
x + 3 = 0  ⇒  x = -3
\`\`\`

✅ The zeroes of the polynomial are **x = -2** and **x = -3**.

---

## Key Points
- Zeroes of a polynomial make it equal to zero.
- A polynomial of degree *n* can have at most *n* zeroes.
- We can find zeroes by **factoring** or using the **quadratic formula**.

---

## Practical Applications
Polynomials and their zeroes appear in real-life contexts:

- **Projectile motion:** Zeroes can tell when an object hits the ground.
- **Economics:** Profit/loss analyses.
- **Biology:** Modeling population growth.

---

## Step-by-Step Explanation

1️⃣ Write the polynomial in standard form:

\`\`\`
ax² + bx + c = 0
\`\`\`

2️⃣ **Factor** if possible:

- Find two numbers whose product is *ac* and sum is *b*.

3️⃣ If factoring is hard, use the **Quadratic Formula**:

\`\`\`
x = (-b ± √(b² - 4ac)) / (2a)
\`\`\`

---

## Practice Problems
1. Find the zeroes of:
   - \`x² - 5x + 6 = 0\`
2. Find the zeroes of:
   - \`x³ - 2x² - 5x + 6 = 0\`

---

## Important Formula
✅ **Quadratic Formula:**

\`\`\`
x = (-b ± √(b² - 4ac)) / 2a
\`\`\`

---

## Conclusion
We learned:

- How to find the zeroes of a polynomial.
- Factoring and formula methods.
- Real-life significance of zeroes.

With practice, you'll easily solve polynomial equations!

---

## Assessment Questions
1. What are the zeroes of a polynomial?
2. How can you find them?
3. Why are they important in real life?

---

## Additional Resources
- NCERT Class 9 Mathematics
- R.D. Sharma Mathematics for Class 9
- Khan Academy, MIT OpenCourseWare
    `,
    }

    return (
      contents[topicName] ||
      `
# ${topicName}

This is a comprehensive topic covering important concepts in ${topicName}. 

## Key Learning Objectives:
- Understand the fundamental concepts
- Apply knowledge to solve problems
- Connect with real-world applications

## Important Points:
- Detailed explanations with examples
- Step-by-step problem solving
- Practice exercises and activities

*Content is being dynamically generated using AI to provide personalized learning experience.*
    `
    )
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: chatInput,
      timestamp: new Date(),
    }

    setChatMessages((prev) => [...prev, userMessage])
    const currentInput = chatInput
    setChatInput("")
    setIsAiTyping(true)

    try {
      // Get AI response using Groq
      const aiResponseContent = await askGroqAI(currentInput, selectedSubject?.name, selectedTopic?.name)

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: aiResponseContent,
        timestamp: new Date(),
      }

      setChatMessages((prev) => [...prev, aiResponse])
      setIsAiTyping(false)

      // Store chat in Supabase
      await supabase.from('course_chats').insert([
        {
          subject: selectedSubject?.name,
          chapter: selectedChapter?.name,
          topic: selectedTopic?.name,
          user_message: currentInput,
          ai_response: aiResponseContent,
          timestamp: new Date().toISOString(),
        }
      ])

      // Determine emotion based on response content
      let emotion: "friendly" | "encouraging" | "explaining" | "excited" = "friendly"
      if (aiResponseContent.includes("step by step") || aiResponseContent.includes("samjhata hun")) {
        emotion = "explaining"
      } else if (aiResponseContent.includes("easy hai") || aiResponseContent.includes("tension mat lo")) {
        emotion = "encouraging"
      } else if (aiResponseContent.includes("!") && aiResponseContent.includes("great")) {
        emotion = "excited"
      }

      // Enhanced text-to-speech with emotion
      speakWithEmotion(aiResponseContent, emotion)
    } catch (error) {
      console.error("Error getting AI response:", error)
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: "Sorry beta, main abhi thoda busy hun. Kya aap thoda der baad try kar sakte hain? 😅",
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, errorResponse])
      setIsAiTyping(false)
    }
  }

  const handleSpeak = (text: string, emotion: "friendly" | "encouraging" | "explaining" | "excited") => {
    speakWithEmotion(text, emotion)
    setIsSpeaking(true)
    setIsPaused(false)
  }
  const handleToggleSpeech = (text: string) => {
    if (!isSpeaking) {
      handleSpeak(text, "friendly")
    } else if (!isPaused) {
      pauseSpeaking()
      setIsPaused(true)
    } else {
      resumeSpeaking()
      setIsPaused(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 h-[calc(100vh-8rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Left Panel - Subjects & Chapters */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Subjects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100%-8rem)]">
                  <div className="p-4 space-y-2">
                    {subjects.map((subject) => (
                      <div key={subject.id}>
                        <Button
                          variant={selectedSubject?.id === subject.id ? "default" : "ghost"}
                          className="w-full justify-start mb-2"
                          onClick={() => {
                            setSelectedSubject(subject)
                            setSelectedChapter(null)
                            setSelectedTopic(null)
                          }}
                        >
                          <span className="mr-2">{subject.icon}</span>
                          {subject.name}
                        </Button>

                        {selectedSubject?.id === subject.id && (
                          <div className="ml-4 space-y-1">
                            {subject.chapters.map((chapter) => (
                              <Button
                                key={chapter.id}
                                variant={selectedChapter?.id === chapter.id ? "secondary" : "ghost"}
                                size="sm"
                                className="w-full justify-start text-sm"
                                onClick={() => {
                                  setSelectedChapter(chapter)
                                  setSelectedTopic(null)
                                }}
                              >
                                {chapter.completed ? (
                                  <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-2 text-gray-400" />
                                )}
                                {chapter.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel - Topics & Content */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedChapter ? (
                    <>
                      <Play className="w-5 h-5" />
                      {selectedChapter.name}
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-5 h-5" />
                      Select a Chapter
                    </>
                  )}
                </CardTitle>
                {selectedSubject && <CardDescription>{selectedSubject.name} • Class 9</CardDescription>}
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100%-8rem)]">
                  {!selectedChapter ? (
                    <div className="p-8 text-center text-gray-500">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Choose a Subject and Chapter</h3>
                      <p>Select a subject from the left panel to start learning</p>
                    </div>
                  ) : !selectedTopic ? (
                    <div className="p-4">
                      <h3 className="font-medium mb-4">Topics in {selectedChapter.name}</h3>
                      <div className="space-y-2">
                        {selectedChapter.topics.map((topic) => (
                          <Button
                            key={topic.id}
                            variant="outline"
                            className="w-full justify-between h-auto p-4 bg-transparent"
                            onClick={() => setSelectedTopic(topic)}
                          >
                            <div className="flex items-center gap-3">
                              {topic.completed ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <Clock className="w-5 h-5 text-gray-400" />
                              )}
                              <span>{topic.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-bold">{selectedTopic.name}</h2>
                          <Badge variant="secondary" className="mt-1">
                            {selectedSubject?.name} • {selectedChapter.name}
                          </Badge>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedTopic(null)}>
                          Back to Topics
                        </Button>
                      </div>

                      {/* Language selection */}
                      <div>
                        <label className="text-base font-medium">Select Output Language</label>
                        <div className="grid grid-cols-2 gap-3 mt-2">
                          <Button
                            variant={selectedLanguage === "english" ? "default" : "outline"}
                            onClick={() => setSelectedLanguage("english")}
                          >
                            English
                          </Button>
                          <Button
                            variant={selectedLanguage === "hindi" ? "default" : "outline"}
                            onClick={() => setSelectedLanguage("hindi")}
                          >
                            Hindi
                          </Button>
                        </div>
                      </div>

                      {isLoadingContent ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                          <span className="ml-2">Loading content...</span>
                        </div>
                      ) : (
                        <div className="bg-green-50 text-black rounded-xl p-4 whitespace-pre-wrap text-sm leading-relaxed h-96 overflow-y-auto">
                          {cleanAIResponse(topicContent)}
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - AI Chatbot */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col">
              <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  AI Doubt Bot
                </CardTitle>
                <CardDescription>Ask questions and get instant help with voice responses</CardDescription>
              </CardHeader>

              <Separator />

              <div className="flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 p-4 h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="text-center text-gray-500 py-8">
                        <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p className="text-sm">Ask me anything about your current topic!</p>
                      </div>
                    )}

                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] p-3 rounded-lg text-sm ${
                            message.type === "user"
                              ? "bg-blue-500 text-white"
                              : "bg-green-50 text-gray-900 border border-green-200"
                          }`}
                        >
                          <div className="whitespace-pre-wrap">
                            {message.type === "ai" ? cleanAIResponse(message.content) : message.content}
                          </div>
                          {message.type === "ai" && (
                            <div className="flex gap-1 mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs hover:bg-green-100"
                                onClick={() => handleSpeak(cleanAIResponse(message.content), "friendly")}
                                disabled={isSpeaking}
                              >
                                <Volume2 className="w-3 h-3 mr-1" />
                                Speak
                              </Button>
                              {isSpeaking && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs hover:bg-green-100"
                                  onClick={() => handleToggleSpeech(cleanAIResponse(message.content))}
                                >
                                  {isPaused ? (
                                    <>
                                      <Play className="w-3 h-3 mr-1" />
                                      Resume
                                    </>
                                  ) : (
                                    <>
                                      <Pause className="w-3 h-3 mr-1" />
                                      Pause
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {isAiTyping && (
                      <div className="flex justify-start">
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-green-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                <Separator />

                <div className="flex-shrink-0 p-4">
                  <form onSubmit={handleChatSubmit}>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Ask your doubt here..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        className="min-h-[60px] resize-none"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleChatSubmit(e)
                          }
                        }}
                      />
                      <Button type="submit" size="sm" disabled={!chatInput.trim() || isAiTyping}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
