import React from 'react';
import { useNavigate } from 'react-router-dom';

function QuizShareModal({ quizId, onClose, onTakeQuiz }) {
  const navigate = useNavigate();
  const quizUrl = `${window.location.origin}/public-quiz/${quizId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizUrl);
    alert('Quiz link copied to clipboard!');
  };

  const handleTakeQuiz = () => {
    onClose(); // Close the modal first
    navigate(`/take-quiz/${quizId}`); // Navigate to the quiz page
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">Quiz Generated Successfully!</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shareable Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quizUrl}
                readOnly
                className="flex-1 p-2 border rounded-md bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded-md hover:bg-opacity-90"
              >
                Copy
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Share this link with participants to take the quiz
            </p>
          </div>

          <div className="border-t pt-4">
            <button
              onClick={handleTakeQuiz}
              className="w-full mb-3 py-2 bg-[rgb(130,88,18)] text-white rounded-md hover:bg-opacity-90"
            >
              Take Quiz Now
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizShareModal; 