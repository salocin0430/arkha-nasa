export interface Module {
  id: string;
  name: string;
  type: 'habitat' | 'laboratory' | 'storage' | 'dormitory' | 'recreation';
  size: 'small' | 'medium' | 'large';
  moduleConfigId: string; // ID del módulo en arkha_modules.json
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  modelUrl?: string;
  isRadioactive: boolean;
  missionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateModuleRequest {
  name: string;
  type: 'habitat' | 'laboratory' | 'storage' | 'dormitory' | 'recreation';
  size: 'small' | 'medium' | 'large';
  moduleConfigId: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  scale: {
    x: number;
    y: number;
    z: number;
  };
  modelUrl?: string;
  isRadioactive?: boolean;
  missionId: string;
}

export interface UpdateModuleRequest {
  name?: string;
  type?: 'habitat' | 'laboratory' | 'storage' | 'dormitory' | 'recreation';
  size?: 'small' | 'medium' | 'large';
  position?: {
    x: number;
    y: number;
    z: number;
  };
  rotation?: {
    x: number;
    y: number;
    z: number;
  };
  scale?: {
    x: number;
    y: number;
    z: number;
  };
  modelUrl?: string;
  isRadioactive?: boolean;
}