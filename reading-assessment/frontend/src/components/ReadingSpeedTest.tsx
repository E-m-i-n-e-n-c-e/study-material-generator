import { useState, useEffect } from 'react';
import Passage from './Passage';
import Quiz from './Quiz';
import Results from './Results';

// API Base URL
const API_URL = 'http://localhost:4001/api';

// Types
interface Question {
  id: string;
  stem: string;
  options: string[];
}

interface AssessmentData {
  id: string;
  title: string;
  text: string;
  wordCount: number;
  difficulty: string;
  questions: Question[];
}

interface Answer {
  questionId: string;
  selectedOption: string;
}

interface Metrics {
  wpm: number;
  accuracy: number;
  retention: number;
  speedLearningScore: number;
}

interface ResultsData {
  metrics: Metrics;
  feedback: string;
}

type AppState = 'idle' | 'reading' | 'quiz' | 'results' | 'loading' | 'error';

function ReadingSpeedTest() {
  const [state, setState] = useState<AppState>('idle');
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [readingTimeSeconds, setReadingTimeSeconds] = useState<number>(0);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState<string>('');

  // Fetch assessment data on component mount
  useEffect(() => {
    fetchAssessment();
  }, []);

  const fetchAssessment = async () => {
    try {
      setState('loading');
      const response = await fetch(`${API_URL}/assessment`);

      if (!response.ok) {
        throw new Error('Failed to fetch assessment');
      }

      const data: AssessmentData = await response.json();
      setAssessmentData(data);
      setState('idle');
    } catch (err) {
      console.error('Error fetching assessment:', err);
      setError('Failed to load assessment. Please refresh the page.');
      setState('error');
    }
  };

  const handleStartAssessment = () => {
    if (!assessmentData) return;

    setState('reading');
    setStartTime(performance.now());
  };

  const handleFinishReading = () => {
    const endTime = performance.now();
    const timeInSeconds = (endTime - startTime) / 1000;
    setReadingTimeSeconds(timeInSeconds);
    setState('quiz');
  };

  const handleSubmitQuiz = async (answers: Answer[]) => {
    if (!assessmentData) return;

    try {
      setState('loading');

      const response = await fetch(`${API_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passageId: assessmentData.id,
          readingTimeSeconds,
          answers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answers');
      }

      const data: ResultsData = await response.json();
      setResults(data);
      setState('results');
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit answers. Please try again.');
      setState('error');
    }
  };

  const handleRestart = () => {
    setState('idle');
    setStartTime(0);
    setReadingTimeSeconds(0);
    setResults(null);
    setError('');
  };

  // Loading state
  if (state === 'loading' && !assessmentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={handleRestart} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!assessmentData) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 Reading Speed Assessment
          </h1>
          <p className="text-gray-600">
            Test your reading speed and comprehension
          </p>
        </header>

        {/* Idle State - Start Screen */}
        {state === 'idle' && (
          <div className="card text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Ready to Begin?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              You'll read a passage and then answer comprehension questions.
              We'll measure your reading speed and accuracy to calculate your Speed Learning Score.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">📖 Today's Topic:</h3>
              <p className="text-blue-800">{assessmentData.title}</p>
              <p className="text-sm text-blue-600 mt-2">
                Difficulty: <span className="capitalize font-medium">{assessmentData.difficulty}</span>
              </p>
            </div>
            <button onClick={handleStartAssessment} className="btn-primary text-lg">
              Start Assessment
            </button>
          </div>
        )}

        {/* Reading State */}
        {state === 'reading' && (
          <Passage
            title={assessmentData.title}
            text={assessmentData.text}
            onFinishReading={handleFinishReading}
          />
        )}

        {/* Quiz State */}
        {state === 'quiz' && (
          <Quiz
            questions={assessmentData.questions}
            onSubmit={handleSubmitQuiz}
          />
        )}

        {/* Loading during submission */}
        {state === 'loading' && assessmentData && (
          <div className="card text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Calculating your results...</p>
          </div>
        )}

        {/* Results State */}
        {state === 'results' && results && (
          <Results
            metrics={results.metrics}
            feedback={results.feedback}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}

export default ReadingSpeedTest;
