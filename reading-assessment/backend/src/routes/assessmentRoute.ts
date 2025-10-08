import { Router } from 'express';
import {
  getModules,
  getRandomPassageController,
  submitAssessment
} from '../controllers/assessmentController';

const router = Router();

// Route definitions
router.get('/modules', getModules);                      // Get list of available modules
router.post('/passage/random', getRandomPassageController);  // Get random passage by module + difficulty
router.post('/submit', submitAssessment);                // Submit assessment answers

export default router;
