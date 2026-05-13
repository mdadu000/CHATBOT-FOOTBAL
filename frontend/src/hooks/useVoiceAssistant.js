import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { speechLangFor } from '../lib/languages.js';

/**
 * Continuous speech recognition with silence-based finalize.
 * Prevents duplicate instances via refs.
 */
export function useVoiceAssistant({ onFinalMessage, languageCode }) {
  const cbRef = useRef(onFinalMessage);
  useEffect(() => {
    cbRef.current = onFinalMessage;
  }, [onFinalMessage]);

  const recognitionRef = useRef(null);
  const activeRef = useRef(false);
  const bufferRef = useRef('');
  const silenceRef = useRef(null);
  const [supported, setSupported] = useState(true);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');

  const clearSilence = useCallback(() => {
    if (silenceRef.current) {
      clearTimeout(silenceRef.current);
      silenceRef.current = null;
    }
  }, []);

  const scheduleFlush = useCallback(() => {
    clearSilence();
    silenceRef.current = setTimeout(() => {
      const text = bufferRef.current.trim();
      bufferRef.current = '';
      setInterim('');
      if (text) cbRef.current(text);
    }, 1600);
  }, [clearSilence]);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return undefined;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    const applyLang = () => {
      const lc = languageCode === 'auto' ? 'en' : languageCode;
      recognition.lang = speechLangFor(lc);
    };
    applyLang();

    recognition.onresult = (event) => {
      let interimPiece = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        const piece = res[0]?.transcript || '';
        if (res.isFinal) {
          bufferRef.current = `${bufferRef.current} ${piece}`.trim();
        } else {
          interimPiece += piece;
        }
      }
      setInterim(`${bufferRef.current} ${interimPiece}`.trim());
      if (bufferRef.current) scheduleFlush();
    };

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') {
        toast.error('Microphone blocked — enable permission in browser settings.');
        activeRef.current = false;
        setListening(false);
      } else if (e.error === 'no-speech') {
        /* ignore */
      } else if (e.error === 'aborted') {
        /* ignore */
      } else {
        console.warn('[speech]', e.error);
      }
    };

    recognition.onend = () => {
      if (activeRef.current) {
        try {
          recognition.start();
        } catch {
          /* already started */
        }
      } else {
        setListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      activeRef.current = false;
      clearSilence();
      try {
        recognition.stop();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, [languageCode, scheduleFlush, clearSilence]);

  const startListening = useCallback(() => {
    if (!supported || !recognitionRef.current) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }
    window.speechSynthesis?.cancel();
    bufferRef.current = '';
    setInterim('');
    activeRef.current = true;
    setListening(true);
    try {
      recognitionRef.current.lang = speechLangFor(languageCode === 'auto' ? 'en' : languageCode);
      recognitionRef.current.start();
    } catch {
      toast.error('Could not start microphone — try again.');
      activeRef.current = false;
      setListening(false);
    }
  }, [languageCode, supported]);

  const stopListening = useCallback(() => {
    activeRef.current = false;
    clearSilence();
    const text = bufferRef.current.trim();
    bufferRef.current = '';
    setInterim('');
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
    if (text) cbRef.current(text);
  }, [clearSilence]);

  return { supported, listening, interim, startListening, stopListening };
}
