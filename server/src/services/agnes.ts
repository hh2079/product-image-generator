const AGNES_BASE = 'https://apihub.agnes-ai.com';

interface GenerateImageParams {
  apiKey: string;
  prompt: string;
  base64Image?: string;  // optional — if omitted, uses T2I mode
  size?: string;
}

interface CreateVideoParams {
  apiKey: string;
  prompt: string;
  imageUrls: string[];
  numFrames?: number;
  frameRate?: number;
}

export async function generateImage(params: GenerateImageParams): Promise<string> {
  const { apiKey, prompt, base64Image, size = '1024x768' } = params;

  const reqBody: Record<string, unknown> = {
    model: 'agnes-image-2.0-flash',
    prompt,
    size,
    extra_body: { response_format: 'url' } as Record<string, unknown>,
  };

  // If base64Image is provided, use I2I mode; otherwise T2I
  if (base64Image) {
    (reqBody.extra_body as Record<string, unknown>).image = [base64Image];
  }

  const res = await fetch(`${AGNES_BASE}/v1/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reqBody),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const status = res.status;
    if (status === 401) throw new Error('API Key 无效或已过期');
    if (status === 503) throw new Error('AI 服务繁忙，请稍后重试');
    throw new Error((err as any).error?.message || `图片生成失败 (HTTP ${status})`);
  }

  const json = await res.json() as { data: Array<{ url: string | null }> };
  const url = json.data?.[0]?.url;
  if (!url) throw new Error('未获取到生成图片 URL');
  return url;
}

export async function createVideo(params: CreateVideoParams): Promise<{ video_id: string; task_id: string }> {
  const { apiKey, prompt, imageUrls, numFrames = 121, frameRate = 24 } = params;
  const res = await fetch(`${AGNES_BASE}/v1/videos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'agnes-video-v2.0',
      prompt,
      extra_body: { image: imageUrls, mode: 'keyframes' },
      num_frames: numFrames,
      frame_rate: frameRate,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const status = res.status;
    if (status === 401) throw new Error('API Key 无效或已过期');
    if (status === 503) throw new Error('AI 服务繁忙，请稍后重试');
    throw new Error((err as any).error?.message || `视频创建失败 (HTTP ${status})`);
  }

  const json = await res.json() as { video_id: string; task_id: string };
  return { video_id: json.video_id, task_id: json.task_id };
}

export async function pollVideoStatus(apiKey: string, videoId: string): Promise<{
  status: string;
  url?: string;
  error?: string;
  progress?: number;
}> {
  const res = await fetch(`${AGNES_BASE}/agnesapi?video_id=${videoId}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    const status = res.status;
    if (status === 401) throw new Error('API Key 无效或已过期');
    if (status === 503) throw new Error('AI 服务繁忙，请稍后重试');
    throw new Error(`查询视频状态失败 (HTTP ${status})`);
  }

  const json = await res.json() as {
    status: string;
    remixed_from_video_id?: string;
    error?: { message?: string } | null;
    progress?: number;
  };

  return {
    status: json.status,
    url: json.remixed_from_video_id,
    error: json.error?.message,
    progress: json.progress,
  };
}
