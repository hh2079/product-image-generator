import { useRef } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { createVideo, pollVideoStatus } from '../../services/api';
import { VIDEO_POLL_INTERVAL, VIDEO_POLL_TIMEOUT } from '../../utils/constants';

export default function VideoGenerateButton() {
  const apiKey = useProjectStore((s) => s.apiKey);
  const assets = useProjectStore((s) => s.assets);
  const projectName = useProjectStore((s) => s.projectName);
  const addAsset = useProjectStore((s) => s.addAsset);
  const setGeneratingStatus = useProjectStore((s) => s.setGeneratingStatus);
  const showToast = useProjectStore((s) => s.showToast);
  const pollTimer = useRef<ReturnType<typeof setInterval>>();

  const generatedImages = assets.filter((a) => a.type === 'image' && a.originalUrl);
  const canGenerate = generatedImages.length >= 2 && !!apiKey;

  const handleGenerateVideo = async () => {
    if (!canGenerate) {
      if (!apiKey) return showToast('请先设置 API Key', 'error');
      return showToast('请至少生成 2 张不同角度的图片（需重新生成）', 'error');
    }

    setGeneratingStatus('generating', '正在创建视频任务...');
    try {
      const { video_id } = await createVideo({
        apiKey,
        imageUrls: generatedImages.map((a) => a.originalUrl!),
        productName: projectName,
      });

      setGeneratingStatus('generating', '视频生成中，请耐心等待...');
      const startTime = Date.now();

      pollTimer.current = setInterval(async () => {
        try {
          const result = await pollVideoStatus(video_id, apiKey);
          if (result.status === 'completed' && result.dataUrl) {
            clearInterval(pollTimer.current);
            addAsset({ type: 'video', name: `${projectName}_video`, dataUrl: result.dataUrl });
            setGeneratingStatus('done');
            showToast('视频生成成功', 'success');
          } else if (result.status === 'failed') {
            clearInterval(pollTimer.current);
            setGeneratingStatus('error');
            showToast(`视频生成失败: ${result.error || '未知错误'}`, 'error');
          } else if (Date.now() - startTime > VIDEO_POLL_TIMEOUT) {
            clearInterval(pollTimer.current);
            setGeneratingStatus('error');
            showToast('视频生成超时，请重试', 'error');
          }
        } catch {
          clearInterval(pollTimer.current);
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
    <button
      onClick={handleGenerateVideo}
      disabled={!canGenerate}
      style={{
        width: '100%', padding: '10px 0', fontSize: 13, borderRadius: 4,
        border: 'none', background: canGenerate ? '#8e44ad' : '#ccc',
        color: '#fff', cursor: canGenerate ? 'pointer' : 'not-allowed',
      }}
    >
      {canGenerate ? '生成商品视频' : `还需 ${2 - generatedImages.length} 张生成图`}
    </button>
  );
}
