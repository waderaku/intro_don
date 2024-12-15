'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';
import type { SongSet } from '@/types/game';

interface SongSetListProps {
  songSets: SongSet[];
}

export function SongSetList({ songSets }: SongSetListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {songSets.map((songSet) => (
        <Card key={songSet.id}>
          <CardHeader>
            <CardTitle>{songSet.name}</CardTitle>
            <CardDescription>{songSet.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-end space-x-2">
              <Link href={`/song-sets/${songSet.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit2 className="w-4 h-4 mr-2" />
                  編集
                </Button>
              </Link>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}