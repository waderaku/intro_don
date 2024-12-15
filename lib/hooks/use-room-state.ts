'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { RoomState } from '@/types/game';

export function useRoomState(roomId: string) {
  const [roomState, setRoomState] = useState<RoomState>({
    status: 'waiting',
    currentBuzzer: null,
    isPlaying: false,
  });

  useEffect(() => {
    const roomChannel = supabase
      .channel(`room_state:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload: any) => {
        setRoomState({
          status: payload.new.status,
          currentBuzzer: payload.new.current_buzzer,
          isPlaying: payload.new.status === 'playing',
        });
      })
      .subscribe();

    // 初期状態を取得
    supabase
      .from('rooms')
      .select('status, current_buzzer')
      .eq('id', roomId)
      .single()
      .then(({ data }) => {
        if (data) {
          setRoomState({
            status: data.status,
            currentBuzzer: data.current_buzzer,
            isPlaying: data.status === 'playing',
          });
        }
      });

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId]);

  return roomState;
}