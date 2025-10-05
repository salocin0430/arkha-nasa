import { Module } from '../entities/Module';

export interface ModuleRepository {
  findByMissionId(missionId: string): Promise<Module[]>;
  save(module: Module): Promise<Module>;
  delete(id: string): Promise<void>;
  deleteAllModules(missionId: string): Promise<void>;
  validatePlacement(module: Module): Promise<boolean>;
}