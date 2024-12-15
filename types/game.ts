export interface Room {
  id: string;
  name: string;
  host: string;
  status: 'waiting' | 'playing' | 'finished';
  current_buzzer: string | null;
  current_round: number;
  song_set_id: string | null;
  created_at: string;
}

export interface RoomState {
  status: Room['status'];
  currentBuzzer: string | null;
  isPlaying: boolean;
}

export interface Player {
  id: string;
  room_id: string;
  name: string;
  score: number;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  created_at: string;
}

export interface SongSet {
  id: string;
  name: string;
  description: string;
  created_by: string;
  created_at: string;
}

export interface SongSetItem {
  id: string;
  song_set_id: string;
  song_id: string;
  sort_order: number;
  created_at: string;
}

export interface CurrentSong {
  id: string;
  room_id: string;
  song_id: string;
  created_at: string;
}