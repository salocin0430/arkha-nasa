import { MissionRepository } from '../../domain/repositories/MissionRepository';
import { Mission } from '../../domain/entities/Mission';
import { supabase } from '../external/SupabaseClient';

export class SupabaseMissionRepository implements MissionRepository {
  async create(mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Mission> {
    // Sincronizar isPublic con el status automáticamente
    const isPublic = mission.status === 'published';

    // Debug: Verificar el valor que llega
    console.log('📝 SupabaseRepository - Creating mission with:', {
      isScientific: mission.isScientific,
      passengers: mission.passengers,
      destination: mission.destination
    });

    const { data, error } = await supabase
      .from('missions')
      .insert({
        user_id: mission.userId,
        title: mission.title,
        description: mission.description,
        destination: mission.destination,
        passengers: mission.passengers,
        duration: mission.duration,
        is_scientific: mission.isScientific,
        is_public: isPublic,
        status: mission.status,
      })
      .select()
      .single();

    console.log('💾 Supabase response data:', data);

    if (error) {
      throw new Error(`Failed to create mission: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      destination: data.destination,
      passengers: data.passengers,
      duration: data.duration,
      isScientific: data.is_scientific,
      isPublic: data.is_public,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  async findById(id: string): Promise<Mission | null> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to find mission: ${error.message}`);
    }

    // Get author information
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id, name, avatar')
      .eq('id', data.user_id)
      .single();

    if (userError) {
      console.warn('Failed to fetch user information:', userError);
    }

    // Get likes count
    const { count: likesCount, error: likesError } = await supabase
      .from('mission_likes')
      .select('*', { count: 'exact', head: true })
      .eq('mission_id', id);

    if (likesError) {
      console.warn('Failed to fetch likes count:', likesError);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      destination: data.destination,
      passengers: data.passengers,
      duration: data.duration,
      isScientific: data.is_scientific || false,
      isPublic: data.is_public,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      // Add author information
      author: userData ? {
        id: userData.id,
        name: userData.name || 'Anonymous',
        avatar: userData.avatar
      } : undefined,
      // Add likes information
      likesCount: likesCount || 0,
      isLikedByUser: false // Will be set by the calling component if needed
    };
  }

  async findByUserId(userId: string): Promise<Mission[]> {
    console.log('SupabaseMissionRepository: Finding missions for user:', userId);
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('SupabaseMissionRepository: Query result:', { data, error });

    if (error) {
      console.error('SupabaseMissionRepository: Error fetching missions:', error);
      throw new Error(`Failed to find missions: ${error.message}`);
    }

    // Get mission IDs for likes
    const missionIds = data.map(mission => mission.id);
    
    // Fetch likes count for all missions
    const { data: likesData, error: likesError } = await supabase
      .from('mission_likes')
      .select('mission_id')
      .in('mission_id', missionIds);

    if (likesError) {
      console.warn('Failed to fetch likes:', likesError);
    }

    // Count likes per mission
    const likesCount: {[missionId: string]: number} = {};
    missionIds.forEach(id => likesCount[id] = 0);
    
    likesData?.forEach(like => {
      likesCount[like.mission_id] = (likesCount[like.mission_id] || 0) + 1;
    });

    return data.map(mission => ({
      id: mission.id,
      userId: mission.user_id,
      title: mission.title,
      description: mission.description,
      destination: mission.destination,
      passengers: mission.passengers,
      duration: mission.duration,
      isScientific: mission.is_scientific || false,
      isPublic: mission.is_public,
      status: mission.status,
      createdAt: new Date(mission.created_at),
      updatedAt: new Date(mission.updated_at),
      // Add likes information
      likesCount: likesCount[mission.id] || 0,
      isLikedByUser: false // Will be set by the calling component if needed
    }));
  }

  async findPublic(): Promise<Mission[]> {
    console.log('SupabaseMissionRepository: Finding published missions');
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    console.log('SupabaseMissionRepository: Published missions query result:', { data, error });

    if (error) {
      console.error('SupabaseMissionRepository: Error fetching published missions:', error);
      throw new Error(`Failed to find published missions: ${error.message}`);
    }

    return data.map(mission => ({
      id: mission.id,
      userId: mission.user_id,
      title: mission.title,
      description: mission.description,
      destination: mission.destination,
      passengers: mission.passengers,
      duration: mission.duration,
      isScientific: mission.is_scientific || false,
      isPublic: mission.is_public,
      status: mission.status,
      createdAt: new Date(mission.created_at),
      updatedAt: new Date(mission.updated_at),
    }));
  }

  async findByUserIdPaginated(userId: string, page: number, limit: number): Promise<{ missions: Mission[], totalPages: number, totalItems: number }> {
    console.log('SupabaseMissionRepository: Finding missions for user:', userId, 'page:', page, 'limit:', limit);
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) {
      throw new Error(`Failed to count missions: ${countError.message}`);
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Get paginated data
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to find missions: ${error.message}`);
    }

    // Get mission IDs for likes
    const missionIds = data.map(mission => mission.id);
    
    console.log('SupabaseMissionRepository: Fetching likes for mission IDs:', missionIds);
    
    // Fetch likes count for all missions
    const { data: likesData, error: likesError } = await supabase
      .from('mission_likes')
      .select('mission_id')
      .in('mission_id', missionIds);

    if (likesError) {
      console.warn('Failed to fetch likes:', likesError);
    }

    console.log('SupabaseMissionRepository: Likes data received:', likesData);

    // Count likes per mission
    const likesCount: {[missionId: string]: number} = {};
    missionIds.forEach(id => likesCount[id] = 0);
    
    likesData?.forEach(like => {
      likesCount[like.mission_id] = (likesCount[like.mission_id] || 0) + 1;
    });

    console.log('SupabaseMissionRepository: Final likes count:', likesCount);

    const missions = data.map(mission => ({
      id: mission.id,
      userId: mission.user_id,
      title: mission.title,
      description: mission.description,
      destination: mission.destination,
      passengers: mission.passengers,
      duration: mission.duration,
      isScientific: mission.is_scientific || false,
      isPublic: mission.is_public,
      status: mission.status,
      createdAt: new Date(mission.created_at),
      updatedAt: new Date(mission.updated_at),
      likesCount: likesCount[mission.id] || 0,
    }));

    return { missions, totalPages, totalItems };
  }

  async findPublicPaginated(page: number, limit: number): Promise<{ missions: Mission[], totalPages: number, totalItems: number }> {
    console.log('SupabaseMissionRepository: Finding published missions page:', page, 'limit:', limit);
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published');

    if (countError) {
      throw new Error(`Failed to count published missions: ${countError.message}`);
    }

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    // Get paginated data
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to find published missions: ${error.message}`);
    }

