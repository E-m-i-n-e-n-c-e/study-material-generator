# 📚 Study Material Generator

A powerful web application that transforms YouTube educational videos into structured, comprehensive study materials. Extract transcripts, normalize content, and generate AI-powered study guides with timestamps, key concepts, and actionable takeaways.

![Study Material Generator](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9+-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.5+-black)
![Express](https://img.shields.io/badge/Express-5.1+-green)

## ✨ Features

### 🎯 **Smart Transcript Processing**
- **YouTube Integration**: Extract transcripts from any YouTube video
- **Content Normalization**: Remove filler words, duplicates, and repetitions
- **Semantic Merging**: Intelligently combine related segments
- **Gap Detection**: Identify natural paragraph breaks and topic transitions

### 📖 **Structured Study Materials**
- **Organized Sections**: Content divided into logical topics with clear headings
- **Timestamp Integration**: Click timestamps to jump to specific video sections
- **Key Concepts**: Highlighted important points and takeaways
- **Study Tips**: Practical advice for effective learning
- **Further Exploration**: Related topics and additional resources

### 🎨 **Interactive Learning Experience**
- **Real-time Processing**: Live progress indicators during content generation
- **Responsive Design**: Optimized for desktop and mobile devices
- **Export Options**: PDF export, markdown copy, and built-in editor
- **Video Integration**: Embedded YouTube player with synchronized transcript

## 🏗️ Architecture

```
study-material-generator/
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API endpoints
│   │   └── utils/           # Utility functions
│   └── package.json
├── frontend/                # Next.js React application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # Reusable UI components
│   │   └── styles/         # Global styles
│   └── package.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** 8.0 or higher
- **Git** for cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/study-material-generator.git
   cd study-material-generator
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Environment Setup

1. **Backend Environment Variables**
   Create a `.env` file in the `backend/` directory:
   ```env
   # API Configuration
   PORT=4000
   
   # AI Service (OpenRouter)
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   
   # Optional: YouTube Language Preference
   YT_LANG=en
   ```

2. **Frontend Environment Variables**
   Create a `.env.local` file in the `frontend/` directory:
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

### Running the Application

#### Development Mode

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The API will be available at `http://localhost:4000`

2. **Start the frontend application**
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

#### Production Mode

1. **Build the backend**
   ```bash
   cd backend
   npm run build
   npm start
   ```

2. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## 🔧 API Documentation

### Endpoints

#### `POST /api/process`
**Combined endpoint for transcript extraction and study material generation**

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID",
  "language": "en" // optional
}
```

**Response:**
```json
{
  "status": 200,
  "videoId": "VIDEO_ID",
  "transcript": [
    {
      "text": "Hello and welcome to this educational video",
      "offset": 0,
      "duration": 3.5
    }
  ],
  "studyMaterial": "# Study Material\n\n### Overview\n...",
  "message": "Transcript extracted and study material generated successfully."
}
```

#### `POST /api/extract`
**Extract transcript only**

**Request:**
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

#### `POST /api/summarize`
**Generate study material from existing transcript**

**Request:**
```json
{
  "videoId": "VIDEO_ID",
  "transcript": [...],
  "language": "en" // optional
}
```

## 🔑 API Keys Configuration

### OpenRouter API Key

The application uses OpenRouter for AI-powered study material generation. You can get a free API key at [OpenRouter](https://openrouter.ai/).

1. **Sign up** for an OpenRouter account
2. **Generate an API key** from your dashboard
3. **Add the key** to your `.env` file:
   ```env
   OPENROUTER_API_KEY=sk-or-v1-your-api-key-here
   ```

**Note:** The application includes a fallback demo mode if no API key is provided, but it will only generate basic summaries.

### YouTube API

No YouTube API key is required. The application uses the `youtubei.js` library to extract transcripts directly from YouTube's public interface.

## 📦 Dependencies

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^5.1.0 | Web framework |
| `openai` | ^4.104.0 | AI service integration |
| `youtubei.js` | ^15.1.1 | YouTube transcript extraction |
| `undici` | ^6.19.8 | HTTP client |

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.5.4 | React framework |
| `react` | 19.1.0 | UI library |
| `tailwindcss` | ^3.4.18 | CSS framework |
| `marked` | ^12.0.2 | Markdown parsing |
| `dompurify` | ^3.1.6 | HTML sanitization |

## 🛠️ Development

### Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── studyController.ts      # Main API controllers
│   ├── services/
│   │   ├── transcriptService.ts    # YouTube transcript extraction
│   │   └── summarizeService.ts     # AI study material generation
│   ├── routes/
│   │   └── studyRoutes.ts          # API route definitions
│   └── utils/
│       └── transcriptNormalizer.ts # Content processing utilities

frontend/
├── src/
│   ├── app/
│   │   ├── (root)/
│   │   │   ├── page.tsx            # Homepage
│   │   │   └── layout.tsx          # Root layout
│   │   ├── transcript/
│   │   │   └── page.tsx            # Transcript viewer
│   │   └── editor/
│   │       └── page.tsx            # Study material editor
│   └── components/
│       ├── Home/                   # Homepage components
│       ├── Transcript/             # Transcript viewer components
│       └── Summary/                # Study material components
```

### Available Scripts

#### Backend Scripts
```bash
npm run dev      # Start development server with hot reload
npm run build    # Compile TypeScript to JavaScript
npm start        # Start production server
```

#### Frontend Scripts
```bash
npm run dev      # Start development server with Turbopack
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎯 Usage

1. **Enter YouTube URL**: Paste any YouTube educational video URL
2. **Processing**: The system will extract and normalize the transcript
3. **Study Material**: View the generated structured study guide
4. **Interactive Learning**: Click timestamps to jump to video sections
5. **Export Options**: Copy, edit, or export to PDF

## 🔒 Security

- **Input Validation**: All YouTube URLs are validated before processing
- **Content Sanitization**: HTML content is sanitized using DOMPurify
- **API Key Protection**: Environment variables are used for sensitive data
- **Error Handling**: Comprehensive error handling for all API endpoints

## 🐛 Troubleshooting

### Common Issues

1. **"Transcript not available"**
   - Ensure the video has captions enabled
   - Check if the video is public and accessible

2. **"API key invalid"**
   - Verify your OpenRouter API key is correct
   - Check if you have sufficient credits

3. **"Video not found"**
   - Ensure the YouTube URL is valid and complete
   - Check if the video is still available

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai/) for AI services
- [YouTube](https://youtube.com/) for video content
- [Next.js](https://nextjs.org/) and [Express.js](https://expressjs.com/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

For support, email sarthak.enigma@gmail.com or create an issue in the GitHub repository.

---

**Made with ❤️ for learners everywhere**
