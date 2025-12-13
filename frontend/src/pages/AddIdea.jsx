// frontend/src/pages/AddIdea.jsx
import React, { useState } from "react";
import useIdeas from "../features/ideas/useIdeas";
import { useAuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import useLinkPreview from "../features/preview/useLinkPreview";
import ImageUploader from "../components/ImageUploader";

const CATEGORIES = ["Food", "Romantic", "Travel", "Reel", "Creative", "Surprise"];

export default function AddIdea() {
  const { user } = useAuthContext();
  const user_id = user?.id || null;
  const navigate = useNavigate();
  const { createIdea } = useIdeas({ user_id });

  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("Food");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageUrl, setImageUrl] = useState(null);

  const { data: preview, loading: previewLoading, error: previewError } = useLinkPreview(
    url.trim()
  );

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
        image_url: imageUrl || null, // <-- included image url here
        // intentionally not sending preview fields to avoid schema issues
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
    <div className="max-w-xl mx-auto p-6 pb-24">
      <h2 className="text-xl font-semibold mb-4">Add New Idea</h2>

      <form
        onSubmit={handleSave}
        className="mt-4 bg-white rounded-2xl p-4 shadow-sm space-y-4"
      >
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Moonlight walk + ice cream"
            className="w-full p-3 rounded-lg border border-[#EFEFEF]"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Optional link (reel / place / post)
          </label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://instagram.com/reel/..."
            className="w-full p-3 rounded-lg border border-[#EFEFEF]"
          />

          {/* Preview block */}
          <div className="mt-3">
            {previewLoading && (
              <div className="text-xs text-gray-500">Fetching preview…</div>
            )}
            {previewError && (
              <div className="text-xs text-red-500">{previewError}</div>
            )}
            {preview && (
              <div className="mt-2 flex gap-3 items-center p-3 rounded-xl border border-pink-100 bg-[#FFF7FB]">
                {preview.image && (
                  <img
                    src={preview.image}
                    alt={preview.title || "preview"}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-gray-800 truncate">
                    {preview.title || "Link preview"}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {preview.site_name || preview.url || ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optional image
          </label>
          <ImageUploader onUploaded={(f) => setImageUrl(f?.url || null)} />
          {imageUrl && (
            <div className="mt-2 text-xs text-gray-500">Image ready to attach.</div>
          )}
        </div>

        {/* Category */}
        <div>
          <div className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-full text-sm ${
                  category === c
                    ? "bg-[#FFF0F6] text-[#FF6FAF]"
                    : "bg-[#F8F6F9] text-[#6E6E6E]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && <div className="text-sm text-red-500">{error}</div>}

        {/* Save */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save idea"}
          </button>
        </div>
      </form>
    </div>
  );
}
