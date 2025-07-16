import { supabase } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data), { status: 200 });
} 