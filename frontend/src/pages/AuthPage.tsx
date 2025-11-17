import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Auth from '../components/Auth';

const AuthPage: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      const targetPath = currentUser.role === 'admin' ? '/admin-dashboard' : '/generate';
      navigate(targetPath);
    }
  }, [currentUser, navigate]);

  return <Auth />;
};

export default AuthPage;
