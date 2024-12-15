'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, AlertCircle } from 'lucide-react';
import { validateAudioFile, formatBytes } from '@/lib/utils/upload';
import { uploadSong } from '@/lib/services/song-upload';
import { MAX_FILE_SIZE } from '@/lib/constants';

interface SongUploadProps {
  roomId: string;
}

export function SongUpload({ roomId }: SongUploadProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);

    if (selectedFile) {
      try {
        validateAudioFile(selectedFile);
        setFile(selectedFile);
      } catch (err) {
        setError((err as Error).message);
        setFile(null);
        e.target.value = '';
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      await uploadSong({
        file,
        title,
        artist,
        roomId,
      });

      // フォームをリセット
      setTitle('');
      setArtist('');
      setFile(null);
      setProgress(100);

      // 成功メッセージを表示
      alert('曲を追加しました！');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="title">曲名</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={uploading}
        />
      </div>

      <div>
        <Label htmlFor="artist">アーティスト</Label>
        <Input
          id="artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
          disabled={uploading}
        />
      </div>

      <div>
        <Label htmlFor="file">
          音声ファイル（最大{MAX_FILE_SIZE / 1024 / 1024}MB）
        </Label>
        <Input
          id="file"
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp3,audio/x-m4a"
          onChange={handleFileChange}
          required
          disabled={uploading}
        />
        {file && (
          <p className="mt-1 text-sm text-gray-500">
            選択したファイル: {file.name} ({formatBytes(file.size)})
          </p>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-center text-gray-500">
            アップロード中... {progress}%
          </p>
        </div>
      )}

      <Button
        type="submit"
        disabled={uploading || !file || !title || !artist}
        className="w-full"
      >
        <Upload className="mr-2 h-4 w-4" />
        {uploading ? 'アップロード中...' : '曲をアップロード'}
      </Button>
    </form>
  );
}