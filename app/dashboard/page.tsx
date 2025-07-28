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
import { useUserMetrics } from '@/hooks/useUserMetrics';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Get user from localStorage and fetch user data
  useEffect(() => {
    const userData = localStorage.getItem('gyaan_user');
    if (!userData) {
      // Set default test user for demo
      const defaultUser = { id: "5d23c823-d199-4b6c-9983-1b909a14f3aa", name: "Aman Gaur", email: "aman.gaur5505@gmail.com" };
      localStorage.setItem('gyaan_user', JSON.stringify(defaultUser));
      setUser(defaultUser);
      setUserLoading(false);
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!parsedUser.id) {
      setUserLoading(false);
      return;
    }

    // Use localStorage data directly to avoid API issues
    setUser(parsedUser);
    setUserLoading(false);
  }, []);

  const {
    quizzesAttempted,
    totalQuestions,
    currentStreak,
    weeklyProgress,
    subjectProgress,
    recentQuizzes,
    overallStats,
    quizzesDeltaLastWeek,
    questionsDeltaYesterday,
    loading: metricsLoading,
    error: metricsError,
    refetch,
  } = useUserMetrics(user?.id || null);

  // Refetch metrics when returning to dashboard
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refetch]);

  // Redirect if no user
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/');
      return;
    }
  }, [router, user, userLoading]);

  if (userLoading || metricsLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (error || metricsError) {
    return <div className="p-8 text-center text-red-500">{error || metricsError}</div>;
  }

  // For lastCompletedTopic, you may want to fetch from another source or compute from quiz_results
  const lastCompletedTopic = 'See Progress Page';

  // Format duration as HH:MM:SS
  function formatDuration(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hi {user?.name || 'Student'}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to continue your learning journey?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Attempted</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizzesAttempted}</div>
              <p className="text-xs text-muted-foreground">+{quizzesDeltaLastWeek} from last week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions Attempted</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <p className="text-xs text-muted-foreground">+{questionsDeltaYesterday} from yesterday</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStreak}</div>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.averageScore}%</div>
              <p className="text-xs text-muted-foreground">across all subjects</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/quiz">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="h-5 w-5 mr-2" />
                  Take a Quiz
                </CardTitle>
                <CardDescription>
                  Test your knowledge with interactive quizzes
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/courses">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Study Material
                </CardTitle>
                <CardDescription>
                  Access comprehensive study resources
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/progress">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Progress
                </CardTitle>
                <CardDescription>
                  Track your learning journey
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentQuizzes.length > 0 ? (
                <div className="space-y-3">
                  {recentQuizzes.map((quiz, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{quiz.subject}</p>
                        <p className="text-sm text-gray-600">{quiz.chapter}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{quiz.score}%</p>
                        <p className="text-xs text-gray-600">{quiz.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent quizzes</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subject Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {subjectProgress.length > 0 ? (
                <div className="space-y-4">
                  {subjectProgress.map((subject, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{subject.subject}</span>
                        <span className="text-sm text-gray-600">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No subject data available</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
