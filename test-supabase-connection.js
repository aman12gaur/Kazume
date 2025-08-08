// Test script to verify Supabase connection and table creation
// Run this with: node test-supabase-connection.js

const { createClient } = require('@supabase/supabase-js');

// You'll need to set these environment variables or replace with your actual values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getUser();
    console.log('Connection test result:', { data, error });
    
    // Test if student_profiles table exists
    const { data: tableData, error: tableError } = await supabase
      .from('student_profiles')
      .select('id')
      .limit(1);
    
    console.log('Table test result:', { tableData, tableError });
    
    if (tableError) {
      console.log('Table does not exist or has access issues. Error:', tableError);
    } else {
      console.log('Table exists and is accessible!');
    }
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection(); 