import { Router, Request, Response } from 'express';
import assessmentData from '../data/assessmentData.json';
import { passages, getPassageById, getRandomPassage, Passage } from '../data/passagesIndex';

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

/**
 * GET /api/passages
 * Get all available passages with metadata
 */
router.get('/passages', (_req: Request, res: Response) => {
  try {
    // Return passage list without the full text and correct answers
    const passageList = passages.map(({ id, title, category, difficulty, wordCount, estimatedReadingTime }) => ({
      id,
      title,
      category,
      difficulty,
      wordCount,
      estimatedReadingTime
    }));

    res.json({
      passages: passageList,
      total: passageList.length
    });
  } catch (error) {
    console.error('Error fetching passages:', error);
    res.status(500).json({ error: 'Failed to fetch passages list' });
  }
});

/**
 * GET /api/passage/:id
 * Get a specific passage by ID
 */
router.get('/passage/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const passage = getPassageById(id);

    if (!passage) {
      return res.status(404).json({ error: 'Passage not found' });
    }

    // Remove correct answers from questions
    const sanitizedQuestions = passage.questions.map(({ id, stem, options }) => ({
      id,
      stem,
      options
    }));

    res.json({
      id: passage.id,
      title: passage.title,
      category: passage.category,
      difficulty: passage.difficulty,
      text: passage.text,
      wordCount: passage.wordCount,
      idealWPM: passage.idealWPM,
      estimatedReadingTime: passage.estimatedReadingTime,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error fetching passage:', error);
    res.status(500).json({ error: 'Failed to fetch passage' });
  }
});

/**
 * GET /api/passage/random
 * Get a random passage, optionally filtered by difficulty
 */
router.get('/passage/random', (req: Request, res: Response) => {
  try {
    const difficulty = req.query.difficulty as 'easy' | 'medium' | 'hard' | undefined;

    // Validate difficulty if provided
    if (difficulty && !['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const passage = getRandomPassage(difficulty);

    // Remove correct answers from questions
    const sanitizedQuestions = passage.questions.map(({ id, stem, options }) => ({
      id,
      stem,
      options
    }));

    res.json({
      id: passage.id,
      title: passage.title,
      category: passage.category,
      difficulty: passage.difficulty,
      text: passage.text,
      wordCount: passage.wordCount,
      idealWPM: passage.idealWPM,
      estimatedReadingTime: passage.estimatedReadingTime,
      questions: sanitizedQuestions
    });
  } catch (error) {
    console.error('Error fetching random passage:', error);
    res.status(500).json({ error: 'Failed to fetch random passage' });
  }
});

/**
 * POST /api/submit - Enhanced version
 * Calculate metrics and return detailed results including answer review
 */
router.post('/submit', (req: Request, res: Response) => {
  try {
    const { passageId, readingTimeSeconds, answers } = req.body as SubmitRequest;

    // Validate request
    if (!passageId || typeof readingTimeSeconds !== 'number' || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Invalid request data' });
    }

    // Find passage from new library or fall back to old data
    let passage = getPassageById(passageId);
    let data: AssessmentData | Passage;

    if (passage) {
      data = passage;
    } else if (passageId === assessmentData.id) {
      data = assessmentData as AssessmentData;
    } else {
      return res.status(400).json({ error: 'Invalid passage ID' });
    }

    const { wordCount, idealWPM, questions } = data;

    // Calculate correct answers and build answer review
    let correctAnswers = 0;
    const answerReview = answers.map(userAnswer => {
      const question = questions.find(q => q.id === userAnswer.questionId);
      const isCorrect = question && question.answer === userAnswer.selectedOption;

      if (isCorrect) {
        correctAnswers++;
      }

      return {
        questionId: userAnswer.questionId,
        selectedOption: userAnswer.selectedOption,
        correctAnswer: question?.answer,
        isCorrect: !!isCorrect
      };
    });

    const totalQuestions = questions.length;

    // Calculate metrics according to specifications

    // 1. Reading Speed (WPM)
    const wpm = Math.round(wordCount / (readingTimeSeconds / 60));

    // 2. Accuracy (%)
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    // 3. Retention Score (%)
    const speedFactor = Math.min(1, wpm / idealWPM);
    const retention = Math.round((accuracy / 100) * speedFactor * 100);

    // 4. Overall Speed Learning Score (out of 100)
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
      feedback,
      answerReview, // New: detailed answer review
      passageInfo: {
        id: passageId,
        title: data.title,
        difficulty: data.difficulty
      }
    });
  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ error: 'Failed to process submission' });
  }
});

export default router;
