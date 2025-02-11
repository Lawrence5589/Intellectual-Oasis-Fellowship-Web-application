import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';

function ExamPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentSubCourse, setCurrentSubCourse] = useState(null);
  const [error, setError] = useState(null);

  // Fetch quiz data and check attempt status
  useEffect(() => {
    const fetchQuizAndCheckAttempt = async () => {
      try {
        if (!user) {
          setError('Please log in to take the exam');
          setLoading(false);
          return;
        }

        const searchParams = new URLSearchParams(window.location.search);
        const moduleId = searchParams.get('module');
        const subCourseId = searchParams.get('subcourse');

        if (!moduleId || !subCourseId) {
          setError('Invalid exam parameters');
          setLoading(false);
          return;
        }

        const courseRef = doc(db, 'courses', courseId);
        const courseDoc = await getDoc(courseRef);

        if (!courseDoc.exists()) {
          setError('Course not found');
          setLoading(false);
          return;
        }

        const courseData = courseDoc.data();
        const module = courseData.modules?.find(m => m.moduleId === moduleId);
        const subCourse = module?.subCourses?.find(sc => sc.subCourseId === subCourseId);

        if (!subCourse?.quizData) {
          setError('Quiz not found');
          setLoading(false);
          return;
        }

        // Check previous attempts
        const resultId = `${courseId}_${moduleId}_${subCourseId}`;
        const attemptRef = doc(db, 'users', user.uid, 'examResults', resultId);
        const attemptDoc = await getDoc(attemptRef);

        if (attemptDoc.exists()) {
          const resultData = attemptDoc.data();
          if (resultData.attempts >= 3 || resultData.score >= 75) {
            navigate(`/courses/${courseId}/results?module=${moduleId}&subcourse=${subCourseId}`);
            return;
          }
        }

        setQuiz(subCourse.quizData);
        setCurrentModule(module);
        setCurrentSubCourse(subCourse);
        setTimeLeft(subCourse.quizData.questions.length * 30);
        setLoading(false);

      } catch (error) {
        console.error('Error fetching quiz:', error);
        setLoading(false);
      }
    };

    fetchQuizAndCheckAttempt();
  }, [courseId, user, navigate]);

  // Timer logic
  useEffect(() => {
    if (!timeLeft || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quiz]);

  const handleAnswerSelect = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const submitExam = async () => {
    if (!quiz || !user || !currentModule || !currentSubCourse) return;

    const results = {
      totalQuestions: quiz.questions.length,
      correctAnswers: 0,
      answers: answers,
      timestamp: serverTimestamp(),
      courseId: courseId,
      moduleId: currentModule.moduleId,
      subCourseId: currentSubCourse.subCourseId,
      timeTaken: quiz.questions.length * 30 - timeLeft
    };

    // Calculate score
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctOption) {
        results.correctAnswers += 1;
      }
    });

    results.score = (results.correctAnswers / results.totalQuestions) * 100;

    try {
      // Save results with a unique ID combining course, module, and subcourse
      const resultId = `${courseId}_${currentModule.moduleId}_${currentSubCourse.subCourseId}`;
      await setDoc(doc(db, 'users', user.uid, 'examResults', resultId), results);

      // Add to overall results collection for analytics
      await addDoc(collection(db, 'examResults'), {
        userId: user.uid,
        courseId: courseId,
        moduleId: currentModule.moduleId,
        subCourseId: currentSubCourse.subCourseId,
        score: results.score,
        timestamp: results.timestamp
      });

      // Navigate to results page with module and subcourse information
      navigate(`/courses/${courseId}/results?module=${currentModule.moduleId}&subcourse=${currentSubCourse.subCourseId}`);
    } catch (error) {
      console.error('Error saving exam results:', error);
    }
  };

  if (loading) {
    return <div>Loading exam...</div>;
  }

  if (!quiz) {
    return <div>No quiz found for this course.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Course Examination</h1>
        <div className="text-xl font-semibold">
          Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {quiz.questions[currentQuestion] && (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </h2>
              <p className="text-gray-700">{quiz.questions[currentQuestion].question}</p>
            </div>

            <div className="space-y-2">
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <label
                  key={index}
                  className={`block p-3 border rounded-lg cursor-pointer transition-colors
                    ${answers[currentQuestion] === index ? 'bg-[rgb(130,88,18)] text-white' : 'hover:bg-gray-50'}`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion}`}
                    value={index}
                    checked={answers[currentQuestion] === index}
                    onChange={() => handleAnswerSelect(currentQuestion, index)}
                    className="hidden"
                  />
                  {option}
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setCurrentQuestion(prev => prev - 1)}
                disabled={currentQuestion === 0}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestion < quiz.questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                  className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submitExam}
                  className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded hover:bg-[rgb(110,68,0)]"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ExamPage; 