'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Music } from 'lucide-react';
import { MAX_SONGS_PER_SET } from '@/lib/constants';
import { supabase } from '@/lib/supabase';
import { uploadSong, addSongToSet } from '@/lib/services/song-upload';
import { getSongsForSet } from '@/lib/services/song';
import type { Song } from '@/types/game';
import { SongUploadForm } from './song-upload-form';

interface SongUploadListProps {
  songSetId: string;
  onSongsChange: (songs: Song[]) => void;
}

export function SongUploadList({ songSetId, onSongsChange }: SongUploadListProps) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = async () => {
    const songList = await getSongsForSet(songSetId);
    setSongs(songList);
    onSongsChange(songList);
  };

  useEffect(() => {
    fetchSongs();
  }, [songSetId]);

  const handleUpload = async (file: File, title: string, artist: string) => {
    setIsUploading(true);
    setError(null);

    try {
      const song = await uploadSong({ file, title, artist });
      await addSongToSet({
        songId: song.id,
        songSetId,
        sortOrder: songs.length,
      });
      await fetchSongs();
    } catch (error) {
      console.error('Error uploading song:', error);
      setError(error instanceof Error ? error.message : '曲のアップロードに失敗しました');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeSong = async (songId: string) => {
    try {
      await supabase
        .from('song_set_items')
        .delete()
        .eq('song_set_id', songSetId)
        .eq('song_id', songId);

      const remainingSongs = songs.filter(song => song.id !== songId);
      await Promise.all(
        remainingSongs.map((song, index) =>
          supabase
            .from('song_set_items')
            .update({ sort_order: index })
            .eq('song_set_id', songSetId)
            .eq('song_id', song.id)
        )
      );

      await fetchSongs();
    } catch (error) {
      console.error('Error removing song:', error);
      setError('曲の削除に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">収録曲一覧</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {songs.map((song) => (
          <div key={song.id} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
            <Music className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <p className="font-medium">{song.title}</p>
              <p className="text-sm text-gray-500">{song.artist}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeSong(song.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      
      {songs.length < MAX_SONGS_PER_SET && (
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">新しい曲を追加</h3>
          <SongUploadForm
            onUpload={handleUpload}
            isUploading={isUploading}
          />
        </div>
      )}
    </div>
  );
}