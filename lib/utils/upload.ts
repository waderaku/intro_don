import { MAX_FILE_SIZE } from '@/lib/constants';

export function validateAudioFile(file: File) {
  // ファイルサイズのチェック（10MB制限）
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`ファイルサイズは${MAX_FILE_SIZE / 1024 / 1024}MB以下にしてください`);
  }

  // ファイル形式のチェック
  const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-m4a'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('対応していないファイル形式です（MP3, WAV, M4Aのみ対応）');
  }

  return true;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}