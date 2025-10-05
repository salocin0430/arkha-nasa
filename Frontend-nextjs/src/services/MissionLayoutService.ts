/**
 * Servicio para generar layouts de módulos basados en parámetros de misión
 * Conecta con el microservicio Python de generación de layouts
 */

import exampleLayoutData from './example1.json';

// URL del microservicio (puede configurarse por entorno)
const MICROSERVICE_URL = process.env.NEXT_PUBLIC_MODULE_MANAGER_API_URL || 'https://api-module-manager.laoarchitects.com';

export interface MissionParameters {
  passengers: number;
  terrain: 'moon' | 'mars' | 'asteroid';
  duration: number; // días
  isScientific: boolean;
}

export interface ModuleLayout {
  id: string; // ID del módulo (debe coincidir con arkha_modules.json)
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface MissionLayout {
  modules: ModuleLayout[];
  terrain: string;
  totalModules: number;
}

class MissionLayoutService {
  private static instance: MissionLayoutService;
  private useMockup: boolean = false; // Cambiar a true para usar mockup

  private constructor() {}

  public static getInstance(): MissionLayoutService {
    if (!MissionLayoutService.instance) {
      MissionLayoutService.instance = new MissionLayoutService();
    }
    return MissionLayoutService.instance;
  }

  /**
   * Genera el layout de módulos llamando al microservicio Python
   * o usando el mockup si está habilitado
   */
  public async generateMissionLayout(parameters: MissionParameters): Promise<MissionLayout> {
    console.log('🚀 MissionLayoutService: Generating layout with params:', parameters);

    // Si el mockup está habilitado, usar example1.json
    if (this.useMockup) {
      console.log('📦 Using MOCKUP from example1.json');
      return this.generateMockupLayout(parameters);
    }

    try {
      // Llamar al microservicio real
      console.log(`🌐 Calling microservice: ${MICROSERVICE_URL}/api/v1/generate-layout`);
      
      const response = await fetch(`${MICROSERVICE_URL}/api/v1/generate-layout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passengers: parameters.passengers,
          duration: parameters.duration,
          terrain: parameters.terrain,
          isScientific: parameters.isScientific,
        }),
      });

      if (!response.ok) {
        throw new Error(`Microservice responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Microservice response received:', {
        totalModules: data.totalModules,
        modules: data.modules?.length,
      });

      // Mapear la respuesta del microservicio al formato esperado
      const modules: ModuleLayout[] = data.modules.map((module: {
        id: string;
        position: [number, number, number];
        rotation: [number, number, number];
        scale: [number, number, number];
      }) => ({
        id: module.id,
        position: module.position,
        rotation: module.rotation,
        scale: module.scale,
      }));

      return {
        modules,
        terrain: parameters.terrain,
        totalModules: modules.length,
      };
    } catch (error) {
      console.error('❌ Error calling microservice, falling back to mockup:', error);
      // Fallback al mockup en caso de error
      return this.generateMockupLayout(parameters);
    }
  }

  /**
   * Genera layout usando el mockup local (example1.json)
   * Usado como fallback o cuando useMockup = true
   */
  private async generateMockupLayout(parameters: MissionParameters): Promise<MissionLayout> {
    // Simular delay del microservicio real
    await new Promise(resolve => setTimeout(resolve, 500));

    // Usar el layout de ejemplo1.json directamente
    const modules: ModuleLayout[] = exampleLayoutData.modules.map(module => ({
      id: module.id,
      position: module.position as [number, number, number],
      rotation: module.rotation as [number, number, number],
      scale: module.scale as [number, number, number],
    }));

    return {
      modules,
      terrain: parameters.terrain,
      totalModules: modules.length,
    };
  }

  /**
   * Obtiene la lista de IDs de módulos únicos necesarios para precargar
   */
  public getRequiredModuleIds(layout: MissionLayout): string[] {
    const uniqueIds = new Set<string>();
    layout.modules.forEach(module => uniqueIds.add(module.id));
    return Array.from(uniqueIds);
  }
}

export default MissionLayoutService;

