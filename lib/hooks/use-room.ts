'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Room, Player } from '@/types/game';

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError) throw roomError;
        if (roomData) setRoom(roomData);

        const { data: playersData, error: playersError } = await supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .order('score', { ascending: false });

        if (playersError) throw playersError;
        if (playersData) setPlayers(playersData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    // WebSocket subscriptions
    const roomChannel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        if (payload.new) setRoom(payload.new as Room);
      })
      .subscribe();

    const playerChannel = supabase
      .channel(`players:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        // プレイヤーリストを再取得（スコア順を維持するため）
        supabase
          .from('players')
          .select('*')
          .eq('room_id', roomId)
          .order('score', { ascending: false })
          .then(({ data }) => {
            if (data) setPlayers(data);
          });
      })
      .subscribe();

    fetchRoom();

    return () => {
      roomChannel.unsubscribe();
      playerChannel.unsubscribe();
    };
  }, [roomId]);

  return { room, players, loading, error };
}