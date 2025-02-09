import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, getDocs, where } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import QuizShareModal from './QuizShareModal';

function QuizGenerator() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState(new Map());
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [generatedQuizId, setGeneratedQuizId] = useState(null);

  const [quizConfig, setQuizConfig] = useState({
    quizName: '',
    subject: '',
    topic: '',
    difficulty: 'intermediate',
    isMixedDifficulty: false,
    questionCount: 10,
    timeLimit: 15,
    isMixedTopics: false
  });

  // Constants for validation
  const LIMITS = {
    MIN_QUESTIONS: 1,
    MAX_QUESTIONS: 50,
    MIN_TIME: 5,
    MAX_TIME: 180, // 3 hours
    MIN_NAME_LENGTH: 3
  };

  const DIFFICULTY_LEVELS = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' }
  ];

  useEffect(() => {
    fetchSubjectsAndQuestions();
  }, []);

  // Fetch available subjects and questions
  const fetchSubjectsAndQuestions = async () => {
    try {
      const questionsRef = collection(db, 'questions');
      const querySnapshot = await getDocs(questionsRef);
      
      const subjectTopicsMap = new Map();
      const questions = [];
      
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (!subjectTopicsMap.has(data.subject)) {
          subjectTopicsMap.set(data.subject, new Set());
        }
        subjectTopicsMap.get(data.subject).add(data.topic);
        questions.push({ id: doc.id, ...data });
      });

      setSubjects(Array.from(subjectTopicsMap.keys()).sort());
      setTopics(subjectTopicsMap);
      setAvailableQuestions(questions);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load subjects and questions");
      setLoading(false);
    }
  };

  // Validate quiz configuration
  const validateQuizConfig = () => {
    const errors = {};

    // Quiz Name validation
    if (!quizConfig.quizName.trim()) {
      errors.quizName = 'Quiz name is required';
    } else if (quizConfig.quizName.length < LIMITS.MIN_NAME_LENGTH) {
      errors.quizName = `Quiz name must be at least ${LIMITS.MIN_NAME_LENGTH} characters`;
    }

    // Subject validation
    if (!quizConfig.subject) {
      errors.subject = 'Please select a subject';
    }

    // Topic validation
    if (!quizConfig.isMixedTopics && !quizConfig.topic) {
      errors.topic = 'Please select a topic or enable mixed topics';
    }

    // Question count validation
    if (quizConfig.questionCount < LIMITS.MIN_QUESTIONS || quizConfig.questionCount > LIMITS.MAX_QUESTIONS) {
      errors.questionCount = `Question count must be between ${LIMITS.MIN_QUESTIONS} and ${LIMITS.MAX_QUESTIONS}`;
    }

    // Time limit validation
    if (quizConfig.timeLimit < LIMITS.MIN_TIME || quizConfig.timeLimit > LIMITS.MAX_TIME) {
      errors.timeLimit = `Time limit must be between ${LIMITS.MIN_TIME} and ${LIMITS.MAX_TIME} minutes`;
    }

    // Check if enough questions are available
    const availableQuestionCount = getAvailableQuestionCount();
    if (availableQuestionCount < quizConfig.questionCount) {
      errors.questionCount = `Only ${availableQuestionCount} questions available for selected criteria`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Get count of available questions based on current filters
  const getAvailableQuestionCount = () => {
    let filteredQuestions = availableQuestions.filter(q => 
      q.subject === quizConfig.subject &&
      (quizConfig.isMixedDifficulty || q.difficulty === quizConfig.difficulty)
    );

    if (!quizConfig.isMixedTopics) {
      filteredQuestions = filteredQuestions.filter(q => q.topic === quizConfig.topic);
    }

    return filteredQuestions.length;
  };

  // Handle subject change
  const handleSubjectChange = (subject) => {
    setQuizConfig(prev => ({
      ...prev,
      subject,
      topic: '', // Reset topic when subject changes
    }));
    setValidationErrors(prev => ({ ...prev, subject: '', topic: '' }));
  };

  // Handle topic change
  const handleTopicChange = (topic) => {
    setQuizConfig(prev => ({
      ...prev,
      topic
    }));
    setValidationErrors(prev => ({ ...prev, topic: '' }));
  };

  // Handle mixed topics toggle
  const handleMixedTopicsChange = (checked) => {
    setQuizConfig(prev => ({
      ...prev,
      isMixedTopics: checked,
      topic: checked ? '' : prev.topic
    }));
    setValidationErrors(prev => ({ ...prev, topic: '' }));
  };

  // Handle mixed difficulty toggle
  const handleMixedDifficultyChange = (checked) => {
    setQuizConfig(prev => ({
      ...prev,
      isMixedDifficulty: checked
    }));
  };

  // Generate quiz
  const generateQuiz = async () => {
    if (!validateQuizConfig()) {
      return;
    }

    try {
      setLoading(true);
      let selectedQuestions = availableQuestions.filter(q => 
        q.subject === quizConfig.subject &&
        (quizConfig.isMixedDifficulty || q.difficulty === quizConfig.difficulty) &&
        (quizConfig.isMixedTopics || q.topic === quizConfig.topic)
      );

      // Randomize questions
      selectedQuestions = selectedQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, quizConfig.questionCount);

      // Create new quiz document with quiz name
      const quizRef = await addDoc(collection(db, 'quizzes'), {
        ...quizConfig,
        questions: selectedQuestions,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid,
        results: []
      });

      setGeneratedQuizId(quizRef.id);
    } catch (error) {
      console.error("Error generating quiz:", error);
      setError("Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleTakeQuiz = () => {
    setGeneratedQuizId(null);
    navigate(`/take-quiz/${generatedQuizId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-gray-600">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p>Loading quiz options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Generate New Quiz</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Quiz Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Quiz Name</label>
          <input
            type="text"
            value={quizConfig.quizName}
            onChange={(e) => setQuizConfig(prev => ({ ...prev, quizName: e.target.value }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] ${
              validationErrors.quizName ? 'border-red-500' : ''
            }`}
          />
          {validationErrors.quizName && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.quizName}</p>
          )}
        </div>

        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Subject</label>
          <select
            value={quizConfig.subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] ${
              validationErrors.subject ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select Subject</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          {validationErrors.subject && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.subject}</p>
          )}
        </div>

        {/* Topic Selection */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">Topic</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quizConfig.isMixedTopics}
                onChange={(e) => handleMixedTopicsChange(e.target.checked)}
                className="rounded border-gray-300 text-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
              />
              <span className="ml-2 text-sm text-gray-600">Mixed Topics</span>
            </label>
          </div>
          {!quizConfig.isMixedTopics && (
            <>
              <select
                value={quizConfig.topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                disabled={!quizConfig.subject || quizConfig.isMixedTopics}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] ${
                  validationErrors.topic ? 'border-red-500' : ''
                }`}
              >
                <option value="">Select Topic</option>
                {quizConfig.subject && Array.from(topics.get(quizConfig.subject) || []).map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
              {validationErrors.topic && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.topic}</p>
              )}
            </>
          )}
        </div>

        {/* Difficulty Level Selection with Mixed Option */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Difficulty Level</label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={quizConfig.isMixedDifficulty}
                onChange={(e) => handleMixedDifficultyChange(e.target.checked)}
                className="rounded border-gray-300 text-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)]"
              />
              <span className="ml-2 text-sm text-gray-600">Mixed Difficulty</span>
            </label>
          </div>
          
          {!quizConfig.isMixedDifficulty && (
            <>
              <select
                value={quizConfig.difficulty}
                onChange={(e) => setQuizConfig(prev => ({ ...prev, difficulty: e.target.value }))}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] ${
                  validationErrors.difficulty ? 'border-red-500' : ''
                }`}
              >
                {DIFFICULTY_LEVELS.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
              {validationErrors.difficulty && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.difficulty}</p>
              )}
            </>
          )}
          
          {quizConfig.isMixedDifficulty && (
            <div className="mt-1 text-sm text-gray-600">
              Questions will be randomly selected from all difficulty levels
            </div>
          )}
        </div>

        {/* Question Count with available questions info */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Number of Questions</label>
          <input
            type="number"
            min={LIMITS.MIN_QUESTIONS}
            max={LIMITS.MAX_QUESTIONS}
            value={quizConfig.questionCount}
            onChange={(e) => setQuizConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 0 }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] ${
              validationErrors.questionCount ? 'border-red-500' : ''
            }`}
          />
          {validationErrors.questionCount && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.questionCount}</p>
          )}
          <div className="mt-1 text-sm">
            <span className="text-gray-500">
              Available questions: {getAvailableQuestionCount()}
            </span>
            {quizConfig.isMixedDifficulty && (
              <div className="mt-1">
                <span className="font-medium">Distribution: </span>
                {DIFFICULTY_LEVELS.map(level => {
                  const count = availableQuestions.filter(q => 
                    q.difficulty === level.value && 
                    q.subject === quizConfig.subject &&
                    (quizConfig.isMixedTopics || q.topic === quizConfig.topic)
                  ).length;
                  return (
                    <span key={level.value} className="mr-3">
                      {level.label}: {count}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Time Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Time Limit (minutes)</label>
          <input
            type="number"
            min={LIMITS.MIN_TIME}
            max={LIMITS.MAX_TIME}
            value={quizConfig.timeLimit}
            onChange={(e) => setQuizConfig(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 0 }))}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] ${
              validationErrors.timeLimit ? 'border-red-500' : ''
            }`}
          />
          {validationErrors.timeLimit && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.timeLimit}</p>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={generateQuiz}
          disabled={loading}
          className="w-full bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] focus:outline-none focus:ring-2 focus:ring-[rgb(130,88,18)] focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Quiz'}
        </button>
      </div>

      {generatedQuizId && (
        <QuizShareModal
          quizId={generatedQuizId}
          onClose={() => setGeneratedQuizId(null)}
          onTakeQuiz={handleTakeQuiz}
        />
      )}
    </div>
  );
}

export default QuizGenerator; 