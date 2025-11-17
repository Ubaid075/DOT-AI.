import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/useToast';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (password !== confirmPassword) {
          toast.error("Passwords do not match.");
          setIsLoading(false);
          return;
        }
        await signup(name, email, password);
      }
      navigate('/generate');
    } catch (error) {
      console.error(error);
      // Toast messages are handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    // Clear fields on toggle
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
          {isLogin ? 'Log in to continue generating images.' : 'Sign up to get your free credits.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <AuthInput label="Name" type="text" value={name} onChange={setName} placeholder="John Doe" disabled={isLoading} />
          )}
          <AuthInput label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" disabled={isLoading} />
          <AuthInput label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" disabled={isLoading} />
          {!isLogin && (
            <AuthInput label="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" disabled={isLoading} />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Log In' : 'Sign Up')}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={toggleForm} className="text-sm text-blue-600 dark:text-blue-400 hover:underline" disabled={isLoading}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AuthInputProps {
    label: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    disabled?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, type, value, onChange, placeholder, disabled }) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required
            disabled={disabled}
            className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
        />
    </div>
);


export default Auth;
