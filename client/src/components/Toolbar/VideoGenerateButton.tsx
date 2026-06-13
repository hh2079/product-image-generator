import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import VideoTransitionPanel from './VideoTransitionPanel';

export default function VideoGenerateButton() {
  const apiKey = useProjectStore((s) => s.apiKey);
  const assets = useProjectStore((s) => s.assets);
  const projectName = useProjectStore((s) => s.projectName);
  const showToast = useProjectStore((s) => s.showToast);
  const [showPanel, setShowPanel] = useState(false);

  const imageAssets = assets.filter((a) => a.type === 'image');
  const canGenerate = imageAssets.length >= 2 && !!apiKey;

  const handleClick = () => {
    if (!apiKey) return showToast('请先设置 API Key', 'error');
    if (imageAssets.length < 2) return showToast('请至少准备 2 张图片', 'error');
    setShowPanel(true);
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!canGenerate}
        style={{
          width: '100%', padding: '10px 0', fontSize: 13, borderRadius: 4,
          border: 'none', background: canGenerate ? '#8e44ad' : '#ccc',
          color: '#fff', cursor: canGenerate ? 'pointer' : 'not-allowed',
        }}
      >
        {canGenerate ? '生成商品视频' : `还需 ${2 - imageAssets.length} 张图`}
      </button>
      {showPanel && (
        <VideoTransitionPanel
          imageAssets={imageAssets}
          projectName={projectName}
          onClose={() => setShowPanel(false)}
        />
      )}
    </>
  );
}
