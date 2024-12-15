'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';

export default function JoinRoom() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    
    try {
      // 1. ルームの存在確認
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id')
        .eq('id', roomId)
        .single();

      if (roomError || !room) {
        throw new Error('ルームが見つかりません');
      }

      // 2. プレイヤーを作成
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .insert([
          {
            room_id: roomId,
            name: playerName,
            score: 0,
          },
        ])
        .select()
        .single();

      if (playerError) throw playerError;
      
      // 3. プレイヤー名をクエリパラメータとして含めてルームページに遷移
      router.push(`/room/${roomId}?player=${encodeURIComponent(playerName)}`);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('ルームへの参加に失敗しました。ルームIDを確認してください。');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">ルームに参加</h1>
        
        <form onSubmit={handleJoinRoom} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="roomId">ルームID</Label>
            <Input
              id="roomId"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="ルームIDを入力"
              required
              disabled={isJoining}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="playerName">プレイヤー名</Label>
            <Input
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="あなたの名前"
              required
              disabled={isJoining}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isJoining}>
            {isJoining ? '参加中...' : '参加する'}
          </Button>
        </form>
      </div>
    </div>
  );
}