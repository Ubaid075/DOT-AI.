import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
// FIX: Import fileURLToPath to define __dirname in an ES module context.
import { fileURLToPath } from 'url';

dotenv.config();

// FIX: Define __dirname for ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes';
import imageRoutes from './routes/image.routes';
import userRoutes from './routes/user.routes';
import reviewRoutes from './routes/reviews.routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);


// Serve frontend
// __dirname will be `backend/dist` when run from `node dist/server.js`
const frontendDistPath = path.join(__dirname, '..', '..', 'frontend', 'dist');

app.use(express.static(frontendDistPath));

app.get('*', (req: express.Request, res: express.Response) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ message: 'API endpoint not found.' });
  }
  res.sendFile(path.resolve(frontendDistPath, 'index.html'));
});

// Global Error Handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});