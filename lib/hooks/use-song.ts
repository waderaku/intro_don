'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentSongForRoom } from '@/lib/services/song';
import type { Song } from '@/types/game';

export function useSong(roomId: string) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCurrentSong = async () => {
    try {
      const song = await getCurrentSongForRoom(roomId);
      setCurrentSong(song);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const subscription = supabase
      .channel('current_song_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'current_song',
        filter: `room_id=eq.${roomId}`,
      }, fetchCurrentSong)
      .subscribe();

    fetchCurrentSong();

    return () => {
      subscription.unsubscribe();
    };
  }, [roomId]);

  return { currentSong, loading, error };
}