import { create } from 'zustand';
import { nanoid } from 'nanoid';

interface Asset {
  id: string;
  type: 'image' | 'video';
  name: string;
  dataUrl: string;
  sourceUrl?: string;           // Agnes AI original URL, for video keyframe input
  angle?: string;
  createdAt: number;
  width?: number;
  height?: number;
}

interface ProjectStore {
  projectName: string;
  setProjectName: (name: string) => void;
  canvasJSON: object | null;
  setCanvasJSON: (json: object) => void;
  assets: Asset[];
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt'>) => string;
  removeAsset: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  activeTool: 'select' | 'text' | 'pan';
  setActiveTool: (tool: 'select' | 'text' | 'pan') => void;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  zoomModal: { type: 'image' | 'video'; url: string } | null;
  openZoomModal: (modal: { type: 'image' | 'video'; url: string }) => void;
  closeZoomModal: () => void;
  generatingStatus: 'idle' | 'generating' | 'done' | 'error';
  generatingMessage: string;
  setGeneratingStatus: (status: 'idle' | 'generating' | 'done' | 'error', msg?: string) => void;
  toast: { message: string; type: 'info' | 'success' | 'error' } | null;
  showToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  clearToast: () => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projectName: '未命名项目',
  setProjectName: (name) => set({ projectName: name }),
  canvasJSON: null,
  setCanvasJSON: (json) => set({ canvasJSON: json }),
  assets: [],
  addAsset: (asset) => {
    const id = nanoid();
    set((s) => ({ assets: [...s.assets, { ...asset, id, createdAt: Date.now() }] }));
    return id;
  },
  removeAsset: (id) => set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
  apiKey: '',
  setApiKey: (key) => set({ apiKey: key }),
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),
  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  zoomModal: null,
  openZoomModal: (modal) => set({ zoomModal: modal }),
  closeZoomModal: () => set({ zoomModal: null }),
  generatingStatus: 'idle',
  generatingMessage: '',
  setGeneratingStatus: (status, msg) =>
    set({ generatingStatus: status, generatingMessage: msg || '' }),
  toast: null,
  showToast: (message, type = 'info') => set({ toast: { message, type } }),
  clearToast: () => set({ toast: null }),
}));
