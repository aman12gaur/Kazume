# Netlify Deployment Guide

## Issue Resolution

The 502 Bad Gateway error occurs because Netlify doesn't support Next.js API routes by default. This guide provides the solution.

## Required Environment Variables

You need to set these environment variables in your Netlify dashboard:

### 1. Go to Netlify Dashboard
- Navigate to your site settings
- Go to "Environment variables" section

### 2. Add these environment variables:

```
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Deployment Steps

1. **Push your code to GitHub/GitLab**
2. **Connect your repository to Netlify**
3. **Set build settings:**
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Add environment variables** (see above)
5. **Deploy**

## What Changed

1. **Created `netlify.toml`** - Configuration file for Netlify
2. **Created Netlify Functions** - Replace Next.js API routes:
   - `netlify/functions/api/groq.js` - Handles Groq AI API calls
   - `netlify/functions/api/study-sessions.js` - Handles study sessions
   - `netlify/functions/api/achievements.js` - Handles achievements
   - `netlify/functions/api/user/[id].js` - Handles user data
   - `netlify/functions/api/quiz-stats/[id].js` - Handles quiz statistics
3. **Updated hooks** - Modified `useStudySession` to use API functions
4. **Added redirects** - Routes `/api/*` requests to Netlify Functions

## How It Works

- Your frontend still calls `/api/groq` as before
- Netlify redirects these calls to the Netlify Function
- The function handles the Groq API calls and Supabase interactions
- CORS is properly configured for cross-origin requests

## Testing

After deployment:
1. Check that your site loads without 404 errors
2. Test the quiz functionality
3. Test the chat functionality
4. Verify that API calls return 200 instead of 502

## Troubleshooting

### If you still get 404 errors:

1. **Check Netlify Function logs:**
   - Go to Netlify Dashboard → Functions
   - Look for any deployment errors

2. **Verify file structure:**
   ```
   netlify/
   └── functions/
       └── api/
           ├── groq.js
           ├── study-sessions.js
           ├── achievements.js
           ├── test.js
           ├── user/
           │   └── [id].js
           └── quiz-stats/
               └── [id].js
   ```

3. **Test the function directly:**
   - Visit: `https://your-site.netlify.app/.netlify/functions/api/test`
   - Should return: `{"message":"Netlify Function is working!"}`

4. **Check environment variables:**
   - Verify all variables are set in Netlify dashboard
   - Check that there are no typos

### If you get 502 errors:

1. **Check Groq API key:**
   - Verify `GROQ_API_KEY` is set correctly
   - Test the key manually

2. **Check Supabase credentials:**
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Test connection to Supabase

3. **Check function logs:**
   - Look for specific error messages
   - Check if tables exist in Supabase

### If you get 400 errors:

1. **Check Supabase tables:**
   - Ensure `study_sessions` table exists
   - Check Row Level Security (RLS) policies
   - Verify table structure matches the code

2. **Test Supabase connection:**
   - Try accessing Supabase directly
   - Check if tables are accessible

## Local Development

For local development, you can still use the Next.js API routes. The Netlify Functions are only used in production.

## File Structure Summary

```
├── netlify.toml                    # Netlify configuration
├── netlify/
│   └── functions/
│       ├── package.json            # Function dependencies
│       └── api/
│           ├── groq.js            # Main AI API
│           ├── study-sessions.js  # Study session management
│           ├── achievements.js    # Achievement system
│           ├── test.js            # Test function
│           ├── user/
│           │   └── [id].js       # User data
│           └── quiz-stats/
│               └── [id].js       # Quiz statistics
└── hooks/
    └── useStudySession.ts         # Updated to use API functions
```

## Common Issues & Solutions

### Issue: Function not found (404)
**Solution:** Check that the function file exists in the correct location and has the proper export.

### Issue: Environment variables not working
**Solution:** Ensure variables are set in Netlify dashboard, not in local `.env` files.

### Issue: CORS errors
**Solution:** The functions include proper CORS headers. Check if the request is reaching the function.

### Issue: Supabase connection errors
**Solution:** Verify Supabase URL and key are correct, and tables exist with proper permissions. 