# Quick Setup Guide

## Installation

From the `reading-assessment` directory, run:

```bash
npm run install:all
```

This will install dependencies for root, backend, and frontend.

## Running the Application

From the `reading-assessment` directory, run:

```bash
npm run dev
```

This will start both servers:
- **Backend**: http://localhost:4001
- **Frontend**: http://localhost:5173

Open http://localhost:5173 in your browser to use the application.

## Testing the API Manually

### Get Assessment Data
```bash
curl http://localhost:4001/api/assessment
```

### Submit Answers (with all correct)
```bash
curl -X POST http://localhost:4001/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "passageId": "proto-passage-01",
    "readingTimeSeconds": 30,
    "answers": [
      {"questionId": "q1", "selectedOption": "Equilibrium Price"},
      {"questionId": "q2", "selectedOption": "An excess supply (surplus)"},
      {"questionId": "q3", "selectedOption": "The relationship between quantity and price"}
    ]
  }'
```

Expected result: 100% accuracy, 230 WPM, 92% retention, 97 speed learning score

## Project Structure

```
reading-assessment/
├── backend/            # Express API (port 4001)
│   └── src/
│       ├── data/       # assessmentData.json
│       ├── routes/     # API endpoints
│       └── index.ts
├── frontend/           # React + Vite (port 5173)
│   └── src/
│       ├── components/
│       └── App.tsx
└── package.json        # Root package with concurrent scripts
```

## Development

### Backend only
```bash
cd backend
npm run dev
```

### Frontend only
```bash
cd frontend
npm run dev
```

### Build for production
```bash
npm run build
```
