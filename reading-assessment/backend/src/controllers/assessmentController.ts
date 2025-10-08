import { Request, Response } from 'express';
import assessmentData from '../data/assessmentData.json';
import { getPassageById, getPassageByModuleAndDifficulty, Passage } from '../data/passagesIndex';
import { getModulesList } from '../data/modules';

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
 * GET /api/modules
 * Get all available modules with their metadata
 */
export const getModules = (_req: Request, res: Response) => {
  try {
    const modules = getModulesList();
    res.json({
      modules,
      total: modules.length
    });
  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ error: 'Failed to fetch modules list' });
  }
};

/**
 * POST /api/passage/random
 * Get a random passage by module and difficulty
 */
export const getRandomPassageController = (req: Request, res: Response) => {
  try {
    const { module, difficulty } = req.body;

    // Validate required fields
    if (!module || !difficulty) {
      return res.status(400).json({
        error: 'Both module and difficulty are required'
      });
    }

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    const passage = getPassageByModuleAndDifficulty(module, difficulty);

    if (!passage) {
      return res.status(404).json({
        error: 'No passage found for the specified module and difficulty'
      });
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
    console.error('Error fetching random passage:', error);
    res.status(500).json({ error: 'Failed to fetch random passage' });
  }
};

/**
 * POST /api/submit - Enhanced version
 * Calculate metrics and return detailed results including answer review
 */
export const submitAssessment = (req: Request, res: Response) => {
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
};
