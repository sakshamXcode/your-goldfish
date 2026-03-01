import React from "react";

export default function Avatar({ src, name }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name || "avatar"}
        className="w-10 h-10 rounded-full object-cover"
      />
    );
  }

  const letter = name?.[0]?.toUpperCase() || "👤";

  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] flex items-center justify-center text-white font-semibold">
      {letter}
    </div>
  );
}
