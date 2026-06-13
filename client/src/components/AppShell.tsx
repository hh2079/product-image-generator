import { useEffect } from 'react';
import { useProjectStore } from '../store/useProjectStore';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const toast = useProjectStore((s) => s.toast);
  const clearToast = useProjectStore((s) => s.clearToast);
  const generatingStatus = useProjectStore((s) => s.generatingStatus);
  const generatingMessage = useProjectStore((s) => s.generatingMessage);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(clearToast, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, clearToast]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {children}

      {generatingStatus === 'generating' && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, color: '#fff', gap: 16,
        }}>
          <div className="spinner" />
          <span>{generatingMessage || '生成中...'}</span>
        </div>
      )}

      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 2000,
          padding: '12px 24px', borderRadius: 8, color: '#fff',
          background: toast.type === 'error' ? '#e74c3c' :
                       toast.type === 'success' ? '#27ae60' : '#3498db',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)', animation: 'fadeIn 0.3s',
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
