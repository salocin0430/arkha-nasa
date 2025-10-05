import { LikeRepository } from '../../domain/repositories/LikeRepository';
import { supabase } from '../external/SupabaseClient';

export class SupabaseLikeRepository implements LikeRepository {
  async likeMission(userId: string, missionId: string): Promise<void> {
    const { error } = await supabase
      .from('mission_likes')
      .insert({
        user_id: userId,
        mission_id: missionId
      });

    if (error) {
      throw new Error(`Failed to like mission: ${error.message}`);
    }
  }

  async unlikeMission(userId: string, missionId: string): Promise<void> {
    const { error } = await supabase
      .from('mission_likes')
      .delete()
      .eq('user_id', userId)
      .eq('mission_id', missionId);

    if (error) {
      throw new Error(`Failed to unlike mission: ${error.message}`);
    }
  }

  async getLikesCount(missionId: string): Promise<number> {
    const { count, error } = await supabase
      .from('mission_likes')
      .select('*', { count: 'exact', head: true })
      .eq('mission_id', missionId);

    if (error) {
      throw new Error(`Failed to get likes count: ${error.message}`);
    }

    return count || 0;
  }

  async hasUserLiked(userId: string, missionId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('mission_likes')
      .select('id')
      .eq('user_id', userId)
      .eq('mission_id', missionId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Failed to check if user liked mission: ${error.message}`);
    }

    return !!data;
  }

  async getLikesForMissions(missionIds: string[]): Promise<{[missionId: string]: number}> {
    const { data, error } = await supabase
      .from('mission_likes')
      .select('mission_id')
      .in('mission_id', missionIds);

    if (error) {
      throw new Error(`Failed to get likes for missions: ${error.message}`);
    }

    // Contar likes por misión
    const likesCount: {[missionId: string]: number} = {};
    missionIds.forEach(id => likesCount[id] = 0);
    
    data?.forEach(like => {
      likesCount[like.mission_id] = (likesCount[like.mission_id] || 0) + 1;
    });

    return likesCount;
  }

  async getUserLikesForMissions(userId: string, missionIds: string[]): Promise<{[missionId: string]: boolean}> {
    const { data, error } = await supabase
      .from('mission_likes')
      .select('mission_id')
      .eq('user_id', userId)
      .in('mission_id', missionIds);

    if (error) {
      throw new Error(`Failed to get user likes for missions: ${error.message}`);
    }

    // Crear mapa de likes del usuario
    const userLikes: {[missionId: string]: boolean} = {};
    missionIds.forEach(id => userLikes[id] = false);
    
    data?.forEach(like => {
      userLikes[like.mission_id] = true;
    });

    return userLikes;
  }
}
