<!-- b19d738c-eb68-4e87-a724-a74d429ee986 478646b7-113a-4788-af0b-0016c5d12cd5 -->
# Automatic Open Graph Image Generation

## Overview

Set up build-time OG image generation that captures the first 500px of main content at 1000px viewport width using Puppeteer, then adds proper Open Graph meta tags to all pages.

## Implementation Steps

### 1. Install Dependencies

Add Puppeteer to generate screenshots during build:

- `puppeteer` - for headless browser screenshots

### 2. Create OG Image Generation Script

Create `/scripts/generate-og-images.mjs` that:

- Builds the site first (`npm run build`)
- Starts a local Astro preview server
- Reads and parses `/dist/sitemap.xml` to get all page URLs
- Uses Puppeteer to visit each URL from the sitemap
- Captures 1000x500px screenshot of main content area
- Saves images to `/public/og-images/` directory with URL-based naming
- Automatically generates OG images for all pages in sitemap (homepage, feed posts, resources, legal pages)

### 3. Add OG Meta Tags to BaseLayout

Update `/src/layouts/BaseLayout.astro` to:

- Generate OG image path automatically from `Astro.url.pathname` (e.g., `/feed/about-me/` → `/og-images/feed-about-me.png`)
- Add `og:image` meta tag in `<head>` pointing to the generated screenshot path
- Use `/zmoki.jpg` as fallback if OG image doesn't exist

### 7. Update Build Process

Modify `/package.json` scripts:

- Add `og:generate` script to run the OG image generator
- Update `build` script to run OG generation after building the site
- Ensure `/public/og-images/` directory is created and gitignored

### 8. Test and Verify

- Build the site and verify OG images are generated
- Check that meta tags are properly rendered in HTML
- Test with social media debuggers (Facebook, Twitter/X, LinkedIn)

## Technical Details

**Screenshot Configuration:**

- Viewport: 1000px width
- Capture height: 500px (first 500px of main content)
- Target element: `main` tag from BaseLayout
- Format: PNG or WebP for quality

**File Naming Convention:**

- Homepage: `/og-images/index.png`
- Feed posts: `/og-images/feed-{slug}.png`
- Resources: `/og-images/resources-{slug}.png`
- Legal: `/og-images/legal-{slug}.png`

**Fallback Strategy:**

- If OG image generation fails, use default `/zmoki.jpg`
- Allow manual override via frontmatter `ogImage` field

### To-dos

- [ ] Install Puppeteer dependency
- [ ] Create OG image generation script with Puppeteer
- [ ] Add optional ogImage field to content schemas
- [ ] Add Open Graph and Twitter Card meta tags to BaseLayout
- [ ] Update PostLayout, ResourceLayout, and LegalLayout to pass ogImage prop
- [ ] Update page components to generate and pass OG image paths
- [ ] Update package.json build scripts to include OG generation
- [ ] Build site and verify OG images and meta tags work correctly