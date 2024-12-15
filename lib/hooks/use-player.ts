import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Player } from '@/types/game';

export function usePlayer(roomId: string, playerName: string) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializePlayer = async () => {
      try {
        // 既存のプレイヤーを検索
        const { data: existingPlayer } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .eq('name', playerName)
          .single();

        if (existingPlayer) {
          setPlayer(existingPlayer);
          return;
        }

        // 新しいプレイヤーを作成
        const { data: newPlayer, error } = await supabase
          .from('players')
          .insert([
            {
              room_id: roomId,
              name: playerName,
              score: 0,
            },
          ])
          .select()
          .single();

        if (error) throw error;
        if (newPlayer) setPlayer(newPlayer);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    if (roomId && playerName) {
      initializePlayer();
    }
  }, [roomId, playerName]);

  return { player, loading, error };
}