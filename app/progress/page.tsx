"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Trophy, Target, Clock, BookOpen, Brain, Calendar, Award } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { useUserMetrics } from '@/hooks/useUserMetrics';
import { StudyTime } from '@/components/StudyTime';

export default function ProgressPage() {
  // Example: get userId from localStorage (replace with your auth logic)
  const userId = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('gyaan_user') || '{}').id : null;
  const {
    quizzesAttempted,
    totalQuestions,
    currentStreak,
    weeklyProgress,
    subjectProgress,
    recentQuizzes,
    overallStats,
    loading,
    error,
    refetch,
  } = useUserMetrics(userId);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getAchievementColor = (type: 'gold' | 'silver' | 'bronze') => {
    switch (type) {
      case 'gold':
        return 'bg-yellow-100 border-yellow-200';
      case 'silver':
        return 'bg-gray-100 border-gray-200';
      case 'bronze':
        return 'bg-orange-100 border-orange-200';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
              <div className="text-2xl font-bold">{overallStats.totalQuizzes}</div>
              <p className="text-xs text-muted-foreground">Average: {overallStats.averageScore}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {overallStats.totalQuestionsSolved > 0 
                  ? Math.round((overallStats.totalCorrect / overallStats.totalQuestionsSolved) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {overallStats.totalCorrect}/{overallStats.totalQuestionsSolved} correct
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up! 🔥</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Strongest Subject</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.strongestSubject || 'None yet'}</div>
              <p className="text-xs text-muted-foreground">
                {overallStats.strongestSubject 
                  ? `${subjectProgress.find(s => s.subject.toLowerCase() === overallStats.strongestSubject.toLowerCase())?.progress || 0}% mastery`
                  : 'Start taking quizzes'
                }
              </p>
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
                  {weeklyProgress.map((score, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</div>
                      <div className="flex-1">
                        <Progress value={score} className="h-3" />
                      </div>
                      <div className="w-12 text-sm font-medium text-right">{score}%</div>
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
                {subjectProgress.map((subject, index) => (
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
                  {recentQuizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getScoreColor(quiz.score)}`}>
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
            {/* Study Time Component */}
            <StudyTime userId={userId} />
            
            {/* Achievements - Placeholder, as not in DB */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Your learning milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border rounded-lg bg-yellow-100 border-yellow-200">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🏆</div>
                    <div className="flex-1">
                      <div className="font-medium">Quiz Master</div>
                      <div className="text-sm text-gray-600 mt-1">Scored 90% or above in 5 consecutive quizzes</div>
                      <div className="text-xs text-gray-500 mt-2">(Sample)</div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-gray-100 border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔥</div>
                    <div className="flex-1">
                      <div className="font-medium">Streak Champion</div>
                      <div className="text-sm text-gray-600 mt-1">Maintained 7-day learning streak</div>
                      <div className="text-xs text-gray-500 mt-2">(Sample)</div>
                    </div>
                  </div>
                </div>
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
                    Spend more time on {overallStats.improvementNeeded} to boost your overall performance
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-900">Strength</div>
                  <div className="text-sm text-green-700 mt-1">
                    You're excelling in {overallStats.strongestSubject}! Keep up the great work
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
            {/* Study Goals - Placeholder */}
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
  );
}
