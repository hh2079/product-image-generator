import { Router, Request, Response } from 'express';
import { createVideo, pollVideoStatus } from '../services/agnes';
import { buildVideoPrompt } from '../utils/prompts';

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
  const { apiKey, imageUrls, productName } = req.body;
  if (!apiKey || !imageUrls || imageUrls.length < 2) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: '缺少 apiKey 或 imageUrls（至少 2 张）' },
    });
  }

  try {
    const prompt = buildVideoPrompt(productName || 'product');
    const result = await createVideo({ apiKey, prompt, imageUrls });
    return res.json(result);
  } catch (err: any) {
    const status = err.message?.includes('API Key') ? 401 : 500;
    return res.status(status).json({
      error: { code: 'CREATION_FAILED', message: err.message || '视频创建失败' },
    });
  }
});

router.get('/status/:id', async (req: Request, res: Response) => {
  const apiKey = req.query.api_key as string;
  const videoId = req.params.id;
  if (!apiKey || !videoId) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: '缺少 api_key 或 video_id' },
    });
  }

  try {
    const result = await pollVideoStatus(apiKey, videoId);

    // When completed, download video server-side to avoid CORS
    if (result.status === 'completed' && result.url) {
      const videoRes = await fetch(result.url);
      const buffer = Buffer.from(await videoRes.arrayBuffer());
      const dataUrl = `data:video/mp4;base64,${buffer.toString('base64')}`;
      return res.json({ ...result, dataUrl });
    }

    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      error: { code: 'QUERY_FAILED', message: err.message || '查询失败' },
    });
  }
});

export default router;
