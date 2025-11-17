import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Favorite, CreditRequest } from '../types';
import { api } from '../services/api';
import { toast } from '../hooks/useToast';
import { useHistory } from '../hooks/useHistory';

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  toggleFavorite: (favoriteData: Omit<Favorite, 'id' | 'createdAt' | 'userId'>) => Promise<void>;
  submitCreditRequest: (requestData: Omit<CreditRequest, 'id' | 'userId' | 'name' | 'email' | 'status' | 'createdAt' | 'resolvedAt' | 'adminNote'>) => Promise<boolean>;
  updateUserProfile: (userId: number, updates: Partial<User>) => Promise<void>;
  deleteMyAccount: () => Promise<void>;
  addReview: (reviewData: { rating: number; comment: string }) => Promise<void>;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { 
    state: currentUser, 
    setState: setCurrentUser, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('dotai_token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const { data } = await api.get('/users/me');
          setCurrentUser(data);
        } catch (error) {
          console.error("Session expired or invalid.", error);
          localStorage.removeItem('dotai_token');
          api.defaults.headers.common['Authorization'] = '';
        }
      }
      setIsLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const { data } = await api.post('/auth/login', { email, password: pass });
      localStorage.setItem('dotai_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setCurrentUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed.');
      throw error;
    }
  };
  
  const signup = async (name: string, email: string, pass: string) => {
    try {
      const { data } = await api.post('/auth/register', { name, email, password: pass });
      localStorage.setItem('dotai_token', data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setCurrentUser(data.user);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Signup failed.');
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dotai_token');
    delete api.defaults.headers.common['Authorization'];
    toast.success('You have been logged out.');
  };

  const toggleFavorite = async (favoriteData: Omit<Favorite, 'id' | 'createdAt' | 'userId'>) => {
    if (!currentUser) return;
    try {
      const { data } = await api.post('/users/favorites/toggle', favoriteData);
      setCurrentUser(data.user);
      toast.success(data.message);
    } catch (error: any) {
       toast.error(error.response?.data?.message || 'Could not update favorites.');
    }
  };
  
  const submitCreditRequest = async (requestData: Omit<CreditRequest, 'id' | 'userId' | 'name' | 'email' | 'status' | 'createdAt' | 'resolvedAt' | 'adminNote'>) => {
    try {
        await api.post('/users/credit-request', requestData);
        toast.success('Your credit request has been submitted for review!');
        return true;
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to submit credit request.');
        return false;
    }
  };

  const updateUserProfile = async (userId: number, updates: Partial<User>) => {
     if (!currentUser || currentUser.id !== userId) return;
     try {
         const { data } = await api.patch(`/users/me`, updates);
         setCurrentUser(data.user);
         toast.success("Profile updated successfully!");
     } catch (error: any) {
         toast.error(error.response?.data?.message || "Failed to update profile.");
     }
  };

  const deleteMyAccount = async () => {
    if (!currentUser) return;
    try {
        await api.delete('/users/me');
        logout(); // Logout after successful deletion
        toast.success("Your account has been deleted.");
    } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to delete account.");
    }
  };
  
  const addReview = async (reviewData: { rating: number; comment: string }) => {
    if (!currentUser) return;
     try {
         await api.post('/reviews', reviewData);
         toast.success("Thank you for your review!");
     } catch (error: any) {
         toast.error(error.response?.data?.message || "Failed to submit review.");
     }
  }


  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, isLoading, login, signup, logout, toggleFavorite, submitCreditRequest, updateUserProfile, deleteMyAccount, addReview, undo, redo, canUndo, canRedo }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};