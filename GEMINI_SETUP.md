# Gemini API Setup Guide

This guide will help you set up Google's Gemini AI API for generating personalized content suggestions.

## 1. Get Your Gemini API Key

1. **Go to Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Click "Get API Key"** in the top right corner
4. **Create a new API key** or use an existing one
5. **Copy your API key**

## 2. Add API Key to Environment Variables

Add your Gemini API key to your `.env.local` file:

```bash
# Add this line to your .env.local file
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual API key.

## 3. Restart Your Development Server

After adding the API key, restart your Next.js development server:

```bash
npm run dev
```

## 4. Test the Integration

1. **Go to Setup Page**: `http://localhost:3000/setup`
2. **Complete Organization Setup**: Fill in your organization details
3. **Add Business Objectives**: Set your goals and targets
4. **Go to Content Suggestions**: Click on the "Content Suggestions" tab
5. **Generate Suggestions**: Click "Generate Suggestions"

## 5. What Gemini Does

When you generate content suggestions, Gemini AI will:

- **Analyze your organization data** (name, type, products/services, objectives)
- **Scrape your website** (if you provided a URL) to understand your brand
- **Generate 3 personalized content suggestions** tailored to your business
- **Include detailed captions, hashtags, and creative guidance**
- **Target different platforms** (Instagram, Facebook, Twitter, LinkedIn)
- **Align with your business objectives**

## 6. Features

### Website Analysis
- Automatically scrapes your website content
- Extracts key information about your brand
- Uses this context to create more relevant suggestions

### Personalized Content
- Tailored to your specific industry and business type
- Aligned with your defined objectives
- Uses modern social media best practices

### Multiple Platforms
- Instagram (Posts, Stories, Reels)
- Facebook (Posts, Stories)
- Twitter (Tweets, Threads)
- LinkedIn (Professional posts)

### Detailed Guidance
- Creative direction and tips
- Engaging captions with emojis
- Relevant hashtags
- Suggested posting dates

## 7. Troubleshooting

### API Key Issues
- Make sure your API key is correct
- Ensure it's added to `.env.local` (not `.env`)
- Restart your development server after adding the key

### Website Scraping Issues
- Some websites may block scraping
- The system will still work without website content
- Check browser console for error messages

### Fallback System
- If Gemini API fails, the system uses fallback suggestions
- You'll see a notification about which method was used
- All functionality remains available

## 8. Cost Considerations

- Gemini API has a free tier with generous limits
- Check Google AI Studio for current pricing
- Monitor your usage in the Google AI Studio dashboard

## 9. Privacy & Security

- Your organization data is stored locally in your browser
- Website content is only used for generating suggestions
- No data is permanently stored on external servers
- API calls are made directly from your application

---

**Need Help?** Check the browser console for detailed error messages and API responses.
