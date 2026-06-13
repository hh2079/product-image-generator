import { Router, Request, Response } from 'express';
import { generateImage } from '../services/agnes';
import { buildImagePrompt } from '../utils/prompts';
import { nanoid } from 'nanoid';

const router = Router();

// In-memory task store
const tasks = new Map<string, { status: string; url?: string; error?: string }>();

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

  const taskId = nanoid();
  tasks.set(taskId, { status: 'generating' });

  // Process in background
  (async () => {
    try {
      const prompt = buildImagePrompt(productName || 'product', angle);
      const url = await generateImage({ apiKey, prompt, base64Image });
      tasks.set(taskId, { status: 'completed', url });
    } catch (err: any) {
      tasks.set(taskId, {
        status: 'failed',
        error: err.message || '图片生成失败',
      });
    }
  })();

  return res.json({ task_id: taskId });
});

router.get('/status/:id', (req: Request, res: Response) => {
  const task = tasks.get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: '任务不存在' } });
  }
  return res.json(task);
});

export default router;
