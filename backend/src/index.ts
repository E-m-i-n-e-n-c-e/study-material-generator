import express, { Request, Response } from 'express';
import studyRoutes from './routes/studyRoutes';
import readingRoutes from './routes/readingRoutes';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Define allowed origins
const allowedOrigins = [
  'http://localhost:8080',              // Dev client
  'http://localhost:3000',              // Another common dev port
  'http://localhost:5173',              // Vite dev server
  'https://ai-study-mentor.vercel.app',  // Production site (no trailing slash)
  'https://platform.theblinkgrid.com',  // Optional: www variant (no trailing slash)
];

// More permissive CORS configuration for debugging
const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log('CORS request from origin:', origin);
    
    // In development, be more permissive
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - allowing all origins');
      callback(null, true);
      return;
    }
    
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) {
      console.log('Request with no origin - allowing');
      callback(null, true);
      return;
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      // In production, be more permissive temporarily for debugging
      console.log('Allowing temporarily for debugging');
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Add debugging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${req.method} ${req.path} from origin: ${req.get('origin')}`);
  next();
});

app.get('/', (_req: Request, res: Response) => {
  res.send('Study Material Generator Backend - Running');
});

app.use('/api/yt-study', studyRoutes);
app.use('/api/reading', readingRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


