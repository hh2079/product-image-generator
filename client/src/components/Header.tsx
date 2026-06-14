import { useState } from 'react';
import { useProjectStore } from '../store/useProjectStore';
import { saveProject } from '../utils/storage';
import ApiKeyModal from './ApiKeyModal';

export default function Header() {
  const projectName = useProjectStore((s) => s.projectName);
  const setProjectName = useProjectStore((s) => s.setProjectName);
  const canvasJSON = useProjectStore((s) => s.canvasJSON);
  const assets = useProjectStore((s) => s.assets);
  const showToast = useProjectStore((s) => s.showToast);
  const [editing, setEditing] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);

  const handleSave = () => {
    const ok = saveProject({
      version: 1,
      projectName,
      canvasJSON,
      assets,
      savedAt: Date.now(),
    });
    showToast(ok ? '项目已保存' : '保存失败，存储空间不足', ok ? 'success' : 'error');
  };

  const handleExport = () => {
    const data = JSON.stringify({
      version: 1,
      projectName,
      canvasJSON,
      assets,
      savedAt: Date.now(),
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('项目已导出', 'success');
  };

  return (
    <>
      <header style={{
        height: 48, display: 'flex', alignItems: 'center', padding: '0 16px',
        borderBottom: '1px solid #e0e0e0', background: '#fff', gap: 16,
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 600, fontSize: 16 }}>视图生成器</span>
        {editing ? (
          <input
            autoFocus
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={() => setEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
            style={{ width: 200, padding: '2px 8px', border: '1px solid #ddd', borderRadius: 4 }}
          />
        ) : (
          <span
            onClick={() => setEditing(true)}
            style={{ cursor: 'pointer', color: '#555' }}
          >
            {projectName}
          </span>
        )}
        <div style={{ flex: 1 }} />
        <button onClick={handleSave} style={btnStyle}>保存</button>
        <button onClick={handleExport} style={btnStyle}>导出</button>
        <button onClick={() => setShowApiModal(true)} style={{ ...btnStyle, background: '#3498db', color: '#fff' }}>
          API Key
        </button>
      </header>
      {showApiModal && <ApiKeyModal onClose={() => setShowApiModal(false)} />}
    </>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '4px 16px', border: '1px solid #ddd', borderRadius: 4,
  background: '#fff', cursor: 'pointer', fontSize: 13,
};
