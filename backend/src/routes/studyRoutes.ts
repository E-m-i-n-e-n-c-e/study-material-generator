import { Router } from 'express';
import { 
  extractTranscript, 
  generateStudyMaterial,
  generatePdf
} from '../controllers/studyController';

const router = Router();

// Individual endpoints
router.post('/extract', extractTranscript);
router.post('/summarize', generateStudyMaterial);
router.post('/pdf', generatePdf);

export default router;
