import { NextRequest, NextResponse } from 'next/server';

interface OrganizationData {
  name: string;
  type: string;
  products_services: string;
  objectives: string;
  website_url?: string;
}

interface Objective {
  id: string;
  type: string;
  description: string;
  target_impressions: number;
  target_reach: number;
  start_date?: string;
  end_date?: string;
}

// Helper function to retry API calls with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Check if it's a 503 error
      if (error instanceof Error && error.message.includes('503')) {
        const delay = baseDelay * Math.pow(2, i); // Exponential backoff
        console.log(`Retry ${i + 1}/${maxRetries} after ${delay}ms due to 503 error`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For non-503 errors, throw immediately
        throw error;
      }
    }
  }
  
  throw lastError!;
}

// Function to scrape website content (simplified version)
async function scrapeWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      return 'Website not accessible or content could not be retrieved.';
    }
    
    const html = await response.text();
    
    // Simple HTML parsing to extract text content
    // Remove script and style elements
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ') // Remove all HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Limit content length to avoid token limits
    return textContent.substring(0, 2000);
  } catch (error) {
    console.error('Error scraping website:', error);
    return 'Website content could not be retrieved.';
  }
}

export async function POST(request: NextRequest) {
  try {
    const { organizationData, objectives } = await request.json();

    // Validate input
    if (!organizationData || !objectives || objectives.length === 0) {
      return NextResponse.json(
        { error: 'Organization data and objectives are required' },
        { status: 400 }
      );
    }

    // Check for Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.' },
        { status: 500 }
      );
    }

    // Validate API key format
    if (!geminiApiKey.startsWith('AIza')) {
      return NextResponse.json(
        { error: 'Invalid Gemini API key format. API key should start with "AIza".' },
        { status: 500 }
      );
    }

    // Scrape website content if URL is provided
    let websiteContent = '';
    if (organizationData.website_url) {
      console.log('Scraping website:', organizationData.website_url);
      websiteContent = await scrapeWebsiteContent(organizationData.website_url);
    }

    // Get current date and calculate date range
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Find the earliest start date and latest end date from objectives
    let earliestStart: string | null = null;
    let latestEnd: string | null = null;
    
    objectives.forEach((obj: Objective) => {
      if (obj.start_date) {
        if (!earliestStart || obj.start_date < earliestStart) {
          earliestStart = obj.start_date;
        }
      }
      if (obj.end_date) {
        if (!latestEnd || obj.end_date > latestEnd) {
          latestEnd = obj.end_date;
        }
      }
    });
    
    // If no dates in objectives, use today + 7 to 30 days
    if (!earliestStart) {
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      earliestStart = nextWeek.toISOString().split('T')[0];
    }
    
    if (!latestEnd) {
      const next30Days = new Date(today);
      next30Days.setDate(next30Days.getDate() + 30);
      latestEnd = next30Days.toISOString().split('T')[0];
    }
    
    // Make sure earliestStart is not in the past
    if (earliestStart < todayStr) {
      earliestStart = todayStr;
    }

    console.log('Date range calculation:');
    console.log('- Today:', todayStr);
    console.log('- Earliest start:', earliestStart);
    console.log('- Latest end:', latestEnd);
    console.log('- Objectives with dates:', objectives.filter((o: Objective) => o.start_date || o.end_date));

    // Create comprehensive prompt for Gemini
    const prompt = `You are a social media content strategist and copywriter. Generate 3 high-quality, personalized content suggestions for a business.

IMPORTANT: Today's date is ${todayStr}. All posting dates MUST be between ${earliestStart} and ${latestEnd}.

BUSINESS INFORMATION:
- Company Name: ${organizationData.name}
- Business Type: ${organizationData.type}
- Products/Services: ${organizationData.products_services}
- Business Objectives: ${organizationData.objectives}
${organizationData.website_url ? `- Website: ${organizationData.website_url}` : ''}

BUSINESS OBJECTIVES:
${objectives.map((obj: Objective) => {
  const dateRange = obj.start_date && obj.end_date ? ` [${obj.start_date} to ${obj.end_date}]` : '';
  return `- ${obj.type.replace('_', ' ').toUpperCase()}: ${obj.description}${dateRange} (Target: ${obj.target_impressions || 0} impressions, ${obj.target_reach || 0} reach)`;
}).join('\n')}

${websiteContent ? `WEBSITE CONTENT CONTEXT:\n${websiteContent}` : ''}

Generate 3 diverse content suggestions that:
1. Are tailored to the business's specific industry and objectives
2. Use modern social media best practices
3. Include engaging captions with relevant hashtags
4. Provide clear creative guidance for implementation
5. Target different platforms (Instagram, Facebook, Twitter/LinkedIn)
6. Align with the business objectives listed above
7. Are authentic to the brand voice

For each suggestion, provide:
- title: Creative, catchy title
- platform: Instagram, Facebook, Twitter, or LinkedIn
- content_type: Video, Post, Story, Reel, etc.
- objective: Which business objective this targets
- content_pillar: The content category (Product Education, Company Culture, Customer Success, Industry Insights, etc.)
- description: What the content should be about
- creative_guidance: Specific creative direction and tips
- caption: Engaging social media caption with emojis
- hashtags: Array of relevant hashtags (5-8 hashtags)
- posting_date: Suggested posting date in YYYY-MM-DD format. MUST be a future date between ${earliestStart} and ${latestEnd}. Spread the 3 suggestions across different dates within this range.

CRITICAL: The posting_date field must be:
1. In YYYY-MM-DD format (e.g., ${earliestStart})
2. A date in the future (after ${todayStr})
3. Within the objectives date range (${earliestStart} to ${latestEnd})
4. Each of the 3 suggestions should have different dates

Return ONLY a valid JSON array with 3 objects, each containing these exact fields.`;

    console.log('Sending request to Gemini API...');
    console.log('API Key (first 10 chars):', geminiApiKey.substring(0, 10) + '...');
    console.log('Prompt length:', prompt.length);
    
    // Use REST API directly with retry logic
    const data = await retryWithBackoff(async () => {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    }, 3, 2000); // 3 retries, starting with 2 second delay
    console.log('Gemini API response received');
    console.log('Response structure:', Object.keys(data));
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }
    
    const text = data.candidates[0].content.parts[0].text;
    console.log('Response length:', text.length);
    console.log('First 200 chars:', text.substring(0, 200));

    // Parse Gemini response
    let suggestions;
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', text);
      
      // Fallback to hardcoded suggestions if parsing fails
      suggestions = [
        {
          title: 'Product Showcase Video',
          platform: 'Instagram',
          content_type: 'Video',
          objective: 'Brand Awareness',
          content_pillar: 'Product Education',
          description: `Create an engaging video showcasing ${organizationData.name}'s main product features and benefits`,
          creative_guidance: 'Use bright lighting, show product in action, include customer testimonials',
          caption: `🚀 Introducing ${organizationData.name}'s latest innovation! See how it can transform your daily routine. #ProductLaunch #Innovation`,
          hashtags: ['#ProductLaunch', '#Innovation', '#Tech', '#Lifestyle'],
          posting_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          title: 'Behind-the-Scenes Story',
          platform: 'Facebook',
          content_type: 'Story',
          objective: 'Engagement',
          content_pillar: 'Company Culture',
          description: `Share a behind-the-scenes look at ${organizationData.name}'s team and company culture`,
          creative_guidance: 'Show team members working, office environment, company values in action',
          caption: `Meet the amazing team behind ${organizationData.name}'s success! 💪 Every great product starts with great people. #TeamWork #CompanyCulture`,
          hashtags: ['#TeamWork', '#CompanyCulture', '#BehindTheScenes', '#WorkLife'],
          posting_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          title: 'Industry Insights Post',
          platform: 'LinkedIn',
          content_type: 'Post',
          objective: 'Lead Generation',
          content_pillar: 'Industry Insights',
          description: `Share valuable insights about ${organizationData.type} industry trends and best practices`,
          creative_guidance: 'Use professional imagery, include data or statistics, encourage discussion',
          caption: `📊 Industry insights from ${organizationData.name}: What's shaping the future of ${organizationData.type}? Share your thoughts below! #IndustryInsights #ProfessionalGrowth`,
          hashtags: ['#IndustryInsights', '#ProfessionalGrowth', '#Business', '#Innovation'],
          posting_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ];
    }

    // Add unique IDs to suggestions
    const suggestionsWithIds = suggestions.map((suggestion: Record<string, unknown>) => ({
      ...suggestion,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }));

    return NextResponse.json({
      success: true,
      suggestions: suggestionsWithIds,
      generated_by: 'gemini',
      organization_context: {
        name: organizationData.name,
        type: organizationData.type,
        objectives_count: objectives.length,
        website_analyzed: !!organizationData.website_url
      },
      website_content_used: !!websiteContent
    });

  } catch (error) {
    console.error('Error generating content suggestions:', error);
    
    let errorMessage = 'Unknown error occurred';
    let isRetryableError = false;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      isRetryableError = error.message.includes('503');
      
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        is_retryable: isRetryableError
      });
    }
    
    // Fallback to hardcoded suggestions if Gemini fails
    const fallbackSuggestions = [
      {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        title: 'Product Showcase Video',
        platform: 'Instagram',
        content_type: 'Video',
        objective: 'Brand Awareness',
        content_pillar: 'Product Education',
        description: 'Create an engaging video showcasing your main product features and benefits',
        creative_guidance: 'Use bright lighting, show product in action, include customer testimonials',
        caption: '🚀 Introducing our latest innovation! See how it can transform your daily routine. #ProductLaunch #Innovation',
        hashtags: ['#ProductLaunch', '#Innovation', '#Tech', '#Lifestyle'],
        posting_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    ];

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      generated_by: 'fallback',
      error: `Gemini API failed: ${errorMessage}`,
      retry_suggestion: isRetryableError 
        ? 'The Gemini API is temporarily unavailable (503). This is usually temporary - try again in a few moments.'
        : 'There was an error with the Gemini API. Using fallback suggestions.',
      debug_info: {
        error_type: error instanceof Error ? error.name : 'Unknown',
        is_retryable: isRetryableError,
        retries_attempted: 3,
        api_key_configured: !!process.env.GEMINI_API_KEY,
        api_key_length: process.env.GEMINI_API_KEY?.length || 0
      }
    });
  }
}