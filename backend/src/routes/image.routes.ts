import express from 'express';
import { generateImage, getPublicGalleryImages, adminAddGalleryImage } from '../controllers/image.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/generate', authMiddleware, generateImage);
router.get('/gallery', getPublicGalleryImages);
router.post('/gallery/add', authMiddleware, adminMiddleware, adminAddGalleryImage);

export default router;