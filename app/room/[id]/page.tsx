import { Suspense } from 'react';
import { RoomClient } from '@/components/room/room-client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/lib/supabase';

interface Props {
  params: {
    id: string;
  };
}

export default function RoomPage({ params }: Props) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RoomClient roomId={params.id} />
    </Suspense>
  );
}

// 静的生成のためのパラメータを生成
export async function generateStaticParams() {
  try {
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id');
    
    return (rooms || []).map((room) => ({
      id: room.id,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}