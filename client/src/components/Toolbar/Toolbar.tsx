import { useState, useEffect } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import VideoGenerateButton from './VideoGenerateButton';

const PRESET_COLORS = ['#FFFFFF', '#F5F5F5', '#E8F4FD', '#FFF9E6', '#F0FFF0', '#FFF0F0', '#000000'];

function getFabCanvas(): any {
  const canvasEl = document.querySelector('canvas');
  return canvasEl ? (canvasEl as any).__fabCanvas : null;
}

export default function Toolbar() {
  const activeTool = useProjectStore((s) => s.activeTool);
  const setActiveTool = useProjectStore((s) => s.setActiveTool);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Sync zoom display
  useEffect(() => {
    const interval = setInterval(() => {
      const c = getFabCanvas();
      if (c) setZoomLevel(Math.round(c.getZoom() * 100));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const zoomIn = () => {
    const c = getFabCanvas();
    if (!c) return;
    const zoom = Math.min(c.getZoom() * 1.2, 5);
    c.zoomToPoint(new (c as any).constructor.Point?.(c.width / 2, c.height / 2) || { x: c.width / 2, y: c.height / 2 }, zoom);
    c.renderAll();
    setZoomLevel(Math.round(zoom * 100));
  };

  const zoomOut = () => {
    const c = getFabCanvas();
    if (!c) return;
    const zoom = Math.max(c.getZoom() * 0.8, 0.1);
    c.zoomToPoint({ x: c.width / 2, y: c.height / 2 }, zoom);
    c.renderAll();
    setZoomLevel(Math.round(zoom * 100));
  };

  const zoomReset = () => {
    const c = getFabCanvas();
    if (!c) return;
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    c.renderAll();
    setZoomLevel(100);
  };

  return (
    <div style={{
      width: 200, display: 'flex', flexDirection: 'column', gap: 12,
      padding: 12, borderLeft: '1px solid #e0e0e0', background: '#fafafa', flexShrink: 0,
    }}>
      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>工具</p>
        <div style={{ display: 'flex', gap: 4 }}>
          {([
            ['select', '选择'],
            ['text', '文字'],
            ['pan', '平移'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTool(key)}
              style={{
                flex: 1, padding: '6px 0', fontSize: 12, borderRadius: 4,
                border: activeTool === key ? '2px solid #3498db' : '1px solid #ddd',
                background: activeTool === key ? '#f0f7ff' : '#fff',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>缩放</p>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button onClick={zoomOut} style={zoomBtnStyle}>−</button>
          <span style={{ fontSize: 12, minWidth: 40, textAlign: 'center' }}>{zoomLevel}%</span>
          <button onClick={zoomIn} style={zoomBtnStyle}>+</button>
          <button onClick={zoomReset} style={{ ...zoomBtnStyle, fontSize: 10 }}>1:1</button>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>背景色</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {PRESET_COLORS.map((color) => (
            <div
              key={color}
              onClick={() => {
                const fabCanvas = getFabCanvas();
                if (fabCanvas) {
                  fabCanvas.set('backgroundColor', color);
                  fabCanvas.renderAll();
                  useProjectStore.getState().setCanvasJSON(fabCanvas.toJSON());
                }
              }}
              style={{
                width: 24, height: 24, borderRadius: 4,
                background: color, border: '1px solid #ddd',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <VideoGenerateButton />
      </div>
    </div>
  );
}

const zoomBtnStyle: React.CSSProperties = {
  width: 32, height: 28, fontSize: 16, borderRadius: 4,
  border: '1px solid #ddd', background: '#fff', cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};
