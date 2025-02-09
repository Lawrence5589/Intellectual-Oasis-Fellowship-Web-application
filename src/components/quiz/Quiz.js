import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';

function Quiz() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participant');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  console.log('Quiz render:', { quizId, participantId, currentUser: !!currentUser, loading, quiz: !!quiz });

  // Fetch quiz data
  useEffect(() => {
    let isMounted = true;

    async function fetchQuiz() {
      if (!quizId) return;
      
      console.log('Fetching quiz:', quizId);
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        
        if (!isMounted) return;

        if (docSnap.exists()) {
          const quizData = docSnap.data();
          setQuiz(quizData);
          // Set timer based on timeLimit from Firestore (in minutes)
          // If timeLimit doesn't exist, fallback to 15 minutes
          setTimeLeft((quizData.timeLimit || 15) * 60);
          console.log('Timer set for:', quizData.timeLimit, 'minutes');
        } else {
          console.log('Quiz not found');
          setError('Quiz not found');
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchQuiz();

    return () => {
      isMounted = false;
    };
  }, [quizId]); // Only depend on quizId

  const handleSubmit = async () => {
    try {
      // Calculate score
      let score = 0;
      quiz.questions.forEach((question, index) => {
        if (answers[index] === question.correctOption) {
          score++;
        }
      });

      const finalScore = Math.round((score / quiz.questions.length) * 100);

      // Update participant record with completion time and score
      await updateDoc(doc(db, 'public-quiz-participants', participantId), {
        completed: true,
        score: finalScore,
        answers: answers,
        completedAt: new Date()
      });

      // Navigate to results
      navigate(`/quiz-results/${quizId}?participant=${participantId}&score=${finalScore}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // Auto-submit when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(130,88,18)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!quiz?.questions) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div>No quiz questions found</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Question {currentQuestion + 1} of {quiz.questions.length}</h1>
          <div className={`text-xl font-semibold ${timeLeft <= 60 ? 'text-red-500 animate-pulse' : ''}`}>
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-lg">{quiz.questions[currentQuestion].question}</p>
        </div>

        <div className="space-y-3">
          {quiz.questions[currentQuestion].options.map((option, index) => (
            <label
              key={index}
              className={`block p-3 border rounded cursor-pointer
                ${answers[currentQuestion] === index ? 'bg-[rgb(130,88,18)] text-white' : 'hover:bg-gray-50'}`}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                checked={answers[currentQuestion] === index}
                onChange={() => {
                  setAnswers(prev => ({
                    ...prev,
                    [currentQuestion]: index
                  }));
                }}
                className="hidden"
              />
              {option}
            </label>
          ))}
        </div>

        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          
          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded hover:bg-[rgb(110,68,0)]"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(prev => Math.min(quiz.questions.length - 1, prev + 1))}
              className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Quiz; 