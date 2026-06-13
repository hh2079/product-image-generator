import { Router, Request, Response } from 'express';
import { generateImage } from '../services/agnes';
import { buildImagePrompt } from '../utils/prompts';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  const { apiKey, base64Image, angle, productDesc } = req.body;
  if (!apiKey || !angle) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: '缺少 apiKey 或 angle' },
    });
  }

  const validAngles = ['front', 'side', 'back', 'top', 'detail'];
  if (!validAngles.includes(angle)) {
    return res.status(400).json({
      error: { code: 'INVALID_ANGLE', message: `angle 必须是: ${validAngles.join(', ')}` },
    });
  }

  const desc = productDesc || 'product';
  const prompt = buildImagePrompt(desc, angle);

  let url: string | null = null;

  // Try I2I first if reference image is provided
  if (base64Image) {
    try {
      url = await generateImage({ apiKey, prompt, base64Image });
    } catch {
      // I2I failed, fall through to T2I
    }
  }

  // Fallback to T2I
  if (!url) {
    try {
      url = await generateImage({ apiKey, prompt });
    } catch (err: any) {
      const status = err.message?.includes('API Key') ? 401 : 500;
      return res.status(status).json({
        error: { code: 'GENERATION_FAILED', message: err.message || '图片生成失败' },
      });
    }
  }

  // Download the image server-side to avoid CORS issues
  try {
    const imageRes = await fetch(url);
    const buffer = Buffer.from(await imageRes.arrayBuffer());
    const contentType = imageRes.headers.get('content-type') || 'image/png';
    const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;
    return res.json({ url, dataUrl });
  } catch {
    return res.status(500).json({
      error: { code: 'DOWNLOAD_FAILED', message: '图片下载失败' },
    });
  }
});

export default router;
