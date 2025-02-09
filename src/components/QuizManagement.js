import React, { useState, useRef, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

function QuizManagement() {
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const quizzesCollection = collection(db, 'quizzes');
      const quizzesSnapshot = await getDocs(quizzesCollection);
      const quizzesList = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizzes(quizzesList);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      setUploadError("Failed to fetch quizzes");
    }
  };

  const deleteQuiz = async (quizId) => {
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setUploadSuccess("Quiz deleted successfully!");
    } catch (error) {
      console.error("Error deleting quiz:", error);
      setUploadError("Failed to delete quiz");
    }
  };

  const exportQuizzes = (difficulty = 'all') => {
    let filteredQuizzes = quizzes;
    if (difficulty !== 'all') {
      filteredQuizzes = quizzes.map(quiz => ({
        ...quiz,
        questions: quiz.questions.filter(q => q.difficulty.toLowerCase() === difficulty)
      })).filter(quiz => quiz.questions.length > 0);
    }

    const dataStr = JSON.stringify(filteredQuizzes, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `quizzes-${difficulty}-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleQuizUpload = async () => {
    setUploadError(null);
    setUploadSuccess(false);

    if (!quizTitle.trim()) {
      setUploadError("Quiz title is required");
      return;
    }

    if (!file) {
      setUploadError("Please select a quiz file");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const quizData = JSON.parse(evt.target.result);
          
          // Validate quiz structure
          if (!quizData.questions || !Array.isArray(quizData.questions)) {
            throw new Error("Quiz file must contain a 'questions' array");
          }

          // Validate each question
          quizData.questions.forEach((question, idx) => {
            if (!question.question || 
                !Array.isArray(question.options) || 
                question.options.length === 0 || 
                typeof question.correctOption !== 'number' ||
                !question.difficulty ||
                !['easy', 'medium', 'hard'].includes(question.difficulty.toLowerCase())) {
              throw new Error(`Invalid question format at index ${idx}. Each question must have: question text, options array, correctOption number, and difficulty level (easy/medium/hard)`);
            }
          });

          // Add quiz to Firestore
          const quizRef = collection(db, 'quizzes');
          await addDoc(quizRef, {
            title: quizTitle,
            description: quizDescription,
            questions: quizData.questions,
            createdAt: serverTimestamp(),
            totalQuestions: quizData.questions.length,
            difficultyBreakdown: {
              easy: quizData.questions.filter(q => q.difficulty.toLowerCase() === 'easy').length,
              medium: quizData.questions.filter(q => q.difficulty.toLowerCase() === 'medium').length,
              hard: quizData.questions.filter(q => q.difficulty.toLowerCase() === 'hard').length
            }
          });

          setUploadSuccess(true);
          // Reset form
          setQuizTitle('');
          setQuizDescription('');
          setFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error) {
          console.error("Error processing quiz file:", error);
          setUploadError(error.message);
        }
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Error uploading quiz:", error);
      setUploadError("Failed to upload quiz. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section id="quiz-management" className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Create New Quiz</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter quiz title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quiz Description
            </label>
            <textarea
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
              placeholder="Enter quiz description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Quiz File (JSON format)
              <div className="text-xs text-gray-500 mt-1">
                Expected JSON format:
                <pre className="bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
{`{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOption": 0,
      "difficulty": "easy" // or "medium" or "hard"
    }
  ]
}`}
                </pre>
              </div>
            </label>
            <input
              type="file"
              accept=".json,application/json"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-1 block w-full"
              ref={fileInputRef}
            />
          </div>

          <button
            onClick={handleQuizUpload}
            disabled={loading}
            className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${loading ? 'bg-gray-400' : 'bg-iof hover:bg-iof-dark'} 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iof`}
          >
            {loading ? 'Uploading...' : 'Upload Quiz'}
          </button>

          {uploadError && (
            <div className="text-red-500 text-sm mt-2">
              {uploadError}
            </div>
          )}
          
          {uploadSuccess && (
            <div className="text-green-500 text-sm mt-2">
              Quiz uploaded successfully!
            </div>
          )}
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Existing Quizzes</h2>
          <div className="space-x-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <button
              onClick={() => exportQuizzes(selectedDifficulty)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
            >
              Export Selected
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(quiz => (
            <div key={quiz.id} className="border rounded-lg p-4 shadow">
              <h3 className="font-semibold text-lg mb-2">{quiz.title}</h3>
              <p className="text-gray-600 text-sm mb-2">{quiz.description}</p>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Total Questions:</span> {quiz.totalQuestions}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Difficulty Breakdown:</span>
                  <div className="ml-2">
                    <div className="text-green-600">Easy: {quiz.difficultyBreakdown?.easy || 0}</div>
                    <div className="text-yellow-600">Medium: {quiz.difficultyBreakdown?.medium || 0}</div>
                    <div className="text-red-600">Hard: {quiz.difficultyBreakdown?.hard || 0}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => deleteQuiz(quiz.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete Quiz
                  </button>
                  <button
                    onClick={() => exportQuizzes(quiz.id)}
                    className="text-iof hover:text-iof-dark"
                  >
                    Export Quiz
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default QuizManagement;