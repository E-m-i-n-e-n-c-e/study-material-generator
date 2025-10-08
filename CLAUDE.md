# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A full-stack application that extracts YouTube video transcripts and transforms them into AI-powered, structured study materials. The system consists of an Express.js backend API and a Next.js frontend application.

## Development Commands

### Backend (Express + TypeScript)
```bash
cd backend
npm run dev      # Development with hot reload (uses ts-node and nodemon)
npm run build    # Compile TypeScript to JavaScript (outputs to dist/)
npm start        # Run production build from dist/
```

### Frontend (Next.js 15 + React 19)
```bash
cd frontend
npm run dev      # Development with Turbopack (port 3000)
npm run build    # Production build with Turbopack
npm start        # Start production server
npm run lint     # ESLint
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 4000)
- `OPENROUTER_API_KEY` - Required for AI-powered study material generation (OpenRouter API key)
- `YT_LANG` - YouTube transcript language preference (default: 'en')
- `APP_URL` - Application URL for OpenRouter headers (default: http://localhost:3000)
- `APP_NAME` - Application name for OpenRouter headers (default: Study Material Generator)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000)

## Architecture

### Backend Service Layer Pattern

The backend follows a clean service-oriented architecture:

**Controllers** (`backend/src/controllers/studyController.ts`)
- Handle HTTP requests/responses
- Validate input and parse YouTube URLs
- Delegate business logic to services
- Return appropriate HTTP status codes

**Services** (`backend/src/services/`)
- `transcriptService.ts` - YouTube transcript extraction using youtubei.js
  - Uses a singleton Innertube client to avoid re-initialization
  - Merges short segments (< 5 seconds) for better readability
  - Handles multiple YouTube URL formats (youtu.be, youtube.com)
  - Returns typed `TranscriptResult` with error codes (NO_TRANSCRIPT, INVALID_VIDEO, etc.)
- `summarizeService.ts` - AI-powered study material generation via OpenRouter
  - Uses OpenAI SDK configured for OpenRouter endpoint
  - Formats transcripts with timestamps for better AI context
  - Structured prompt engineering for educational content
  - Fallback demo mode if no API key provided
- `pdfService.ts` - PDF generation from markdown using md-to-pdf

**Routes** (`backend/src/routes/studyRoutes.ts`)
- `/api/extract` - Extract transcript from YouTube URL
- `/api/summarize` - Generate study material from transcript
- `/api/pdf` - Generate PDF from markdown

### Frontend Architecture

**App Router Structure** (Next.js 15)
- `app/(root)/page.tsx` - Homepage with URL input
- `app/transcript/page.tsx` - Transcript viewer with embedded YouTube player
- `app/editor/page.tsx` - Study material editor with export options

**Component Organization**
- `components/Home/` - Landing page components (Hero, Features, UrlInputPanel)
- `components/Transcript/` - TranscriptViewer component
- `components/Summary/` - SummaryCanvas component for displaying study materials

**Data Flow**
1. User submits YouTube URL via UrlInputPanel
2. Frontend calls `/api/extract` to get transcript
3. Transcript segments are displayed with timestamps
4. Frontend calls `/api/summarize` to generate study material
5. Study material is rendered with markdown parsing (using `marked` and `dompurify`)

## Key Implementation Details

### Transcript Processing
- The `mergeShortSegments()` function in `transcriptService.ts` combines adjacent segments shorter than 5 seconds
- Segments are sorted by offset before display
- Timestamps are in seconds and converted to MM:SS format for display

### AI Study Material Generation
- Uses OpenRouter with `openai/gpt-4o-mini` model
- Temperature set to 0.3 for consistent, focused output
- Prompt engineering creates structured output with Overview, Concepts, Summary, Study Tips, and Further Exploration sections
- The `removeTopLevelMarkdownBlock()` function strips code fence artifacts if AI wraps output in markdown blocks

### YouTube URL Parsing
- `getVideoIdFromUrl()` handles multiple formats:
  - `https://youtu.be/VIDEO_ID`
  - `https://youtube.com/watch?v=VIDEO_ID`
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - Various youtube.com subdomains

### Error Handling
- Typed error codes for transcript failures: `NO_TRANSCRIPT`, `INVALID_VIDEO`, `FETCH_ERROR`, `LIBRARY_ERROR`
- Graceful degradation with fallback demo mode if OpenRouter API key is missing
- User-friendly error messages for common scenarios (no captions, video unavailable)

## Technology Stack

**Backend:**
- Express 5.1.0 - Web framework
- TypeScript 5.9+ - Type safety
- youtubei.js 15.1.1 - YouTube transcript extraction (no API key required)
- OpenAI SDK 4.104.0 - Configured for OpenRouter endpoint
- md-to-pdf 5.2.4 - PDF generation
- dotenv - Environment configuration

**Frontend:**
- Next.js 15.5.4 - React framework with App Router
- React 19.1.0 - UI library
- TypeScript 5+ - Type safety
- Tailwind CSS 3.4.18 - Styling
- marked 12.0.2 - Markdown parsing
- dompurify 3.1.6 - XSS protection for rendered HTML

## Development Notes

- Backend runs on port 4000 by default, frontend on port 3000
- CORS is not explicitly configured - ensure both run on localhost for development
- The youtubei.js library doesn't require YouTube API credentials
- OpenRouter API key is optional but required for AI-generated content (falls back to basic summary without it)
- TypeScript is used throughout both backend and frontend
- Both projects use nodemon/Turbopack for hot reload during development
