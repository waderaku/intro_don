'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRoom } from '@/lib/hooks/use-room';
import { usePlayer } from '@/lib/hooks/use-player';
import { RoomHeader } from '@/components/room/room-header';
import { PlayerList } from '@/components/room/player-list';
import { GameControls } from '@/components/room/game-controls';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function RoomClient() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const playerName = searchParams.get('player');
  const { room, players, loading: roomLoading, error: roomError } = useRoom(id as string);
  const { player, loading: playerLoading, error: playerError } = usePlayer(id as string, playerName || '');
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    if (room && player) {
      setIsHost(room.host === player.name);
    }
  }, [room, player]);

  if (roomLoading || playerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (roomError || playerError || !room || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-600">
          {roomError?.message || playerError?.message || 'ルームが見つかりませんでした'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <RoomHeader room={room} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <PlayerList players={players} />
          </div>
          <div className="md:col-span-2">
            <GameControls
              roomId={room.id}
              playerId={player.id}
              isHost={isHost}
            />
          </div>
        </div>
      </div>
    </div>
  );
}