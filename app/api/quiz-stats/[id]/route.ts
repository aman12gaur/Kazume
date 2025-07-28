import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServerClient';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'User ID not provided' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch quiz results for the user
    const { data, error } = await supabase
      .from('quiz_results')
      .select('total_questions')
      .eq('user_id', id);

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats
    const quizzesAttempted = data.length;
    const totalQuestions = data.reduce((sum, row) => sum + (row.total_questions || 0), 0);

    return NextResponse.json({
      quizzesAttempted,
      totalQuestions
    });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 