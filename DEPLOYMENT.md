# 🚀 Deployment Guide - Al Hayat GPT

This guide covers the complete deployment process for Al Hayat GPT across different platforms and environments.

## 📋 Pre-deployment Checklist

### Environment Setup
- [ ] OpenAI API key configured
- [ ] Clerk authentication setup complete
- [ ] Sanity CMS configured and content published
- [ ] Environment variables configured
- [ ] Build process tested locally
- [ ] All tests passing

### Security Review
- [ ] API keys are environment variables (not hardcoded)
- [ ] CORS settings configured properly
- [ ] Authentication flows tested
- [ ] Input validation implemented
- [ ] Rate limiting configured

## 🌐 Vercel Deployment (Recommended)

### Automatic Deployment

1. **Connect Repository**
   ```bash
   # Push your code to GitHub
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `ahgpt` repository

3. **Configure Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm install",
     "devCommand": "npm run dev"
   }
   ```

4. **Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=sk-...
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/chat
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/chat
   
   # Sanity CMS
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=skXXX...
   NEXT_PUBLIC_SANITY_API_VERSION=2023-12-01
   
   # Application
   NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
   NEXT_PUBLIC_WIDGET_SDK_URL=https://your-domain.vercel.app
   
   # Optional: Analytics & Monitoring
   VERCEL_ANALYTICS_ID=your_analytics_id
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build completion
   - Test deployment at your Vercel URL

### Custom Domain Setup

1. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain (e.g., `alhayatgpt.com`)

2. **DNS Configuration**
   ```dns
   # Add these DNS records at your domain provider:
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

3. **SSL Certificate**
   - Vercel automatically provisions SSL certificates
   - Verify HTTPS is working

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  ahgpt:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      - CLERK_SECRET_KEY=${CLERK_SECRET_KEY}
      - NEXT_PUBLIC_SANITY_PROJECT_ID=${NEXT_PUBLIC_SANITY_PROJECT_ID}
      - SANITY_API_TOKEN=${SANITY_API_TOKEN}
    volumes:
      - ./.env.production:/app/.env.production:ro
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - ahgpt
    restart: unless-stopped
```

### Build and Deploy
```bash
# Build the Docker image
docker build -t ahgpt .

# Run the container
docker run -p 3000:3000 --env-file .env.production ahgpt

# Or use Docker Compose
docker-compose up -d
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Install Amplify CLI**
   ```bash
   npm install -g @aws-amplify/cli
   amplify configure
   ```

2. **Initialize Amplify**
   ```bash
   amplify init
   ```

3. **Configure Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

4. **Deploy**
   ```bash
   amplify add hosting
   amplify publish
   ```

### Using AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 22.04 LTS
   - t3.medium or larger recommended
   - Configure security groups (ports 22, 80, 443)

2. **Install Dependencies**
   ```bash
   # Connect to your instance
   ssh -i your-key.pem ubuntu@your-instance-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx -y
   ```

3. **Deploy Application**
   ```bash
   # Clone repository
   git clone https://github.com/burhankhatib/ahgpt.git
   cd ahgpt
   
   # Install dependencies
   npm install
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start npm --name "ahgpt" -- start
   pm2 startup
   pm2 save
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Environment-Specific Configurations

### Production Environment
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Performance optimizations
NEXT_PUBLIC_APP_URL=https://alhayatgpt.com
NEXT_PUBLIC_SANITY_DATASET=production

# Security headers
SECURITY_HEADERS_ENABLED=true
```

### Staging Environment
```env
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.alhayatgpt.com
NEXT_PUBLIC_SANITY_DATASET=staging
```

### Development Environment
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_DATASET=development
```

## 📊 Monitoring & Analytics

### Health Checks
```typescript
// pages/api/health.ts
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version,
    environment: process.env.NODE_ENV
  });
}
```

### Performance Monitoring
- Set up Vercel Analytics
- Configure Sentry for error tracking
- Implement logging with Winston
- Monitor API response times

### Uptime Monitoring
```bash
# Add uptime monitoring services:
# - UptimeRobot
# - Pingdom
# - StatusCake
```

## 🔒 Security Considerations

### SSL/TLS Configuration
```nginx
# Strong SSL configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
```

### Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Environment Variable Issues**
   ```bash
   # Verify variables are loaded
   npm run env-check
   ```

3. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

### Deployment Validation

```bash
# Health check
curl https://your-domain.com/api/health

# Widget SDK check
curl https://your-domain.com/widget-sdk.js

# Chat API check
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}'
```

## 📝 Post-deployment Tasks

1. **Test all functionality**
   - [ ] User registration/login
   - [ ] Chat functionality
   - [ ] Widget integration
   - [ ] Admin dashboard
   - [ ] Export features

2. **Performance optimization**
   - [ ] Enable CDN caching
   - [ ] Optimize images
   - [ ] Configure database connection pooling
   - [ ] Set up caching strategies

3. **Monitoring setup**
   - [ ] Configure alerts
   - [ ] Set up log aggregation
   - [ ] Monitor key metrics
   - [ ] Set up backup procedures

## 🔄 Continuous Deployment

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

This deployment guide ensures your Al Hayat GPT application is deployed securely and efficiently across different platforms. Choose the deployment method that best fits your needs and infrastructure requirements. 