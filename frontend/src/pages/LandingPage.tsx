import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Reviews from '../components/Reviews';
import Button from '../components/Button';

const LandingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.role === 'admin' ? '/admin-dashboard' : '/generate');
    }
  }, [currentUser, navigate]);

  if (currentUser) {
    return null; // Or a loading spinner while redirecting
  }

  return (
    <>
        <div className="container mx-auto max-w-5xl py-20 text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
            Generate stunning AI images instantly.
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
                Describe your vision and watch DOT Ai bring it to life. Unlock your creativity with the power of artificial intelligence. Get 25 free credits on sign up.
            </p>
            <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/login')}>Get Started</Button>
                <Button onClick={() => navigate('/gallery')} variant="secondary">Explore Gallery</Button>
            </div>
        </div>
        <Reviews />
    </>
  );
};

export default LandingPage;
