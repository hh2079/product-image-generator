import { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { validateApiKey } from '../services/api';

export default function ApiKeyModal({ onClose }: { onClose: () => void }) {
  const apiKey = useProjectStore((s) => s.apiKey);
  const setApiKey = useProjectStore((s) => s.setApiKey);
  const showToast = useProjectStore((s) => s.showToast);
  const [value, setValue] = useState(apiKey);
  const [validating, setValidating] = useState(false);

  const handleValidate = async () => {
    if (!value.trim()) return showToast('请输入 API Key', 'error');
    setValidating(true);
    try {
      const result = await validateApiKey(value.trim());
      if (result.valid) {
        setApiKey(value.trim());
        showToast('API Key 验证成功', 'success');
        onClose();
      } else {
        showToast('API Key 无效', 'error');
      }
    } catch {
      showToast('网络错误，无法验证', 'error');
    } finally {
      setValidating(false);
    }
  };

  const handleSave = () => {
    if (!value.trim()) return showToast('请输入 API Key', 'error');
    setApiKey(value.trim());
    showToast('API Key 已保存', 'success');
    onClose();
  };

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <h3 style={{ marginBottom: 12 }}>设置 API Key</h3>
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入你的 Agnes AI API Key"
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4, marginBottom: 12 }}
        />
        <p style={{ fontSize: 12, color: '#999', marginBottom: 16 }}>
          获取 API Key: apihub.agnes-ai.com
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={handleSave} style={btnSecondary}>直接保存</button>
          <button onClick={handleValidate} disabled={validating} style={btnPrimary}>
            {validating ? '验证中...' : '验证并保存'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500,
};

const modalStyle: React.CSSProperties = {
  background: '#fff', borderRadius: 8, padding: 24,
  width: 420, boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
};

const btnPrimary: React.CSSProperties = {
  padding: '6px 20px', background: '#3498db', color: '#fff',
  border: 'none', borderRadius: 4, cursor: 'pointer',
};

const btnSecondary: React.CSSProperties = {
  padding: '6px 20px', background: '#fff', color: '#555',
  border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer',
};
