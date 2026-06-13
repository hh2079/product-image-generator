import { useState } from 'react';
import UploadZone from './UploadZone';
import AssetList from './AssetList';
import GeneratePanel from './GeneratePanel';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  if (collapsed) {
    return (
      <div
        onClick={() => setCollapsed(false)}
        style={{
          width: 24, background: '#f5f5f5', borderRight: '1px solid #e0e0e0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}
        title="展开侧边栏"
      >
        ▸
      </div>
    );
  }

  return (
    <div style={{
      width: 260, display: 'flex', flexDirection: 'column',
      borderRight: '1px solid #e0e0e0', background: '#fafafa', flexShrink: 0,
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', borderBottom: '1px solid #e0e0e0',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>素材面板</span>
        <span
          onClick={() => setCollapsed(true)}
          style={{ cursor: 'pointer', color: '#888', fontSize: 14 }}
        >
          ◂
        </span>
      </div>
      <UploadZone />
      <GeneratePanel />
      <AssetList />
    </div>
  );
}