    // Get unique user IDs
    const userIds = [...new Set(data.map(mission => mission.user_id))];
    
    // Fetch user information from the user_profiles view
    const { data: usersData, error: usersError } = await supabase
      .from('user_profiles')
      .select('id, name, avatar')
      .in('id', userIds);

    if (usersError) {
      console.warn('Failed to fetch user information:', usersError);
    }

    // Create a map of user data for quick lookup
    const usersMap = new Map();
    if (usersData) {
      usersData.forEach(user => {
        usersMap.set(user.id, {
          id: user.id,
          name: user.name || 'Anonymous',
          avatar: user.avatar
        });
      });
    }
    
    // For users not found in our table, use a fallback
    userIds.forEach(userId => {
      if (!usersMap.has(userId)) {
        const shortId = userId.substring(0, 8);
        usersMap.set(userId, {
          id: userId,
          name: `User ${shortId}`,
          avatar: null
        });
      }
    });

    // Get mission IDs for likes
    const missionIds = data.map(mission => mission.id);
    
    // Fetch likes count for all missions
    const { data: likesData, error: likesError } = await supabase
      .from('mission_likes')
      .select('mission_id')
      .in('mission_id', missionIds);

    if (likesError) {
      console.warn('Failed to fetch likes:', likesError);
    }

