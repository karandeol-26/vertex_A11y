# Vertex A11y

A Chrome extension that scans websites for accessibility violations and provides actionable recommendations to help developers build more inclusive web experiences.

## The Problem

Web accessibility remains a significant challenge in modern development:

- **1.3 billion people** worldwide live with disabilities and depend on accessible websites
- **96.3% of homepages** have detectable WCAG failures according to WebAIM's annual accessibility analysis
- Accessibility testing often happens late in development, making fixes expensive and time-consuming
- Existing tools either lack actionable guidance or require extensive accessibility knowledge to interpret

## The Solution

Vertex A11y provides instant, developer-friendly accessibility scanning with:

- **Real-time violation detection** - Scans pages for ADA/WCAG compliance issues
- **Visual highlighting** - Highlights problematic elements directly on the page
- **Actionable recommendations** - Provides specific code fixes, not just problem descriptions
- **Compliance scoring** - Estimates overall accessibility compliance with tiered ratings (A, AA, AAA)
- **Comprehensive coverage** - Checks images, forms, keyboard navigation, color contrast, semantic structure, and more

## Key Features

### Automated Scanning
- Image alt text validation
- Color contrast analysis (WCAG AA/AAA standards)
- Keyboard accessibility verification
- Form label associations
- Semantic HTML structure
- Media caption requirements
- Zoom/viewport configuration

### Developer Experience
- **Instant feedback** - No page reloads or external tools required
- **Element highlighting** - Click "Reveal on page" to visually locate issues
- **Code snippets** - Shows both problematic code and suggested fixes
- **Issue filtering** - View all issues or focus on fixable ones
- **Sorting options** - Organize by issue type or severity level

### Visual Design
- Modern, intuitive interface built with contemporary web technologies
- Smooth animations and micro-interactions using Motion library
- Dark theme optimized for developer workflows
- Responsive design that works across different screen sizes

## What Makes It Different

Unlike existing accessibility tools, Vertex A11y focuses on:

1. **Developer velocity** - Fixes are actionable code snippets, not abstract guidelines
2. **Visual workflow integration** - Highlights elements directly in the browser context
3. **Instant feedback loop** - No need to navigate between tools or upload sites for testing
4. **Practical prioritization** - Clear severity levels help focus on high-impact issues first
5. **Educational approach** - Each violation includes learning context, not just error detection

## Technologies Used

### Frontend
- **Vanilla JavaScript** - Lightweight, no framework dependencies for content scripts
- **Motion.js** - Smooth animations and micro-interactions in the popup UI
- **Chrome Extension APIs** - Manifest V3 with proper content script isolation

### Development Tools
- **ESBuild** - Fast bundling and build optimization
- **Chrome Extension Manifest V3** - Latest extension platform standards

### Accessibility Testing
- **WCAG 2.1 Guidelines** - Implements Level A, AA, and AAA compliance checks
- **Color contrast algorithms** - Proper luminance calculations following WCAG standards
- **Semantic HTML validation** - Checks for proper landmark usage and heading structure

## Impact

### For Developers
- **Faster iteration** - Catch accessibility issues during development, not after deployment
- **Lower learning curve** - Provides specific solutions rather than requiring deep accessibility expertise
- **Better code quality** - Encourages accessible-first development practices

### For Users with Disabilities
- **Improved web experience** - Helps create websites that work for screen readers, keyboard navigation, and assistive technologies
- **Better compliance** - Supports developers in meeting ADA and Section 508 requirements
- **Inclusive design** - Promotes universal design principles that benefit all users

### For Organizations
- **Reduced legal risk** - Proactive accessibility compliance helps avoid ADA lawsuits
- **Cost savings** - Earlier detection means cheaper fixes compared to post-deployment remediation
- **Broader reach** - Accessible websites serve larger audiences and improve SEO

## Getting Started

1. **Install the Extension**
   - Download from the Chrome Web Store (coming soon)
   - Or load unpacked from this repository for development

2. **Scan Any Website**
   - Navigate to any webpage
   - Click the Vertex A11y icon in your browser toolbar
   - Click "Scan this Page"

3. **Review and Fix Issues**
   - Review the compliance score and issue breakdown
   - Click "Reveal on page" to highlight problematic elements
   - Copy the provided code fixes and apply them to your project

## Development

```bash
# Install dependencies
npm install

# Build bundled files
npx esbuild popup.js --bundle --outfile=popup.bundle.js
npx esbuild animations.js --bundle --outfile=animations.bundle.js

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked" and select this directory
```

## Supported Accessibility Checks

- ✅ **Images**: Alt text presence and quality
- ✅ **Color Contrast**: WCAG AA/AAA compliance (4.5:1 / 7:1 ratios)
- ✅ **Keyboard Navigation**: Focusable interactive elements
- ✅ **Semantic HTML**: Proper landmark usage (main, nav, header, footer)
- ✅ **Forms**: Label associations and accessibility
- ✅ **Media**: Video caption requirements
- ✅ **Viewport**: Zoom and scaling configuration
- ✅ **Heading Structure**: Logical heading hierarchy
