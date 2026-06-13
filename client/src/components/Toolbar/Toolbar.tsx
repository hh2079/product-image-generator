import { useProjectStore } from '../../store/useProjectStore';
import VideoGenerateButton from './VideoGenerateButton';

const PRESET_COLORS = ['#FFFFFF', '#F5F5F5', '#E8F4FD', '#FFF9E6', '#F0FFF0', '#FFF0F0', '#000000'];

export default function Toolbar() {
  const activeTool = useProjectStore((s) => s.activeTool);
  const setActiveTool = useProjectStore((s) => s.setActiveTool);

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
        <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>背景色</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {PRESET_COLORS.map((color) => (
            <div
              key={color}
              onClick={() => {
                const canvasEl = document.querySelector('canvas');
                if (canvasEl) {
                  const fabCanvas = (canvasEl as any).__fabCanvas;
                  if (fabCanvas) {
                    fabCanvas.set('backgroundColor', color);
                    fabCanvas.renderAll();
                    useProjectStore.getState().setCanvasJSON(fabCanvas.toJSON());
                  }
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
