// frontend/src/pages/AddIdea.jsx
import React, { useState } from "react";
import useIdeas from "../features/ideas/useIdeas";
import { useAuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import useLinkPreview from "../features/preview/useLinkPreview";
import ImageUploader from "../components/ImageUploader";
import PlacesAutocomplete from "../components/PlacesAutocomplete";

const CATEGORIES = ["Food", "Romantic", "Travel", "Reel", "Creative", "Surprise"];
const categoryIcons = { Food: '🍽️', Romantic: '💕', Travel: '✈️', Reel: '🎬', Creative: '🎨', Surprise: '🎁' };

export default function AddIdea() {
  const { user } = useAuthContext();
  const user_id = user?.id || null;
  const navigate = useNavigate();
  const { createIdea } = useIdeas({ user_id });

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Food");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const { data: preview, loading: previewLoading, error: previewError } = useLinkPreview(url.trim());

  async function handleSave(e) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await createIdea({
        title: title.trim(),
        url: url.trim() || null,
        category,
        added_by: user_id,
        image_url: imageUrl || null,
        tags: location ? [location] : [],
      });
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to save idea");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto pb-24">
      <h2 className="text-xl font-bold mb-5 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
        ✨ New Idea
      </h2>

      <form onSubmit={handleSave} className="glass-card-static p-6 space-y-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Moonlight walk + ice cream"
            className="input-glass"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Place / Location <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
          </label>
          <PlacesAutocomplete value={location} onChange={setLocation} />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Link <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/reel/..."
            className="input-glass"
          />

          <div className="mt-3">
            {previewLoading && (
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Fetching preview…</div>
            )}
            {previewError && (
              <div className="text-xs" style={{ color: '#ef4444' }}>{previewError}</div>
            )}
            {preview && (
              <div className="mt-2 flex gap-3 items-center p-3 rounded-xl glass-card-static">
                {preview.image && (
                  <img src={preview.image} alt={preview.title || "preview"}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }} />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                    {preview.title || "Link preview"}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {preview.site_name || preview.url || ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image uploader */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
            Image <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>(optional)</span>
          </label>
          <ImageUploader onUploaded={(f) => setImageUrl(f?.url || null)} />
          {imageUrl && (
            <div className="mt-3">
              <div className="relative group rounded-xl overflow-hidden max-w-xs"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <img src={imageUrl} alt="preview" className="w-full h-auto object-cover max-h-48" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    Attached ✓
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <div className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
            Category
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`pill ${category === c ? 'pill-active' : 'pill-default'}`}
              >
                {categoryIcons[c]} {c}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm px-3 py-2 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
            {error}
          </div>
        )}

        {/* Save */}
        <div className="flex justify-end pt-2">
          <button type="submit" disabled={saving} className="btn-aurora text-sm">
            {saving ? "Saving…" : "💾 Save idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
