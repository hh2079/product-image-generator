const BASE = '/api';

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json() as T & { error?: { code: string; message: string } };
  if (!res.ok) {
    throw new Error((json as any).error?.message || `请求失败 (${res.status})`);
  }
  return json;
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  const json = await res.json() as T & { error?: { code: string; message: string } };
  if (!res.ok) {
    throw new Error((json as any).error?.message || `请求失败 (${res.status})`);
  }
  return json;
}

export function validateApiKey(apiKey: string) {
  return post<{ valid: boolean; error?: { code: string; message: string } }>('/key/validate', { apiKey });
}

export function generateImage(params: {
  apiKey: string;
  angle: string;
  productName: string;
  productDesc?: string;
  base64Image?: string;
}) {
  return post<{ url: string; dataUrl: string }>('/images/generate', params);
}

export function createVideo(params: {
  apiKey: string;
  imageUrls: string[];
  productName?: string;
  productDesc?: string;
  transitions?: string[];
}) {
  return post<{ video_id: string; task_id: string }>('/videos/create', params);
}

export function pollVideoStatus(videoId: string, apiKey: string) {
  return get<{
    status: string;
    url?: string;
    error?: string;
    progress?: number;
  }>(`/videos/status/${videoId}?api_key=${encodeURIComponent(apiKey)}`);
}
