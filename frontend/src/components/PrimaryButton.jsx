// frontend/src/components/PrimaryButton.jsx
import React from "react";

export default function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white font-semibold shadow-md hover:opacity-95 transition"
    >
      {children}
    </button>
  );
}
