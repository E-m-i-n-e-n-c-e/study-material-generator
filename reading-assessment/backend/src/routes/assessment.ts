import { Router, Request, Response } from 'express';
import assessmentData from '../data/assessmentData.json';

const router = Router();

// Types
interface Question {
  id: string;
  stem: string;
  options: string[];
  answer: string;
}

interface AssessmentData {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  difficulty: string;
  idealWPM: number;
  questions: Question[];
}

interface SubmitAnswer {
  questionId: string;
  selectedOption: string;
}

interface SubmitRequest {
  passageId: string;
  readingTimeSeconds: number;
  answers: SubmitAnswer[];
}

interface Metrics {
  wpm: number;
  accuracy: number;
  retention: number;
  speedLearningScore: number;
}

/**
 * GET /api/assessment
 * Fetch the reading passage and quiz data
 */
router.get('/assessment', (_req: Request, res: Response) => {
  try {
    // Return assessment data without the correct answers
    const { id, title, text, wordCount, difficulty, questions } = assessmentData as AssessmentData;

    // Remove correct answers from questions before sending to frontend
    const sanitizedQuestions = questions.map(({ id, stem, options }) => ({
      id,
      stem,
      options
    }));

    res.json({
      id,
      title,
      text,
      wordCount,
      difficulty,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ error: 'Failed to fetch assessment data' });
  }
});

/**
 * POST /api/submit
 * Calculate metrics and return results
 */
router.post('/submit', (req: Request, res: Response) => {
  try {
    const { passageId, readingTimeSeconds, answers } = req.body as SubmitRequest;

    // Validate request
    if (!passageId || typeof readingTimeSeconds !== 'number' || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Verify passage ID
    if (passageId !== assessmentData.id) {
      return res.status(400).json({ error: 'Invalid passage ID' });
    }

    const data = assessmentData as AssessmentData;
    const { wordCount, idealWPM, questions } = data;

    // Calculate correct answers
    let correctAnswers = 0;
    for (const userAnswer of answers) {
      const question = questions.find(q => q.id === userAnswer.questionId);
      if (question && question.answer === userAnswer.selectedOption) {
        correctAnswers++;
      }
    }

    const totalQuestions = questions.length;

    // Calculate metrics according to specifications

    // 1. Reading Speed (WPM)
    const wpm = Math.round(wordCount / (readingTimeSeconds / 60));

    // 2. Accuracy (%)
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    // 3. Retention Score (%)
    // Retention = (Accuracy/100) × min(1, WPM/idealWPM) × 100
    const speedFactor = Math.min(1, wpm / idealWPM);
    const retention = Math.round((accuracy / 100) * speedFactor * 100);

    // 4. Overall Speed Learning Score (out of 100)
    // SpeedScore = (0.6 × Accuracy) + (0.4 × min(100, (WPM/idealWPM) × 100))
    const speedComponent = Math.min(100, (wpm / idealWPM) * 100);
    const speedLearningScore = Math.round((0.6 * accuracy) + (0.4 * speedComponent));

    const metrics: Metrics = {
      wpm,
      accuracy,
      retention,
      speedLearningScore
    };

    // Generate feedback based on performance
    const feedback = generateFeedback(metrics, idealWPM, wpm);

    res.json({
      metrics,
      feedback
    });
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

/**
 * Generate personalized feedback based on metrics
 */
function generateFeedback(metrics: Metrics, idealWPM: number, actualWPM: number): string {
  const { accuracy, speedLearningScore } = metrics;

  // Excellent performance
  if (speedLearningScore >= 85 && accuracy >= 80) {
    return 'Excellent work! You have great reading speed and comprehension.';
  }

  // Good speed, needs better comprehension
  if (actualWPM >= idealWPM && accuracy < 70) {
    return 'Good pace, but focus more on key details to improve comprehension.';
  }

  // Good comprehension, slow speed
  if (accuracy >= 80 && actualWPM < idealWPM * 0.8) {
    return 'Great comprehension! Try to increase your reading speed gradually.';
  }

  // Balanced but room for improvement
  if (speedLearningScore >= 60 && speedLearningScore < 85) {
    return 'Good effort! Practice regularly to improve both speed and accuracy.';
  }

  // Needs improvement
  if (speedLearningScore < 60) {
    return 'Take your time to understand the content. Speed will improve with practice.';
  }

  // Default
  return 'Keep practicing to improve your reading skills!';
}

export default router;
