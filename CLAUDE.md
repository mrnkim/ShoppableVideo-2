# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Shoppable Video is a Next.js 14 web application that enables in-video commerce by detecting products in videos using TwelveLabs' Analyze API. It allows viewers to discover and purchase products directly from streaming videos without interrupting playback.

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture Overview

### Technology Stack
- **Frontend Framework**: Next.js 14 with React 18
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS 3 + Material-UI
- **Video Player**: react-player for HLS streaming
- **API Integration**: TwelveLabs API v1.3 for video analysis

### Key Components

1. **Main Application** (`src/app/page.tsx`): 
   - Orchestrates video selection, product detection, and timeline synchronization
   - Manages state for video playback, product visibility, and user interactions
   - Handles metadata caching to optimize performance

2. **Video Player** (`src/components/ProductVideoPlayer.tsx`):
   - Renders HLS video streams with product overlay markers
   - Synchronizes product highlights with video timeline
   - Handles product selection interactions

3. **Product Sidebar** (`src/components/ProductDetailSidebar.tsx`):
   - Displays detected products with Amazon integration
   - Auto-expands/collapses based on video timeline
   - Supports manual navigation to product timestamps

### API Routes

- `/api/videos` - Fetch videos from TwelveLabs index
- `/api/videos/[videoId]` - Get specific video details
- `/api/videos/saveMetadata` - Save analyzed product metadata
- `/api/analyze` - Trigger video analysis with TwelveLabs

### Data Flow

1. **Video Loading**: Fetches videos from TwelveLabs index specified in `NEXT_PUBLIC_DEFAULT_INDEX_ID`
2. **Metadata Check**: Checks for existing product metadata in `user_metadata`
3. **Analysis**: If no metadata exists, triggers TwelveLabs Analyze API to detect products
4. **Caching**: Saves analyzed data back to video's `user_metadata` for future use
5. **Display**: Renders products synchronized with video timeline

## Environment Configuration

Required environment variables:
- `TWELVELABS_API_KEY` - Your TwelveLabs API key
- `NEXT_PUBLIC_DEFAULT_INDEX_ID` - TwelveLabs index containing videos
- `TWELVELABS_API_BASE_URL` - API base URL (defaults to v1.3)

## Type Definitions

Core types are defined in `src/lib/types.ts`:
- `ProductInfo` - Product detection data with timeline, brand, location
- `VideoItem` - Video metadata from TwelveLabs
- `VideoDetail` - Extended video information with HLS data
- Component prop interfaces for type safety