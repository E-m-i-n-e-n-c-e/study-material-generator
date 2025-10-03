import { Router } from 'express';
import { extractController } from '../controllers/extractController';

const router = Router();

router.post('/extract', extractController);

export default router;


