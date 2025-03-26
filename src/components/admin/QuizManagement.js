import React, { useState, useRef, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, writeBatch, query, where } from 'firebase/firestore';

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
  const [questions, setQuestions] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    bySubject: {},
    byTopic: {},
    byDifficulty: {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    }
  });
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterTopic, setFilterTopic] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteCount, setDeleteCount] = useState(0);

  useEffect(() => {
    fetchQuizzes();
    fetchQuestions();
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

  const fetchQuestions = async () => {
    try {
      const questionsCollection = collection(db, 'questions');
      const questionsSnapshot = await getDocs(questionsCollection);
      const questionsList = questionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsList);
      
      // Calculate statistics
      const stats = {
        total: questionsList.length,
        bySubject: {},
        byTopic: {},
        byDifficulty: {
          beginner: 0,
          intermediate: 0,
          advanced: 0
        }
      };

      questionsList.forEach(question => {
        // Count by subject
        stats.bySubject[question.subject] = (stats.bySubject[question.subject] || 0) + 1;
        // Count by topic
        stats.byTopic[question.topic] = (stats.byTopic[question.topic] || 0) + 1;
        // Count by difficulty
        stats.byDifficulty[question.difficulty.toLowerCase()]++;
      });

      setStatistics(stats);
    } catch (error) {
      console.error("Error fetching questions:", error);
      setUploadError("Failed to fetch questions");
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

  const getFilteredQuestions = () => {
    let filteredQuestions = [...questions];

    if (filterSubject !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.subject === filterSubject);
    }

    if (filterTopic !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => q.topic === filterTopic);
    }

    if (filterDifficulty !== 'all') {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty.toLowerCase() === filterDifficulty.toLowerCase()
      );
    }

    return filteredQuestions;
  };

  const handleDeleteQuestions = async () => {
    try {
      setLoading(true);
      const questionsToDelete = getFilteredQuestions();
      setDeleteCount(questionsToDelete.length);
      setShowDeleteConfirm(true);
    } catch (error) {
      console.error("Error preparing delete:", error);
      setUploadError("Failed to prepare questions for deletion");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      const questionsToDelete = getFilteredQuestions();
      
      // Use batched writes for better performance
      const batch = writeBatch(db);
      questionsToDelete.forEach(question => {
        const questionRef = doc(db, 'questions', question.id);
        batch.delete(questionRef);
      });
      
      await batch.commit();
      
      // Refresh questions and statistics
      await fetchQuestions();
      setUploadSuccess(`Successfully deleted ${questionsToDelete.length} questions`);
    } catch (error) {
      console.error("Error deleting questions:", error);
      setUploadError("Failed to delete questions");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const exportFilteredQuestions = async () => {
    try {
      const filteredQuestions = getFilteredQuestions();
      
      // Clean up questions before export
      const cleanedQuestions = filteredQuestions.map(q => ({
        question: q.question,
        options: q.options,
        correctOption: q.correctOption,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty
      }));

      const dataStr = JSON.stringify({ questions: cleanedQuestions }, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `questions-${filterSubject}-${filterTopic}-${filterDifficulty}-${new Date().toISOString()}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting questions:", error);
      setUploadError("Failed to export questions");
    }
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
                !question.subject ||
                !question.topic ||
                !question.difficulty ||
                !['beginner', 'intermediate', 'advanced'].includes(question.difficulty.toLowerCase())) {
              throw new Error(`Invalid question format at index ${idx}. Each question must have: question text, options array, correctOption number, subject, topic, and difficulty level (beginner/intermediate/advanced)`);
            }
          });

          // Add questions to Firestore
          const questionsRef = collection(db, 'questions');
          const batch = writeBatch(db);
          
          quizData.questions.forEach((question) => {
            const newQuestionRef = doc(questionsRef);
            batch.set(newQuestionRef, {
              ...question,
              createdAt: serverTimestamp(),
              setTitle: quizTitle, // reference to original set
              setDescription: quizDescription
            });
          });

          await batch.commit();

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
        <h2 className="text-2xl font-semibold mb-4">Upload Questions</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Set Title
            </label>
            <input
              type="text"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter set title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Set Description
            </label>
            <textarea
              value={quizDescription}
              onChange={(e) => setQuizDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              rows="3"
              placeholder="Enter set description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Questions File (JSON format)
              <div className="text-xs text-gray-500 mt-1">
                Expected JSON format:
                <pre className="bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
{`{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctOption": 0,
      "subject": "Biology", // Main subject (Biology/Chemistry/Physics)
      "topic": "Cell Biology", // Specific topic within the subject
      "difficulty": "beginner" // or "intermediate" or "advanced"
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
            {loading ? 'Uploading...' : 'Upload Questions'}
          </button>

          {uploadError && (
            <div className="text-red-500 text-sm mt-2">
              {uploadError}
            </div>
          )}
          
          {uploadSuccess && (
            <div className="text-green-500 text-sm mt-2">
              Questions uploaded successfully!
            </div>
          )}
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4">Questions Pool Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Total Questions</h3>
            <p className="text-3xl font-bold text-iof">{statistics.total}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">By Subject</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(statistics.bySubject).map(([subject, count]) => (
                <div key={subject} className="flex justify-between">
                  <span>{subject}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">By Topic</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(statistics.byTopic).map(([topic, count]) => (
                <div key={topic} className="flex justify-between">
                  <span>{topic}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-2">By Difficulty</h3>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Beginner:</span>
                <span className="font-medium">{statistics.byDifficulty.beginner}</span>
              </div>
              <div className="flex justify-between">
                <span>Intermediate:</span>
                <span className="font-medium">{statistics.byDifficulty.intermediate}</span>
              </div>
              <div className="flex justify-between">
                <span>Advanced:</span>
                <span className="font-medium">{statistics.byDifficulty.advanced}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
          >
            <option value="all">All Subjects</option>
            {Object.keys(statistics.bySubject).map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
          >
            <option value="all">All Topics</option>
            {Object.keys(statistics.byTopic).map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={exportFilteredQuestions}
              className="bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-md hover:bg-[rgb(110,68,0)] transition-colors"
            >
              Export Filtered Questions
            </button>

            <button
              onClick={handleDeleteQuestions}
              className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
            >
              Delete Filtered Questions
            </button>
          </div>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete {deleteCount} questions matching these filters?
              <br />
              <span className="text-red-600 font-semibold">This action cannot be undone.</span>
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizManagement;