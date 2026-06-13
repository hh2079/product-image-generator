import { useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { createVideo, pollVideoStatus } from '../../services/api';
import { VIDEO_POLL_INTERVAL, VIDEO_POLL_TIMEOUT } from '../../utils/constants';

interface Props {
  imageAssets: Array<{ id: string; dataUrl: string; sourceUrl?: string; angle?: string }>;
  projectName: string;
  onClose: () => void;
}

const angleLabelMap: Record<string, string> = {
  front: '正面', side: '侧面', back: '背面', top: '顶视', detail: '细节',
};

export default function VideoTransitionPanel({ imageAssets, projectName, onClose }: Props) {
  const apiKey = useProjectStore((s) => s.apiKey);
  const addAsset = useProjectStore((s) => s.addAsset);
  const setGeneratingStatus = useProjectStore((s) => s.setGeneratingStatus);
  const showToast = useProjectStore((s) => s.showToast);

  const angleLabel = (a: string | undefined) => angleLabelMap[a || ''] || '图片';

  const [transitions, setTransitions] = useState<string[]>(
    imageAssets.slice(0, -1).map((_, i) =>
      `平滑过渡，展示${angleLabel(imageAssets[i + 1].angle)}细节`
    )
  );

  const handleGenerate = async () => {
    setGeneratingStatus('generating', '正在创建视频任务...');
    try {
      const { video_id } = await createVideo({
        apiKey,
        imageUrls: imageAssets.map((a) => a.sourceUrl || a.dataUrl),
        productName: projectName,
      });

      setGeneratingStatus('generating', '视频生成中，请耐心等待...');
      const startTime = Date.now();
      const interval = setInterval(async () => {
        try {
          const result = await pollVideoStatus(video_id, apiKey);
          if (result.status === 'completed' && result.url) {
            clearInterval(interval);
            addAsset({ type: 'video', name: `${projectName}_video`, dataUrl: result.url, sourceUrl: result.url });
            setGeneratingStatus('done');
            showToast('视频生成成功', 'success');
            onClose();
          } else if (result.status === 'failed') {
            clearInterval(interval);
            setGeneratingStatus('error');
            showToast(`视频生成失败: ${result.error || '未知错误'}`, 'error');
          } else if (Date.now() - startTime > VIDEO_POLL_TIMEOUT) {
            clearInterval(interval);
            setGeneratingStatus('error');
            showToast('视频生成超时，请重试', 'error');
          }
        } catch {
          clearInterval(interval);
          setGeneratingStatus('error');
          showToast('查询视频状态失败', 'error');
        }
      }, VIDEO_POLL_INTERVAL);
    } catch (err: any) {
      setGeneratingStatus('error');
      showToast(err.message || '视频创建失败', 'error');
    }
  };

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: '#fff', borderRadius: 8, padding: 24, width: 460,
        maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
      }}>
        <h3 style={{ marginBottom: 12, fontSize: 14 }}>视频关键帧过渡设置</h3>
        <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
          已选 {imageAssets.length} 张图片作为关键帧
        </p>

        {imageAssets.map((asset, i) => (
          <div key={asset.id}>
            <div style={{
              fontSize: 12, fontWeight: 600, color: '#3498db',
              marginBottom: 4, marginTop: i > 0 ? 12 : 0,
            }}>
              #{i + 1} — {angleLabel(asset.angle)}
            </div>
            {i < imageAssets.length - 1 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 2 }}>
                  ↓ 过渡描述
                </div>
                <input
                  value={transitions[i]}
                  onChange={(e) => {
                    const next = [...transitions];
                    next[i] = e.target.value;
                    setTransitions(next);
                  }}
                  placeholder="描述这一段的过渡效果"
                  style={{
                    width: '100%', padding: '6px 8px', fontSize: 12, borderRadius: 4,
                    border: '1px solid #ddd',
                  }}
                />
              </div>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            padding: '8px 24px', background: '#fff', color: '#555',
            border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer', fontSize: 13,
          }}>取消</button>
          <button onClick={handleGenerate} style={{
            padding: '8px 24px', background: '#8e44ad', color: '#fff',
            border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 13,
          }}>生成视频</button>
        </div>
      </div>
    </div>
  );
}
