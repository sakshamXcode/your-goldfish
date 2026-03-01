import React, { useState, useEffect, useRef } from 'react';

export default function PlacesAutocomplete({ value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!query || query === value) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await res.json();
        setResults(data || []);
        setIsOpen(true);
      } catch (err) {
        console.error("Places API error:", err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (place) => {
    const selectedName = place.display_name;
    setQuery(selectedName);
    onChange(selectedName);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value === '') onChange('');
        }}
        onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        placeholder="Search for a place (e.g. Central Park, NY)"
        className="input-glass"
      />

      {loading && (
        <div className="absolute right-4 top-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>Loading...</div>
      )}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-20 w-full mt-2 rounded-xl overflow-hidden max-h-60 overflow-auto"
          style={{
            background: 'rgba(18,18,26,0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
          {results.map((place) => (
            <li
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="px-4 py-3 cursor-pointer transition-all duration-200"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(139,92,246,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div className="text-sm font-medium line-clamp-1" style={{ color: 'var(--color-text-primary)' }}>
                {place.display_name.split(',')[0]}
              </div>
              <div className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                {place.display_name}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
