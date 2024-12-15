'use client';

import { useRef, useEffect } from 'react';
import type { Song } from '@/types/game';

interface SongPlayerProps {
  song: Song | null;
  isPlaying: boolean;
  isHost: boolean;
}

export function SongPlayer({ song, isPlaying }: SongPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  if (!song) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-500">曲が選択されていません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{song.title}</h3>
        <p className="text-sm text-gray-500">{song.artist}</p>
      </div>
      <audio
        ref={audioRef}
        src={song.audio_url}
        style={{ display: 'none' }}
      />
    </div>
  );
}