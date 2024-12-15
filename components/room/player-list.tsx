'use client';

import { type Player } from '@/types/game';

interface PlayerListProps {
  players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">参加者</h2>
      <div className="space-y-3">
        {players.map((player) => (
          <div
            key={player.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <span className="font-medium">{player.name}</span>
            <span className="text-blue-600 font-bold">{player.score}点</span>
          </div>
        ))}
      </div>
    </div>
  );
}