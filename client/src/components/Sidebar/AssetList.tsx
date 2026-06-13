import { useProjectStore } from '../../store/useProjectStore';

export default function AssetList() {
  const assets = useProjectStore((s) => s.assets);
  const removeAsset = useProjectStore((s) => s.removeAsset);
  const openZoomModal = useProjectStore((s) => s.openZoomModal);

  if (assets.length === 0) return null;

  const handleDragStart = (e: React.DragEvent, assetId: string) => {
    e.dataTransfer.setData('text/plain', assetId);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div style={{ padding: 8, overflowY: 'auto', flex: 1 }}>
      <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>素材库 ({assets.length})</p>
      {assets.map((asset) => (
        <div
          key={asset.id}
          draggable
          onDragStart={(e) => handleDragStart(e, asset.id)}
          onClick={() => openZoomModal({ type: asset.type, url: asset.dataUrl })}
          style={{
            position: 'relative', marginBottom: 8, borderRadius: 6,
            overflow: 'hidden', border: '1px solid #eee', cursor: 'grab',
          }}
        >
          {asset.type === 'image' ? (
            <img src={asset.dataUrl} alt={asset.name}
              style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
          ) : (
            <video src={asset.dataUrl}
              style={{ width: '100%', height: 80, objectFit: 'cover', display: 'block' }} />
          )}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(0,0,0,0.6)', color: '#fff',
            fontSize: 11, padding: '2px 6px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{asset.angle ? ({ front: '正面', side: '侧面', back: '背面', top: '顶视', detail: '细节' }[asset.angle] || asset.angle) : asset.type === 'video' ? '视频' : '原图'}</span>
            <span
              onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
              style={{ cursor: 'pointer', fontSize: 14, fontWeight: 'bold' }}
            >
              ×
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
