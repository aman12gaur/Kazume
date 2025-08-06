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
2. **Created Netlify Function** - `netlify/functions/api/groq.js` replaces the Next.js API route
3. **Added redirects** - Routes `/api/*` requests to Netlify Functions

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

If you still get errors:
1. Check Netlify Function logs in the dashboard
2. Verify environment variables are set correctly
3. Ensure the function is being called (check network tab)
4. Check that Supabase credentials are correct

## Local Development

For local development, you can still use the Next.js API routes. The Netlify Functions are only used in production. 