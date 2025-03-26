import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../contexts/AuthContext';
import { v4 as uuidv4 } from 'uuid';

function Quiz() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Get participantId from URL or generate new one
  const participantId = searchParams.get('participant') || uuidv4();

  // Redirect to include participantId if not in URL
  useEffect(() => {
    if (!searchParams.get('participant')) {
      navigate(`/take-quiz/${quizId}?participant=${participantId}`, { replace: true });
    }
  }, [quizId, participantId, searchParams, navigate]);

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [participantInitialized, setParticipantInitialized] = useState(false);

  console.log('Quiz render:', { quizId, participantId, currentUser: !!currentUser, loading, quiz: !!quiz, timeRemaining });

  // Modify the initialization useEffect
  useEffect(() => {
    const initializeParticipant = async () => {
      if (!quizId || !participantId) return;

      try {
        const participantRef = doc(db, 'public-quiz-participants', participantId);
        const participantDoc = await getDoc(participantRef);

        if (!participantDoc.exists()) {
          // Create new participant document if it doesn't exist
          await setDoc(participantRef, {
            quizId: quizId,
            startedAt: serverTimestamp(),
            completed: false,
            answers: {}
          });
          console.log('Created new participant document');
        } else {
          // If already completed, redirect to results
          if (participantDoc.data().completed) {
            const score = participantDoc.data().score;
            navigate(`/quiz-results/${quizId}?participant=${participantId}&score=${score}`);
            return;
          }
        }
        setParticipantInitialized(true);
      } catch (err) {
        console.error('Error initializing participant:', err);
        setError('Failed to initialize quiz. Please try again.');
      }
    };

    initializeParticipant();
  }, [quizId, participantId, navigate]);

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

  // Wrap handleSubmit in useCallback
  const handleSubmit = useCallback(async () => {
    try {
      // Calculate score
      let score = 0;
      Object.entries(answers).forEach(([questionIndex, selectedAnswer]) => {
        const question = quiz.questions[questionIndex];
        if (question && selectedAnswer === question.correctOption) {
          score++;
        }
      });

      const finalScore = Math.round((score / quiz.questions.length) * 100);

      // Check if participant exists
      const participantRef = doc(db, 'public-quiz-participants', participantId);
      const participantDoc = await getDoc(participantRef);
      
      if (!participantDoc.exists()) {
        throw new Error('Participant not found');
      }

      // Update participant record
      await updateDoc(participantRef, {
        completed: true,
        score: finalScore,
        answers: answers,
        completedAt: serverTimestamp()
      });

      // Navigate to results
      navigate(`/quiz-results/${quizId}?participant=${participantId}&score=${finalScore}`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    }
  }, [answers, quiz, participantId, quizId, navigate]);

  // Now the effect can safely include handleSubmit
  useEffect(() => {
    if (isTimeUp) {
      handleSubmit();
    }
  }, [isTimeUp, handleSubmit]);

  // Add console logs to debug timer
  useEffect(() => {
    if (!quiz?.timeLimit || !participantId) {
      console.log('Timer not starting:', { timeLimit: quiz?.timeLimit, participantId });
      return;
    }

    const getTimeRemaining = async () => {
      try {
        const participantRef = doc(db, 'public-quiz-participants', participantId);
        const participantDoc = await getDoc(participantRef);
        
        if (!participantDoc.exists()) {
          console.error('Participant document not found');
          return;
        }

        const startTime = participantDoc.data().startedAt?.toDate();
        if (!startTime) {
          console.error('Start time not found in participant document');
          return;
        }

        const timeLimitMs = quiz.timeLimit * 60 * 1000; // Convert minutes to milliseconds
        const endTime = new Date(startTime.getTime() + timeLimitMs);
        const remaining = endTime - new Date();

        console.log('Timer initialized:', { 
          startTime, 
          timeLimitMs, 
          endTime, 
          remaining 
        });

        setTimeRemaining(Math.max(0, remaining));
      } catch (err) {
        console.error('Error getting time remaining:', err);
      }
    };

    getTimeRemaining();

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null;
        const newTime = Math.max(0, prev - 1000);
        if (newTime === 0) {
          setIsTimeUp(true);
          clearInterval(timer);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, participantId]);

  // Modify the loading check in the render
  if (loading || !participantInitialized) {
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
          {timeRemaining !== null && (
            <div className={`text-xl font-bold ${timeRemaining < 60000 ? 'text-red-600' : ''}`}>
              Time: {Math.floor(timeRemaining / 60000)}:{String(Math.floor((timeRemaining % 60000) / 1000)).padStart(2, '0')}
            </div>
          )}
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