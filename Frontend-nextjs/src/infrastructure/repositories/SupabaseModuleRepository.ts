import { Module } from '../../domain/entities/Module';
import { ModuleRepository } from '../../domain/repositories/ModuleRepository';
import { supabase } from '../external/SupabaseClient';

export class SupabaseModuleRepository implements ModuleRepository {
  async findByMissionId(missionId: string): Promise<Module[]> {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to fetch modules: ${error.message}`);

    return (data || []).map(module => ({
      id: module.id,
      name: module.name,
      type: module.type,
      size: module.size,
      moduleConfigId: module.module_config_id || '',
      position: module.position,
      rotation: module.rotation,
      scale: module.scale,
      modelUrl: module.model_url,
      isRadioactive: module.is_radioactive,
      missionId: module.mission_id,
      createdAt: new Date(module.created_at),
      updatedAt: new Date(module.updated_at),
    }));
  }

  async save(module: Module): Promise<Module> {
    const { data, error } = await supabase
      .from('modules')
      .upsert({
        id: module.id,
        name: module.name,
        type: module.type,
        size: module.size,
        module_config_id: module.moduleConfigId,
        position: module.position,
        rotation: module.rotation,
        scale: module.scale,
        model_url: module.modelUrl,
        is_radioactive: module.isRadioactive,
        mission_id: module.missionId,
        created_at: module.createdAt.toISOString(),
        updated_at: module.updatedAt.toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to save module: ${error.message}`);

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      size: data.size,
      moduleConfigId: data.module_config_id || '',
      position: data.position,
      rotation: data.rotation,
      scale: data.scale,
      modelUrl: data.model_url,
      isRadioactive: data.is_radioactive,
      missionId: data.mission_id,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  // Método para guardar múltiples módulos de una vez (bulk save)
  async saveModules(missionId: string, modules: Array<{
    moduleConfigId: string;
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
  }>): Promise<void> {
    // Primero, eliminar todos los módulos existentes de esta misión
    await supabase
      .from('modules')
      .delete()
      .eq('mission_id', missionId);

    // Luego, insertar los nuevos módulos
    const modulesToInsert = modules.map((module, index) => ({
      name: `Module ${index + 1}`,
      type: 'habitat', // Tipo por defecto, podríamos mapear esto desde el config
      size: 'medium',
      module_config_id: module.moduleConfigId,
      position: module.position,
      rotation: module.rotation,
      scale: module.scale,
      model_url: null,
      is_radioactive: false,
      mission_id: missionId,
    }));

    const { error } = await supabase
      .from('modules')
      .insert(modulesToInsert);

    if (error) throw new Error(`Failed to save modules: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) throw new Error(`Failed to delete module: ${error.message}`);
  }

  async deleteAllModules(missionId: string): Promise<void> {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('mission_id', missionId);

    if (error) throw new Error(`Failed to delete all modules: ${error.message}`);
  }

  async validatePlacement(module: Module): Promise<boolean> {
    // Get all modules in the same mission
    const existingModules = await this.findByMissionId(module.missionId);
    
    // Check for collisions
    for (const existingModule of existingModules) {
      if (this.checkCollision(module, existingModule)) {
        return false;
      }
    }

    // Check for radioactive module placement rules
    if (module.isRadioactive) {
      return this.validateRadioactivePlacement(module, existingModules);
    }

    return true;
  }

  private checkCollision(module1: Module, module2: Module): boolean {
    const pos1 = module1.position;
    const pos2 = module2.position;
    
    // Simple collision detection based on module size
    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + 
      Math.pow(pos1.y - pos2.y, 2) + 
      Math.pow(pos1.z - pos2.z, 2)
    );
    
    // Minimum distance between modules (adjust based on module sizes)
    const minDistance = 2.0;
    
    return distance < minDistance;
  }

  private validateRadioactivePlacement(module: Module, existingModules: Module[]): boolean {
    // Radioactive modules should not be placed near dormitory modules
    const dormitoryModules = existingModules.filter(m => m.type === 'dormitory');
    
    for (const dormitory of dormitoryModules) {
      const distance = Math.sqrt(
        Math.pow(module.position.x - dormitory.position.x, 2) + 
        Math.pow(module.position.y - dormitory.position.y, 2) + 
        Math.pow(module.position.z - dormitory.position.z, 2)
      );
      
      // Minimum safe distance from dormitories
      const safeDistance = 5.0;
      if (distance < safeDistance) {
        return false;
      }
    }
    
    return true;
  }
}
