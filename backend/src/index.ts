import express, { Request, Response } from 'express';
import extractRoutes from './routes/extractRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Backend running');
});

app.use('/api', extractRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


