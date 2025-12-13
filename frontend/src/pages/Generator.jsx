// frontend/src/pages/Generator.jsx
import React, { useState } from 'react';

export default function Generator() {
  const [result, setResult] = useState(null);
  function spin() {
    const samples = [
      "Rooftop Candlelight Dinner",
      "Park Picnic & Ice Cream",
      "Drive-in Movie Night",
      "Sunset Boat Ride",
    ];
    setResult(samples[Math.floor(Math.random() * samples.length)]);
  }

  return (
    <section>
      <h2 className="text-xl font-semibold">Random Date Generator</h2>
      <div className="mt-4 bg-gradient-to-br from-[#D8B9FF] to-[#FFE7F2] rounded-2xl p-6 text-center">
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-white">Mood<br/><strong>Cute</strong></div>
          <div className="p-4 rounded-xl bg-white">Cost<br/><strong>₹0 - 500</strong></div>
          <div className="p-4 rounded-xl bg-white">Time<br/><strong>Evening</strong></div>
        </div>

        <button onClick={spin} className="mt-6 px-6 py-3 rounded-full bg-gradient-to-br from-[#FF6FAF] to-[#A86EFF] text-white">Generate My Date!</button>

        {result && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
            <div className="font-semibold">Suggestion</div>
            <div className="text-sm text-[#6E6E6E]">{result}</div>
          </div>
        )}
      </div>
    </section>
  );
}
