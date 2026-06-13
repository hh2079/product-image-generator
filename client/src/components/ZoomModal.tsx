import { useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';

export default function ZoomModal() {
  const modal = useProjectStore((s) => s.zoomModal);
  const close = useProjectStore((s) => s.closeZoomModal);

  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modal, close]);

  if (!modal) return null;

  return (
    <div onClick={close} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2000, cursor: 'pointer',
    }}>
      {modal.type === 'image' ? (
        <img
          src={modal.url}
          alt="preview"
          style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', cursor: 'default' }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <video
          src={modal.url}
          controls
          autoPlay
          style={{ maxWidth: '90vw', maxHeight: '90vh', cursor: 'default' }}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
