import { useCallback, useRef, useState } from 'react';
import { useProjectStore } from '../../store/useProjectStore';
import { fileToBase64, getImageDimensions } from '../../utils/file';
import { MAX_UPLOAD_SIZE, ALLOWED_IMAGE_TYPES } from '../../utils/constants';

export default function UploadZone() {
  const addAsset = useProjectStore((s) => s.addAsset);
  const showToast = useProjectStore((s) => s.showToast);
  const [dragover, setDragover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast('仅支持 JPG/PNG/WebP 格式', 'error');
      return;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      showToast('图片大小不超过 20MB', 'error');
      return;
    }
    try {
      const dataUrl = await fileToBase64(file);
      const dims = await getImageDimensions(dataUrl);
      addAsset({ type: 'image', name: file.name, dataUrl, width: dims.width, height: dims.height });
      showToast(`已上传: ${file.name}`, 'success');
    } catch {
      showToast('文件读取失败', 'error');
    }
  }, [addAsset, showToast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
      onDragLeave={() => setDragover(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        margin: 8, padding: 24, border: `2px dashed ${dragover ? '#3498db' : '#ccc'}`,
        borderRadius: 8, textAlign: 'center', cursor: 'pointer',
        background: dragover ? '#f0f7ff' : '#fafafa',
        transition: 'all 0.2s',
      }}
    >
      <p style={{ fontSize: 13, color: '#888' }}>
        拖拽商品图片到此处<br />或点击上传
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) processFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
