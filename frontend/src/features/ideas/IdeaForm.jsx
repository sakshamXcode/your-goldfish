// frontend/src/features/ideas/IdeaForm.jsx
import React, { useState } from 'react';
import TagChip from '../../components/TagChip';
import PrimaryButton from '../../components/PrimaryButton';
import { fetchPreview, createIdeaAPI, uploadImageAPI } from '../../lib/api';
import { useAuthContext } from '../../contexts/AuthContext';
import demoData from '../../demo/demoData';

const CATEGORIES = ['Food','Romantic','Travel','Reel','Creative','Surprise'];

export default function IdeaForm({ onSaved }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Food');
  const [link, setLink] = useState('');
  const [preview, setPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const { user } = useAuthContext?.() || {};
  const userId = user?.id || 'user_anna'; // fallback demo user

  async function handleFetchPreview() {
    if (!link) return;
    setLoadingPreview(true);
    setError(null);
    try {
      const data = await fetchPreview(link);
      setPreview(data || null);
    } catch (err) {
      setError('Failed to fetch preview');
      setPreview(null);
    } finally {
      setLoadingPreview(false);
    }
  }

  async function handleUploadImage(file) {
    if (!file) return null;
    try {
      const resp = await uploadImageAPI(file);
      return resp?.file?.url || resp?.file?.path || null;
    } catch (err) {
      console.error('upload failed', err);
      return null;
    }
  }

  async function handleSave() {
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    setSaving(true);
    setError(null);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await handleUploadImage(imageFile);
      }

const payload = {
  title: title.trim(),
  url: link.trim() || null,
  category,
  added_by: userId,
  image_url: imageUrl || null,
};

      const resp = await createIdeaAPI(payload);
      if (resp?.ok) {
        onSaved && onSaved(resp.idea || payload);
        // reset
        setTitle('');
        setCategory('Food');
        setLink('');
        setPreview(null);
        setImageFile(null);
      } else {
        // fallback demo save
        demoData.ideas.unshift({
          id: Date.now(),
          title: payload.title,
          tags: payload.tags,
          image: payload.image_url || null,
          description: payload.description,
        });
        onSaved && onSaved(demoData.ideas[0]);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save idea');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-2 bg-white rounded-2xl p-4 shadow-sm">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (e.g. Candlelight rooftop)"
        className="w-full p-3 rounded-lg border border-[#EFEFEF]"
      />

      <div className="mt-3 flex gap-2 flex-wrap">
        {CATEGORIES.map((c) => (
          <TagChip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>

      <div className="mt-3">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Add a link (Instagram / article / youtube...)"
          className="w-full p-3 rounded-lg border border-[#EFEFEF]"
        />
        <div className="mt-2 flex gap-2">
          <button onClick={handleFetchPreview} className="px-4 py-2 rounded-full bg-[#FFE7F2] text-[#FF6FAF]">
            {loadingPreview ? 'Loading...' : 'Fetch preview'}
          </button>
        </div>
      </div>

      {preview && (
        <div className="mt-4 bg-[#FAFAFA] p-3 rounded-lg border">
          {preview.image && (
            <img
              src={preview.image}
              alt={preview.title}
              className="w-full h-36 object-cover rounded-md"
            />
          )}
          <div className="mt-2">
            <div className="font-semibold">{preview.title}</div>
            <div className="text-sm text-[#6E6E6E]">{preview.description}</div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className="block text-sm text-[#6E6E6E]">Optional image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="mt-2"
        />
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      <div className="mt-4 flex justify-end">
        <PrimaryButton onClick={handleSave}>{saving ? 'Saving...' : 'Save idea'}</PrimaryButton>
      </div>
    </div>
  );
}
