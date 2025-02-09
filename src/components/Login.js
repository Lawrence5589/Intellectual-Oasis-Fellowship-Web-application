import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError('Failed to log in');
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard'); // Redirect to dashboard
    } catch (err) {
      setError('Failed to log in with Google');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset your password.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError('Failed to send password reset email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <img src="images/Group 4.jpg" alt="IO Fellowship" className="mx-auto h-16 mb-4" />
          <h1 className="text-2xl font-bold text-iof mb-2">Log In</h1>
          <p className="text-gray-600">Access your account</p>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <button
          onClick={handleGoogleLogin}
          className="w-full mb-6 border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
        >
          <img src="images/google.svg" alt="Google" className="w-5 h-5" />
          Log in with Google
        </button>

        <form onSubmit={handleLogin} className="space-y-4">
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
              className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-iof focus:ring-iof"
            />
          </div>
          <button type="submit" className="w-full bg-iof text-white py-2 px-4 rounded-full hover:bg-iof-dark transition-colors">Log In</button>
        </form>

        <div className="mt-4 text-center">
          <button onClick={handleForgotPassword} className="text-sm text-iof hover:text-iof-dark mb-4">Forgot Password?</button>
          <div className="text-gray-600">
            Don't have an account yet? 
            <Link to="/signup" className="text-iof hover:text-iof-dark">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;