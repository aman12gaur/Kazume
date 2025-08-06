# Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Changes
- [ ] `netlify.toml` file created
- [ ] Netlify Functions created in `netlify/functions/api/`
- [ ] `useStudySession.ts` updated to use API functions
- [ ] All files committed to Git

### ✅ Environment Variables (Set in Netlify Dashboard)
- [ ] `GROQ_API_KEY` - Your Groq API key
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key

### ✅ Supabase Setup
- [ ] `study_sessions` table exists
- [ ] `achievements` table exists
- [ ] `interactions` table exists
- [ ] `users` table exists
- [ ] `quiz_results` table exists
- [ ] Row Level Security (RLS) policies configured or disabled for testing

## Deployment Steps

### 1. Push to Git
```bash
git add .
git commit -m "Add Netlify Functions for API routes"
git push origin main
```

### 2. Netlify Setup
1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Connect your repository
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
4. Add environment variables (see above)
5. Deploy

### 3. Test Deployment

#### Test 1: Basic Function
Visit: `https://your-site.netlify.app/.netlify/functions/api/test`
Expected: `{"message":"Netlify Function is working!"}`

#### Test 2: Groq API
Try starting a quiz or chat
Expected: No 502 errors, API calls work

#### Test 3: Study Sessions
Try using study session features
Expected: No 400 errors, data saves correctly

## Troubleshooting

### If Test 1 fails (404):
- Check that `netlify/functions/api/test.js` exists
- Verify `netlify.toml` has correct redirects
- Check Netlify Function logs

### If Test 2 fails (502):
- Verify `GROQ_API_KEY` is set correctly
- Check Netlify Function logs for Groq API errors
- Test Groq API key manually

### If Test 3 fails (400):
- Verify Supabase tables exist
- Check Supabase credentials
- Disable RLS temporarily for testing

## File Structure Verification

```
netlify/
├── functions/
│   ├── package.json
│   └── api/
│       ├── groq.js ✅
│       ├── study-sessions.js ✅
│       ├── achievements.js ✅
│       ├── test.js ✅
│       ├── user/
│       │   └── [id].js ✅
│       └── quiz-stats/
│           └── [id].js ✅
└── netlify.toml ✅
```

## Environment Variables Format

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Common Error Messages

- **404 Not Found**: Function file missing or wrong path
- **502 Bad Gateway**: Environment variable missing or API error
- **400 Bad Request**: Supabase table missing or RLS blocking
- **CORS Error**: Function not being called (check redirects)

## Success Indicators

✅ Site loads without console errors
✅ Quiz functionality works
✅ Chat functionality works  
✅ Study sessions save correctly
✅ No 502 errors in Network tab
✅ API calls return 200 status codes 