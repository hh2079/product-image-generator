import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { ANGLES } from '../../utils/constants';
import { generateImage } from '../../services/api';

export default function GeneratePanel() {
  const apiKey = useProjectStore((s) => s.apiKey);
  const assets = useProjectStore((s) => s.assets);
  const projectName = useProjectStore((s) => s.projectName);
  const addAsset = useProjectStore((s) => s.addAsset);
  const setGeneratingStatus = useProjectStore((s) => s.setGeneratingStatus);
  const showToast = useProjectStore((s) => s.showToast);
  const [angle, setAngle] = useState<string>('front');
  const [productDesc, setProductDesc] = useState('');

  const hasKey = !!apiKey;
  const mainImage = assets.find((a) => a.type === 'image');

  const handleGenerate = async () => {
    if (!hasKey) return showToast('请先设置 API Key', 'error');
    if (!productDesc.trim()) return showToast('请输入商品的英文描述，如 white sneaker', 'error');

    const angleLabel = ANGLES.find((a) => a.key === angle)?.label || angle;
    setGeneratingStatus('generating', `正在生成${angleLabel}角度图...`);
    try {
      const { dataUrl } = await generateImage({
        apiKey,
        angle,
        productName: projectName,
        productDesc: productDesc.trim(),
        base64Image: mainImage?.dataUrl, // try I2I first, backend falls back to T2I
      });
      addAsset({ type: 'image', name: `${productDesc.trim()}_${angle}`, dataUrl, angle });
      setGeneratingStatus('done');
      showToast(`${angleLabel}角度图生成成功`, 'success');
    } catch (err: any) {
      setGeneratingStatus('error');
      showToast(err.message || '生成失败', 'error');
    }
  };

  return (
    <div style={{ padding: 8, borderTop: '1px solid #eee' }}>
      <p style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>商品描述（英文）</p>
      <input
        value={productDesc}
        onChange={(e) => setProductDesc(e.target.value)}
        placeholder="例: white flat sneaker"
        style={{
          width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4,
          border: '1px solid #ddd', marginBottom: 8,
        }}
      />

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
