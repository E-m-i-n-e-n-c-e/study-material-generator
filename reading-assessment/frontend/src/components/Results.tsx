interface Metrics {
  wpm: number;
  accuracy: number;
  retention: number;
  speedLearningScore: number;
}

interface ResultsProps {
  metrics: Metrics;
  feedback: string;
  onRestart: () => void;
}

function Results({ metrics, feedback, onRestart }: ResultsProps) {
  const { wpm, accuracy, retention, speedLearningScore } = metrics;

  // Determine overall performance level
  const getPerformanceLevel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-green-600', emoji: '🌟' };
    if (score >= 70) return { label: 'Good', color: 'text-blue-600', emoji: '👍' };
    if (score >= 60) return { label: 'Fair', color: 'text-yellow-600', emoji: '📈' };
    return { label: 'Needs Improvement', color: 'text-orange-600', emoji: '💪' };
  };

  const performance = getPerformanceLevel(speedLearningScore);

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <div className="card text-center bg-gradient-to-br from-primary-50 to-purple-50 border-2 border-primary-200">
        <div className="text-6xl mb-4">{performance.emoji}</div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Assessment Complete!
        </h2>
        <p className={`text-xl font-semibold mb-4 ${performance.color}`}>
          {performance.label} Performance
        </p>
        <div className="bg-white rounded-lg p-6 max-w-sm mx-auto shadow-inner">
          <p className="text-sm text-gray-600 mb-2">Speed Learning Score</p>
          <div className="text-5xl font-bold text-primary-600">
            {speedLearningScore}
            <span className="text-2xl text-gray-500">/100</span>
          </div>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* WPM Card */}
        <div className="metric-card">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Reading Speed
          </h3>
          <div className="text-3xl font-bold text-primary-700">
            {wpm}
          </div>
          <p className="text-sm text-gray-600 mt-1">Words per minute</p>
        </div>

        {/* Accuracy Card */}
        <div className="metric-card">
          <div className="text-3xl mb-2">🎯</div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Accuracy
          </h3>
          <div className="text-3xl font-bold text-primary-700">
            {accuracy}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Questions correct</p>
        </div>

        {/* Retention Card */}
        <div className="metric-card md:col-span-2 lg:col-span-1">
          <div className="text-3xl mb-2">🧠</div>
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Retention Score
          </h3>
          <div className="text-3xl font-bold text-primary-700">
            {retention}%
          </div>
          <p className="text-sm text-gray-600 mt-1">Speed × Accuracy</p>
        </div>
      </div>

      {/* Feedback Card */}
      <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
        <div className="flex items-start">
          <div className="text-3xl mr-4">💡</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Personalized Feedback
            </h3>
            <p className="text-gray-700 leading-relaxed">
              {feedback}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Explanation */}
      <div className="card bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 Understanding Your Scores
        </h3>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex">
            <span className="font-semibold w-40">Reading Speed:</span>
            <span className="flex-1">Measures how fast you read (words per minute)</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-40">Accuracy:</span>
            <span className="flex-1">Percentage of questions answered correctly</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-40">Retention:</span>
            <span className="flex-1">Combined measure of speed and comprehension</span>
          </div>
          <div className="flex">
            <span className="font-semibold w-40">Overall Score:</span>
            <span className="flex-1">Weighted average (60% accuracy + 40% speed)</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button onClick={onRestart} className="btn-primary text-lg">
          Try Again 🔄
        </button>
      </div>
    </div>
  );
}

export default Results;
