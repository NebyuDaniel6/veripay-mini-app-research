#!/bin/bash

echo "🚀 Deploying VeriPay Mini App Research Project..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Check if we're in a git repository
    if [ -d ".git" ]; then
        echo "📝 Committing changes..."
        git add .
        git commit -m "Deploy VeriPay Mini App Research Project - $(date)"
        
        echo "�� Pushing to GitHub..."
        git push origin main
        
        echo "🎉 Deployment complete!"
        echo "📱 Your Mini App will be available at:"
        echo "   https://yourusername.github.io/veripay-mini-app-research"
        echo ""
        echo "🔧 Next steps:"
        echo "   1. Go to @BotFather in Telegram"
        echo "   2. Send /mybots and select your bot"
        echo "   3. Choose 'Bot Settings' → 'Mini App'"
        echo "   4. Enter your GitHub Pages URL"
        echo "   5. Test your Mini App!"
    else
        echo "⚠️  Not a git repository. Please initialize git and push to GitHub."
        echo "   git init"
        echo "   git add ."
        echo "   git commit -m 'Initial commit'"
        echo "   git remote add origin <your-repo-url>"
        echo "   git push -u origin main"
    fi
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
