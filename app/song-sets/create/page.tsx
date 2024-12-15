'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SongUploadList } from '@/components/song-sets/song-upload-list';
import { supabase } from '@/lib/supabase';

export default function CreateSongSetPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: songSet, error } = await supabase
        .from('song_sets')
        .insert([
          {
            name,
            description,
            created_by: 'system', // TODO: 認証実装後にユーザーIDを設定
          },
        ])
        .select()
        .single();

      if (error) throw error;

      router.push(`/song-sets/${songSet.id}/edit`);
    } catch (error) {
      console.error('Error creating song set:', error);
      alert('問題セットの作成に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">新規問題セット作成</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">セット名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: J-POP 2000年代"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">説明</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="問題セットの説明を入力"
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '作成中...' : '問題セットを作成'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}