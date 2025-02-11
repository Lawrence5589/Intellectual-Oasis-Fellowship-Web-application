import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';

function PublicQuizEntry() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    consent: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [authCompleted, setAuthCompleted] = useState(false);

  // Handle redirect result first
  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log('Google Sign-in successful:', result.user.uid);
          setAuthCompleted(true);
        }
      } catch (error) {
        console.error('Redirect Error:', error);
        setError('Failed to complete sign in. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    handleRedirectResult();
  }, []);

  // Handle participant creation and navigation after authentication
  useEffect(() => {
    const createParticipantAndRedirect = async () => {
      if (!currentUser || !authCompleted || isProcessing) return;

      try {
        setIsProcessing(true);
        console.log('Creating participant for:', currentUser.uid);

        // Check if quiz exists
        const quizRef = doc(db, 'quizzes', quizId);
        const quizDoc = await getDoc(quizRef);

        if (!quizDoc.exists()) {
          throw new Error('Quiz not found');
        }

        // Check for existing participant
        const participantsRef = collection(db, 'public-quiz-participants');
        const q = query(
          participantsRef,
          where('quizId', '==', quizId),
          where('userId', '==', currentUser.uid)
        );

        const participantSnapshot = await getDocs(q);
        let participantId;

        if (!participantSnapshot.empty) {
          participantId = participantSnapshot.docs[0].id;
          console.log('Found existing participant:', participantId);
        } else {
          const newParticipantRef = await addDoc(participantsRef, {
            quizId,
            userId: currentUser.uid,
            fullName: currentUser.displayName || formData.fullName || 'Anonymous',
            email: currentUser.email,
            startedAt: new Date(),
            authProvider: currentUser.providerData[0]?.providerId || 'email'
          });
          participantId = newParticipantRef.id;
          console.log('Created new participant:', participantId);
        }

        const quizUrl = `/take-quiz/${quizId}?participant=${participantId}&type=public`;
        console.log('Navigating to:', quizUrl);
        await navigate(quizUrl, { replace: true });

      } catch (error) {
        console.error('Error:', error);
        setError(error.message || 'Failed to start quiz. Please try again.');
        setIsProcessing(false);
      }
    };

    createParticipantAndRedirect();
  }, [currentUser, authCompleted, quizId, navigate, isProcessing, formData.fullName]);

  const handleGoogleSignIn = async () => {
    if (!formData.consent) {
      setError('Please accept the consent to data processing');
      return;
    }

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
      setError('Failed to start sign in. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.consent) {
      setError('Please accept the consent to data processing');
      return;
    }

    try {
      setIsProcessing(true);
      let userCredential;

      if (isNewUser) {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        await updateProfile(userCredential.user, {
          displayName: formData.fullName
        });
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
      }

      setAuthCompleted(true);
    } catch (error) {
      console.error('Auth Error:', error);
      setError(
        error.code === 'auth/email-already-in-use'
          ? 'An account with this email already exists. Please sign in.'
          : error.code === 'auth/invalid-email'
          ? 'Invalid email address'
          : error.code === 'auth/wrong-password'
          ? 'Incorrect password'
          : 'Failed to register. Please try again.'
      );
      setIsProcessing(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(130,88,18)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {isNewUser ? 'Create Account' : 'Sign In'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isNewUser 
              ? 'Create an account to take the quiz'
              : 'Sign in to take the quiz'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Google Sign In Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(130,88,18)]"
            >
              <img 
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                alt="Google logo" 
                className="w-5 h-5 mr-2"
              />
              Continue with Google
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {isNewUser && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required={isNewUser}
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(130,88,18)] focus:border-[rgb(130,88,18)]"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(130,88,18)] focus:border-[rgb(130,88,18)]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[rgb(130,88,18)] focus:border-[rgb(130,88,18)]"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="consent"
                  type="checkbox"
                  checked={formData.consent}
                  onChange={(e) => setFormData({...formData, consent: e.target.checked})}
                  className="h-4 w-4 text-[rgb(130,88,18)] focus:ring-[rgb(130,88,18)] border-gray-300 rounded"
                />
                <label htmlFor="consent" className="ml-2 block text-sm text-gray-900">
                  I consent to the processing of my personal data for quiz participation
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(130,88,18)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(130,88,18)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (isNewUser ? 'Create Account' : 'Sign In')}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsNewUser(!isNewUser)}
                className="text-sm text-[rgb(130,88,18)] hover:underline"
              >
                {isNewUser 
                  ? 'Already have an account? Sign in'
                  : 'Need an account? Create one'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PublicQuizEntry; 