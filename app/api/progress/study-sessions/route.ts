import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month'); // ISO yyyy-mm-01

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const monthStart = month ?? new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

    const { data, error } = await supabase
      .from('study_sessions')
      .select('start_time, end_time, duration')
      .eq('user_id', userId)
      .gte('start_time', monthStart)
      .order('start_time', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch study sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, start_time, end_time, duration, subject } = body as {
      userId?: string;
      start_time?: string;
      end_time?: string;
      duration?: number; // seconds
      subject?: string | null;
    };

    if (!userId || !start_time || !end_time || typeof duration !== 'number') {
      return NextResponse.json({ error: 'userId, start_time, end_time, duration required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('study_sessions')
      .insert([{ user_id: userId, start_time, end_time, duration, subject: subject ?? null }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create study session' }, { status: 500 });
  }
}