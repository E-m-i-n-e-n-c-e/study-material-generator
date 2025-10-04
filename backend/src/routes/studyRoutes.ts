import { Router } from 'express';
import { 
  extractTranscript, 
  generateStudyMaterial
} from '../controllers/studyController';

const router = Router();

// Individual endpoints
router.post('/extract', extractTranscript);
router.post('/summarize', generateStudyMaterial);

export default router;
