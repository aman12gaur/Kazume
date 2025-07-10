"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Trophy, Target, Clock, BookOpen, Brain, Calendar, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"

interface ProgressData {
  weeklyScores: { day: string; score: number }[]
  subjectMastery: { subject: string; mastery: number; color: string }[]
  recentQuizzes: {
    id: string
    subject: string
    score: number
    date: string
    timeTaken: string
    questionsCorrect: number
    totalQuestions: number
  }[]
  achievements: {
    id: string
    title: string
    description: string
    icon: string
    date: string
    type: "gold" | "silver" | "bronze"
  }[]
  overallStats: {
    totalQuizzes: number
    averageScore: number
    totalStudyTime: string
    currentStreak: number
    strongestSubject: string
    improvementNeeded: string
  }
}

const progressData: ProgressData = {
  weeklyScores: [
    { day: "Mon", score: 75 },
    { day: "Tue", score: 82 },
    { day: "Wed", score: 78 },
    { day: "Thu", score: 88 },
    { day: "Fri", score: 85 },
    { day: "Sat", score: 92 },
    { day: "Sun", score: 89 },
  ],
  subjectMastery: [
    { subject: "Mathematics", mastery: 85, color: "bg-blue-500" },
    { subject: "Science", mastery: 78, color: "bg-green-500" },
    { subject: "Social Studies", mastery: 82, color: "bg-purple-500" },
    { subject: "English", mastery: 71, color: "bg-orange-500" },
  ],
  recentQuizzes: [
    {
      id: "1",
      subject: "Mathematics",
      score: 92,
      date: "2024-01-15",
      timeTaken: "4:23",
      questionsCorrect: 23,
      totalQuestions: 25,
    },
    {
      id: "2",
      subject: "Science",
      score: 85,
      date: "2024-01-14",
      timeTaken: "3:45",
      questionsCorrect: 17,
      totalQuestions: 20,
    },
    {
      id: "3",
      subject: "Social Studies",
      score: 78,
      date: "2024-01-13",
      timeTaken: "5:12",
      questionsCorrect: 14,
      totalQuestions: 18,
    },
    {
      id: "4",
      subject: "English",
      score: 88,
      date: "2024-01-12",
      timeTaken: "4:56",
      questionsCorrect: 22,
      totalQuestions: 25,
    },
  ],
  achievements: [
    {
      id: "1",
      title: "Quiz Master",
      description: "Scored 90% or above in 5 consecutive quizzes",
      icon: "🏆",
      date: "2024-01-15",
      type: "gold",
    },
    {
      id: "2",
      title: "Streak Champion",
      description: "Maintained 7-day learning streak",
      icon: "🔥",
      date: "2024-01-14",
      type: "silver",
    },
    {
      id: "3",
      title: "Math Wizard",
      description: "Completed all Mathematics chapters",
      icon: "🧮",
      date: "2024-01-10",
      type: "bronze",
    },
    {
      id: "4",
      title: "Quick Learner",
      description: "Finished quiz in under 3 minutes",
      icon: "⚡",
      date: "2024-01-08",
      type: "silver",
    },
  ],
  overallStats: {
    totalQuizzes: 24,
    averageScore: 83,
    totalStudyTime: "12h 45m",
    currentStreak: 7,
    strongestSubject: "Mathematics",
    improvementNeeded: "English",
  },
}

export default function ProgressPage() {
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50"
    if (score >= 80) return "text-blue-600 bg-blue-50"
    if (score >= 70) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const getAchievementColor = (type: "gold" | "silver" | "bronze") => {
    switch (type) {
      case "gold":
        return "bg-yellow-100 border-yellow-200"
      case "silver":
        return "bg-gray-100 border-gray-200"
      case "bronze":
        return "bg-orange-100 border-orange-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress Dashboard</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.overallStats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">Average: {progressData.overallStats.averageScore}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.overallStats.totalStudyTime}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.overallStats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strongest Subject</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.overallStats.strongestSubject}</div>
              <p className="text-xs text-muted-foreground">85% mastery</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Weekly Performance
                </CardTitle>
                <CardDescription>Your quiz scores over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.weeklyScores.map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1">
                        <Progress value={day.score} className="h-3" />
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{day.score}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subject Mastery */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Subject Mastery
                </CardTitle>
                <CardDescription>Your progress across different subjects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressData.subjectMastery.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.subject}</span>
                      <Badge variant="secondary">{subject.mastery}%</Badge>
                    </div>
                    <Progress value={subject.mastery} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Quiz History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Recent Quiz History
                </CardTitle>
                <CardDescription>Your latest quiz attempts and scores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreColor(quiz.score)}`}
                        >
                          <span className="font-bold">{quiz.score}%</span>
                        </div>
                        <div>
                          <div className="font-medium">{quiz.subject}</div>
                          <div className="text-sm text-gray-500">
                            {quiz.questionsCorrect}/{quiz.totalQuestions} correct • {quiz.timeTaken}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{quiz.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Your learning milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {progressData.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 border rounded-lg ${getAchievementColor(achievement.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{achievement.description}</div>
                        <div className="text-xs text-gray-500 mt-2">{achievement.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Improvement Suggestions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Improvement Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-blue-900">Focus Area</div>
                  <div className="text-sm text-blue-700 mt-1">
                    Spend more time on {progressData.overallStats.improvementNeeded} to boost your overall performance
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">Strength</div>
                  <div className="text-sm text-green-700 mt-1">
                    You're excelling in {progressData.overallStats.strongestSubject}! Keep up the great work
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="font-medium text-purple-900">Study Tip</div>
                  <div className="text-sm text-purple-700 mt-1">
                    Try taking quizzes in the morning when your mind is fresh for better scores
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Study Goals */}
            <Card>
              <CardHeader>
                <CardTitle>This Week's Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-green-500 bg-green-500 rounded"></div>
                  <span className="text-sm">Complete 5 quizzes</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-green-500 bg-green-500 rounded"></div>
                  <span className="text-sm">Maintain 7-day streak</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm">Score 85%+ in English</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                  <span className="text-sm">Study for 2 hours daily</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
