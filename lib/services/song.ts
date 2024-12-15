'use client';

import { supabase } from '@/lib/supabase';
import type { Song } from '@/types/game';

// 使用済みの曲を追跡するテーブル名
const USED_SONGS_TABLE = 'used_songs';

export async function getCurrentSongForRoom(roomId: string): Promise<Song | null> {
  try {
    const { data: currentSongData } = await supabase
      .from('current_song')
      .select('song_id')
      .eq('room_id', roomId)
      .single();

    if (!currentSongData) return null;

    const { data: song } = await supabase
      .from('songs')
      .select('*')
      .eq('id', currentSongData.song_id)
      .single();

    return song;
  } catch (error) {
    console.error('Error fetching current song:', error);
    return null;
  }
}

export async function getSongsForSet(songSetId: string): Promise<Song[]> {
  try {
    const { data, error } = await supabase
      .from('song_set_items')
      .select(`
        song_id,
        songs (
          id,
          title,
          artist,
          audio_url
        )
      `)
      .eq('song_set_id', songSetId)
      .order('sort_order');

    if (error) throw error;

    return data.map((item: any) => item.songs);
  } catch (error) {
    console.error('Error fetching songs for set:', error);
    return [];
  }
}

// 使用済みの曲IDを取得
async function getUsedSongIds(roomId: string): Promise<string[]> {
  const { data } = await supabase
    .from(USED_SONGS_TABLE)
    .select('song_id')
    .eq('room_id', roomId);

  return data?.map(item => item.song_id) || [];
}

// 曲を使用済みとしてマーク
async function markSongAsUsed(roomId: string, songId: string) {
  await supabase
    .from(USED_SONGS_TABLE)
    .insert([{ room_id: roomId, song_id: songId }]);
}

// 使用済み曲をリセット
export async function resetUsedSongs(roomId: string) {
  await supabase
    .from(USED_SONGS_TABLE)
    .delete()
    .eq('room_id', roomId);
}

export async function selectRandomSongFromSet(roomId: string, songSetId: string): Promise<string | null> {
  try {
    // 1. 使用済みの曲IDを取得
    const usedSongIds = await getUsedSongIds(roomId);

    // 2. 問題セットから未使用の曲を取得
    const { data: availableSongs, error } = await supabase
      .from('song_set_items')
      .select('song_id')
      .eq('song_set_id', songSetId)
      .not('song_id', 'in', `(${usedSongIds.join(',')})`);

    if (error) {
      console.error('Error fetching available songs:', error);
      return null;
    }

    if (!availableSongs || availableSongs.length === 0) {
      // 全ての曲を使い切った場合、使用済み曲をリセットして再度取得
      await resetUsedSongs(roomId);
      const { data: resetSongs } = await supabase
        .from('song_set_items')
        .select('song_id')
        .eq('song_set_id', songSetId);

      if (!resetSongs || resetSongs.length === 0) {
        return null;
      }

      const randomSong = resetSongs[Math.floor(Math.random() * resetSongs.length)];

      await markSongAsUsed(roomId, randomSong.song_id);
      return randomSong.song_id;
    }

    // 3. 選択した曲を使用済みとしてマーク
    const randomSong = availableSongs[Math.floor(Math.random() * availableSongs.length)];
    await markSongAsUsed(roomId, randomSong.song_id);
    return randomSong.song_id;
  } catch (error) {
    console.error('Error selecting random song:', error);
    return null;
  }
}

export async function updateCurrentSong(roomId: string, songId: string | null) {
  try {
    // 既存のレコードを削除
    await supabase
      .from('current_song')
      .delete()
      .eq('room_id', roomId);

    if (songId) {
      // 新しい曲を設定
      await supabase
        .from('current_song')
        .insert([
          {
            room_id: roomId,
            song_id: songId,
          },
        ]);
    }
  } catch (error) {
    console.error('Error updating current song:', error);
    throw error;
  }
}