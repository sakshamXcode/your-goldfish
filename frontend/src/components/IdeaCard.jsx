// frontend/src/components/IdeaCard.jsx
import React from "react";

export default function IdeaCard({ idea, onClick }) {
  if (!idea) return null;

  const {
    title,
    category,
    image_url,
    preview_image, // in case you later store this
    url,
  } = idea;

  const displayImage = image_url || preview_image || null;

  return (
    <article
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="h-40 bg-gradient-to-br from-[#FFE7F2] to-[#FFF0F6] flex items-center justify-center">
        {displayImage ? (
          <img
            src={displayImage}
            alt={title || "idea"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-2xl">🌸</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
          {title}
        </h3>

        {category && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <span className="text-xs px-3 py-1 rounded-full bg-[#FFF0F6] text-[#FF6FAF]">
              {category}
            </span>
          </div>
        )}

        {url && (
          <div className="mt-3">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-blue-500 underline break-all"
              onClick={(e) => e.stopPropagation()}
            >
              Open link
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
