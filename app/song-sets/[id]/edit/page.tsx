'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SongUploadList } from '@/components/song-sets/song-upload-list';
import { supabase } from '@/lib/supabase';
import type { SongSet } from '@/types/game';

interface Props {
  params: {
    id: string;
  };
}

export default function EditSongSetPage({ params }: Props) {
  const router = useRouter();
  const [songSet, setSongSet] = useState<SongSet | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSongSet = async () => {
      const { data, error } = await supabase
        .from('song_sets')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching song set:', error);
        return;
      }

      setSongSet(data);
      setName(data.name);
      setDescription(data.description);
    };

    fetchSongSet();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('song_sets')
        .update({
          name,
          description,
        })
        .eq('id', params.id);

      if (error) throw error;

      router.push('/song-sets');
    } catch (error) {
      console.error('Error updating song set:', error);
      alert('問題セットの更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!songSet) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">問題セットの編集</h1>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">セット名</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: J-POP 2000年代"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">説明</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="問題セットの説明を入力"
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/song-sets')}
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '更新中...' : '更新する'}
                </Button>
              </div>
            </div>

            <hr />

            <SongUploadList
              songSetId={params.id}
              onSongsChange={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}