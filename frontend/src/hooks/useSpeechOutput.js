import { useCallback, useEffect, useRef, useState } from 'react';

function pickVoice(voices, bcp47, gender) {
  const base = bcp47.split('-')[0].toLowerCase();
  const subset = voices.filter((v) => v.lang.toLowerCase().startsWith(base));
  const female = (name) =>
    /female|woman|girl|zira|samantha|karen|victoria|fiona|susan|veena|paola|luciana/i.test(name);
  const male = (name) =>
    /male|man|david|mark|daniel|thomas|jorge|diego|juan|enrique|google us english/i.test(name);

  const pool =
    gender === 'female'
      ? subset.filter((v) => female(v.name)) || subset
      : subset.filter((v) => male(v.name) || !female(v.name));

  return pool[0] || subset[0] || voices[0] || null;
}

export function useSpeechOutput() {
  const [voicesReady, setVoicesReady] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const utterRef = useRef(null);

  useEffect(() => {
    const load = () => setVoicesReady(true);
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    load();
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  const cancel = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = useCallback((text, bcp47, gender, muted) => {
    if (!window.speechSynthesis || muted || !text?.trim()) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = bcp47;
    const voices = window.speechSynthesis.getVoices();
    const v = pickVoice(voices, bcp47, gender);
    if (v) u.voice = v;
    u.rate = 1.05;
    u.pitch = gender === 'female' ? 1.08 : 0.95;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utterRef.current = u;
    window.speechSynthesis.speak(u);
  }, []);

  return { speak, cancel, speaking, voicesReady };
}
