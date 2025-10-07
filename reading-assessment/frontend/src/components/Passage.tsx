interface PassageProps {
  title: string;
  text: string;
  onFinishReading: () => void;
}

function Passage({ title, text, onFinishReading }: PassageProps) {
  return (
    <div className="card">
      <div className="mb-6">
        <div className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-3">
          📖 Reading Phase
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm">Read carefully. Your time starts now!</p>
      </div>

      <div className="prose max-w-none mb-8">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 leading-relaxed">
          <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
            {text}
          </p>
        </div>
      </div>

      <div className="border-t pt-6 text-center">
        <p className="text-gray-600 mb-4">
          Once you've finished reading, click the button below to proceed to the quiz.
        </p>
        <button onClick={onFinishReading} className="btn-primary text-lg">
          I'm Done Reading ✓
        </button>
      </div>
    </div>
  );
}

export default Passage;
