import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { FiAward, FiClock, FiBarChart2, FiStar } from 'react-icons/fi';

function QuizResults() {
  const { quizId } = useParams();
  const [searchParams] = useSearchParams();
  const participantId = searchParams.get('participant');
  const score = searchParams.get('score');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [participant, setParticipant] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchResults = async () => {
      try {
        // Fetch quiz data
        const quizRef = doc(db, 'quizzes', quizId);
        const quizDoc = await getDoc(quizRef);

        if (!quizDoc.exists()) {
          throw new Error('Quiz not found');
        }

        // Fetch participant data
        const participantRef = doc(db, 'public-quiz-participants', participantId);
        const participantDoc = await getDoc(participantRef);

        if (!participantDoc.exists()) {
          throw new Error('Results not found');
        }

        const participantData = participantDoc.data();

        if (isMounted) {
          setQuiz(quizDoc.data());
          setParticipant(participantData);
          setLoading(false);
        }

        // Fetch leaderboard data
        try {
          const participantsRef = collection(db, 'public-quiz-participants');
          const leaderboardQuery = query(
            participantsRef,
            where('quizId', '==', quizId),
            where('completed', '==', true),
            orderBy('score', 'desc'),
            limit(50)
          );

          const leaderboardDocs = await getDocs(leaderboardQuery);
          
          // Process leaderboard to get unique users with best scores
          const uniqueUserScores = new Map();
          leaderboardDocs.forEach(doc => {
            const data = doc.data();
            const existingEntry = uniqueUserScores.get(data.userId);
            
            if (!existingEntry || 
                (data.score > existingEntry.score || 
                 (data.score === existingEntry.score && 
                  data.completedAt.toDate() - data.startedAt.toDate() < 
                  existingEntry.completedAt.toDate() - existingEntry.startedAt.toDate()))) {
              uniqueUserScores.set(data.userId, {
                ...data,
                timeTaken: (data.completedAt.toDate() - data.startedAt.toDate()) / 1000,
                id: doc.id
              });
            }
          });

          // Convert to array, sort, and take top 5
          const topScores = Array.from(uniqueUserScores.values())
            .sort((a, b) => {
              if (b.score !== a.score) return b.score - a.score;
              return a.timeTaken - b.timeTaken;
            })
            .slice(0, 5);

          if (isMounted) {
            setLeaderboard(topScores);
          }
        } catch (leaderboardError) {
          console.error('Error fetching leaderboard:', leaderboardError);
          if (isMounted) {
            setLeaderboardError(leaderboardError.message);
          }
        } finally {
          if (isMounted) {
            setLeaderboardLoading(false);
          }
        }

      } catch (error) {
        console.error('Error fetching results:', error);
        if (isMounted) {
          setError(error.message);
          setLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isMounted = false;
    };
  }, [quizId, participantId]);

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const calculateTimeTaken = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const timeDiff = endTime.toDate() - startTime.toDate();
    return Math.max(0, timeDiff / 1000); // Convert to seconds and ensure non-negative
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
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-[rgb(130,88,18)] text-white rounded hover:bg-[rgb(110,68,0)]"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Personal Score Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Quiz Results</h1>
          <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
            {score}%
          </div>
          <div className="text-gray-600 mt-2">
            {score >= 75 ? 'Excellent work!' : 
             score >= 50 ? 'Good effort!' : 
             'Keep practicing!'}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FiAward className="w-6 h-6 mx-auto mb-2 text-[rgb(130,88,18)]" />
            <div className="text-sm text-gray-600">Your Score</div>
            <div className="font-bold">{score}%</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FiBarChart2 className="w-6 h-6 mx-auto mb-2 text-[rgb(130,88,18)]" />
            <div className="text-sm text-gray-600">Questions</div>
            <div className="font-bold">{quiz?.questions?.length || 0}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <FiClock className="w-6 h-6 mx-auto mb-2 text-[rgb(130,88,18)]" />
            <div className="text-sm text-gray-600">Time Used</div>
            <div className="font-bold">
              {formatTime(calculateTimeTaken(participant?.startedAt, participant?.completedAt))} 
              <span className="text-sm text-gray-500 ml-1">
                / {formatTime(quiz?.timeLimit * 60 || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Leaderboard Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FiStar className="mr-2 text-[rgb(130,88,18)]" />
            Top Performers
          </h2>
          {leaderboardLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(130,88,18)]"></div>
            </div>
          ) : leaderboardError ? (
            <div className="text-center py-4 text-gray-500">
              Unable to load leaderboard at this time
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No entries in leaderboard yet
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <div 
                  key={entry.id}
                  className={`flex items-center p-4 rounded-lg ${
                    entry.userId === currentUser?.uid ? 'bg-[rgb(130,88,18)] bg-opacity-10' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-shrink-0 w-8 text-center font-bold text-[rgb(130,88,18)]">
                    #{index + 1}
                  </div>
                  <div className="flex-grow ml-4">
                    <div className="font-semibold">{entry.fullName}</div>
                    <div className="text-sm text-gray-600">
                      Time Used: {formatTime(calculateTimeTaken(entry.startedAt, entry.completedAt))}
                    </div>
                  </div>
                  <div className={`flex-shrink-0 font-bold ${getScoreColor(entry.score)}`}>
                    {entry.score}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate(`/take-quiz/${quizId}?participant=${participantId}&type=public`)}
            className="px-6 py-2 bg-[rgb(130,88,18)] text-white rounded hover:bg-[rgb(110,68,0)]"
          >
            Retry Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizResults; 