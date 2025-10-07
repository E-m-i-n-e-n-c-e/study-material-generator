import { useState } from 'react';

interface Question {
  id: string;
  stem: string;
  options: string[];
}

interface Answer {
  questionId: string;
  selectedOption: string;
}

interface QuizProps {
  questions: Question[];
  onSubmit: (answers: Answer[]) => void;
}

function Quiz({ questions, onSubmit }: QuizProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  const handleOptionChange = (questionId: string, option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: option,
    });
  };

  const handleSubmit = () => {
    // Convert selectedAnswers to Answer array
    const answers: Answer[] = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption,
    }));

    onSubmit(answers);
  };

  const allQuestionsAnswered = questions.every(q => selectedAnswers[q.id]);
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="card">
      <div className="mb-6">
        <div className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
          ✏️ Quiz Phase
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Comprehension Questions
        </h2>
        <p className="text-gray-500">
          Answer the following questions based on what you just read.
        </p>
        <div className="mt-3 text-sm text-gray-600">
          Progress: {answeredCount} / {questions.length} answered
        </div>
      </div>

      <div className="space-y-8 mb-8">
        {questions.map((question, index) => (
          <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {index + 1}. {question.stem}
            </h3>

            <div className="space-y-3">
              {question.options.map((option) => {
                const isSelected = selectedAnswers[question.id] === option;
                return (
                  <label
                    key={option}
                    className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={isSelected}
                      onChange={() => handleOptionChange(question.id, option)}
                      className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
                    />
                    <span className={`flex-1 ${isSelected ? 'text-primary-900 font-medium' : 'text-gray-700'}`}>
                      {option}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-6 text-center">
        {!allQuestionsAnswered && (
          <p className="text-amber-600 mb-4 text-sm">
            ⚠️ Please answer all questions before submitting
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allQuestionsAnswered}
          className="btn-primary text-lg"
        >
          Submit Answers
        </button>
      </div>
    </div>
  );
}

export default Quiz;
