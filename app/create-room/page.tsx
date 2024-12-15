'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { selectRandomSongFromSet, updateCurrentSong } from '@/lib/services/song';
import type { SongSet } from '@/types/game';

export default function CreateRoom() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [hostName, setHostName] = useState('');
  const [songSetId, setSongSetId] = useState('');
  const [songSets, setSongSets] = useState<SongSet[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchSongSets = async () => {
      const { data } = await supabase
        .from('song_sets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setSongSets(data);
    };

    fetchSongSets();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      // 1. ルームを作成
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .insert([
          {
            name: roomName,
            host: hostName,
            status: 'waiting',
            song_set_id: songSetId,
          },
        ])
        .select()
        .single();

      if (roomError) throw roomError;
      if (!roomData) throw new Error('Room creation failed');

      // 2. ホストプレイヤーを作成
      const { error: playerError } = await supabase
        .from('players')
        .insert([
          {
            room_id: roomData.id,
            name: hostName,
            score: 0,
          },
        ]);

      if (playerError) throw playerError;

      // 3. 問題セットから最初の曲を選択して設定
      const songId = await selectRandomSongFromSet(roomData.id, songSetId);
      if (songId) {
        await updateCurrentSong(roomData.id, songId);
      }

      router.push(`/room/${roomData.id}?player=${encodeURIComponent(hostName)}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('ルームの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">ルームを作成</h1>
        
        <form onSubmit={handleCreateRoom} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomName">ルーム名</Label>
            <Input
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="例: みんなで音楽クイズ！"
              required
              disabled={isCreating}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="hostName">ホスト名</Label>
            <Input
              id="hostName"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="あなたの名前"
              required
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="songSet">問題セット</Label>
            <Select
              value={songSetId}
              onValueChange={setSongSetId}
              disabled={isCreating}
            >
              <SelectTrigger>
                <SelectValue placeholder="問題セットを選択" />
              </SelectTrigger>
              <SelectContent>
                {songSets.map((set) => (
                  <SelectItem key={set.id} value={set.id}>
                    {set.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button
            type="submit"
            className="w-full"
            disabled={isCreating || !songSetId}
          >
            {isCreating ? 'ルームを作成中...' : 'ルームを作成'}
          </Button>
        </form>
      </div>
    </div>
  );
}