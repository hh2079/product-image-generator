import { STORAGE_KEY } from './constants';

interface ProjectSnapshot {
  version: number;
  projectName: string;
  canvasJSON: object | null;
  assets: Array<{
    id: string;
    type: 'image' | 'video';
    name: string;
    dataUrl: string;
    angle?: string;
    createdAt: number;
    width?: number;
    height?: number;
  }>;
  savedAt: number;
}

export function saveProject(snapshot: ProjectSnapshot): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...snapshot, savedAt: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

export function loadProject(): ProjectSnapshot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProject(): void {
  localStorage.removeItem(STORAGE_KEY);
}
