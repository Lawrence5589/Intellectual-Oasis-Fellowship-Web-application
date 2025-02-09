import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, Timestamp, limit, startAfter, orderBy, addDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { FiShare2, FiTrash2, FiUsers, FiClock, FiBarChart2, FiBook, FiCalendar, FiChevronLeft, FiChevronRight, FiAward } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import LeaderboardModal from './LeaderboardModal';

function QuizHistory() {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [pageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Add missing state variables
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [indexBuilding, setIndexBuilding] = useState(false);
  const navigate = useNavigate();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user?.uid);
      setUser(user);
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
        limit(pageSize * 2) // Fetch more data to check if there are more pages
      );

      if (isNextPage && lastVisible) {
        q = query(
          quizzesRef,
          where('createdBy', '==', userId),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(pageSize * 2)
        );
      }
      
      const quizzesSnap = await getDocs(q);
      
      if (quizzesSnap.empty) {
        setHasMore(false);
        if (!isNextPage) setQuizzes([]);
        return;
      }

      setLastVisible(quizzesSnap.docs[quizzesSnap.docs.length - 1]);
      
      const newQuizData = quizzesSnap.docs
        .filter(doc => doc.data().createdBy === userId)
        .map(doc => {
          const data = doc.data();
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
              : new Date(data.createdAt || Date.now())
          };
        });

      // Set hasMore based on whether we got more items than pageSize
      setHasMore(newQuizData.length > pageSize);
      
      // Only take pageSize number of items
      const paginatedData = newQuizData.slice(0, pageSize);
      
      setQuizzes(prev => isNextPage ? [...prev, ...paginatedData] : paginatedData);
      setIndexBuilding(false);

      // Load participants for each quiz
      for (const quiz of paginatedData) {
        await loadParticipants(quiz.id);
      }

    } catch (error) {
      console.error('Error in loadQuizzes:', error);
      setError('Failed to load quizzes. Please try again.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadParticipants = async (quizId) => {
    try {
      const participantsRef = collection(db, 'public-quiz-participants');
      const q = query(participantsRef, where('quizId', '==', quizId));
      const participantsSnap = await getDocs(q);
      
      console.log(`Participants for quiz ${quizId}:`, participantsSnap.size);
      
      setParticipants(prev => ({
        ...prev,
        [quizId]: participantsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }));
    } catch (error) {
      console.error('Error loading participants:', error);
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

  const getAverageScore = (quizId) => {
    const quizParticipants = participants[quizId] || [];
    if (quizParticipants.length === 0) return 0;
    const totalScore = quizParticipants.reduce((sum, p) => sum + (p.score || 0), 0);
    return (totalScore / quizParticipants.length).toFixed(1);
  };

  const sortQuizzes = (quizList) => {
    switch (sortBy) {
      case 'name':
        return [...quizList].sort((a, b) => 
          (a.quizName || '').localeCompare(b.quizName || '')
        );
      case 'participants':
        return [...quizList].sort((a, b) => 
          (participants[b.id]?.length || 0) - (participants[a.id]?.length || 0)
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

  const getCurrentPageItems = () => {
    const filteredAndSorted = getFilteredAndSortedQuizzes();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSorted.slice(startIndex, endIndex);
  };

  const handleTakeQuiz = async (quizId) => {
    console.log('Take Quiz button clicked for quiz ID:', quizId);
    
    if (!auth.currentUser) {
      console.error('No authenticated user found');
      setError('Please log in to take the quiz');
      return;
    }

    try {
      console.log('Creating participant record...');
      const participantsRef = collection(db, 'public-quiz-participants');
      
      // Check if participant already exists
      const existingParticipantQuery = query(
        participantsRef,
        where('quizId', '==', quizId),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const existingParticipants = await getDocs(existingParticipantQuery);
      let participantId;

      if (!existingParticipants.empty) {
        participantId = existingParticipants.docs[0].id;
        console.log('Found existing participant:', participantId);
      } else {
        const newParticipantRef = await addDoc(participantsRef, {
          quizId,
          userId: auth.currentUser.uid,
          fullName: auth.currentUser.displayName || 'Anonymous',
          email: auth.currentUser.email,
          startedAt: new Date(),
          authProvider: auth.currentUser.providerData[0]?.providerId || 'email',
          completed: false // Add this to track completion status
        });
        participantId = newParticipantRef.id;
        console.log('Created new participant:', participantId);
      }

      const quizUrl = `/take-quiz/${quizId}?participant=${participantId}&type=public`;
      console.log('Attempting navigation to:', quizUrl);
      
      // Force a hard navigation if needed
      window.location.href = quizUrl;
      
      // Backup navigation using navigate
      // setTimeout(() => {
      //   navigate(quizUrl, { replace: true });
      // }, 100);

    } catch (error) {
      console.error('Error in handleTakeQuiz:', error);
      setError('Failed to start quiz. Please try again.');
    }
  };

  const fetchLeaderboard = async (quizId) => {
    setLoading(true);
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

      setLeaderboard(topScores);
      setShowLeaderboard(true);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizzes.length > 0) {
      const filteredQuizzes = getFilteredAndSortedQuizzes();
      setTotalPages(Math.ceil(filteredQuizzes.length / pageSize));
    }
  }, [quizzes, searchTerm, sortBy, pageSize]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(130,88,18)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-4 max-w-7xl mx-auto">
      {error && (
        <div className={`border px-4 py-3 rounded relative ${
          indexBuilding 
            ? 'bg-blue-100 border-blue-400 text-blue-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Your Quizzes</h2>
            {auth.currentUser && (
              <div className="text-sm text-gray-600">
                <p>Email: {auth.currentUser.email}</p>
                <p>Total Quizzes: {quizzes.length}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-[rgb(130,88,18)] outline-none"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(130,88,18)] focus:border-[rgb(130,88,18)] outline-none"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="participants">Sort by Participants</option>
          </select>
        </div>
      </div>
      
      {!auth.currentUser ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Please sign in to view your quizzes.</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(130,88,18)]"></div>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            {searchTerm ? 'No quizzes match your search.' : 'You haven\'t created any quizzes yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quiz Name
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Subject
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Topic
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                    Users
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Created
                  </th>
                  <th className="px-2 sm:px-4 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getCurrentPageItems().map(quiz => (
                  <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[150px] sm:max-w-none">
                        {quiz.quizName}
                      </div>
                      <div className="text-xs text-gray-500 sm:hidden truncate">
                        {quiz.subject} - {quiz.topic}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-500">{quiz.subject}</div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-500">{quiz.topic}</div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-center">
                      <div className="text-sm text-gray-500">{participants[quiz.id]?.length || 0}</div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-gray-500">
                        {quiz.createdAt.toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-2 sm:py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1 sm:space-x-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Take Quiz button clicked - event prevented');
                            handleTakeQuiz(quiz.id);
                          }}
                          className="flex items-center justify-center p-2 text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)]"
                          title="Take Quiz"
                        >
                          <FiBook className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="sr-only">Take Quiz</span>
                        </button>
                        <button
                          onClick={() => shareQuiz(quiz.id)}
                          className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)]"
                          title="Share Quiz"
                        >
                          <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => deleteQuiz(quiz.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Quiz"
                        >
                          <FiTrash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => fetchLeaderboard(quiz.id)}
                          disabled={loading}
                          className="text-[rgb(130,88,18)] hover:text-[rgb(110,68,0)]"
                          title="View Leaderboard"
                        >
                          <FiAward className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => prev - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * pageSize, quizzes.length)}</span> of{' '}
                  <span className="font-medium">{quizzes.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}

      <LeaderboardModal
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        leaderboard={leaderboard}
        currentUserId={auth.currentUser?.uid}
      />
    </div>
  );
}

export default QuizHistory; 