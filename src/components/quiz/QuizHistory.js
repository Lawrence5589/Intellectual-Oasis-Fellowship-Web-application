import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp, limit, startAfter, orderBy, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { FiShare2, FiTrash2, FiUsers, FiClock, FiBarChart2, FiBook, FiCalendar, FiChevronLeft, FiChevronRight, FiAward, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import LeaderboardModal from './LeaderboardModal';

function QuizHistory() {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [error, setError] = useState('');
  const [pageSize] = useState(10);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      if (user) {
        loadQuizzes();
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadQuizzes = async (isNextPage = false) => {
    if (!auth.currentUser) {
      console.log('No authenticated user');
      setLoading(false);
      return;
    }

    try {
      const userId = auth.currentUser.uid;
      console.log('Fetching quizzes for user:', userId);
      
      const quizzesRef = collection(db, 'quizzes');
      let q = query(
        quizzesRef, 
        where('createdBy', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );

      if (isNextPage && lastVisible) {
        q = query(
          quizzesRef,
          where('createdBy', '==', userId),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(pageSize)
        );
      }
      
      const quizzesSnap = await getDocs(q);
      
      if (quizzesSnap.empty) {
        setHasMore(false);
        if (!isNextPage) setQuizzes([]);
        return;
      }

      setLastVisible(quizzesSnap.docs[quizzesSnap.docs.length - 1]);
      
      const newQuizData = await Promise.all(quizzesSnap.docs.map(async (doc) => {
        const data = doc.data();
        const participantsData = await loadParticipants(doc.id);
        
        return {
          id: doc.id,
          ...data,
          quizName: data.quizName || data.setTitle || 'Untitled Quiz',
          subject: data.subject || 'No Subject',
          topic: data.topic || 'No Topic',
          timeLimit: data.timeLimit || 15,
          questionCount: data.questions?.length || 0,
          createdAt: data.createdAt instanceof Timestamp 
            ? data.createdAt.toDate() 
            : new Date(data.createdAt || Date.now()),
          participants: participantsData
        };
      }));

      setQuizzes(prev => isNextPage ? [...prev, ...newQuizData] : newQuizData);
      setHasMore(newQuizData.length === pageSize);

    } catch (error) {
      console.error('Error in loadQuizzes:', error);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (quizId) => {
    try {
      const participantsRef = collection(db, 'public-quiz-participants');
      const q = query(
        participantsRef, 
        where('quizId', '==', quizId)
      );
      
      const participantsSnap = await getDocs(q);
      console.log(`Found ${participantsSnap.size} participants for quiz ${quizId}`);
      
      const participants = participantsSnap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          startedAt: data.startedAt?.toDate(),
          completedAt: data.completedAt?.toDate(),
          timeTaken: data.completedAt && data.startedAt ? 
            Math.round((data.completedAt.toDate() - data.startedAt.toDate()) / 1000) : 
            null
        };
      });

      console.log('Processed participants:', participants);
      return participants;
    } catch (error) {
      console.error('Error loading participants:', error);
      return [];
    }
  };

  const deleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await deleteDoc(doc(db, 'quizzes', quizId));
        setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const shareQuiz = (quizId) => {
    const quizUrl = `${window.location.origin}/public-quiz/${quizId}`;
    navigator.clipboard.writeText(quizUrl);
    alert('Quiz link copied to clipboard!');
  };

  const sortQuizzes = (quizList) => {
    switch (sortBy) {
      case 'name':
        return [...quizList].sort((a, b) => 
          (a.quizName || '').localeCompare(b.quizName || '')
        );
      case 'participants':
        return [...quizList].sort((a, b) => 
          (b.participants?.length || 0) - (a.participants?.length || 0)
        );
      case 'date':
      default:
        return [...quizList].sort((a, b) => b.createdAt - a.createdAt);
    }
  };

  const getFilteredAndSortedQuizzes = () => {
    const filtered = quizzes.filter(quiz => 
      (quiz.quizName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (quiz.topic || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    return sortQuizzes(filtered);
  };

  const renderQuizRow = (quiz) => {
    const totalParticipants = quiz.participants?.length || 0;
    const completedParticipants = quiz.participants?.filter(p => p.completed) || [];
    const averageScore = completedParticipants.length > 0 
      ? Math.round(completedParticipants.reduce((sum, p) => sum + (p.score || 0), 0) / completedParticipants.length)
      : 0;

    // Mobile view (under 768px)
    if (window.innerWidth < 768) {
      return (
        <div key={quiz.id} className="bg-white p-3 rounded-lg shadow-sm mb-3 border">
          <div className="flex justify-between items-start mb-2">
            <div className="font-medium">{quiz.quizName}</div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSelectedQuiz(quiz);
                  setShowDetails(true);
                }}
                className="p-1 text-gray-600 hover:text-[rgb(130,88,18)]"
                title="View Details"
              >
                <FiBarChart2 size={16} />
              </button>
              <button
                onClick={() => shareQuiz(quiz.id)}
                className="p-1 text-gray-600 hover:text-[rgb(130,88,18)]"
                title="Share Quiz"
              >
                <FiShare2 size={16} />
              </button>
              <button
                onClick={() => deleteQuiz(quiz.id)}
                className="p-1 text-gray-600 hover:text-red-500"
                title="Delete Quiz"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Participants</span>
              <div>{totalParticipants} ({completedParticipants.length})</div>
            </div>
            <div>
              <span className="text-gray-500">Avg Score</span>
              <div>{averageScore}%</div>
            </div>
            <div>
              <span className="text-gray-500">Questions</span>
              <div>{quiz.questionCount}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(quiz.createdAt).toLocaleDateString()}
          </div>
        </div>
      );
    }

    // Desktop view (768px and above)
    return (
      <tr key={quiz.id} className="border-b hover:bg-gray-50">
        <td className="py-2 px-4">{quiz.quizName}</td>
        <td className="py-2 px-4 text-center">
          <div>
            <span>{totalParticipants}</span>
            <span className="text-xs text-gray-500 ml-1">
              ({completedParticipants.length})
            </span>
          </div>
        </td>
        <td className="py-2 px-4 text-center">{averageScore}%</td>
        <td className="py-2 px-4 text-center">{quiz.questionCount}</td>
        <td className="py-2 px-4 text-center">
          {new Date(quiz.createdAt).toLocaleDateString()}
        </td>
        <td className="py-2 px-4">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setSelectedQuiz(quiz);
                setShowDetails(true);
              }}
              className="p-1 text-gray-600 hover:text-[rgb(130,88,18)]"
              title="View Details"
            >
              <FiBarChart2 size={18} />
            </button>
            <button
              onClick={() => shareQuiz(quiz.id)}
              className="p-1 text-gray-600 hover:text-[rgb(130,88,18)]"
              title="Share Quiz"
            >
              <FiShare2 size={18} />
            </button>
            <button
              onClick={() => deleteQuiz(quiz.id)}
              className="p-1 text-gray-600 hover:text-red-500"
              title="Delete Quiz"
            >
              <FiTrash2 size={18} />
            </button>
          </div>
        </td>
      </tr>
    );
  };

  const QuizDetailsModal = ({ quiz, onClose }) => {
    if (!quiz) return null;

    const completedParticipants = quiz.participants?.filter(p => p.completed) || [];
    const averageScore = completedParticipants.length > 0 
      ? Math.round(completedParticipants.reduce((sum, p) => sum + (p.score || 0), 0) / completedParticipants.length)
      : 0;
    const averageTime = completedParticipants.length > 0
      ? Math.round(completedParticipants.reduce((sum, p) => sum + (p.timeTaken || 0), 0) / completedParticipants.length)
      : 0;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">{quiz.quizName}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX size={24} />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox icon={<FiUsers />} label="Total Participants" value={quiz.participants?.length || 0} />
            <StatBox icon={<FiAward />} label="Average Score" value={`${averageScore}%`} />
            <StatBox icon={<FiClock />} label="Average Time" 
              value={`${Math.floor(averageTime / 60)}:${(averageTime % 60).toString().padStart(2, '0')}`} />
            <StatBox icon={<FiBook />} label="Questions" value={quiz.questionCount} />
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-2">Participant Results</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-center">Score</th>
                    <th className="py-2 px-4 text-center">Time</th>
                    <th className="py-2 px-4 text-center">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {quiz.participants?.map((participant) => (
                    <tr key={participant.id} className="border-b">
                      <td className="py-2 px-4">{participant.fullName || 'Anonymous'}</td>
                      <td className="py-2 px-4 text-center">
                        {participant.completed ? `${participant.score}%` : 'In Progress'}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {participant.timeTaken ? 
                          `${Math.floor(participant.timeTaken / 60)}:${(participant.timeTaken % 60).toString().padStart(2, '0')}` : 
                          '-'}
                      </td>
                      <td className="py-2 px-4 text-center">
                        {participant.startedAt?.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const StatBox = ({ icon, label, value }) => (
    <div className="bg-gray-50 p-3 rounded">
      <div className="flex items-center space-x-2">
        <span className="text-[rgb(130,88,18)]">{icon}</span>
        <div>
          <div className="text-xs text-gray-500">{label}</div>
          <div className="font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl font-bold text-gray-800">Quiz History</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search quizzes..."
            className="p-2 border rounded text-sm w-full sm:w-auto"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-2 border rounded text-sm w-full sm:w-auto"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="participants">Participants</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(130,88,18)]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <>
          <div className="hidden md:block"> {/* Desktop view */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="py-2 px-4 text-left">Quiz Name</th>
                    <th className="py-2 px-4 text-center">Participants</th>
                    <th className="py-2 px-4 text-center">Avg Score</th>
                    <th className="py-2 px-4 text-center">Questions</th>
                    <th className="py-2 px-4 text-center">Created</th>
                    <th className="py-2 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredAndSortedQuizzes().map(renderQuizRow)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden"> {/* Mobile view */}
            <div className="space-y-3">
              {getFilteredAndSortedQuizzes().map(renderQuizRow)}
            </div>
          </div>

          {hasMore && (
            <button
              onClick={() => loadQuizzes(true)}
              className="w-full mt-4 p-2 text-[rgb(130,88,18)] hover:bg-gray-50 rounded text-sm"
            >
              Load More
            </button>
          )}

          {showDetails && (
            <QuizDetailsModal
              quiz={selectedQuiz}
              onClose={() => {
                setShowDetails(false);
                setSelectedQuiz(null);
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

export default QuizHistory; 