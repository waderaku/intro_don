'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { validateAudioFile } from '@/lib/utils/upload';

interface SongUploadFormProps {
  onUpload: (file: File, title: string, artist: string) => Promise<void>;
  isUploading: boolean;
}

export function SongUploadForm({ onUpload, isUploading }: SongUploadFormProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title || !artist) return;

    try {
      await onUpload(file, title, artist);
      // フォームをリセット
      setTitle('');
      setArtist('');
      setFile(null);
      setError(null);
      const form = e.target as HTMLFormElement;
      form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'アップロードに失敗しました');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (selectedFile) {
      try {
        validateAudioFile(selectedFile);
        setFile(selectedFile);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'ファイルの検証に失敗しました');
        setFile(null);
        e.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">曲名</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isUploading}
          />
        </div>
        <div>
          <Label htmlFor="artist">アーティスト</Label>
          <Input
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            required
            disabled={isUploading}
          />
        </div>
        <div>
          <Label htmlFor="file">音声ファイル</Label>
          <Input
            id="file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            required
            disabled={isUploading}
          />
        </div>
        <Button
          type="submit"
          disabled={isUploading || !file || !title || !artist}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isUploading ? 'アップロード中...' : '曲を追加'}
        </Button>
      </form>
    </div>
  );
}