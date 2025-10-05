import { UserRepository } from '../../domain/repositories/UserRepository';
import { MissionRepository } from '../../domain/repositories/MissionRepository';
import { ModuleRepository } from '../../domain/repositories/ModuleRepository';
import { LikeRepository } from '../../domain/repositories/LikeRepository';
import { SupabaseUserRepository } from '../../infrastructure/repositories/SupabaseUserRepository';
import { SupabaseMissionRepository } from '../../infrastructure/repositories/SupabaseMissionRepository';
import { SupabaseModuleRepository } from '../../infrastructure/repositories/SupabaseModuleRepository';
import { SupabaseLikeRepository } from '../../infrastructure/repositories/SupabaseLikeRepository';
import { RegisterUser } from '../../domain/use-cases/RegisterUser';
import { CreateMission } from '../../domain/use-cases/CreateMission';

// Repository instances
const userRepository: UserRepository = new SupabaseUserRepository();
const missionRepository: MissionRepository = new SupabaseMissionRepository();
const moduleRepository: ModuleRepository = new SupabaseModuleRepository();
const likeRepository: LikeRepository = new SupabaseLikeRepository();

// Use case instances
export const registerUser = new RegisterUser(userRepository);
export const createMission = new CreateMission(missionRepository, moduleRepository);

// Export repositories for direct access if needed
export { userRepository, missionRepository, moduleRepository, likeRepository };
