import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { SongSet } from '@/types/game';

export function useSongSets() {
  const [songSets, setSongSets] = useState<SongSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSongSets = async () => {
      try {
        const { data, error } = await supabase
          .from('song_sets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSongSets(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchSongSets();
  }, []);

  return { songSets, loading, error };
}