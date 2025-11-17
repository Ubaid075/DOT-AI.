import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path for useAuth
import { useAuth } from '../context/AuthContext';
import { User, Transaction, Review, CreditRequest } from '../types';
import Button from './Button';
import Avatar from './Avatar';
import { CameraIcon, TrashIcon, UserIcon, ActivityIcon, CogIcon, SparklesIcon, CreditCardIcon, MailIcon, StarIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { toast } from '../hooks/useToast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  isEditable: boolean;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png'];

type Tab = 'profile' | 'history' | 'transactions' | 'settings' | 'review' | 'requests';

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, isEditable }) => {
  const { updateUserProfile, generationHistory, deleteMyAccount, transactions, creditRequests } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  
  const handleClose = () => {
    setActiveTab('profile'); // Reset to default tab on close
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setActiveTab('profile');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const userGenerations = generationHistory.filter(g => g.userId === user.id);
  const userTransactions = transactions.filter(t => t.userId === user.id);
  const userCreditRequests = creditRequests.filter(r => r.userId === user.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={handleClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full m-4 transform transition-all duration-300 ease-out scale-95 opacity-0 animate-fade-in-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s forwards', maxHeight: '90vh' }}
      >
        <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
        
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                <TabButton icon={UserIcon} label="Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                <TabButton icon={ActivityIcon} label="History" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                <TabButton icon={CreditCardIcon} label="Transactions" isActive={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')} />
                {isEditable && <TabButton icon={ClockIcon} label="Credit Requests" isActive={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />}
                {isEditable && <TabButton icon={StarIcon} label="Review" isActive={activeTab === 'review'} onClick={() => setActiveTab('review')} />}
                {isEditable && <TabButton icon={CogIcon} label="Settings" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />}
            </nav>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            {activeTab === 'profile' && <ProfileTab user={user} isEditable={isEditable} onSave={onClose}/>}
            {activeTab === 'history' && <HistoryTab generations={userGenerations} />}
            {activeTab === 'transactions' && <TransactionsTab transactions={userTransactions} />}
            {activeTab === 'requests' && isEditable && <CreditRequestsTab requests={userCreditRequests} />}
            {activeTab === 'review' && isEditable && <ReviewTab user={user} />}
            {activeTab === 'settings' && isEditable && <SettingsTab user={user} onClose={onClose} />}
        </div>

      </div>
    </div>
  );
};

// --- Tab Components ---

const ProfileTab: React.FC<{user: User, isEditable: boolean, onSave: () => void}> = ({ user, isEditable, onSave }) => {
    const { updateUserProfile } = useAuth();
    const [newAvatar, setNewAvatar] = useState<string | null>(null);
    const [editedName, setEditedName] = useState(user.name);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasChanges = newAvatar !== null || editedName !== user.name;

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
          toast.error('Invalid file type. Please upload a JPG or PNG.');
          return;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => setNewAvatar(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        const updates: Partial<User> = {};
        if (newAvatar) updates.avatar = newAvatar;
        if (editedName !== user.name) updates.name = editedName;

        if (Object.keys(updates).length > 0) {
            updateUserProfile(user.id, updates);
        }
        onSave();
    };

    const handleRemoveAvatar = () => {
        updateUserProfile(user.id, { avatar: undefined });
        setNewAvatar(null);
    };

    const displayUser = { ...user, avatar: newAvatar ?? user.avatar };
    const formatTimestamp = (isoString: string) => new Date(isoString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col md:flex-row md:space-x-8 items-center md:items-start">
            <div className="flex flex-col items-center flex-shrink-0">
                <div className="relative mb-4">
                    <Avatar user={displayUser} className="w-32 h-32 border-4 border-gray-200 dark:border-gray-700" />
                    {isEditable && (
                        <>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden"/>
                            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-transform transform hover:scale-110" aria-label="Change profile picture">
                                <CameraIcon className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
                 {isEditable && user.avatar && (
                     <Button variant="secondary" onClick={handleRemoveAvatar} className="!text-xs !px-2 !py-1 flex items-center space-x-1 text-red-500">
                        <TrashIcon className="w-3 h-3" />
                        <span>Remove</span>
                     </Button>
                )}
            </div>

            <div className="w-full mt-6 md:mt-0 text-center md:text-left">
                {isEditable ? (
                    <input type="text" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="text-3xl font-bold text-center md:text-left bg-transparent border-b-2 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 outline-none w-full mb-2" />
                ) : (
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
                )}
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-center md:justify-start bg-gray-100 dark:bg-gray-700/50 p-2 rounded-lg">
                        <SparklesIcon className="w-5 h-5 mr-2 text-blue-500" />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                           {user.role === 'admin' ? 'Credits: ∞ (Unlimited)' : `${user.credits} Credits Remaining`}
                        </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">Member since {formatTimestamp(user.createdAt)}</p>
                </div>
                
                 <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Need Help?</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">If you have any issues with payments or credits, please reach out to our support team.</p>
                    <a 
                        href="mailto:ubaidjfh@gmail.com?subject=DOT.AI Support Request"
                        className="inline-flex items-center justify-center mt-3 px-3 py-2 border border-transparent rounded-md font-semibold text-xs text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-300 dark:bg-blue-900/50 dark:hover:bg-blue-900 transition-colors"
                    >
                        <MailIcon className="w-4 h-4 mr-2" />
                        Contact Support
                    </a>
                </div>

                 {isEditable && (
                     <div className="flex space-x-2 mt-6 justify-center md:justify-start">
                        <Button onClick={handleSave} disabled={!hasChanges}>Save Changes</Button>
                        <Button variant="secondary" onClick={onSave}>Close</Button>
                     </div>
                )}
            </div>
        </div>
    );
};

const HistoryTab: React.FC<{generations: any[]}> = ({ generations }) => {
    const formatTimestamp = (isoString: string) => new Date(isoString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    
    if (generations.length === 0) {
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No generation history found.</div>
    }

    return (
        <div className="space-y-4">
            {generations.map(gen => (
                <div key={gen.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">"{gen.prompt}"</p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex justify-between items-center">
                        <span>Style: {gen.style} | Quality: {gen.quality}</span>
                        <span className="font-medium">{formatTimestamp(gen.date)}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const TransactionsTab: React.FC<{transactions: Transaction[]}> = ({ transactions }) => {
    const formatTimestamp = (isoString: string) => new Date(isoString).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    if (transactions.length === 0) {
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">No transaction history found.</div>
    }

    return (
        <div className="space-y-4">
            {transactions.map(t => (
                <div key={t.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                            Purchased {t.creditsPurchased} Credits
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatTimestamp(t.date)}
                        </p>
                    </div>
                    <div className="text-right">
                         <p className="font-bold text-lg text-green-600 dark:text-green-400">${t.amountPaid.toFixed(2)}</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400">{t.status}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const CreditRequestsTab: React.FC<{ requests: CreditRequest[] }> = ({ requests }) => {
    const sortedRequests = [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (sortedRequests.length === 0) {
        return <div className="text-center py-12 text-gray-500 dark:text-gray-400">You have not submitted any credit requests.</div>
    }

    const getStatusInfo = (status: CreditRequest['status']) => {
        switch (status) {
            case 'Pending':
                return { icon: ClockIcon, color: 'text-yellow-500 dark:text-yellow-400', label: 'Pending Approval' };
            case 'Approved':
                return { icon: CheckCircleIcon, color: 'text-green-500 dark:text-green-400', label: 'Approved' };
            case 'Rejected':
                return { icon: XCircleIcon, color: 'text-red-500 dark:text-red-400', label: 'Rejected' };
        }
    };

    return (
        <div className="space-y-4">
            {sortedRequests.map(req => {
                const statusInfo = getStatusInfo(req.status);
                return (
                    <div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    Request for {req.creditPackage.credits} Credits
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono" title={req.transactionId}>
                                    TID: {req.transactionId}
                                </p>
                             </div>
                              <div className={`flex items-center space-x-2 text-sm font-semibold ${statusInfo.color}`}>
                                <statusInfo.icon className="w-5 h-5"/>
                                <span>{statusInfo.label}</span>
                             </div>
                        </div>
                        {req.status === 'Rejected' && req.adminNote && (
                            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-md border border-red-200 dark:border-red-700">
                                <strong>Admin Note:</strong> {req.adminNote}
                            </div>
                        )}
                         <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            Submitted on {new Date(req.createdAt).toLocaleString()}
                        </div>
                    </div>
                )
            })}
        </div>
    );
};

const ReviewTab: React.FC<{ user: User }> = ({ user }) => {
    const { addReview, reviews } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const existingReview = reviews.find(r => r.userId === user.id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating.");
            return;
        }
        if (!comment.trim()) {
            toast.error("Please enter a comment.");
            return;
        }
        addReview({ rating, comment });
    };

    if (existingReview) {
        return (
            <div>
                <h3 className="text-lg font-semibold mb-3">Your Review</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center mb-2">
                         {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} filled={i < existingReview.rating} className="w-5 h-5 text-yellow-500" />
                        ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">"{existingReview.comment}"</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Submitted on {new Date(existingReview.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        );
    }
    
    return (
        <div>
            <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Share your experience with the community. Your feedback helps us improve!</p>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, index) => {
                            const ratingValue = index + 1;
                            return (
                                <button
                                    type="button"
                                    key={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                    onMouseEnter={() => setHoverRating(ratingValue)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="text-gray-300 dark:text-gray-600 focus:outline-none"
                                >
                                    <StarIcon
                                        className={`w-7 h-7 transition-colors ${(hoverRating || rating) >= ratingValue ? 'text-yellow-500' : ''}`}
                                        filled={(hoverRating || rating) >= ratingValue}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
                <div>
                    <label htmlFor="comment" className="block text-sm font-medium mb-2">Your Comment</label>
                    <textarea
                        id="comment"
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us what you think..."
                        className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <Button type="submit">Submit Review</Button>
            </form>
        </div>
    );
};

const SettingsTab: React.FC<{user: User, onClose: () => void}> = ({ user, onClose }) => {
    const { updateUserProfile, deleteMyAccount } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        updateUserProfile(user.id, { password: newPassword });
        setNewPassword('');
        setConfirmPassword('');
        toast.success("Password updated successfully!");
    };
    
    const handleDeleteAccount = () => {
        if (window.confirm("Are you absolutely sure you want to delete your account? This action is irreversible and will permanently delete all your data.")) {
            deleteMyAccount();
            onClose();
        }
    };
    
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-semibold mb-3">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <AuthInput label="New Password" type="password" value={newPassword} onChange={setNewPassword} placeholder="••••••••" />
                    <AuthInput label="Confirm New Password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" />
                    <Button type="submit" className="w-full md:w-auto">Update Password</Button>
                </form>
            </div>
            <div className="border-t border-red-500/30 pt-6">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Deleting your account will remove all your data from our servers. This action cannot be undone.</p>
                <Button onClick={handleDeleteAccount} className="!bg-red-600 !text-white hover:!bg-red-700 focus:!ring-red-500">
                    Delete My Account
                </Button>
            </div>
        </div>
    );
};

// --- Helper Components ---

const TabButton: React.FC<{icon: React.FC<any>, label: string, isActive: boolean, onClick: () => void}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </button>
);

const AuthInput: React.FC<{label: string, type: string, value: string, onChange: (v: string) => void, placeholder: string}> = ({ label, type, value, onChange, placeholder }) => (
    <div>
        <label className="block text-sm font-medium mb-1.5">{label}</label>
        <input
            type={type} value={value} onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder} required
            className="w-full p-2.5 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
    </div>
);


export default ProfileModal;