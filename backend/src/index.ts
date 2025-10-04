import express, { Request, Response } from 'express';
import extractRoutes from './routes/extractRoutes';
import summarizeRoutes from './routes/summarizeRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Backend running');
});

app.use('/api', extractRoutes);
app.use('/api', summarizeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


