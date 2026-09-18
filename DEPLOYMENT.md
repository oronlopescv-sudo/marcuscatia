# Deployment Guide - Hostinger

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Git repository access

## Quick Start for Hostinger

### 1. Initial Setup
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Test production build locally
npm start
```

### 2. Environment Variables
Create `.env.production.local` file in Hostinger:

```env
GEMINI_API_KEY=""
APP_URL="https://your-domain.com"
NODE_ENV="production"
```

### 3. Hostinger Configuration

**Use Node.js application deployment:**

1. Go to Hostinger Dashboard > Hosting > Manage
2. Click "Web Hosting" > "Web Applications" or "Node.js"
3. Select Node.js version: **18.x** or higher
4. Set **Startup Command**: `npm start`
5. Set **Node Environment**: `production`

### 4. Application Files

Ensure Hostinger can access these files:
```
.
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── .env.production
└── app/
    ├── layout.tsx
    ├── page.tsx
    └── ...other routes
```

### 5. Build Output

The build creates a `.next` folder which is required. Make sure it's included in deployment.

### 6. Troubleshooting

**Issue: "Unsupported framework"**
- ✅ Verify `package.json` exists with `"next"` dependency
- ✅ Check Node.js version is 18+
- ✅ Ensure `npm install` completes successfully
- ✅ Verify `.next` build folder exists

**Issue: Port or connection errors**
- Application runs on port 3000 by default
- Hostinger automatically binds to correct port

**Issue: Missing static files**
- Check `public/` folder contains `logo.png` and `catia-cooking.jpg`
- These are required for the site to display properly

## Production Build

```bash
# Clean previous build
npm run clean

# Install dependencies
npm install --legacy-peer-deps

# Build optimized version
npm run build

# Verify build
npm start
```

## Performance Tips

1. The site uses Zustand for state management - data stored in localStorage
2. Images are optimized via Next.js Image component
3. CSS is minified with Tailwind CSS
4. JavaScript is tree-shaken and minified

## Support

For issues, check:
- Hostinger logs in Dashboard > Hosting > Logs
- Node.js compatibility matrix
- Environment variables configuration
