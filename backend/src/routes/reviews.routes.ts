import express from 'express';
import { getReviews, createReview } from '../controllers/reviews.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', getReviews);
router.post('/', authMiddleware, createReview);

export default router;