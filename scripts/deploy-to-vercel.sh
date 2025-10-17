#!/bin/bash

# Tezzeract Dashboard - Vercel Deployment Script
# This script helps you prepare and deploy your app to Vercel

echo "🚀 Tezzeract Dashboard - Vercel Deployment Helper"
echo "================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local file not found"
    echo "📝 Please create .env.local with your environment variables"
    echo "   You can use .env.example as a template"
    echo ""
    echo "Required variables:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
    echo "- GEMINI_API_KEY"
    echo "- OAuth credentials (LinkedIn, Google, Meta, Twitter)"
    echo ""
    read -p "Press Enter to continue after creating .env.local..."
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "   Make sure you're in the project root directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project to check for errors
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "📝 Creating vercel.json configuration..."
    cat > vercel.json << 'EOF'
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
EOF
    echo "✅ vercel.json created"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Deploy to Vercel'"
echo "   git push origin main"
echo ""
echo "2. Go to https://vercel.com and import your GitHub repository"
echo ""
echo "3. Add your environment variables in Vercel dashboard"
echo ""
echo "4. Update OAuth redirect URIs with your Vercel domain"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "✨ Happy deploying!"
