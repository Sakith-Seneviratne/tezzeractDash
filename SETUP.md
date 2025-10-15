# Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# LLM API Keys
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Social Media Platform API Keys
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000
```

## Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your URL and keys
3. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
4. Enable Row Level Security (RLS) policies

## Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features Implemented

### ✅ Phase 1: Foundation & Setup
- [x] Next.js project with TypeScript
- [x] TailwindCSS with custom gradient theme
- [x] Supabase client setup
- [x] Database schema with RLS policies
- [x] Authentication flows (login, signup)
- [x] Organization switcher component
- [x] Base layout with navigation (dark/light mode toggle)

### ✅ Phase 2: Authentication & Organization Management
- [x] Auth context for user state management
- [x] Protected routes
- [x] Organization creation
- [x] Multi-tenant architecture
- [x] User session management

### 🚧 Next Steps
- Dashboard module with KPI aggregation
- AI insights panel
- Platform-specific performance cards
- Digital setup module
- Platform integrations
- Content suggestions and calendar
- Settings module

## Current Status

The foundation is complete with:
- Multi-tenant authentication system
- Organization management
- Protected routes
- Responsive UI with dark/light mode
- Gradient theme implementation
- Database schema ready for data

You can now:
1. Sign up for a new account
2. Create an organization
3. Switch between organizations (if you have multiple)
4. Navigate through the dashboard structure
5. Use the responsive navigation with theme switching

The next phase will implement the actual dashboard functionality with data visualization and AI insights.
