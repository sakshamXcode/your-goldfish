// frontend/src/components/Header.jsx
// import React, { useContext } from "react";
import NotificationsBell from "./NotificationsBell";
import {useAuthContext } from "../contexts/AuthContext"; // if you created it
import logo from "/app_logo.png"; // your goldfish logo in public folder

export default function Header() {
const { user } = useAuthContext();

  return (
    <header className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center overflow-hidden">
          {/* App Goldfish Logo */}
          <img
            src={logo}
            alt="Your Goldfish Logo"
            className="w-10 h-10 object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B1B1B]">Your Goldfish</h1>
          <p className="text-sm text-[#6E6E6E]">Catch every idea before it swims away</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationsBell
          to_phone={user?.phone || "+918081308505"}
          user_id={user?.id || null}
        />
        {/* Settings avatar / gear (you already said Profile/Me should be settings) */}
        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600">
          {/* simple settings icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1 .6 1.65 1.65 0 0 0-.33 1.1V21a2 2 0 0 1-4 0v-.1a1.65 1.65 0 0 0-.33-1.1 1.65 1.65 0 0 0-1-.6 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15 1.65 1.65 0 0 0 4 14a1.65 1.65 0 0 0-.6-1 1.65 1.65 0 0 0-1.1-.33H2a2 2 0 0 1 0-4h.1a1.65 1.65 0 0 0 1.1-.33 1.65 1.65 0 0 0 .6-1A1.65 1.65 0 0 0 4.6 5a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6 1.65 1.65 0 0 0 10 4a1.65 1.65 0 0 0 1-.6 1.65 1.65 0 0 0 .33-1.1V2a2 2 0 0 1 4 0v.1a1.65 1.65 0 0 0 .33 1.1 1.65 1.65 0 0 0 1 .6 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9 1.65 1.65 0 0 0 20 10a1.65 1.65 0 0 0 .6 1 1.65 1.65 0 0 0 1.1.33H22a2 2 0 0 1 0 4h-.1a1.65 1.65 0 0 0-1.1.33 1.65 1.65 0 0 0-.6 1Z" />
          </svg>
        </div>
      </div>
    </header>
  );
}
