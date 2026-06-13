import { Router, Request, Response } from 'express';
import { generateImage } from '../services/agnes';
import { buildImagePrompt } from '../utils/prompts';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  const { apiKey, base64Image, angle, productName } = req.body;
  if (!apiKey || !base64Image || !angle) {
    return res.status(400).json({
      error: { code: 'MISSING_FIELDS', message: '缺少 apiKey, base64Image 或 angle' },
    });
  }

  const validAngles = ['front', 'side', 'back', 'top', 'detail'];
  if (!validAngles.includes(angle)) {
    return res.status(400).json({
      error: { code: 'INVALID_ANGLE', message: `angle 必须是: ${validAngles.join(', ')}` },
    });
  }

  try {
    const prompt = buildImagePrompt(productName || 'product', angle);
    const url = await generateImage({ apiKey, prompt, base64Image });
    return res.json({ url });
  } catch (err: any) {
    const status = err.message?.includes('API Key') ? 401 : 500;
    return res.status(status).json({
      error: { code: 'GENERATION_FAILED', message: err.message || '图片生成失败' },
    });
  }
});

export default router;
