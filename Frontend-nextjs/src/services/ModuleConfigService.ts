// Servicio para cargar y gestionar configuraciones de módulos ARKHA
export interface ModuleConfig {
  id: string;
  name: string;
  code?: string;
  item?: string;
  type: string;
  description?: string;
  area?: string;
  volume?: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  typeModel: 'glb' | 'gltf' | 'obj' | 'fbx';
  path: string;
  interactive: boolean;
  hidden: boolean;
  image?: string;
  price?: number;
  currency?: string;
  maps?: {
    normal?: string;
    roughness?: string;
    metalness?: string;
    ao?: string;
    emissive?: string;
  };
  materialProperties?: {
    roughness?: number;
    metalness?: number;
    emissiveIntensity?: number;
    aoMapIntensity?: number;
    normalScale?: number;
    reflective?: boolean;
  };
  lighting?: {
    enabled: boolean;
    intensity: number;
    angle: number;
    color: string;
    position: [number, number, number];
    type: 'spot' | 'point' | 'directional';
  };
}

export interface ArkhaModulesConfig {
  id: string;
  name: string;
  defaultTime: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  floorMaterial: string;
  baseModel?: ModuleConfig;
  modules: ModuleConfig[];
  lighting: {
    ambient: {
      color: string;
      intensity: number;
      name: string;
    };
    directional: {
      color: string;
      intensity: number;
      position: [number, number, number];
      castShadow: boolean;
      name: string;
    };
  };
  environment: {
    skyColor: string;
    groundColor: string;
    fogEnabled: boolean;
  };
}

class ModuleConfigService {
  private static instance: ModuleConfigService;
  private configCache: Map<string, ArkhaModulesConfig> = new Map();

  static getInstance(): ModuleConfigService {
    if (!ModuleConfigService.instance) {
      ModuleConfigService.instance = new ModuleConfigService();
    }
    return ModuleConfigService.instance;
  }

  /**
   * Cargar configuración de módulos ARKHA
   */
  async getModulesConfig(configId: string = 'arkha_modules'): Promise<ArkhaModulesConfig | null> {
    try {
      // Verificar caché
      if (this.configCache.has(configId)) {
        return this.configCache.get(configId)!;
      }

      // Cargar desde archivo con cache-busting timestamp
      const timestamp = new Date().getTime();
      const response = await fetch(`/configs/${configId}.json?v=${timestamp}`);
      if (!response.ok) {
        throw new Error(`Error loading config: ${response.statusText}`);
      }

      const config: ArkhaModulesConfig = await response.json();
      
      // Guardar en caché
      this.configCache.set(configId, config);
      
      console.log(`✅ Module configuration loaded: ${config.name}`, {
        totalModules: config.modules.length,
        sampleModule: config.modules[0] ? {
          id: config.modules[0].id,
          hasCode: !!config.modules[0].code,
          hasItem: !!config.modules[0].item,
          hasArea: !!config.modules[0].area,
          hasVolume: !!config.modules[0].volume,
        } : 'No modules'
      });
      return config;
    } catch (error) {
      console.error('Error cargando configuración de módulos:', error);
      return null;
    }
  }

  /**
   * Obtener módulo específico por ID
   */
  async getModuleById(moduleId: string, configId: string = 'arkha_modules'): Promise<ModuleConfig | null> {
    try {
      const config = await this.getModulesConfig(configId);
      if (!config) return null;

      const foundModule = config.modules.find(m => m.id === moduleId);
      return foundModule || null;
    } catch (error) {
      console.error('Error obteniendo módulo:', error);
      return null;
    }
  }

  /**
   * Obtener todos los módulos visibles
   */
  async getVisibleModules(configId: string = 'arkha_modules'): Promise<ModuleConfig[]> {
    try {
      const config = await this.getModulesConfig(configId);
      if (!config) return [];

      return config.modules.filter(module => !module.hidden);
    } catch (error) {
      console.error('Error obteniendo módulos visibles:', error);
      return [];
    }
  }

  /**
   * Obtener módulos por tipo
   */
  async getModulesByType(type: string, configId: string = 'arkha_modules'): Promise<ModuleConfig[]> {
    try {
      const config = await this.getModulesConfig(configId);
      if (!config) return [];

      return config.modules.filter(module => 
        module.type.toLowerCase().includes(type.toLowerCase()) && !module.hidden
      );
    } catch (error) {
      console.error('Error obteniendo módulos por tipo:', error);
      return [];
    }
  }

  /**
   * Limpiar caché
   */
  clearCache(): void {
    this.configCache.clear();
    console.log('Caché de configuración limpiado');
  }
}

export default ModuleConfigService;

