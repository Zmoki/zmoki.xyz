# Zmoki Digital Garden

This is the source code for [zmoki.xyz](https://zmoki.xyz) - a personal digital garden built with Astro.

## About

This site serves as a digital garden where I share thoughts, resources, and experiences. It's built with modern web technologies and focuses on clean, accessible design.

## Tech Stack

- **Astro** - Static site generator
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **MDX** - Rich content authoring
- **Remark/Rehype** - Content processing

## Getting Started

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)

### Installation

```bash
npm install
```

### Development

```bash
# Start the development server
npm run dev

# The site will be available at http://localhost:4321
```

### Building

```bash
# Build the site for production
npm run build

# Preview the built site
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the site for production
- `npm run preview` - Preview the built site
- `npm run clean` - Clean node_modules and dist folders
- `npm run lhci:mobile` - Run Lighthouse CI audits on mobile
- `npm run lhci:desktop` - Run Lighthouse CI audits on desktop
- `npm run lhci:collect` - Collect Lighthouse data
- `npm run lhci:assert` - Run assertions against performance budgets

## Project Structure

```
src/
├── components/     # Reusable Astro components
├── content/       # MDX/Markdown content
│   ├── feed/      # Blog posts and articles
│   ├── legal/     # Legal pages
│   └── resources/ # Resource pages
├── images/        # Static images
├── layouts/       # Page layouts
└── pages/         # Astro pages and routes
```

## Content Management

Content is written in MDX and Markdown files in the `src/content/` directory. The site automatically generates pages and routes based on the content structure.

### Adding New Content

1. Create a new `.mdx` or `.md` file in the appropriate content directory
2. Add frontmatter with title, description, and other metadata
3. The site will automatically generate the page

### Available Components

- `Time` - Formats and displays dates
- `RawVideo` - Video player with autoplay and responsive design
- `Video` - Enhanced video component
- `PostCard` - Card component for displaying posts
- `ThemeToggle` - Dark/light theme toggle
- `BrevoForm` - Newsletter signup form

## Performance Monitoring

This site uses Lighthouse CI to monitor performance, accessibility, best practices, and SEO scores.

### Local Performance Testing

Run performance audits locally:

```bash
# Test mobile performance
npm run lhci:mobile

# Test desktop performance
npm run lhci:desktop
```

Reports are generated in the `.lighthouseci/` directory with detailed HTML reports.

### Automated Testing

Lighthouse CI runs automatically on:

- Every push to the main branch
- Every pull request

Results are uploaded as GitHub Actions artifacts and include:

- Performance scores (target: ≥90)
- Accessibility scores (target: ≥90)
- Best practices scores (target: ≥90)
- SEO scores (target: ≥90)

View detailed reports in the GitHub Actions tab of any workflow run.
