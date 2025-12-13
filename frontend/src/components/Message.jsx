// frontend/src/components/Message.jsx
import React from "react";

export default function Message({ who, text }) {
  const isHer = who === "her";
  return (
    <div className={`mb-3 flex ${isHer ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-[70%] p-3 rounded-2xl ${
          isHer ? "bg-[#FFF0F6]" : "bg-[#DDE7FF]"
        }`}
      >
        <div className="text-sm">{text}</div>
      </div>
    </div>
  );
}
