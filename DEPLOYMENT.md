# Production Deployment Guide

## Environment Variables
Create a `.env.production` file with:
```
NODE_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_APP_NAME=Blood Bank Management System
VITE_APP_VERSION=1.0.0
VITE_BASE_PATH=/your-subdirectory  # Only if deploying to a subdirectory
```

## Build Commands
```bash
# Install dependencies
npm install

# Build for production
npm run build:prod

# Preview production build locally
npm run preview
```

## Deployment Checklist
- [ ] Environment variables configured
- [ ] API endpoints updated for production
- [ ] Console logs removed (completed)
- [ ] Test files removed (completed)
- [ ] Build optimized with code splitting
- [ ] Assets minified and compressed
- [ ] Source maps disabled for security
- [ ] Routing configured correctly (fixed)

## Performance Optimizations Applied
- Code splitting for vendor libraries
- Terser minification with console removal
- Asset optimization
- Bundle analysis available via `npm run analyze`

## Routing Configuration
- Base path set to root ("/") by default
- For subdirectory deployment, set VITE_BASE_PATH environment variable
- React Router configured to handle the base path correctly

## Security Considerations
- Source maps disabled in production
- Console logs removed
- Debug information stripped
- Environment variables properly configured
