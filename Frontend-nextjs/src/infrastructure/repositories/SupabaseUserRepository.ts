import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/repositories/UserRepository';
import { supabase } from '../external/SupabaseClient';

export class SupabaseUserRepository implements UserRepository {
  async findById(_id: string): Promise<User | null> {
    const { data, error } = await supabase.auth.getUser();
    
    if (error || !data.user) return null;
    
    return User.create({
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || 'User',
      avatar: data.user.user_metadata?.avatar,
      createdAt: new Date(data.user.created_at)
    });
  }

  async findByEmail(_email: string): Promise<User | null> {
    // En Supabase, no podemos buscar por email directamente desde el cliente
    // Esto se maneja a través de auth.signInWithPassword
    return null;
  }

  async save(user: User): Promise<User> {
    // En Supabase, la actualización se maneja a través de auth.updateUser
    const { data, error } = await supabase.auth.updateUser({
      data: {
        name: user.name,
        avatar: user.avatar
      }
    });

    if (error) throw new Error(`Failed to update user: ${error.message}`);
    if (!data.user) throw new Error('User not found');

    return User.create({
      id: data.user.id,
      email: data.user.email!,
      name: data.user.user_metadata?.name || 'User',
      avatar: data.user.user_metadata?.avatar,
      createdAt: new Date(data.user.created_at)
    });
  }

  async delete(_id: string): Promise<void> {
    // En Supabase, la eliminación se maneja a través de auth.admin.deleteUser
    // Esto requiere permisos de administrador
    throw new Error('User deletion requires admin privileges');
  }
}