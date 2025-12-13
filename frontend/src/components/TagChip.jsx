// frontend/src/components/TagChip.jsx
import React from "react";

export default function TagChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm ${
        active
          ? "bg-[#FFF0F6] text-[#FF6FAF]"
          : "bg-[#F8F6F9] text-[#6E6E6E]"
      }`}
    >
      {label}
    </button>
  );
}
