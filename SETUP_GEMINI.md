# Quick Setup Guide - Google Gemini Integration

## Step 1: Get Your Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy your API key

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

## Step 3: Restart the Server

```bash
npm run dev
```

## Testing the Integration

1. Open http://localhost:3000 in your browser
2. Enter any topic (e.g., "Solar System", "Machine Learning", "Cell Biology")
3. Click "Draw"
4. Watch as Gemini generates an intelligent diagram!

## Troubleshooting

### Issue: Still seeing mock data
- **Solution**: Make sure `.env.local` exists and contains a valid `GEMINI_API_KEY`
- Check the terminal for the warning: "GEMINI_API_KEY not configured, using mock data"
- Restart the dev server after adding the API key

### Issue: API errors
- **Solution**: Verify your API key is correct
- Check you have quota remaining on your Google Cloud account
- The app will automatically fall back to mock data if Gemini fails

## How It Works

- **With API Key**: Gemini AI generates custom diagrams for any topic
- **Without API Key**: Falls back to predefined mock diagrams for common topics
- **On Error**: Gracefully handles failures and uses mock data

## Cost Information

- Gemini 1.5 Flash is very cost-effective
- Free tier available with generous limits
- Check [Google AI pricing](https://ai.google.dev/pricing) for details

Enjoy your AI-powered whiteboard! 🎨✨
