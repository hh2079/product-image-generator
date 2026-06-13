import { Router, Request, Response } from 'express';

const router = Router();

router.post('/validate', async (req: Request, res: Response) => {
  const { apiKey } = req.body;
  if (!apiKey) {
    return res.status(400).json({ error: { code: 'MISSING_FIELDS', message: '缺少 apiKey' } });
  }

  try {
    const result = await fetch('https://apihub.agnes-ai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'agnes-image-2.0-flash',
        prompt: 'test',
        size: '64x64',
        extra_body: { response_format: 'url' },
      }),
    });
    if (result.status === 401) {
      return res.json({ valid: false, error: { code: 'UNAUTHORIZED', message: 'API Key 无效或已过期' } });
    }
    return res.json({ valid: true });
  } catch {
    return res.json({ valid: false, error: { code: 'NETWORK_ERROR', message: '网络连接失败，无法验证' } });
  }
});

export default router;
