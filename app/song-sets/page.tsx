'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SongSetList } from '@/components/song-sets/song-set-list';
import { useSongSets } from '@/lib/hooks/use-song-sets';

export default function SongSetsPage() {
  const { songSets, loading, error } = useSongSets();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">問題セット一覧</h1>
          <Link href="/song-sets/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Button>
          </Link>
        </div>
        <SongSetList songSets={songSets} />
      </div>
    </div>
  );
}