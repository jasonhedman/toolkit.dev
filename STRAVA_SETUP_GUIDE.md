# Complete Strava Toolkit Setup Guide

## ✅ What's Already Done

I've completed the following setup steps for you:

1. **✅ Dependencies Installed**: All npm packages are installed
2. **✅ AUTH_SECRET Generated**: Secure authentication secret created  
3. **✅ Strava Toolkit Created**: Complete toolkit with 9 tools implemented
4. **✅ Environment Configuration**: Added Strava OAuth support
5. **✅ UI Components Built**: Activity cards, stats dashboards, and visualizations
6. **✅ Development Server Started**: Running in background

## 🔧 Remaining Setup Steps

### 1. Set Up Your Database

Since Docker/Podman isn't available, you need to set up a PostgreSQL database:

#### Option A: Use a Cloud Database (Recommended)
- **Supabase**: Go to [supabase.com](https://supabase.com) → Create project → Get connection string
- **Neon**: Go to [neon.tech](https://neon.tech) → Create database → Get connection string
- **Railway**: Go to [railway.app](https://railway.app) → Create PostgreSQL → Get connection string

#### Option B: Local PostgreSQL Installation
```bash
# macOS with Homebrew
brew install postgresql
brew services start postgresql
createdb toolkit_dev

# Your connection string will be:
# postgresql://username:password@localhost:5432/toolkit_dev
```

### 2. Update Your .env.local File

Open your `.env.local` file and update these values:

```env
# Replace with your actual database URL
DATABASE_URL="your_actual_database_connection_string_here"

# Add your OpenRouter API key (get from https://openrouter.ai/)
OPENROUTER_API_KEY="sk-or-v1-your_actual_openrouter_key_here"

# Strava OAuth (uncomment and add your credentials)
AUTH_STRAVA_ID=your_strava_client_id
AUTH_STRAVA_SECRET=your_strava_client_secret
```

### 3. Create Strava OAuth App

1. **Go to Strava Developers**: https://developers.strava.com/
2. **Click "Create App"**
3. **Fill in details**:
   - Application Name: "Your App Name"
   - Category: Choose appropriate category
   - Club: Leave blank (optional)
   - Website: `http://localhost:3000`
   - Authorization Callback Domain: `localhost`
4. **Copy your credentials**:
   - Client ID → Use as `AUTH_STRAVA_ID`
   - Client Secret → Use as `AUTH_STRAVA_SECRET`

### 4. Run Database Migrations

Once your database is set up:

```bash
npm run db:generate
```

If you encounter errors:
```bash
npm run db:push  # Alternative approach
```

### 5. Get Your OpenRouter API Key

1. **Visit**: https://openrouter.ai/
2. **Sign up/Login**
3. **Go to Keys section**
4. **Create API key**
5. **Add to .env.local** as `OPENROUTER_API_KEY`

## 🚀 Testing Your Setup

### 1. Check the Development Server

Visit: http://localhost:3000

You should see the main toolkit interface.

### 2. Test Strava Authentication

1. **Click "Sign In"**
2. **Choose "Strava" option** (should appear if credentials are set)
3. **Authorize your app** on Strava
4. **Return to the app** - you should be logged in

### 3. Test the Strava Toolkit

After authentication, try these prompts:

- "Show me my recent activities"
- "What are my running statistics for this year?"
- "Find popular cycling segments near San Francisco"
- "Analyze my last workout"

## 🛠️ Available Strava Tools

Your toolkit includes 9 powerful Strava tools:

1. **Get Athlete Profile** - User info and premium status
2. **Get Athlete Activities** - Activity lists with filtering
3. **Get Activity Details** - Deep workout analysis
4. **Get Athlete Stats** - Comprehensive statistics
5. **Search Segments** - Find popular segments
6. **Get Segment Details** - Segment information
7. **Get Segment Leaderboard** - Competitive rankings
8. **Get Routes** - Saved routes (Premium)
9. **Get Athlete Zones** - Training zones

## 🎯 Example Use Cases

Users can now ask:
- *"Show me my running pace trends over the last 3 months"*
- *"Find challenging cycling routes near my location"*
- *"Compare my performance on segments to other athletes"*
- *"Create a training plan based on my recent activities"*
- *"What are my personal records and achievements?"*

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check if your database URL is correct
npm run db:studio  # Opens Prisma Studio
```

### Environment Variable Issues
```bash
# Restart development server after changes
# Kill the current process and run:
npm run dev
```

### Strava OAuth Issues
- Ensure "Authorization Callback Domain" is set to `localhost`
- Check that CLIENT_ID and CLIENT_SECRET are correct
- Make sure scopes include `read,activity:read_all`

### Missing Dependencies
```bash
# If you see missing package errors:
npm install @icons-pack/react-simple-icons --legacy-peer-deps
```

## 📚 Additional Configuration

### Optional: Add More OAuth Providers

Uncomment in `.env.local`:
```env
# Google OAuth
AUTH_GOOGLE_ID=your_google_client_id
AUTH_GOOGLE_SECRET=your_google_client_secret

# GitHub OAuth  
AUTH_GITHUB_ID=your_github_client_id
AUTH_GITHUB_SECRET=your_github_client_secret
```

### Optional: Add More Toolkiting APIs

```env
# Web Search
EXA_API_KEY=your_exa_api_key

# Code Interpreter
E2B_API_KEY=your_e2b_api_key

# Memory
MEM0_API_KEY=your_mem0_api_key
```

## ✅ Success Checklist

- [ ] Database connected and migrations run
- [ ] OpenRouter API key added
- [ ] Strava OAuth app created and configured
- [ ] Can sign in with Strava
- [ ] Can access Strava toolkit in chat
- [ ] AI responds to Strava-related queries

## 🎉 You're All Set!

Once you complete these steps, you'll have a fully functional AI chatbot with comprehensive Strava fitness tracking capabilities!

## 🆘 Need Help?

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure database is accessible
4. Confirm Strava OAuth settings match exactly

The Strava toolkit is now ready to provide personalized fitness insights, activity analysis, and training recommendations to your users! 