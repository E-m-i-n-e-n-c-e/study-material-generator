import express, { Request, Response } from 'express';
import studyRoutes from './routes/studyRoutes';
import readingRoutes from './routes/readingRoutes';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());


// Define allowed origins
const allowedOrigins = [
  'http://localhost:8080',              // Dev client
  'https://ai-study-mentor.vercel.app/',               // Production site
  'https://platform.theblinkgrid.com/',           // Optional: www variant
];

// Dynamic CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow request
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // enable if you plan to use cookies or JWT via headers
};

app.use(cors(corsOptions));
app.use(express.json());


app.get('/', (_req: Request, res: Response) => {
  res.send('Study Material Generator Backend - Running');
});

app.use('/api/yt-study', studyRoutes);
app.use('/api/reading', readingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


