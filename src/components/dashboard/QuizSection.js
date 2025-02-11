import React, { useState } from 'react';
import QuizGenerator from '../quiz/QuizGenerator';
import QuizHistory from '../quiz/QuizHistory';

function QuizSection() {
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'history'

  return (
    <section id="quiz-section" className="bg-white p-4 rounded-lg shadow">
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'generate' ? 'bg-[rgb(130,88,18)] text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('generate')}
        >
          Generate Quiz
        </button>
        <button
          className={`px-4 py-2 rounded ${
            activeTab === 'history' ? 'bg-[rgb(130,88,18)] text-white' : 'bg-gray-200'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Quiz History
        </button>
      </div>

      {activeTab === 'generate' ? <QuizGenerator /> : <QuizHistory />}
    </section>
  );
}

export default QuizSection;