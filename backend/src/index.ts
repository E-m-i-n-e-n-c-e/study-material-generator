import express, { Request, Response } from 'express';
import studyRoutes from './routes/studyRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Study Material Generator Backend - Running');
});

app.use('/api', studyRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


