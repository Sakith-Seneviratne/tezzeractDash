# 🚀 Dashboard + Content Generation Tool

A comprehensive dashboard and content generation platform built with Next.js, featuring AI-powered insights, multi-platform analytics, and content management capabilities.

## ✨ Features

### 🎯 **Core Modules**
- **Dashboard**: Real-time KPI aggregation with AI insights
- **Digital Setup**: Platform connections, objectives, competitor tracking
- **Content Suggestions**: AI-generated content ideas with editing capabilities
- **Content Calendar**: Dual calendar/table view with rich editing
- **Settings**: User, organization, and integration management

### 🔗 **Platform Integrations**
- **Meta (Facebook & Instagram)**: OAuth integration with analytics
- **LinkedIn**: Company page analytics and insights
- **Google Analytics**: Website performance metrics
- **CSV Upload**: Custom data import and mapping

### 🤖 **AI Integration**
- **Multi-Provider Support**: OpenAI, Anthropic, Google Gemini
- **Content Generation**: AI-powered content suggestions
- **Analytics Insights**: Intelligent performance analysis
- **Configurable Models**: Temperature, tokens, and provider selection

### 🎨 **Modern UI/UX**
- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching with system preference
- **Gradient Theme**: Custom #00378A → #00A9EE color scheme
- **Smooth Animations**: Fade-in, slide-up, and hover effects
- **Accessibility**: Focus management and keyboard navigation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React 19
- **Styling**: TailwindCSS with custom components
- **Database**: Supabase (PostgreSQL + Auth + Real-time)
- **Authentication**: Supabase Auth with multi-tenant support
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **Fonts**: Figtree from Google Fonts
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Platform API credentials (Meta, LinkedIn, Google)

### 1. Clone and Install
```bash
git clone <repository-url>
cd dashboard
npm install
```

### 2. Environment Setup
Create `.env.local` file:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# LLM Provider API Keys
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_AI_API_KEY=your_google_ai_api_key

# Platform Integration Credentials
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Encryption Key (generate 32-character random string)
ENCRYPTION_KEY=your_32_character_encryption_key
```

### 3. Database Setup
1. Create a Supabase project
2. Run the SQL from `supabase-schema.sql` in your Supabase SQL editor
3. Create storage buckets: `avatars`, `organization-logos`, `csv-uploads`

### 4. Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── dashboard/        # Dashboard-specific components
│   ├── calendar/         # Calendar components
│   └── setup/            # Setup components
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase configuration
│   ├── integrations/     # Platform integrations
│   ├── llm/              # LLM provider abstractions
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
└── hooks/                # Custom React hooks
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run audit:security   # Security audit
npm run audit:performance # Performance check
npm run audit            # Run all audits

# Deployment
npm run deploy           # Deploy to Vercel (with audits)
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Organization-level data isolation
- **Environment Variables**: All sensitive data secured
- **OAuth Integration**: Secure platform connections
- **Token Management**: Automatic refresh and encryption
- **Protected Routes**: Authentication middleware
- **Input Validation**: Zod schema validation

## 🚀 Deployment

### Vercel Deployment
1. Connect to Vercel: `vercel login`
2. Set environment variables in Vercel dashboard
3. Deploy: `npm run deploy`

### Platform Setup
- **Meta**: Configure OAuth redirect URIs
- **LinkedIn**: Set up OAuth application
- **Google Analytics**: Enable APIs and create credentials

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Features Overview

### Dashboard Module
- Real-time KPI aggregation across platforms
- AI-powered insights and recommendations
- Interactive charts and visualizations
- Platform-specific performance cards
- Time range selection and filtering

### Content Management
- AI-generated content suggestions
- Editable content calendar with dual views
- Rich text editing and file attachments
- Status management and scheduling
- Platform-specific optimization

### Digital Setup
- Platform connection management
- Objective setting and tracking
- Competitor analysis and monitoring
- CSV data import and mapping
- Integration testing and sync

### Settings & Configuration
- User profile and preferences
- Organization management
- Team member access control
- LLM provider configuration
- Integration settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and audits
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment issues
- Review [SETUP.md](./SETUP.md) for configuration help
- Run `npm run audit` for security and performance checks

## 🎯 Roadmap

- [ ] Additional platform integrations (Twitter, TikTok)
- [ ] Advanced analytics and reporting
- [ ] Team collaboration features
- [ ] Mobile application
- [ ] API rate limiting and caching
- [ ] Advanced AI features and customization# tezzeractDash
