// Servicio para cargar y gestionar configuraciones de misiones ARKHA
export interface ModuleConfig {
  id: string;
  name: string;
  type: 'habitat' | 'lab' | 'storage' | 'power' | 'life_support' | 'access';
  description: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  modelPath: string;
  interactive: boolean;
  hidden: boolean;
  connectionPoints: {
    id: string;
    position: [number, number, number];
    type: 'horizontal' | 'vertical';
    compatible: string[]; // Tipos de módulos compatibles
  }[];
  anclajes?: {
    id: string;
    tipo: 'interconexión_vertical' | 'interconexión_horizontal';
    radio: number;
    posicion: [number, number, number];
    direccion: [number, number, number];
    arriba: [number, number, number];
    compatible: string[];
  }[];
  requirements: {
    power: number;
    lifeSupport: number;
    crew: number;
  };
  restrictions: {
    cannotBeNear: string[]; // Tipos de módulos que no pueden estar cerca
    minDistance: number;
  };
}

export interface MissionConfig {
  id: string;
  name: string;
  description: string;
  destination: string;
  crewSize: number;
  missionDuration: number;
  cameraPosition: [number, number, number];
  cameraTarget: [number, number, number];
  modules: ModuleConfig[];
  lighting: {
    ambient: {
      color: string;
      intensity: number;
    };
    directional: {
      color: string;
      intensity: number;
      position: [number, number, number];
      castShadow: boolean;
    };
  };
  environment: {
    skyColor: string;
    groundColor: string;
    fogEnabled: boolean;
  };
}

export const MissionConfigService = {
  // Cargar configuración para una misión específica
  async getMissionConfig(missionId: string): Promise<MissionConfig | null> {
    try {
      const url = `/configs/mission_${missionId}.json`;
      console.log(`Intentando cargar configuración desde: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error cargando configuración: ${response.status}`);
      }
      
      const config = await response.json();
      console.log(`Configuración cargada exitosamente:`, config);
      return config;
    } catch (error) {
      console.error(`Error cargando configuración:`, error);
      return null;
    }
  },

  // Cargar configuración por defecto para nuevas misiones
  async getDefaultMissionConfig(): Promise<MissionConfig> {
    return {
      id: 'default',
      name: 'Nueva Misión ARKHA',
      description: 'Configuración por defecto para una nueva misión espacial',
      destination: 'Marte',
      crewSize: 4,
      missionDuration: 30,
      cameraPosition: [0, 5, 10],
      cameraTarget: [0, 0, 0],
      modules: [],
      lighting: {
        ambient: {
          color: '0x404040',
          intensity: 0.4
        },
        directional: {
          color: '0xffffff',
          intensity: 1.0,
          position: [0, 0, 0],
          castShadow: true
        }
      },
      environment: {
        skyColor: '0x87ceeb',
        groundColor: '0x8b4513',
        fogEnabled: false
      }
    };
  },

  // Cargar catálogo de módulos disponibles
  async getModulesCatalog(): Promise<ModuleConfig[]> {
    try {
      const url = `/configs/modules_catalog.json`;
      console.log(`Cargando catálogo de módulos desde: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error cargando catálogo: ${response.status}`);
      }
      
      const catalog = await response.json();
      console.log(`Catálogo de módulos cargado:`, catalog);
      return catalog.modules || [];
    } catch (error) {
      console.error(`Error cargando catálogo de módulos:`, error);
      return [];
    }
  },

  // Guardar configuración de misión
  async saveMissionConfig(missionId: string, config: MissionConfig): Promise<boolean> {
    try {
      // En un entorno real, esto enviaría los datos al servidor
      console.log(`Guardando configuración para misión ${missionId}:`, config);
      
      // Simular guardado exitoso
      return true;
    } catch (error) {
      console.error(`Error guardando configuración:`, error);
      return false;
    }
  }
};
