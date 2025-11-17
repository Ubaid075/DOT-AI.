import React, { useState, useMemo, useEffect } from 'react';
import Button from './Button';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon, UsersIcon, ClockIcon } from './Icons';
import { toast } from '../hooks/useToast';
import { User, CreditRequest } from '../types';
import ProfileModal from './ProfileModal';
import Avatar from './Avatar';
import { api } from '../services/api';

type Tab = 'users' | 'credits';

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [creditRequests, setCreditRequests] = useState<CreditRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('users');

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, requestsRes] = await Promise.all([
                api.get('/users/admin/users'),
                api.get('/users/admin/credit-requests'),
            ]);
            setUsers(usersRes.data);
            setCreditRequests(requestsRes.data);
        } catch (error) {
            toast.error("Failed to load admin data.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

  if (isLoading) return <div className="container mx-auto max-w-7xl py-12 text-center">Loading dashboard...</div>;

  return (
    <div className="container mx-auto max-w-7xl py-12">
      <h1 className="text-4xl font-extrabold tracking-tighter mb-8">Admin Dashboard</h1>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <TabButton icon={UsersIcon} label="Users" count={users.length} isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                <TabButton icon={ClockIcon} label="Credit Requests" count={creditRequests.filter(c=>c.status === 'Pending').length} isActive={activeTab === 'credits'} onClick={() => setActiveTab('credits')} />
            </nav>
      </div>

      <div>
        {activeTab === 'users' && <UsersPanel users={users} setUsers={setUsers} />}
        {activeTab === 'credits' && <CreditRequestsPanel requests={creditRequests} onAction={fetchData} />}
      </div>
    </div>
  );
};

// --- Panels ---

const UsersPanel: React.FC<{users: User[], setUsers: (users: User[]) => void}> = ({ users, setUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => users.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users, searchTerm]);

    const handleDeleteUser = async (userId: number) => {
        const user = users.find(u => u.id === userId);
        if (window.confirm(`Are you sure you want to delete ${user?.name}? This is irreversible.`)) {
            try {
                await api.delete(`/users/admin/users/${userId}`);
                setUsers(users.filter(u => u.id !== userId));
                toast.success('User deleted successfully.');
            } catch (e) {
                toast.error('Failed to delete user.');
            }
        }
    };

    return (
        <div>
            <input 
                type="text" 
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 mb-6 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
            />
            <div className="overflow-x-auto bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credits</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map(user => (
                        <tr key={user.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Avatar user={user} className="w-10 h-10 mr-4" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{user.role === 'admin' ? '∞' : user.credits}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <Button onClick={() => handleDeleteUser(user.id)} variant="secondary" className="!bg-red-100 dark:!bg-red-900/50 !text-red-600 dark:!text-red-400 !px-3 !py-1">Delete</Button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const CreditRequestsPanel: React.FC<{requests: CreditRequest[], onAction: () => void}> = ({ requests, onAction }) => {
    
    const handleApprove = async (id: number) => {
        if (!window.confirm("Are you sure you want to approve this request and add credits?")) return;
        try {
            await api.post(`/users/admin/credit-requests/${id}/approve`);
            toast.success("Request approved and credits added.");
            onAction(); // Re-fetch data
        } catch(e) {
            toast.error("Failed to approve request.");
        }
    };

    const handleReject = async (id: number) => {
        const reason = prompt("Reason for rejection (optional):");
        if (reason === null) return; // User cancelled prompt
        try {
            await api.post(`/users/admin/credit-requests/${id}/reject`, { note: reason });
            toast.success("Request rejected.");
            onAction(); // Re-fetch data
        } catch(e) {
            toast.error("Failed to reject request.");
        }
    };

    const pendingRequests = requests.filter(r => r.status === 'Pending');
    const resolvedRequests = requests.filter(r => r.status !== 'Pending');

    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Pending Requests ({pendingRequests.length})</h2>
            {pendingRequests.length > 0 ? (
                 <div className="space-y-4">
                    {pendingRequests.map(req => (
                        <div key={req.id} className="p-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div>
                                <p className="font-semibold">{req.name} ({req.email})</p>
                                {/* FIX: `amountPaid` is a property of `req`, not `req.creditPackage`. */}
                                <p className="text-sm text-gray-600 dark:text-gray-300">Requesting <strong>{req.creditPackage.credits} credits</strong> for ${req.amountPaid}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-1">TID: {req.transactionId}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={() => handleApprove(req.id)} className="!bg-green-100 dark:!bg-green-900/50 !text-green-600 dark:!text-green-400 !px-3 !py-1">Approve</Button>
                                <Button onClick={() => handleReject(req.id)} variant="secondary" className="!bg-red-100 dark:!bg-red-900/50 !text-red-600 dark:!text-red-400 !px-3 !py-1">Reject</Button>
                            </div>
                        </div>
                    ))}
                 </div>
            ) : <p className="text-gray-500 dark:text-gray-400">No pending credit requests.</p>}

            <h2 className="text-2xl font-bold mt-12 mb-4">Resolved Requests ({resolvedRequests.length})</h2>
             {resolvedRequests.length > 0 ? (
                 <div className="space-y-4">
                    {resolvedRequests.map(req => (
                        <div key={req.id} className={`p-4 bg-white dark:bg-gray-800/50 rounded-lg border ${req.status === 'Approved' ? 'border-green-200 dark:border-green-700' : 'border-red-200 dark:border-red-700'}`}>
                            <p className="font-semibold">{req.name}</p>
                            <p className="text-sm">Requested {req.creditPackage.credits} credits - <span className={`font-bold ${req.status === 'Approved' ? 'text-green-600' : 'text-red-600'}`}>{req.status}</span></p>
                            {req.adminNote && <p className="text-xs italic mt-1 text-gray-500">Note: {req.adminNote}</p>}
                        </div>
                    ))}
                 </div>
            ) : <p className="text-gray-500 dark:text-gray-400">No resolved credit requests.</p>}
        </div>
    )
};

// --- Helper Components ---
const TabButton: React.FC<{icon: React.FC<any>, label: string, count: number, isActive: boolean, onClick: () => void}> = ({ icon: Icon, label, count, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-lg transition-colors whitespace-nowrap ${isActive ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'}`}>
        <Icon className="w-6 h-6" />
        <span>{label}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{count}</span>
    </button>
);


export default AdminDashboard;