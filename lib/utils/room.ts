import { supabase } from '@/lib/supabase';

export async function getRoomById(roomId: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) throw error;
  return data;
}

export async function getAllRoomIds() {
  const { data, error } = await supabase
    .from('rooms')
    .select('id');

  if (error) throw error;
  return data.map(room => room.id);
}