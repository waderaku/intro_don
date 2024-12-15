import { supabase } from '@/lib/supabase';
import type { Song } from '@/types/game';

interface UploadSongParams {
  file: File;
  title: string;
  artist: string;
  roomId?: string;
}

export async function uploadSong({ file, title, artist, roomId }: UploadSongParams): Promise<Song> {
  // 1. S3にファイルをアップロードし、DBに曲情報を保存
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('artist', artist);
  if (roomId) {
    formData.append('roomId', roomId);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'ファイルのアップロードに失敗しました');
  }

  const { song } = await response.json();
  return song;
}

interface AddSongToSetParams {
  songId: string;
  songSetId: string;
  sortOrder: number;
}

export async function addSongToSet({ songId, songSetId, sortOrder }: AddSongToSetParams) {
  const { error } = await supabase
    .from('song_set_items')
    .insert([
      {
        song_set_id: songSetId,
        song_id: songId,
        sort_order: sortOrder,
      },
    ]);

  if (error) {
    throw error;
  }
}