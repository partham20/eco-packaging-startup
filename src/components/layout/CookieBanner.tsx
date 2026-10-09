import { useState } from 'react';

const KEY = 'petti.cookies';

function read() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return 'unavailable';
  }
}

export default function CookieBanner() {
  const [choice, setChoice] = useState(read);
  if (choice) return null;
  const decide = (v: 'accepted' | 'declined') => {
    try {
      localStorage.setItem(KEY, v);
    } catch {
      /* storage blocked: just hide for this visit */
    }
    setChoice(v);
  };
  return (
    <div role="dialog" aria-label="Cookies" className="no-print fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-[340px] bg-ink p-6 text-white shadow-2xl">
      <h2 className="text-[28px] font-normal">Cookies</h2>
      <p className="mt-3 text-[15px] leading-relaxed text-white/90">This website uses cookies to ensure you get the best experience on your device.</p>
      <button onClick={() => decide('accepted')} className="mt-5 h-12 w-full rounded-full bg-white text-[17px] text-ink transition hover:bg-white/90">Accept all cookies</button>
      <button onClick={() => decide('declined')} className="mt-3 h-12 w-full rounded-full border border-white text-[17px] transition hover:bg-white hover:text-ink">Decline all cookies</button>
    </div>
  );
}
