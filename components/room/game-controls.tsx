'use client';

import { useState } from 'react';
import { useGameState } from '@/lib/hooks/use-game-state';
import { useSong } from '@/lib/hooks/use-song';
import { SongPlayer } from '@/components/room/song-player';
import { AnswerDialog } from '@/components/room/answer-dialog';
import { Button } from '@/components/ui/button';
import { Music2, AlertCircle, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GameControlsProps {
  roomId: string;
  playerId: string;
  isHost: boolean;
}

export function GameControls({ roomId, playerId, isHost }: GameControlsProps) {
  const { currentSong } = useSong(roomId);
  const {
    isPlaying,
    answerState,
    hasPressed,
    canBuzz,
    gameStarted,
    handleBuzzer,
    resetBuzzer,
    startGame,
    nextRound,
    submitAnswer,
  } = useGameState(roomId, playerId);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);

  const handleBuzzerClick = () => {
    handleBuzzer();
    setShowAnswerDialog(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Music2 className="mr-2" />
            <h2 className="text-xl font-semibold">現在の曲</h2>
          </div>
          {isHost && !gameStarted && (
            <Button onClick={startGame}>
              ゲームを開始
            </Button>
          )}
          {isHost && gameStarted && !isPlaying && (
            <Button onClick={nextRound}>
              <Play className="w-4 h-4 mr-2" />
              次の問題へ
            </Button>
          )}
        </div>

        <SongPlayer
          song={currentSong}
          isPlaying={isPlaying}
          isHost={isHost}
        />

        {answerState === 'wrong' && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              不正解です。もう一度挑戦してください！
            </AlertDescription>
          </Alert>
        )}

        <Button
          className="w-full h-16 text-xl"
          disabled={!canBuzz || hasPressed || !isPlaying}
          onClick={handleBuzzerClick}
        >
          {hasPressed ? '回答済み' : '早押しボタン'}
        </Button>

        <AnswerDialog
          isOpen={showAnswerDialog}
          onClose={() => {
            setShowAnswerDialog(false);
            if (answerState === 'wrong') {
              resetBuzzer();
            }
          }}
          onSubmit={submitAnswer}
        />
      </div>
    </div>
  );
}