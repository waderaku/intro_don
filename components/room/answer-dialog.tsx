'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AnswerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (answer: string) => Promise<boolean>;
}

export function AnswerDialog({ isOpen, onClose, onSubmit }: AnswerDialogProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const isCorrect = await onSubmit(answer);
      if (isCorrect) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
      setAnswer('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>曲名を入力してください</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="曲名"
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting || !answer}>
            回答する
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}