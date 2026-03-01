// frontend/src/pages/Generator.jsx
import React, { useState, useRef } from 'react';

const suggestions = [
  { text: "Rooftop Candlelight Dinner", icon: "🕯️" },
  { text: "Park Picnic & Ice Cream", icon: "🧺" },
  { text: "Drive-in Movie Night", icon: "🎬" },
  { text: "Sunset Boat Ride", icon: "🚤" },
  { text: "Stargazing with Hot Chocolate", icon: "⭐" },
  { text: "Cook Together at Home", icon: "👨‍🍳" },
  { text: "Museum & Coffee Walk", icon: "🏛️" },
  { text: "Beach Day with Surfing", icon: "🏄" },
  { text: "Dance Class Together", icon: "💃" },
  { text: "Mini Road Trip", icon: "🚗" },
  { text: "Pottery Workshop Date", icon: "🏺" },
  { text: "Night Photography Walk", icon: "📷" },
];

export default function Generator() {
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const timeoutRef = useRef(null);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    // Rapid cycle through options for visual effect
    let count = 0;
    const maxCycles = 12;
    function cycle() {
      const random = suggestions[Math.floor(Math.random() * suggestions.length)];
      setResult(random);
      count++;
      if (count < maxCycles) {
        timeoutRef.current = setTimeout(cycle, 80 + count * 30);
      } else {
        setSpinning(false);
      }
    }
    cycle();
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <h2 className="text-xl font-bold mb-5 animate-fade-in-up" style={{ color: 'var(--color-text-primary)' }}>
        🎲 Date Generator
      </h2>

      <div className="glass-card-static p-6 text-center animate-fade-in-up" style={{
        animationDelay: '0.1s',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(236,72,153,0.05), rgba(59,130,246,0.04))',
      }}>
        {/* Mood/Cost/Time filters */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="glass-card-static p-3 rounded-xl text-center">
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Mood</div>
            <div className="font-bold text-sm mt-1" style={{ color: '#c084fc' }}>Cute</div>
          </div>
          <div className="glass-card-static p-3 rounded-xl text-center">
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Cost</div>
            <div className="font-bold text-sm mt-1" style={{ color: '#f472b6' }}>₹0 - 500</div>
          </div>
          <div className="glass-card-static p-3 rounded-xl text-center">
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Time</div>
            <div className="font-bold text-sm mt-1" style={{ color: '#60a5fa' }}>Evening</div>
          </div>
        </div>

        {/* Spin button */}
        <button onClick={spin} disabled={spinning}
          className="btn-aurora px-8 py-4 text-base relative"
          style={{
            borderRadius: 999,
            boxShadow: spinning ? '0 0 40px rgba(139,92,246,0.5)' : '0 0 20px rgba(139,92,246,0.2)',
          }}>
          {spinning ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full" style={{ animation: 'spin-slow 0.6s linear infinite' }} />
              Spinning…
            </span>
          ) : 'Generate My Date!'}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-6 glass-card-static p-5 animate-fade-in-up">
            <div className="text-3xl mb-2">{result.icon}</div>
            <div className="font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
              {result.text}
            </div>
            <div className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {spinning ? 'Picking the perfect date…' : 'Your perfect date idea! 🎉'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
