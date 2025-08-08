-- Create student_profiles table manually
-- Run this in your Supabase SQL editor

-- Create the table
CREATE TABLE IF NOT EXISTS student_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  class TEXT NOT NULL,
  section TEXT NOT NULL,
  school_name TEXT NOT NULL,
  school_board TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  emergency_contact TEXT NOT NULL,
  blood_group TEXT,
  medical_conditions TEXT,
  interests TEXT[] DEFAULT '{}',
  goals TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_class ON student_profiles(class);
CREATE INDEX IF NOT EXISTS idx_student_profiles_school_board ON student_profiles(school_board);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_student_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_student_profiles_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON student_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON student_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE student_profiles IS 'Comprehensive student profile information including personal, academic, and contact details';
COMMENT ON COLUMN student_profiles.user_id IS 'Reference to auth.users table';
COMMENT ON COLUMN student_profiles.full_name IS 'Student full name';
COMMENT ON COLUMN student_profiles.date_of_birth IS 'Student date of birth';
COMMENT ON COLUMN student_profiles.gender IS 'Student gender (male, female, other)';
COMMENT ON COLUMN student_profiles.class IS 'Student class (1-12)';
COMMENT ON COLUMN student_profiles.section IS 'Student section (A-E)';
COMMENT ON COLUMN student_profiles.school_name IS 'Name of the school';
COMMENT ON COLUMN student_profiles.school_board IS 'School board (CBSE, ICSE, etc.)';
COMMENT ON COLUMN student_profiles.parent_name IS 'Parent or guardian name';
COMMENT ON COLUMN student_profiles.parent_phone IS 'Parent or guardian phone number';
COMMENT ON COLUMN student_profiles.parent_email IS 'Parent or guardian email (optional)';
COMMENT ON COLUMN student_profiles.address IS 'Student address';
COMMENT ON COLUMN student_profiles.city IS 'City name';
COMMENT ON COLUMN student_profiles.state IS 'State name';
COMMENT ON COLUMN student_profiles.pincode IS 'Pincode';
COMMENT ON COLUMN student_profiles.emergency_contact IS 'Emergency contact number';
COMMENT ON COLUMN student_profiles.blood_group IS 'Student blood group (optional)';
COMMENT ON COLUMN student_profiles.medical_conditions IS 'Medical conditions or allergies (optional)';
COMMENT ON COLUMN student_profiles.interests IS 'Array of student interests';
COMMENT ON COLUMN student_profiles.goals IS 'Academic goals and objectives (optional)';
COMMENT ON COLUMN student_profiles.created_at IS 'Profile creation timestamp';
COMMENT ON COLUMN student_profiles.updated_at IS 'Profile last update timestamp'; 