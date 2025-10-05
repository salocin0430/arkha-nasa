import { SupabaseModuleRepository } from '../../infrastructure/repositories/SupabaseModuleRepository';

export interface SaveModulesRequest {
  missionId: string;
  modules: Array<{
    moduleConfigId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }>;
}

export class ModuleService {
  private moduleRepository: SupabaseModuleRepository;

  constructor() {
    this.moduleRepository = new SupabaseModuleRepository();
  }

  async saveModules(request: SaveModulesRequest): Promise<void> {
    console.log('🔧 ModuleService: Saving modules...', {
      missionId: request.missionId,
      moduleCount: request.modules.length,
    });

    await this.moduleRepository.saveModules(request.missionId, request.modules);

    console.log('✅ ModuleService: Modules saved successfully');
  }

  async loadModules(missionId: string) {
    console.log('🔧 ModuleService: Loading modules for mission:', missionId);

    const modules = await this.moduleRepository.findByMissionId(missionId);

    console.log('✅ ModuleService: Modules loaded successfully', {
      moduleCount: modules.length,
    });

    return modules;
  }

  async deleteAllModules(missionId: string): Promise<void> {
    console.log('🗑️  ModuleService: Deleting all modules for mission:', missionId);

    await this.moduleRepository.deleteAllModules(missionId);

    console.log('✅ ModuleService: All modules deleted successfully');
  }
}