    // Count likes per mission
    const likesCount: {[missionId: string]: number} = {};
    missionIds.forEach(id => likesCount[id] = 0);
    
    likesData?.forEach(like => {
      likesCount[like.mission_id] = (likesCount[like.mission_id] || 0) + 1;
    });

    const missions = data.map(mission => {
      const user = usersMap.get(mission.user_id);
      return {
        id: mission.id,
        userId: mission.user_id,
        title: mission.title,
        description: mission.description,
        destination: mission.destination,
        passengers: mission.passengers,
        duration: mission.duration,
        isScientific: mission.is_scientific || false,
        isPublic: mission.is_public,
        status: mission.status,
        createdAt: new Date(mission.created_at),
        updatedAt: new Date(mission.updated_at),
        // Add author information
        author: {
          id: user?.id,
          name: user?.name || 'Anonymous',
          avatar: user?.avatar
        },
        // Add likes information
        likesCount: likesCount[mission.id] || 0,
        isLikedByUser: false // Will be set by the calling component if needed
      };
    });

    return { missions, totalPages, totalItems };
  }

  async update(id: string, updates: Partial<Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Mission> {
    // Construir objeto de actualización solo con campos que han cambiado
    const updateData: Record<string, string | number | boolean> = {
      updated_at: new Date().toISOString(),
    };

    // Solo agregar campos que están presentes en updates
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.destination !== undefined) updateData.destination = updates.destination;
    if (updates.passengers !== undefined) updateData.passengers = updates.passengers;
    if (updates.duration !== undefined) updateData.duration = updates.duration;
    if (updates.isScientific !== undefined) updateData.is_scientific = updates.isScientific;
    if (updates.status !== undefined) {
      updateData.status = updates.status;
      // Sincronizar isPublic con el status automáticamente
      updateData.is_public = updates.status === 'published';
    }
    if (updates.isPublic !== undefined) updateData.is_public = updates.isPublic;

    const { data, error } = await supabase
      .from('missions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(`Failed to update mission: ${error.message}`);
    }

    // Get author information
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id, name, avatar')
      .eq('id', data.user_id)
      .single();

    if (userError) {
      console.warn('Failed to fetch user information:', userError);
    }

    // Get likes count
    const { count: likesCount, error: likesError } = await supabase
      .from('mission_likes')
      .select('*', { count: 'exact', head: true })
      .eq('mission_id', id);

    if (likesError) {
      console.warn('Failed to fetch likes count:', likesError);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      destination: data.destination,
      passengers: data.passengers,
      duration: data.duration,
      isScientific: data.is_scientific || false,
      isPublic: data.is_public,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      // Add author information
      author: userData ? {
        id: userData.id,
        name: userData.name || 'Anonymous',
        avatar: userData.avatar
      } : undefined,
      // Add likes information
      likesCount: likesCount || 0,
      isLikedByUser: false // Will be set by the calling component if needed
    };
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete mission: ${error.message}`);
    }
  }

  async publishMission(id: string): Promise<Mission> {
    console.log('SupabaseMissionRepository: Publishing mission:', id);
    const { data, error } = await supabase
      .from('missions')
      .update({ 
        status: 'published',
        is_public: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    console.log('SupabaseMissionRepository: Publish result:', { data, error });

    if (error) {
      console.error('SupabaseMissionRepository: Error publishing mission:', error);
      throw new Error(`Failed to publish mission: ${error.message}`);
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      destination: data.destination,
      passengers: data.passengers,
      duration: data.duration,
      isScientific: data.is_scientific || false,
      isPublic: data.is_public,
      status: data.status,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}