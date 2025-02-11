import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import LoadingIndicator from '../common/LoadingIndicator';

function ResultsPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const [highestScore, setHighestScore] = useState(0);
  const [courseProgress, setCourseProgress] = useState(0);

  // Get module and subcourse from URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const moduleId = searchParams.get('module');
  const subCourseId = searchParams.get('subcourse');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get current quiz results
        const resultId = `${courseId}_${moduleId}_${subCourseId}`;
        const resultDoc = await getDoc(doc(db, 'users', user.uid, 'examResults', resultId));
        
        if (resultDoc.exists()) {
          const resultData = resultDoc.data();
          setResults(resultData);
          setAttempts(resultData.attempts || 1);
          setHighestScore(resultData.highestScore || resultData.score);
        }

        // Get course progress
        const progressDoc = await getDoc(doc(db, 'users', user.uid, 'courseProgress', courseId));
        if (progressDoc.exists()) {
          setCourseProgress(progressDoc.data().progress);
        }

        setLoading(false);
      } catch (error) {
        console.error('Error fetching results:', error);
        setLoading(false);
      }
    };

    if (user) fetchResults();
  }, [user, courseId]);

  const handleMarkComplete = async () => {
    if (results.score < 75) {
      alert('You need to score at least 75% to mark this section as complete.');
      return;
    }

    try {
      setLoading(true);
      
      // Update user's course progress
      const userProgressRef = doc(db, 'users', user.uid, 'courseProgress', courseId);
      const userCompletedRef = doc(db, 'users', user.uid, 'completedSubCourses', courseId);
      
      // Get current course data
      const courseRef = doc(db, 'courses', courseId);
      const courseDoc = await getDoc(courseRef);
      const courseData = courseDoc.data();

      // Get current completion status
      const completedDoc = await getDoc(userCompletedRef);
      const completedData = completedDoc.exists() ? completedDoc.data() : { completed: {} };

      // Mark this subcourse as completed
      const completionKey = `${moduleId}_${subCourseId}`;
      completedData.completed[completionKey] = {
        completedAt: new Date().toISOString(),
        score: results.score,
        attempts: attempts
      };

      // Calculate new progress
      const totalSubCourses = courseData.modules.reduce(
        (total, module) => total + (module.subCourses?.length || 0),
        0
      );
      const completedCount = Object.keys(completedData.completed).length;
      const newProgress = (completedCount / totalSubCourses) * 100;

      // Batch write the updates
      const batch = writeBatch(db);
      
      // Update completed subcourses
      batch.set(userCompletedRef, completedData, { merge: true });
      
      // Update progress
      batch.set(userProgressRef, {
        progress: newProgress,
        lastUpdated: new Date().toISOString()
      }, { merge: true });

      // Store the exam result
      const resultRef = doc(db, 'users', user.uid, 'examResults', `${courseId}_${moduleId}_${subCourseId}`);
      batch.set(resultRef, {
        score: results.score,
        attempts: attempts,
        highestScore: Math.max(results.score, highestScore),
        completedAt: new Date().toISOString(),
        courseId,
        moduleId,
        subCourseId
      });

      await batch.commit();
      
      // Navigate back to course
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!results || !moduleId || !subCourseId) {
        console.error('Missing required data for retry');
        return;
    }

    // Only allow retry if score is below 75% and attempts are less than 3
    if (results.score >= 75) {
        alert('You have already passed this evaluation.');
        return;
    }

    if (attempts >= 3) {
        alert('You have reached the maximum number of attempts for this quiz.');
        return;
    }

    // If conditions are met, navigate to exam page with required parameters
    navigate(`/courses/${courseId}/exam?module=${moduleId}&subcourse=${subCourseId}`);
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Evaluation Results</h1>
        
        {attempts >= 3 && results.score < 75 ? (
            <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-red-600 mb-4">
                    Course Failed
                </h2>
                <p className="text-gray-700">
                    You have exhausted all 3 attempts and did not achieve a passing score.
                    Please contact the administrator for further assistance.
                </p>
            </div>
        ) : (
            <div className="mb-8">
                <div className="text-center">
                    <h2 className="text-6xl font-bold text-gray-700 mb-4">
                        {results.score.toFixed(1)}%
                    </h2>
                    <p className="text-xl mb-2">
                        Grade: {results.score >= 75 ? 'Pass' : 'Fail'}
                    </p>
                    <p className="text-gray-600">
                        Attempts: {attempts}/3
                    </p>
                    <p className="text-gray-600">
                        Highest Score: {highestScore.toFixed(1)}%
                    </p>
                </div>
            </div>
        )}

        <div className="space-y-4">
          <p className="text-center text-lg">
            Correct Answers: {results.correctAnswers} out of {results.totalQuestions}
          </p>
          
          <div className="flex justify-center space-x-4 mt-8">
            {results.score >= 75 ? (
              <button
                onClick={handleMarkComplete}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Mark Complete
              </button>
            ) : (
              <button
                onClick={handleRetry}
                disabled={attempts >= 3}
                className={`bg-[rgb(130,88,18)] text-white px-6 py-2 rounded-lg 
                  ${attempts >= 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[rgb(110,68,0)]'}`}
              >
                Retry Evaluation
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage; 