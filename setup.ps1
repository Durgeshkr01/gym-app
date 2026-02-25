# 🎯 Installation Script
# Run this script to setup the project automatically

Write-Host "🏋️ SG Fitness Evolution - Auto Setup Script" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    pause
    exit
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "✅ NPM installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM not found!" -ForegroundColor Red
    pause
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📱 Setting up Mobile App..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navigate to mobile-app directory
Set-Location -Path "mobile-app"

# Install Expo CLI globally
Write-Host "Installing Expo CLI..." -ForegroundColor Yellow
try {
    npm install -g expo-cli --silent
    Write-Host "✅ Expo CLI installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Expo CLI installation failed, continuing anyway..." -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "Installing mobile app dependencies..." -ForegroundColor Yellow
Write-Host "(This may take 2-5 minutes)" -ForegroundColor Gray
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Mobile app dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some dependencies failed to install. You may need to run 'npm install' again." -ForegroundColor Yellow
}

# Go back to root
Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🖥️ Setting up Backend..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Navigate to backend directory
Set-Location -Path "backend"

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some backend dependencies failed to install." -ForegroundColor Yellow
}

# Create .env file if it doesn't exist
if (!(Test-Path ".env")) {
    Write-Host ""
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please update it with your Firebase credentials." -ForegroundColor Green
}

# Go back to root
Set-Location -Path ".."

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Setup Firebase:" -ForegroundColor White
Write-Host "   - Read FIREBASE_SETUP.md for detailed instructions" -ForegroundColor Gray
Write-Host "   - Create Firebase project at https://console.firebase.google.com/" -ForegroundColor Gray
Write-Host "   - Update mobile-app/firebase-config.js with your Firebase config" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Run the Mobile App:" -ForegroundColor White
Write-Host "   cd mobile-app" -ForegroundColor Gray
Write-Host "   npx expo start" -ForegroundColor Gray
Write-Host ""
Write-Host "3. (Optional) Run Backend:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm start" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - README.md - Project overview" -ForegroundColor Gray
Write-Host "   - PROJECT_SETUP.md - Detailed setup guide" -ForegroundColor Gray
Write-Host "   - QUICK_START.md - Quick start commands" -ForegroundColor Gray
Write-Host "   - FIREBASE_SETUP.md - Firebase configuration" -ForegroundColor Gray
Write-Host "   - ARCHITECTURE.md - System architecture" -ForegroundColor Gray
Write-Host ""

Write-Host "🏋️ Happy Coding! Build an amazing gym app! 💪" -ForegroundColor Green
Write-Host ""
pause
