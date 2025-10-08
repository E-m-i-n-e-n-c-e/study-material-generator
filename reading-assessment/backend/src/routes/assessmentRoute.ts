import { Router } from 'express';
import {
  getAssessment,
  getPassages,
  getPassageByIdController,
  getRandomPassageController,
  submitAssessment
} from '../controllers/assessmentController';

const router = Router();

// Route definitions
router.get('/assessment', getAssessment);
router.get('/passages', getPassages);
router.get('/passage/:id', getPassageByIdController);  // Not needed 
router.get('/passage/random', getRandomPassageController);
router.post('/submit', submitAssessment);  // Works

export default router;
