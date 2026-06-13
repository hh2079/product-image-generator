import { useState, useRef } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ANGLES } from '../../utils/constants';
import { generateImage, pollImageStatus } from '../../services/api';

export default function GeneratePanel() {
  const assets = useProjectStore((s) => s.assets);
  const apiKey = useProjectStore((s) => s.apiKey);
  const projectName = useProjectStore((s) => s.projectName);
  const addAsset = useProjectStore((s) => s.addAsset);
  const setGeneratingStatus = useProjectStore((s) => s.setGeneratingStatus);
  const showToast = useProjectStore((s) => s.showToast);
  const [angle, setAngle] = useState<string>('front');
  const pollTimer = useRef<ReturnType<typeof setInterval>>();

  const mainImage = assets.find((a) => a.type === 'image');
  const hasKey = !!apiKey;

  const handleGenerate = async () => {
    if (!hasKey) return showToast('请先设置 API Key', 'error');
    if (!mainImage) return showToast('请先上传商品图片', 'error');

    const angleLabel = ANGLES.find((a) => a.key === angle)?.label || angle;
    setGeneratingStatus('generating', `正在生成${angleLabel}角度图...`);
    try {
      const { task_id } = await generateImage({
        apiKey, base64Image: mainImage.dataUrl, angle, productName: projectName,
      });

      pollTimer.current = setInterval(async () => {
        try {
          const result = await pollImageStatus(task_id);
          if (result.status === 'completed' && result.url) {
            clearInterval(pollTimer.current);
            addAsset({ type: 'image', name: `${projectName}_${angle}`, dataUrl: result.url, originalUrl: result.url, angle });
            setGeneratingStatus('done');
            showToast(`${angleLabel}角度图生成成功`, 'success');
          } else if (result.status === 'failed') {
            clearInterval(pollTimer.current);
            setGeneratingStatus('error');
            showToast(`生成失败: ${result.error || '未知错误'}`, 'error');
          }
        } catch {
          // polling error, keep trying
        }
      }, 3000);
    } catch (err: any) {
      setGeneratingStatus('error');
      showToast(err.message || '生成失败', 'error');
    }
  };

  if (!mainImage) {
    return <div style={{ padding: 8, fontSize: 12, color: '#999' }}>上传图片后可开始生成</div>;
  }

  return (
    <div style={{ padding: 8, borderTop: '1px solid #eee' }}>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>选择生成角度</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        {ANGLES.map((a) => (
          <button
            key={a.key}
            onClick={() => setAngle(a.key)}
            style={{
              padding: '4px 10px', fontSize: 12, borderRadius: 4,
              border: angle === a.key ? '2px solid #3498db' : '1px solid #ddd',
              background: angle === a.key ? '#f0f7ff' : '#fff',
              cursor: 'pointer',
            }}
          >
            {a.label}
          </button>
        ))}
      </div>
      <button
        onClick={handleGenerate}
        disabled={!hasKey}
        style={{
          width: '100%', padding: '8px 0', fontSize: 13, borderRadius: 4,
          border: 'none', background: hasKey ? '#27ae60' : '#ccc',
          color: '#fff', cursor: hasKey ? 'pointer' : 'not-allowed',
        }}
      >
        {hasKey ? `生成${ANGLES.find((a) => a.key === angle)?.label}图` : '请先设置 API Key'}
      </button>
    </div>
  );
}
