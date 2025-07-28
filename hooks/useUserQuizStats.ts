import { useEffect, useState } from 'react';

interface UserQuizStats {
  quizzesAttempted: number;
  totalQuestions: number;
  loading: boolean;
  error: string | null;
}

export function useUserQuizStats(userId: string | null): UserQuizStats {
  const [quizzesAttempted, setQuizzesAttempted] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetch(`/api/quiz-stats/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setLoading(false);
          return;
        }
        setQuizzesAttempted(data.quizzesAttempted);
        setTotalQuestions(data.totalQuestions);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [userId]);

  return { quizzesAttempted, totalQuestions, loading, error };
} 