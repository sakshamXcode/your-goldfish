// frontend/src/pages/Profile.jsx
import React from 'react';

export default function Profile() {
  return (
    <section>
      <h2 className="text-xl font-semibold">Profile & Settings</h2>
      <div className="mt-4 bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] flex items-center justify-center text-white font-bold">S</div>
          <div>
            <div className="font-semibold">Saksham & Partner</div>
            <div className="text-sm text-[#6E6E6E]">Day 328 together</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="p-3 rounded-lg bg-[#FFF0F6]">Theme: Pink Dream</div>
          <div className="p-3 rounded-lg bg-white border">Privacy & invites</div>
          <div className="p-3 rounded-lg bg-white border">Connected accounts</div>
        </div>
      </div>
    </section>
  );
}
