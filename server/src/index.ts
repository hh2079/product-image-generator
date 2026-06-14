import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import keyRouter from './routes/key';
import imagesRouter from './routes/images';
import videosRouter from './routes/videos';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/key', keyRouter);
app.use('/api/images', imagesRouter);
app.use('/api/videos', videosRouter);
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Serve built frontend in production
const clientDist = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDist));
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
