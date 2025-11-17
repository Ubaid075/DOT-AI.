import express from 'express';
import { 
    getMe, 
    toggleFavorite,
    updateMe,
    deleteMe,
    createCreditRequest,
    getMyHistory,
    getMyTransactions,
    getMyCreditRequests,
    // Admin
    adminGetAllUsers,
    adminAddCredits,
    adminDeleteUser,
    adminGetAllHistory,
    adminGetAllTransactions,
    adminGetAllCreditRequests,
    adminApproveCreditRequest,
    adminRejectCreditRequest,
} from '../controllers/user.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Authenticated User Routes
router.get('/me', authMiddleware, getMe);
router.patch('/me', authMiddleware, updateMe);
router.delete('/me', authMiddleware, deleteMe);

router.post('/favorites/toggle', authMiddleware, toggleFavorite);
router.post('/credit-request', authMiddleware, createCreditRequest);

router.get('/me/history', authMiddleware, getMyHistory);
router.get('/me/transactions', authMiddleware, getMyTransactions);
router.get('/me/credit-requests', authMiddleware, getMyCreditRequests);


// Admin Routes
router.get('/admin/users', authMiddleware, adminMiddleware, adminGetAllUsers);
router.post('/admin/users/:id/add-credits', authMiddleware, adminMiddleware, adminAddCredits);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, adminDeleteUser);
router.get('/admin/history', authMiddleware, adminMiddleware, adminGetAllHistory);
router.get('/admin/transactions', authMiddleware, adminMiddleware, adminGetAllTransactions);
router.get('/admin/credit-requests', authMiddleware, adminMiddleware, adminGetAllCreditRequests);
router.post('/admin/credit-requests/:id/approve', authMiddleware, adminMiddleware, adminApproveCreditRequest);
router.post('/admin/credit-requests/:id/reject', authMiddleware, adminMiddleware, adminRejectCreditRequest);


export default router;