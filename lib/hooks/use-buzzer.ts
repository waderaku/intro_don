'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useBuzzer(roomId: string, playerId: string) {
  const [hasPressed, setHasPressed] = useState(false);

  // 他のプレイヤーのボタン押下を監視
  useEffect(() => {
    const buzzerChannel = supabase
      .channel(`buzzer:${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`,
      }, (payload: any) => {
        const currentBuzzer = payload.new.current_buzzer;
        setHasPressed(currentBuzzer === playerId);
      })
      .subscribe();

    return () => {
      buzzerChannel.unsubscribe();
    };
  }, [roomId, playerId]);

  const handleBuzzer = useCallback(async () => {
    if (!hasPressed) {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .update({ current_buzzer: playerId })
          .eq('id', roomId)
          .eq('current_buzzer', null) // 誰も押していない場合のみ更新
          .select()
          .single();

        if (error) throw error;
        
        // 自分が早押しに成功した場合のみtrueに
        setHasPressed(data.current_buzzer === playerId);
      } catch (error) {
        console.error('Error handling buzzer:', error);
      }
    }
  }, [hasPressed, roomId, playerId]);

  const resetBuzzer = useCallback(() => {
    setHasPressed(false);
  }, []);

  return {
    hasPressed,
    handleBuzzer,
    resetBuzzer,
  };
}