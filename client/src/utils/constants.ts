export const ANGLES = [
  { key: 'front', label: '正面' },
  { key: 'side', label: '侧面' },
  { key: 'back', label: '背面' },
  { key: 'top', label: '顶视' },
  { key: 'detail', label: '细节' },
] as const;

export const CANVAS_DEFAULTS = {
  width: 2000,
  height: 2000,
  backgroundColor: '#FFFFFF',
};

export const STORAGE_KEY = 'pimg_project_v1';

export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024; // 20MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const VIDEO_POLL_INTERVAL = 5000;
export const VIDEO_POLL_TIMEOUT = 10 * 60 * 1000; // 10 minutes
