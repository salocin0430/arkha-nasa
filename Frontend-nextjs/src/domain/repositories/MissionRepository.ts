import { Mission } from '../entities/Mission';

export interface MissionRepository {
  create(mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Mission>;
  findById(id: string): Promise<Mission | null>;
  findByUserId(userId: string): Promise<Mission[]>;
  findPublic(): Promise<Mission[]>;
  findByUserIdPaginated(userId: string, page: number, limit: number): Promise<{ missions: Mission[], totalPages: number, totalItems: number }>;
  findPublicPaginated(page: number, limit: number): Promise<{ missions: Mission[], totalPages: number, totalItems: number }>;
  update(id: string, updates: Partial<Omit<Mission, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Mission>;
  delete(id: string): Promise<void>;
  publishMission(id: string): Promise<Mission>;
}