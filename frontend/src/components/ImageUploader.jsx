// frontend/src/components/ImageUploader.jsx
import React, { useRef, useState } from "react";
import useUpload from "../features/uploads/useUpload";

export default function ImageUploader({ onUploaded }) {
  const inputRef = useRef();
  const [localPreview, setLocalPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const { upload, loading, error } = useUpload();

  async function handleFile(file) {
    if (!file) return;
    setLocalPreview(URL.createObjectURL(file));
    try {
      const uploaded = await upload(file);
      if (onUploaded) onUploaded(uploaded);
    } catch (err) {
      console.warn("upload error:", err);
    }
  }

  function handleInputChange(e) {
    handleFile(e.target.files?.[0]);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }

  return (
    <div>
      <div
        className="relative rounded-2xl p-6 text-center cursor-pointer transition-all duration-300"
        style={{
          background: dragOver ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)',
          border: dragOver ? '2px dashed rgba(139,92,246,0.5)' : '2px dashed rgba(255,255,255,0.08)',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <input ref={inputRef} type="file" accept="image/*" onChange={handleInputChange} className="hidden" />

        {localPreview ? (
          <div className="flex items-center gap-4">
            <img src={localPreview} alt="preview" className="w-16 h-16 rounded-xl object-cover"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }} />
            <div className="text-left">
              <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {loading ? 'Uploading…' : 'Image attached'}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                Click to replace
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl mb-2">📸</div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
              Drop an image or click to browse
            </div>
            <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
              PNG, JPG up to 5MB
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 text-xs px-3 py-2 rounded-xl"
          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          {error}
        </div>
      )}
    </div>
  );
}
