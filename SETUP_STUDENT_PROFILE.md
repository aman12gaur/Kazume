# Student Profile Feature Setup Guide

## Overview
This guide will help you set up the student profile feature and resolve the console error you're experiencing.

## Step 1: Create the Database Table

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase Dashboard**
   - Navigate to your Supabase project
   - Go to the SQL Editor

2. **Run the SQL Script**
   - Copy the contents of `create_student_profiles_table.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

### Option B: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Run the migration**:
   ```bash
   npx supabase db push
   ```

## Step 2: Verify Table Creation

After creating the table, verify it exists by:

1. **Check in Supabase Dashboard**:
   - Go to Table Editor
   - Look for `student_profiles` table
   - Verify all columns are present

2. **Test the connection**:
   ```bash
   node test-supabase-connection.js
   ```

## Step 3: Environment Variables

Make sure your `.env.local` file has the correct Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 4: Test the Feature

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test the profile flow**:
   - Sign up as a new user
   - You should be redirected to the profile form
   - Fill out the form and save
   - Check the database to verify data is saved

## Troubleshooting

### Console Error: "Error loading profile: {}"

This error occurs when:
1. The `student_profiles` table doesn't exist
2. There are RLS (Row Level Security) policy issues
3. The user is not authenticated properly

**Solutions:**

1. **Check if table exists**:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name = 'student_profiles';
   ```

2. **Verify RLS policies**:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'student_profiles';
   ```

3. **Check user authentication**:
   - Ensure the user is properly logged in
   - Check localStorage for `gyaan_user` data

### Database Connection Issues

1. **Verify environment variables**:
   - Check `.env.local` file
   - Ensure Supabase URL and key are correct

2. **Test connection**:
   ```javascript
   // Add this to your component temporarily
   useEffect(() => {
     const testConnection = async () => {
       const { data, error } = await supabase.auth.getUser();
       console.log('Auth test:', { data, error });
     };
     testConnection();
   }, []);
   ```

### RLS Policy Issues

If you're getting permission errors, ensure the RLS policies are correct:

```sql
-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'student_profiles';

-- If policies are missing, recreate them:
CREATE POLICY "Users can view own profile" ON student_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON student_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON student_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON student_profiles
  FOR DELETE USING (auth.uid() = user_id);
```

## Feature Flow

### 1. New User Signup
- User signs up → Redirected to `/profile`
- Profile form opens automatically
- User fills out comprehensive information
- Data saved to `student_profiles` table
- User redirected to dashboard

### 2. Existing User
- User clicks "Profile" button in navbar
- Profile page loads with existing data
- User can view and edit profile

### 3. Profile Editing
- Click "Edit Profile" button
- Form loads with existing data
- Make changes and save
- Profile updated in database

## Database Schema

The `student_profiles` table includes:

**Personal Information:**
- `full_name` (TEXT, required)
- `date_of_birth` (DATE, required)
- `gender` (TEXT, required)
- `blood_group` (TEXT, optional)

**Academic Information:**
- `class` (TEXT, required)
- `section` (TEXT, required)
- `school_name` (TEXT, required)
- `school_board` (TEXT, required)

**Contact Information:**
- `parent_name` (TEXT, required)
- `parent_phone` (TEXT, required)
- `parent_email` (TEXT, optional)
- `emergency_contact` (TEXT, required)
- `address` (TEXT, required)
- `city` (TEXT, required)
- `state` (TEXT, required)
- `pincode` (TEXT, required)

**Additional Information:**
- `medical_conditions` (TEXT, optional)
- `interests` (TEXT[], optional)
- `goals` (TEXT, optional)

## Security Features

1. **Row Level Security (RLS)**: Users can only access their own profile
2. **Authentication Required**: All operations require user authentication
3. **Input Validation**: Form validation on both client and server side
4. **Data Encryption**: All data is encrypted at rest

## Performance Optimizations

1. **Indexes**: Created on frequently queried columns
2. **Caching**: Profile data cached in localStorage
3. **Optimized Queries**: Single query to load profile data
4. **Lazy Loading**: Profile loads only when needed

## Monitoring and Debugging

### Console Logs
The improved error handling now provides detailed console logs:
- Profile loading attempts
- Database operation results
- Error details with context

### Database Monitoring
- Check Supabase Dashboard for query performance
- Monitor RLS policy effectiveness
- Track user engagement with profile feature

## Next Steps

After successful setup:

1. **Test the complete flow** with multiple users
2. **Monitor performance** in production
3. **Add additional features** like profile picture upload
4. **Implement data export** functionality
5. **Add admin dashboard** for profile management

## Support

If you encounter issues:

1. Check the console logs for detailed error information
2. Verify the database table exists and has correct structure
3. Ensure RLS policies are properly configured
4. Test the Supabase connection using the test script
5. Check environment variables are correctly set

---

This setup guide should resolve the console error and ensure the student profile feature works correctly. 