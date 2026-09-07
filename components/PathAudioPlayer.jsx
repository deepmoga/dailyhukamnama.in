'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react';

export default function PathAudioPlayer({ audioUrl, title, punjabiTitle }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => console.log('Audio playback prevented:', err));
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const restartAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-gold-500/15 to-orange-500/10 border-2 border-gold-400/40 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Play button and titles */}
        <div className="flex items-center space-x-3.5">
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause Recitation' : 'Play Recitation'}
            className="w-12 h-12 rounded-full bg-gold-500 hover:bg-gold-600 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 fill-white" />
            ) : (
              <Play className="w-6 h-6 fill-white ml-0.5" />
            )}
          </button>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <p className="text-[11px] font-bold text-gold-700 uppercase tracking-wider">
                Sacred Path Recitation
              </p>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {title} {punjabiTitle && <span className="font-gurmukhi font-normal text-slate-600">({punjabiTitle})</span>}
            </h4>
          </div>
        </div>

        {/* Right: Timer & Tools */}
        <div className="flex items-center space-x-3 text-xs text-slate-600 self-end sm:self-center">
          <span className="font-mono text-xs font-semibold text-slate-700">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button
            onClick={restartAudio}
            title="Restart from beginning"
            className="p-1.5 text-slate-500 hover:text-gold-700 hover:bg-gold-100 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
            className="p-1.5 text-slate-500 hover:text-gold-700 hover:bg-gold-100 rounded-lg transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Scrub bar slider */}
      <div className="flex items-center space-x-2 pt-1">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-gold-200 rounded-lg appearance-none cursor-pointer accent-gold-600"
        />
      </div>
    </div>
  );
}
