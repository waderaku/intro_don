import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Music, Plus, Users, Settings } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="flex items-center justify-center space-x-3">
          <Music className="w-12 h-12 text-blue-600" />
          <h1 className="text-4xl font-bold text-blue-900">イントロドン!</h1>
        </div>
        
        <p className="text-lg text-gray-700 max-w-md mx-auto">
          曲のイントロを聴いて、みんなで早押しクイズに参加しよう！
          曲名を当てて、ポイントを獲得しましょう。
        </p>

        <div className="space-y-4">
          <Link href="/create-room">
            <Button className="w-64 h-12 text-lg bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              ルームを作成
            </Button>
          </Link>
          
          <div className="block">
            <Link href="/join-room">
              <Button variant="outline" className="w-64 h-12 text-lg">
                <Users className="w-5 h-5 mr-2" />
                ルームに参加
              </Button>
            </Link>
          </div>

          <div className="block">
            <Link href="/song-sets">
              <Button variant="ghost" className="w-64 h-12 text-lg">
                <Settings className="w-5 h-5 mr-2" />
                問題セット管理
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}