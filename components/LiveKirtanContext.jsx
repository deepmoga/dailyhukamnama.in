'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

const LiveKirtanContext = createContext({
  isPlaying: false,
  isBuffering: false,
  togglePlay: () => {},
  play: () => {},
  pause: () => {},
});

const PRIMARY_STREAM = 'https://live.sgpc.net:8444/;';
const FALLBACK_STREAM = 'https://stream.zeno.fm/f3wvbbqmdg8uv';

export function LiveKirtanProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);

  const initAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio(PRIMARY_STREAM);
      audio.preload = 'none';

      audio.addEventListener('waiting', () => setIsBuffering(true));
      audio.addEventListener('playing', () => {
        setIsBuffering(false);
        setIsPlaying(true);
      });
      audio.addEventListener('pause', () => {
        setIsBuffering(false);
        setIsPlaying(false);
      });
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setIsBuffering(false);
      });
      audio.addEventListener('error', (e) => {
        console.warn('SGPC primary stream encountered an issue, trying fallback stream...', e);
        if (audioRef.current && audioRef.current.src !== FALLBACK_STREAM) {
          audioRef.current.src = FALLBACK_STREAM;
          audioRef.current.play().catch((err) => {
            console.error('Fallback live stream playback error:', err);
            setIsPlaying(false);
            setIsBuffering(false);
          });
        } else {
          setIsPlaying(false);
          setIsBuffering(false);
        }
      });

      audioRef.current = audio;
    }
    return audioRef.current;
  };

  const play = () => {
    const audio = initAudio();
    setIsBuffering(true);
    // Reload source to ensure latest live point
    if (audio.paused && !isPlaying) {
      audio.src = PRIMARY_STREAM;
    }
    audio.play().then(() => {
      setIsPlaying(true);
      setIsBuffering(false);
    }).catch((err) => {
      console.error('Audio play error:', err);
      setIsBuffering(false);
      setIsPlaying(false);
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsBuffering(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <LiveKirtanContext.Provider value={{ isPlaying, isBuffering, togglePlay, play, pause }}>
      {children}
    </LiveKirtanContext.Provider>
  );
}

export function useLiveKirtan() {
  return useContext(LiveKirtanContext);
}
