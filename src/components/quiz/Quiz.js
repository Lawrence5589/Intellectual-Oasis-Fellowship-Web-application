import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

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
          console.log('Quiz found');
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

      // Get the participant's start time and calculate duration
      const participantDoc = await getDoc(doc(db, 'public-quiz-participants', participantId));
      const startTime = participantDoc.data().startedAt;
      const completedAt = new Date();

      // Update participant record with completion time and score
      await updateDoc(doc(db, 'public-quiz-participants', participantId), {
        completed: true,
        score: finalScore,
        answers: answers,
        completedAt: completedAt
      });

      // Navigate to results
      navigate(`/quiz-results/${quizId}?participant=${participantId}&score=${finalScore}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz');
    }
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