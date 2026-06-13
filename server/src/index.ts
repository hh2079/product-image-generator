import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import keyRouter from './routes/key';
import imagesRouter from './routes/images';
import videosRouter from './routes/videos';

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json({ limit: '50mb' }));

app.use('/api/key', keyRouter);
app.use('/api/images', imagesRouter);
app.use('/api/videos', videosRouter);
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
