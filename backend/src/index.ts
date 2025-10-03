import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.send('Backend running');
});

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello World from Sarthak' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


