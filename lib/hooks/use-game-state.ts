'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useBuzzer } from './use-buzzer';
import { useRoomState } from './use-room-state';
import { selectRandomSongFromSet, updateCurrentSong } from '@/lib/services/song';
import { INTRO_DURATION } from '@/lib/constants';

export function useGameState(roomId: string, playerId: string) {
  const [currentRound, setCurrentRound] = useState(0);
  const [answerState, setAnswerState] = useState<'waiting' | 'answering' | 'correct' | 'wrong'>('waiting');
  const { hasPressed, handleBuzzer, resetBuzzer } = useBuzzer(roomId, playerId);
  const roomState = useRoomState(roomId);

  const canBuzz = roomState.isPlaying && !roomState.currentBuzzer;
  const gameStarted = roomState.status !== 'waiting';

  const startGame = useCallback(async () => {
    try {
      await supabase
        .from('rooms')
        .update({ 
          status: 'ready',
          current_round: 0,
          current_buzzer: null,
        })
        .eq('id', roomId);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, [roomId]);

  const nextRound = useCallback(async () => {
    try {
      const { data: room } = await supabase
        .from('rooms')
        .select('song_set_id')
        .eq('id', roomId)
        .single();

      if (!room?.song_set_id) {
        throw new Error('問題セットが設定されていません');
      }

      const songId = await selectRandomSongFromSet(roomId, room.song_set_id);
      if (!songId) {
        throw new Error('問題セットに曲が登録されていません');
      }

      await updateCurrentSong(roomId, songId);

      await supabase
        .from('rooms')
        .update({ 
          status: 'playing',
          current_buzzer: null,
          current_round: currentRound + 1
        })
        .eq('id', roomId);

      setTimeout(async () => {
        await supabase
          .from('rooms')
          .update({ 
            status: 'ready',
            current_buzzer: null
          })
          .eq('id', roomId);
      }, INTRO_DURATION);
    } catch (error) {
      console.error('Error starting next round:', error);
    }
  }, [roomId, currentRound]);

  const submitAnswer = useCallback(async (answer: string): Promise<boolean> => {
    try {
      const { data: songData } = await supabase
        .from('current_song')
        .select('song_id')
        .eq('room_id', roomId)
        .single();

      if (!songData) return false;

      const { data: correctSong } = await supabase
        .from('songs')
        .select('title')
        .eq('id', songData.song_id)
        .single();

      const isCorrect = correctSong?.title.toLowerCase() === answer.toLowerCase();
      
      if (isCorrect) {
        await Promise.all([
          supabase
            .from('players')
            .update({ score: supabase.sql`score + 100` })
            .eq('id', playerId),
          supabase
            .from('rooms')
            .update({ 
              status: 'ready',
              current_buzzer: null
            })
            .eq('id', roomId)
        ]);
        
        setAnswerState('correct');
      } else {
        setAnswerState('wrong');
        await supabase
          .from('rooms')
          .update({ current_buzzer: null })
          .eq('id', roomId);
      }

      return isCorrect;
    } catch (error) {
      console.error('Error submitting answer:', error);
      return false;
    }
  }, [roomId, playerId]);

  return {
    isPlaying: roomState.isPlaying,
    currentRound,
    answerState,
    canBuzz,
    hasPressed,
    gameStarted,
    handleBuzzer,
    resetBuzzer,
    startGame,
    nextRound,
    submitAnswer,
  };
}