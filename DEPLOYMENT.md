# InSync - Deployment Guide

## Pre-Deployment Checklist

Before deploying, make sure to:

1. **Update URLs**: Replace `insync.com` in these files with your actual domain:
   - `index.html` (Open Graph & Twitter meta tags, canonical URL)
   - `robots.txt`
   - `sitemap.xml`

2. **Create Icons**: Generate proper PNG icons from the SVG:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)
   - `og-image.png` (1200x630 pixels for social sharing)

   You can use online tools like:
   - https://realfavicongenerator.net
   - https://www.canva.com

---

## Deployment Options

### Option 1: Netlify (Recommended - Free & Easy)

1. **Create Netlify Account**: Go to https://netlify.com and sign up

2. **Deploy via Drag & Drop**:
   - Go to https://app.netlify.com/drop
   - Drag the entire `valentine-card-creator` folder
   - Done! You'll get a URL like `random-name.netlify.app`

3. **Custom Domain** (Optional):
   - Go to Site Settings > Domain Management
   - Add your custom domain
   - Follow DNS instructions

4. **Enable HTTPS**: Automatic with Netlify

### Option 2: Vercel (Free & Fast)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd valentine-card-creator
   vercel
   ```

3. Follow the prompts to deploy

### Option 3: GitHub Pages (Free)

1. **Create GitHub Repository**:
   ```bash
   cd valentine-card-creator
   git init
   git add .
   git commit -m "Initial commit - InSync Valentine Card Creator"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/insync.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**:
   - Go to Repository Settings > Pages
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Save

3. Your site will be at: `https://YOUR_USERNAME.github.io/insync/`

### Option 4: Cloudflare Pages (Free & Fast)

1. Push code to GitHub (see Option 3, step 1)

2. Go to https://pages.cloudflare.com

3. Connect your GitHub repository

4. Build settings:
   - Build command: (leave empty)
   - Build output directory: `/`

5. Deploy!

---

## Post-Deployment

1. **Test on Multiple Devices**:
   - Desktop (Chrome, Firefox, Safari, Edge)
   - Mobile (iOS Safari, Android Chrome)

2. **Test Core Features**:
   - Card themes work
   - Text input and colors work
   - Stickers can be added
   - Photo upload and memories work
   - Download HTML works
   - Card flip works on mobile

3. **Submit to Search Engines**:
   - Google Search Console: https://search.google.com/search-console
   - Bing Webmaster Tools: https://www.bing.com/webmasters

4. **Monitor Performance**:
   - Use Google Lighthouse in Chrome DevTools
   - Target scores: Performance 90+, Accessibility 90+

---

## File Structure

```
valentine-card-creator/
├── index.html          # Main HTML file
├── styles.css          # All styles
├── script.js           # All JavaScript
├── manifest.json       # PWA manifest
├── robots.txt          # Search engine crawling rules
├── sitemap.xml         # Sitemap for SEO
├── icon-192.svg        # App icon (SVG)
├── icon-192.png        # App icon (create this)
├── icon-512.png        # Large app icon (create this)
├── og-image.png        # Social sharing image (create this)
├── _headers            # Netlify/Cloudflare headers
├── _redirects          # Netlify redirects
└── DEPLOYMENT.md       # This file
```

---

## Quick Deploy Commands

### Netlify CLI
```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

---

## Need Help?

- Netlify Docs: https://docs.netlify.com
- Vercel Docs: https://vercel.com/docs
- GitHub Pages Docs: https://docs.github.com/pages

Good luck with your deployment! 💕
