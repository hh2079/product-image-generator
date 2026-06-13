import { useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';
import { useProjectStore } from '../../store/useProjectStore';
import { CANVAS_DEFAULTS } from '../../utils/constants';

export default function InfiniteCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabRef = useRef<fabric.Canvas | null>(null);
  const setCanvasJSON = useProjectStore((s) => s.setCanvasJSON);
  const activeTool = useProjectStore((s) => s.activeTool);
  const openZoomModal = useProjectStore((s) => s.openZoomModal);
  const assets = useProjectStore((s) => s.assets);
  const showToast = useProjectStore((s) => s.showToast);

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_DEFAULTS.width,
      height: CANVAS_DEFAULTS.height,
      backgroundColor: CANVAS_DEFAULTS.backgroundColor,
      selection: true,
    });
    fabRef.current = canvas;

    // Expose for Toolbar access
    const canvasEl = canvasRef.current;
    if (canvasEl) (canvasEl as any).__fabCanvas = canvas;

    // Sync canvas JSON on changes
    const sync = () => setCanvasJSON(canvas.toJSON());
    canvas.on('object:modified', sync);
    canvas.on('object:added', sync);
    canvas.on('object:removed', sync);

    // Double-click to zoom (for images/videos) OR edit text
    canvas.on('mouse:dblclick', (opt: any) => {
      const obj = opt.target;
      if (!obj) return;
      // Images/videos: open zoom modal
      const dataUrl = (obj as any)._element?.src || (obj as any).getSrc?.();
      if (dataUrl) {
        const type = (obj as any)._element?.tagName === 'VIDEO' ? 'video' : 'image';
        openZoomModal({ type, url: dataUrl });
        return;
      }
      // Text objects: enter edit mode on double-click
      if ((obj as any).enterEditing) {
        (obj as any).enterEditing();
        canvas.renderAll();
      }
    });

    // Keyboard: Delete selected
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = canvas.getActiveObject();
        // Don't delete if editing text
        if (active && (active as any).isEditing) return;
        if (active && (e.target as HTMLElement)?.tagName !== 'INPUT' && (e.target as HTMLElement)?.tagName !== 'TEXTAREA') {
          canvas.remove(active);
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };
    window.addEventListener('keydown', keyHandler);

    return () => {
      window.removeEventListener('keydown', keyHandler);
      canvas.dispose();
      fabRef.current = null;
    };
  }, []);

  // Text tool: click on empty area to add text
  const handleTextToolClick = useCallback((opt: any) => {
    const canvas = fabRef.current;
    if (!canvas) return;

    // If clicked on existing text, enter edit mode immediately
    if (opt.target && (opt.target as any).enterEditing) {
      (opt.target as any).enterEditing();
      canvas.renderAll();
      return;
    }

    // If clicked on any existing object, don't add text
    if (opt.target) return;

    // Create new text at click position
    const point = opt.scenePoint || opt.pointer || canvas.getCenterPoint();
    const text = new fabric.IText('双击编辑文字', {
      left: point.x,
      top: point.y,
      fontSize: 24,
      fill: '#333333',
      fontFamily: 'PingFang SC, Microsoft YaHei, sans-serif',
      editable: true,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    // Enter edit mode immediately so user can type right away
    text.enterEditing();
    canvas.renderAll();
    useProjectStore.getState().setActiveTool('select');
  }, []);

  // Tool switching effect
  useEffect(() => {
    const canvas = fabRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = activeTool === 'select';

    if (activeTool === 'text') {
      canvas.on('mouse:down', handleTextToolClick);
    } else {
      canvas.off('mouse:down', handleTextToolClick);
    }

    canvas.defaultCursor = activeTool === 'pan' ? 'grab' : 'default';

    // Cleanup: remove handler on unmount or re-run
    return () => {
      canvas.off('mouse:down', handleTextToolClick);
    };
  }, [activeTool, handleTextToolClick]);

  // Handle drop from Sidebar
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const canvas = fabRef.current;
    if (!canvas) return;
    const assetId = e.dataTransfer.getData('text/plain');
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const dropPoint = new fabric.Point(e.clientX - rect.left, e.clientY - rect.top);

    if (asset.type === 'image') {
      fabric.FabricImage.fromURL(asset.dataUrl, { crossOrigin: 'anonymous' }).then((img) => {
        const maxW = canvas.width * 0.4;
        const scale = Math.min(1, maxW / (img.width || 200));
        img.set({ left: dropPoint.x, top: dropPoint.y, scaleX: scale, scaleY: scale });
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      }).catch(() => {
        showToast('图片加载失败', 'error');
      });
    } else {
      // Video — show first frame as thumbnail
      const videoEl = document.createElement('video');
      videoEl.src = asset.dataUrl;
      videoEl.currentTime = 1;
      videoEl.onloadeddata = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = videoEl.videoWidth || 320;
        tempCanvas.height = videoEl.videoHeight || 240;
        tempCanvas.getContext('2d')!.drawImage(videoEl, 0, 0);
        const frame = tempCanvas.toDataURL('image/jpeg');
        fabric.FabricImage.fromURL(frame, { crossOrigin: 'anonymous' }).then((img) => {
          const maxW = canvas.width * 0.4;
          const scale = Math.min(1, maxW / (img.width || 200));
          img.set({ left: dropPoint.x, top: dropPoint.y, scaleX: scale, scaleY: scale });
          (img as any)._videoUrl = asset.dataUrl;
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        }).catch(() => {
          showToast('视频加载失败', 'error');
        });
      };
    }
  }, [assets, showToast]);

  // Pan mode
  const panning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== 'pan') return;
    panning.current = true;
    lastPan.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!panning.current) return;
    const canvas = fabRef.current;
    if (!canvas) return;
    const vpt = canvas.viewportTransform!;
    const dx = e.clientX - lastPan.current.x;
    const dy = e.clientY - lastPan.current.y;
    vpt[4] += dx;
    vpt[5] += dy;
    canvas.requestRenderAll();
    lastPan.current = { x: e.clientX, y: e.clientY };
  };
  const handleMouseUp = () => { panning.current = false; };

  return (
    <div
      style={{ width: '100%', height: '100%', overflow: 'hidden', background: '#e5e5e5' }}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
