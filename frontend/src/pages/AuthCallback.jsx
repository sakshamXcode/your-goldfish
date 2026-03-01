// frontend/src/pages/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  // Extract any errors from the URL right away to prevent cascading renders
  const hash = window.location.hash;
  const initialError = hash && hash.includes('error_description') 
    ? new URLSearchParams(hash.substring(1)).get('error_description').replace(/\+/g, ' ') 
    : null;
    
  const [error] = useState(initialError);

  const { user } = useAuthContext();

  useEffect(() => {
    // Only redirect once the AuthContext has finished saving the user firmly into React state.
    // This prevents ProtectedRoute from catching a 'null' ghost user during the split-second
    // between Supabase unlocking and React updating the global context.
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-screen">
        <h2 className="text-xl font-bold text-red-600 mb-2">Login Failed</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/auth/login')}
          className="px-4 py-2 bg-gray-200 rounded-lg"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-[#FF6FAF] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Authenticating your Magic Link...</p>
      </div>
    </div>
  );
}
