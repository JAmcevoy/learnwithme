import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { useSetCurrentUser } from '../../context/CurrentUserContext';
import ErrorModal from '../../components/ErrorModal';
import LoadingSpinner from '../../components/LoadingSpinner';

const SignIn = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); 
  const [isModalVisible, setIsModalVisible] = useState(false);

  const setCurrentUser = useSetCurrentUser();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/dj-rest-auth/login/', { username, password });
      setCurrentUser(data);

      history.replace('/');
      window.location.reload(); 
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    let errorMsg = 'An unexpected error occurred. Please try again.';
    
    if (err.response) {
      const { status, data } = err.response;
      if (status === 400 && data.non_field_errors) {
        errorMsg = data.non_field_errors[0];
      } else if (status === 400 && data.detail) {
        errorMsg = data.detail;
      } else {
        errorMsg = `Error: ${data.detail || 'Invalid credentials. Please try again.'}`;
      }
    } else if (err.request) {
      errorMsg = 'Network error. Please check your connection and try again.';
    }

    setPassword('');
    setError(errorMsg);
    setIsModalVisible(true); 
    console.error('Sign-in error:', err);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-400">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 mb-2">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div className="mb-4 relative">
            <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-2 top-2 text-gray-600 hover:text-gray-800"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <button
            type="submit"
            className={`w-full bg-blue-500 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>

      {isModalVisible && (
        <ErrorModal
          message={error}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default SignIn;
