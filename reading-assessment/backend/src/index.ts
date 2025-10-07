import express, { Request, Response } from 'express';
import cors from 'cors';
import assessmentRoutes from './routes/assessment';

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Reading Assessment API - Running',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api', assessmentRoutes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
  console.log(`✓ API endpoints available at http://localhost:${PORT}/api`);
});
