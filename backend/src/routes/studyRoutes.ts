import { Router } from 'express';
import { 
  extractTranscript, 
  generateStudyMaterial, 
  extractAndGenerate 
} from '../controllers/studyController';

const router = Router();

// Individual endpoints
router.post('/extract', extractTranscript);
router.post('/summarize', generateStudyMaterial);

// Combined endpoint for convenience
router.post('/process', extractAndGenerate);

export default router;
