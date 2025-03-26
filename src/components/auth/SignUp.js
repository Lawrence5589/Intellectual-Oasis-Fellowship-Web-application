import React, { useState } from 'react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, GoogleAuthProvider, signInWithRedirect } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const saveUserToFirestore = async (user) => {
    try {
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || name,
        email: user.email,
        createdAt: new Date(),
        lastLogin: new Date(),
        isAdmin: false,
      });
    } catch (error) {
      console.error('Error adding user to Firestore:', error);
      throw error;
    }
  };

  // Add password validation function
  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length < minLength) {
      return 'Password must be at least 8 characters long';
    }
    if (!hasUpperCase || !hasLowerCase) {
      return 'Password must contain both uppercase and lowercase letters';
    }
    if (!hasNumbers) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  // Add input sanitization function
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    
    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: sanitizedName });
      await sendEmailVerification(user);
      await saveUserToFirestore(user);
      
      setCurrentUser(user);
      setVerificationSent(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    try {
      await signInWithRedirect(auth, provider);
    } catch (err) {
      setError('Failed to sign up with Google');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-lg shadow-lg">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img src="images/Group 4.jpg" alt="IO Fellowship" className="mx-auto h-16 mb-4" />
          <h1 className="text-2xl font-bold text-iof mb-2">Create an Account</h1>
          <p className="text-gray-600">Join IOF Training today</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        {verificationSent && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">Please check your email inbox to verify your account.</div>}

        <button
          onClick={handleGoogleSignUp}
          className="w-full mb-6 border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <img src="images/google.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength="8"
              className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
            />
            <p className="mt-1 text-sm text-gray-500">
              Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
            />
          </div>
          <button type="submit" className="w-full bg-[rgb(130,88,18)] text-white py-2 px-4 rounded-full hover:bg-[rgb(110,68,0)] transition-colors">Sign Up</button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-gray-600">
            Already have an account? 
            <Link to="/login" className="text-iof hover:text-iof-dark">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;