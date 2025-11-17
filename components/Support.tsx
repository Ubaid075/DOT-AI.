import React, { useState, useEffect } from 'react';
// FIX: Corrected import path for useAuth
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import { MailIcon, SendIcon } from './Icons';
import { toast } from '../hooks/useToast';
import { IssueType } from '../types';

const Support: React.FC = () => {
  const { currentUser, sendSupportMessage } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [issueType, setIssueType] = useState<IssueType>(IssueType.GENERAL);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 1000));
    const success = sendSupportMessage({ name, email, subject, message, issueType });
    if (success) {
      // Clear form on success, but keep pre-filled details for logged-in users
      setSubject('');
      setMessage('');
      setIssueType(IssueType.GENERAL);
      if (!currentUser) {
          setName('');
          setEmail('');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Support Center
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Have questions or need help? We're here for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <AuthInput label="Your Name" type="text" value={name} onChange={setName} placeholder="John Doe" required={true} />
              <AuthInput label="Your Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required={true} />
            </div>
            
            <div>
                <label htmlFor="issueType" className="block text-sm font-medium mb-2">Issue Type</label>
                <select
                    id="issueType"
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value as IssueType)}
                    required
                    className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                    {Object.values(IssueType).map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            <AuthInput label="Subject (Optional)" type="text" value={subject} onChange={setSubject} placeholder="e.g., Issue with credit purchase" />
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">Message</label>
              <textarea
                id="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                required
                className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <Button type="submit" className="w-full flex items-center justify-center" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : (
                <>
                  <SendIcon className="w-5 h-5 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Contact Information</h2>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              For any urgent issues or if you prefer to contact us directly, you can reach us via email. We typically respond within 24 hours.
            </p>
            <div className="flex items-start space-x-3">
              <MailIcon className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Email Us</h3>
                <a href="mailto:ubaidjfh@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  ubaidjfh@gmail.com
                </a>
              </div>
            </div>
             <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Common Issues</h3>
                 <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1">
                    <li>Payment or credit purchase problems</li>
                    <li>Login and authentication issues</li>
                    <li>Errors during image generation</li>
                    <li>General questions about the platform</li>
                 </ul>
             </div>
          </div>
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
    required?: boolean;
}

const AuthInput: React.FC<AuthInputProps> = ({ label, type, value, onChange, placeholder, required = false }) => (
    <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
    </div>
);


export default Support;