"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Brain, Trophy, TrendingUp, Clock, Target, Play, MessageCircle, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"

interface DashboardStats {
  quizzesAttempted: number
  totalQuestions: number
  currentStreak: number
  lastCompletedTopic: string
  weeklyProgress: number[]
  subjectProgress: { subject: string; progress: number; color: string }[]
}

export default function Dashboard() {
  const [user, setUser] = useState<{ name: string; id: string } | null>(null)
  const [stats, setStats] = useState<DashboardStats>({
    quizzesAttempted: 12,
    totalQuestions: 156,
    currentStreak: 5,
    lastCompletedTopic: "Rational Numbers - Mathematics",
    weeklyProgress: [65, 72, 68, 85, 78, 92, 88],
    subjectProgress: [
      { subject: "Mathematics", progress: 78, color: "bg-blue-500" },
      { subject: "Science", progress: 65, color: "bg-green-500" },
      { subject: "Social Studies", progress: 82, color: "bg-purple-500" },
      { subject: "English", progress: 71, color: "bg-orange-500" },
    ],
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("gyaan_user")
    if (!userData) {
      router.push("/")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hi {user.name}, Welcome Back to Gyaan! 👋</h1>
          <p className="text-gray-600">Continue your learning journey and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Attempted</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quizzesAttempted}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Solved</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">+23 from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-muted-foreground">Today's session</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Today's Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium">Continue Last Topic</h3>
                    <p className="text-sm text-gray-600">{stats.lastCompletedTopic}</p>
                  </div>
                  <Button asChild>
                    <Link href="/courses">Continue</Link>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" asChild>
                    <Link href="/quiz">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Take Today's Quiz</div>
                          <div className="text-sm text-gray-500">Mathematics - Algebra</div>
                        </div>
                      </div>
                    </Link>
                  </Button>

                  <Button variant="outline" className="h-auto p-4 justify-start bg-transparent" asChild>
                    <Link href="/courses">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                          <MessageCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Ask a Doubt</div>
                          <div className="text-sm text-gray-500">AI Chatbot with Voice</div>
                        </div>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subject Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Subject-wise Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.subjectProgress.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <Badge variant="secondary">{subject.progress}%</Badge>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to your favorite activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/courses">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/quiz">
                    <Trophy className="w-4 h-4 mr-2" />
                    Start Quiz
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/progress">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Progress
                  </Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline" asChild>
                  <Link href="/courses">
                    <Brain className="w-4 h-4 mr-2" />
                    AI Doubt Bot
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <div className="font-medium">Quiz Master</div>
                    <div className="text-sm text-gray-600">Scored 90% in Math Quiz</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Target className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="font-medium">Streak Champion</div>
                    <div className="text-sm text-gray-600">5 days learning streak</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="font-medium">Chapter Complete</div>
                    <div className="text-sm text-gray-600">Finished Number Systems</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
