'use client';

import { type Room } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface RoomHeaderProps {
  room: Room;
}

export function RoomHeader({ room }: RoomHeaderProps) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{room.name}</h1>
          <p className="text-gray-600">ホスト: {room.host}</p>
        </div>
        <Button onClick={handleShare} variant="outline" className="flex items-center gap-2">
          <Share2 className="w-4 h-4" />
          共有
        </Button>
      </div>
    </div>
  );
}